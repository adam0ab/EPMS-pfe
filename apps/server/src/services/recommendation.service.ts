import {
  ProcedureAudience,
  ProcedureStatus,
  RecommendationPriority,
  RecommendationType,
  StudentRecommendationDTO,
  StudentRecommendationsDTO,
} from "@epms/shared";
import { procedureRepository } from "../repositories/procedure.repository";
import { studentChecklistService } from "./studentChecklist.service";

type ProcedureLike = any;
type ChecklistLike = Awaited<ReturnType<typeof studentChecklistService.list>>[number];
type Candidate = StudentRecommendationDTO & { score: number; reasonCodes: Set<string> };

const DAY = 24 * 60 * 60 * 1000;

function idOf(value: unknown) {
  return typeof value === "object" && value && "_id" in value ? String((value as any)._id) : String(value ?? "");
}

function nameOf(value: unknown) {
  return typeof value === "object" && value && "name" in value ? String((value as any).name ?? "") : "";
}

function words(value: unknown) {
  return new Set(String(value ?? "").toLowerCase().match(/[\p{L}\p{N}]{3,}/gu) ?? []);
}

function overlap(left: Set<string>, right: Set<string>) {
  let count = 0;
  left.forEach((word) => { if (right.has(word)) count += 1; });
  return count;
}

function procedureTerms(procedure: ProcedureLike) {
  return words([
    procedure.title,
    procedure.description,
    ...(procedure.keywords ?? []),
    ...(procedure.requiredDocuments ?? []),
    ...(procedure.steps ?? []).map((step: any) => step.description),
  ].join(" "));
}

function deadlineInfo(deadline?: Date | string) {
  if (!deadline) return { score: 0, priority: "LOW" as RecommendationPriority, code: undefined };
  const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / DAY);
  if (days < 0) return { score: -45, priority: "LOW" as RecommendationPriority, code: "DEADLINE_PASSED" };
  if (days <= 3) return { score: 80, priority: "VERY_HIGH" as RecommendationPriority, code: "DEADLINE_WITHIN_3_DAYS" };
  if (days <= 7) return { score: 55, priority: "HIGH" as RecommendationPriority, code: "DEADLINE_WITHIN_7_DAYS" };
  if (days <= 14) return { score: 30, priority: "MEDIUM" as RecommendationPriority, code: "DEADLINE_WITHIN_14_DAYS" };
  return { score: 0, priority: "LOW" as RecommendationPriority, code: undefined };
}

function reasonText(codes: Set<string>) {
  const messages: Record<string, string> = {
    IN_PROGRESS: "You have already started this procedure.",
    RELATED_TO_CHECKLIST: "Related to a procedure in your checklist.",
    SAME_CATEGORY: "Same category as a procedure in your checklist.",
    SAME_DEPARTMENT: "Same department as a procedure in your checklist.",
    KEYWORD_MATCH: "Shares relevant topics with your checklist.",
    DEADLINE_WITHIN_3_DAYS: "Deadline within 3 days.",
    DEADLINE_WITHIN_7_DAYS: "Deadline within 7 days.",
    DEADLINE_WITHIN_14_DAYS: "Deadline within 14 days.",
    DEADLINE_PASSED: "The recorded deadline has passed.",
    EXPLORE: "Explore a published procedure available to students.",
  };
  return [...codes].map((code) => messages[code]).filter(Boolean);
}

function priorityOf(score: number, deadlinePriority: RecommendationPriority): RecommendationPriority {
  if (deadlinePriority === "VERY_HIGH" || score >= 100) return "VERY_HIGH";
  if (deadlinePriority === "HIGH" || score >= 55) return "HIGH";
  if (deadlinePriority === "MEDIUM" || score >= 25) return "MEDIUM";
  return "LOW";
}

export const recommendationService = {
  async forStudent(studentId: string): Promise<StudentRecommendationsDTO> {
    const [{ items: procedures }, checklists] = await Promise.all([
      procedureRepository.paginate({ status: ProcedureStatus.PUBLISHED, targetAudience: ProcedureAudience.STUDENT }, 1, 100),
      studentChecklistService.list(studentId),
    ]);

    const checklistByProcedure = new Map(checklists.map((checklist: any) => [checklist.procedure._id, checklist]));
    const active = checklists.filter((checklist: any) => checklist.totalCount > 0 && !checklist.isComplete);
    const activeProcedures = procedures.filter((procedure: any) => active.some((checklist: any) => checklist.procedure._id === procedure._id.toString()));
    const candidates: Candidate[] = procedures.map((procedure: ProcedureLike) => {
      const procedureId = procedure._id.toString();
      const checklist = checklistByProcedure.get(procedureId) as ChecklistLike | undefined;
      const deadline = deadlineInfo(procedure.deadline);
      const codes = new Set<string>();
      let score = 5 + Math.min(Number(procedure.viewCount ?? 0), 20) / 20;

      if (deadline.code) codes.add(deadline.code);
      score += deadline.score;
      if (checklist?.isComplete) score -= 140;
      if (checklist && !checklist.isComplete) {
        score += 100;
        codes.add("IN_PROGRESS");
      }

      const candidateTerms = procedureTerms(procedure);
      for (const source of activeProcedures) {
        if (source._id.toString() === procedureId) continue;
        let related = false;
        if (idOf(source.category) === idOf(procedure.category)) { score += 25; codes.add("SAME_CATEGORY"); related = true; }
        if (idOf(source.department) === idOf(procedure.department)) { score += 18; codes.add("SAME_DEPARTMENT"); related = true; }
        const commonTerms = overlap(candidateTerms, procedureTerms(source));
        if (commonTerms) { score += Math.min(commonTerms, 5) * 6; codes.add("KEYWORD_MATCH"); related = true; }
        if (related) codes.add("RELATED_TO_CHECKLIST");
      }
      // A non-matching candidate must remain an honest exploration result,
      // even when the student has other checklist activity.
      if (!codes.size) codes.add("EXPLORE");

      const type: RecommendationType = checklist && !checklist.isComplete
        ? "CONTINUE"
        : deadline.code?.startsWith("DEADLINE_WITHIN")
          ? "DEADLINE_APPROACHING"
          : codes.has("RELATED_TO_CHECKLIST")
            ? "RELATED_TO_CHECKLIST"
            : codes.has("EXPLORE") ? "EXPLORE" : "TOP_RECOMMENDATION";
      return {
        procedure: procedure.toObject ? procedure.toObject() : procedure,
        type,
        priority: priorityOf(score, deadline.priority),
        reasons: reasonText(codes),
        ...(checklist ? { checklist: { completedCount: checklist.completedCount, totalCount: checklist.totalCount, progressPercent: checklist.progressPercent, isComplete: checklist.isComplete } } : {}),
        score,
        reasonCodes: codes,
      };
    });

    const ranked = candidates.sort((a, b) => b.score - a.score || b.procedure.viewCount - a.procedure.viewCount || a.procedure.title.localeCompare(b.procedure.title));
    const continueItems = ranked.filter((candidate) => candidate.type === "CONTINUE" && !candidate.checklist?.isComplete);
    const deadlineApproaching = ranked.filter((candidate) => candidate.type === "DEADLINE_APPROACHING" && !candidate.checklist?.isComplete).slice(0, 5);
    const relatedToChecklist = this.diversify(ranked.filter((candidate) => candidate.type === "RELATED_TO_CHECKLIST" && !candidate.checklist?.isComplete), 5);
    const recommendedForYou = this.diversify(ranked.filter((candidate) => candidate.type === "TOP_RECOMMENDATION" && !candidate.checklist?.isComplete), 5);
    const explore = this.diversify(ranked.filter((candidate) => candidate.type === "EXPLORE" && !candidate.checklist?.isComplete), 6);
    const actionSource = continueItems[0] ?? deadlineApproaching[0] ?? relatedToChecklist[0] ?? explore[0];
    const nextBestAction = actionSource ? { ...this.public(actionSource), action: actionSource.type === "CONTINUE" ? "CONTINUE" as const : "START" as const } : undefined;

    return {
      nextBestAction,
      sections: {
        recommendedForYou: recommendedForYou.map(this.public),
        deadlineApproaching: deadlineApproaching.map(this.public),
        continue: continueItems.map(this.public),
        relatedToChecklist: relatedToChecklist.map(this.public),
        explore: explore.map(this.public),
      },
    };
  },

  diversify(candidates: Candidate[], limit: number) {
    const result: Candidate[] = [];
    const categoryCounts = new Map<string, number>();
    for (const candidate of candidates) {
      const category = nameOf(candidate.procedure.category) || "uncategorized";
      const urgent = candidate.priority === "VERY_HIGH" || candidate.priority === "HIGH";
      if (!urgent && (categoryCounts.get(category) ?? 0) >= 2) continue;
      result.push(candidate);
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      if (result.length === limit) break;
    }
    return result;
  },

  public(candidate: Candidate): StudentRecommendationDTO {
    const { score: _score, reasonCodes: _codes, ...dto } = candidate;
    return dto;
  },
};
