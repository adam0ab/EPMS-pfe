import { ProcedureStatus, Role } from "@epms/shared";
import { procedureRepository } from "../repositories/procedure.repository";
import { validationHistoryRepository } from "../repositories/validationHistory.repository";
import { ApiError } from "../utils/ApiError";
import { ProcedureDocument } from "../models/Procedure.model";

export interface ReportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string | string[];
  department?: string;
  category?: string;
}

export interface ExecutiveSummary {
  totalProcedures: number;
  publishedRate: number;
  approvalRate: number;
  rejectionRate: number;
  validationBacklog: number;
  publicationBacklog: number;
  atRiskProcedures: number;
  criticalProcedures: number;
  averageValidationTimeHours: number | null;
  averagePublicationTimeHours: number | null;
}

export interface WorkflowAnalysis {
  distribution: Record<ProcedureStatus, number>;
  submissionRate: number;
  approvalRate: number;
  rejectionRate: number;
  publicationRate: number;
  bottlenecks: Array<{ status: ProcedureStatus; count: number; label: string; severity: "info" | "warning" | "danger" }>;
}

export interface HealthAnalysis {
  healthy: number;
  atRisk: number;
  critical: number;
  total: number;
  distribution: Record<string, number>;
  averageScore: number;
}

export interface ValidationAnalysis {
  totalSubmitted: number;
  totalApproved: number;
  totalRejected: number;
  approvalRate: number;
  rejectionRate: number;
  averageValidationTimeHours: number | null;
  fastestValidationHours: number | null;
  longestValidationHours: number | null;
  periodLabel: string;
}

export interface ComplianceAnalysis {
  total: number;
  withDocuments: number;
  withoutDocuments: number;
  withResponsiblePerson: number;
  withoutResponsiblePerson: number;
  withDeadline: number;
  withoutDeadline: number;
  documentationCoverage: number;
  metadataCompleteness: number;
}

export interface DeadlineAnalysis {
  overdue: number;
  dueSoon: number;
  upcoming: number;
  noDeadline: number;
  total: number;
  overdueRate: number;
  dueSoonRate: number;
}

export interface AgeAnalysis {
  recentlyUpdated: number;
  aging: number;
  outdated: number;
  total: number;
  recentlyUpdatedPct: number;
  agingPct: number;
  outdatedPct: number;
}

export interface Insight {
  type: "success" | "warning" | "danger" | "info";
  title: string;
  message: string;
}

export interface Decision {
  title: string;
  reason: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  affectedCount: number;
  suggestedAction: string;
}

export interface ExecutiveConclusion {
  overallStatus: "HEALTHY" | "STABLE" | "NEEDS_ATTENTION" | "CRITICAL";
  mainStrength: string;
  mainWeakness: string;
  mainRisk: string;
  recommendedPriority: string;
}

export interface FullReport {
  generatedAt: string;
  periodLabel: string;
  filters: ReportFilters;
  executiveSummary: ExecutiveSummary;
  workflowAnalysis: WorkflowAnalysis;
  healthAnalysis: HealthAnalysis;
  validationAnalysis: ValidationAnalysis;
  complianceAnalysis: ComplianceAnalysis;
  deadlineAnalysis: DeadlineAnalysis;
  ageAnalysis: AgeAnalysis;
  insights: Insight[];
  decisions: Decision[];
  conclusion: ExecutiveConclusion;
}

function daysBetween(start?: Date | null, end?: Date | null): number | null {
  if (!start || !end) return null;
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export const reportService = {
  async buildReport(filters: ReportFilters): Promise<FullReport> {
    const query = procedureRepository.buildFilterQuery(filters);
    const procedures = await procedureRepository.allForReport(query);
    const now = new Date();
    const periodLabel = filters.dateFrom && filters.dateTo
      ? `${filters.dateFrom} → ${filters.dateTo}`
      : filters.dateFrom
        ? `From ${filters.dateFrom}`
        : filters.dateTo
          ? `Until ${filters.dateTo}`
          : "All time";

    const statusCounts: Record<string, number> = {};
    for (const p of procedures) {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    }

    const total = procedures.length;
    const published = statusCounts[ProcedureStatus.PUBLISHED] || 0;
    const approved = statusCounts[ProcedureStatus.APPROVED] || 0;
    const rejected = statusCounts[ProcedureStatus.REJECTED] || 0;
    const pendingReview = statusCounts[ProcedureStatus.PENDING_REVIEW] || 0;
    const draft = statusCounts[ProcedureStatus.DRAFT] || 0;
    const archived = statusCounts[ProcedureStatus.ARCHIVED] || 0;
    const totalReviewed = approved + rejected;

    const publishedRate = total ? (published / total) * 100 : 0;
    const approvalRate = totalReviewed ? (approved / totalReviewed) * 100 : 0;
    const rejectionRate = totalReviewed ? (rejected / totalReviewed) * 100 : 0;

    const validationTimes: number[] = [];
    const publicationTimes: number[] = [];
    for (const p of procedures) {
      const validationTime = daysBetween(p.submittedAt as Date | undefined, p.approvedAt as Date | undefined) ?? daysBetween(p.submittedAt as Date | undefined, p.rejectedAt as Date | undefined);
      if (validationTime !== null) validationTimes.push(validationTime);
      const publicationTime = daysBetween(p.approvedAt as Date | undefined, p.publishedAt as Date | undefined);
      if (publicationTime !== null) publicationTimes.push(publicationTime);
    }
    const averageValidationTimeHours = validationTimes.length ? validationTimes.reduce((a, b) => a + b, 0) / validationTimes.length : null;
    const averagePublicationTimeHours = publicationTimes.length ? publicationTimes.reduce((a, b) => a + b, 0) / publicationTimes.length : null;

    const executiveSummary: ExecutiveSummary = {
      totalProcedures: total,
      publishedRate: Math.round(publishedRate * 100) / 100,
      approvalRate: Math.round(approvalRate * 100) / 100,
      rejectionRate: Math.round(rejectionRate * 100) / 100,
      validationBacklog: pendingReview,
      publicationBacklog: approved,
      atRiskProcedures: approved + pendingReview,
      criticalProcedures: rejected + draft,
      averageValidationTimeHours: averageValidationTimeHours ? Math.round(averageValidationTimeHours * 100) / 100 : null,
      averagePublicationTimeHours: averagePublicationTimeHours ? Math.round(averagePublicationTimeHours * 100) / 100 : null,
    };

    const submissionRate = total ? (totalReviewed / total) * 100 : 0;
    const publicationRate = approved ? (published / approved) * 100 : 0;

    const bottlenecks = [
      { status: ProcedureStatus.DRAFT, count: draft, label: "Submission bottleneck", severity: "warning" as const },
      { status: ProcedureStatus.PENDING_REVIEW, count: pendingReview, label: "Validation bottleneck", severity: pendingReview > 5 ? "danger" as const : "warning" as const },
      { status: ProcedureStatus.APPROVED, count: approved, label: "Publication bottleneck", severity: approved > 3 ? "danger" as const : "warning" as const },
      { status: ProcedureStatus.REJECTED, count: rejected, label: "Quality issue", severity: rejected > 3 ? "danger" as const : "warning" as const },
    ].filter((b) => b.count > 0);

    const workflowAnalysis: WorkflowAnalysis = {
      distribution: {
        [ProcedureStatus.DRAFT]: draft,
        [ProcedureStatus.PENDING_REVIEW]: pendingReview,
        [ProcedureStatus.APPROVED]: approved,
        [ProcedureStatus.PUBLISHED]: published,
        [ProcedureStatus.REJECTED]: rejected,
        [ProcedureStatus.ARCHIVED]: archived,
      },
      submissionRate: Math.round(submissionRate * 100) / 100,
      approvalRate: Math.round(approvalRate * 100) / 100,
      rejectionRate: Math.round(rejectionRate * 100) / 100,
      publicationRate: Math.round(publicationRate * 100) / 100,
      bottlenecks,
    };

    const healthy = published;
    const atRisk = approved + pendingReview;
    const critical = rejected + draft;
    const healthTotal = healthy + atRisk + critical;
    const healthAnalysis: HealthAnalysis = {
      healthy,
      atRisk,
      critical,
      total: healthTotal,
      distribution: {
        healthy: total ? (healthy / total) * 100 : 0,
        atRisk: total ? (atRisk / total) * 100 : 0,
        critical: total ? (critical / total) * 100 : 0,
      },
      averageScore: total ? Math.round(((healthy * 100) + (atRisk * 50) + (critical * 0)) / total) : 0,
    };

    const validationAnalysis: ValidationAnalysis = {
      totalSubmitted: totalReviewed,
      totalApproved: approved,
      totalRejected: rejected,
      approvalRate: Math.round(approvalRate * 100) / 100,
      rejectionRate: Math.round(rejectionRate * 100) / 100,
      averageValidationTimeHours: averageValidationTimeHours ? Math.round(averageValidationTimeHours * 100) / 100 : null,
      fastestValidationHours: validationTimes.length ? Math.round(Math.min(...validationTimes) * 100) / 100 : null,
      longestValidationHours: validationTimes.length ? Math.round(Math.max(...validationTimes) * 100) / 100 : null,
      periodLabel,
    };

    const withDocuments = procedures.filter((p) => p.requiredDocuments && p.requiredDocuments.length > 0).length;
    const withoutDocuments = total - withDocuments;
    const withResponsiblePerson = procedures.filter((p) => p.responsiblePerson && p.responsiblePerson.trim().length > 0).length;
    const withoutResponsiblePerson = total - withResponsiblePerson;
    const withDeadline = procedures.filter((p) => p.deadline).length;
    const withoutDeadline = total - withDeadline;
    const documentationCoverage = total ? (withDocuments / total) * 100 : 0;
    const metadataCompleteness = total ? ((withDocuments + withResponsiblePerson + withDeadline) / (total * 3)) * 100 : 0;

    const complianceAnalysis: ComplianceAnalysis = {
      total,
      withDocuments,
      withoutDocuments,
      withResponsiblePerson,
      withoutResponsiblePerson,
      withDeadline,
      withoutDeadline,
      documentationCoverage: Math.round(documentationCoverage * 100) / 100,
      metadataCompleteness: Math.round(metadataCompleteness * 100) / 100,
    };

    const overdue = procedures.filter((p) => p.deadline && new Date(p.deadline) < now && p.status !== ProcedureStatus.PUBLISHED && p.status !== ProcedureStatus.ARCHIVED).length;
    const dueSoon = procedures.filter((p) => p.deadline && new Date(p.deadline) >= now && new Date(p.deadline) <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) && p.status !== ProcedureStatus.PUBLISHED && p.status !== ProcedureStatus.ARCHIVED).length;
    const upcoming = procedures.filter((p) => p.deadline && new Date(p.deadline) > new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)).length;
    const noDeadline = procedures.filter((p) => !p.deadline).length;
    const deadlineAnalysis: DeadlineAnalysis = {
      overdue,
      dueSoon,
      upcoming,
      noDeadline,
      total,
      overdueRate: total ? (overdue / total) * 100 : 0,
      dueSoonRate: total ? (dueSoon / total) * 100 : 0,
    };

    const ninetyDays = 90 * 24 * 60 * 60 * 1000;
    const recentlyUpdated = procedures.filter((p) => now.getTime() - new Date(p.updatedAt).getTime() < ninetyDays).length;
    const aging = procedures.filter((p) => { const age = now.getTime() - new Date(p.updatedAt).getTime(); return age >= ninetyDays && age < 180 * 24 * 60 * 60 * 1000; }).length;
    const outdated = procedures.filter((p) => now.getTime() - new Date(p.updatedAt).getTime() >= 180 * 24 * 60 * 60 * 1000).length;
    const ageAnalysis: AgeAnalysis = {
      recentlyUpdated,
      aging,
      outdated,
      total,
      recentlyUpdatedPct: total ? Math.round((recentlyUpdated / total) * 100) : 0,
      agingPct: total ? Math.round((aging / total) * 100) : 0,
      outdatedPct: total ? Math.round((outdated / total) * 100) : 0,
    };

    const insights: Insight[] = [];
    if (rejectionRate > 30) {
      insights.push({ type: "danger", title: "High rejection rate", message: `Rejection rate is ${rejectionRate.toFixed(1)}%, which exceeds the 30% threshold.` });
    } else if (rejectionRate > 15) {
      insights.push({ type: "warning", title: "Elevated rejection rate", message: `Rejection rate is ${rejectionRate.toFixed(1)}%, which exceeds the 15% threshold.` });
    }
    if (pendingReview > 5) {
      insights.push({ type: "warning", title: "Validation backlog", message: `${pendingReview} procedures are pending review.` });
    }
    if (approved > 3) {
      insights.push({ type: "info", title: "Publication backlog", message: `${approved} procedures are approved but not yet published.` });
    }
    if (overdue > 0) {
      insights.push({ type: "danger", title: "Overdue procedures", message: `${overdue} procedures have passed their deadline.` });
    }
    if (dueSoon > 0) {
      insights.push({ type: "warning", title: "Deadlines approaching", message: `${dueSoon} procedures have a deadline within 7 days.` });
    }
    if (outdated > 0) {
      insights.push({ type: "warning", title: "Outdated procedures", message: `${outdated} procedures have not been updated in over 180 days.` });
    }
    if (publishedRate >= 80 && total > 0) {
      insights.push({ type: "success", title: "High publication rate", message: `${publishedRate.toFixed(1)}% of procedures are published.` });
    }

    const decisions: Decision[] = [];
    if (pendingReview > 0) {
      decisions.push({ title: "Prioritize validation of pending procedures", reason: `${pendingReview} procedures are waiting for validation.`, priority: "HIGH", affectedCount: pendingReview, suggestedAction: "Schedule validator review session." });
    }
    if (rejected > 0) {
      decisions.push({ title: "Review rejected procedures", reason: `Rejection rate is ${rejectionRate.toFixed(1)}%.`, priority: rejectionRate > 30 ? "HIGH" : "MEDIUM", affectedCount: rejected, suggestedAction: "Review quality and completeness before resubmission." });
    }
    if (approved > 0) {
      decisions.push({ title: "Publish approved procedures", reason: `${approved} procedures are ready for publication.`, priority: "MEDIUM", affectedCount: approved, suggestedAction: "Publish approved procedures to make them available." });
    }
    if (overdue > 0) {
      decisions.push({ title: "Address overdue procedures", reason: `${overdue} procedures have passed their deadline.`, priority: "HIGH", affectedCount: overdue, suggestedAction: "Review deadlines and update or archive overdue procedures." });
    }
    if (outdated > 0) {
      decisions.push({ title: "Update outdated procedures", reason: `${outdated} procedures have not been updated for more than 180 days.`, priority: "MEDIUM", affectedCount: outdated, suggestedAction: "Review and update outdated procedures." });
    }
    if (withoutDocuments > 0 && total > 0) {
      const docCoverage = (withDocuments / total) * 100;
      if (docCoverage < 70) {
        decisions.push({ title: "Improve documentation coverage", reason: `Documentation coverage is ${docCoverage.toFixed(1)}%.`, priority: "MEDIUM", affectedCount: withoutDocuments, suggestedAction: "Add required documents to incomplete procedures." });
      }
    }

    let overallStatus: ExecutiveConclusion["overallStatus"] = "HEALTHY";
    if (critical > 0 || overdue > 0 || rejectionRate > 30) overallStatus = "CRITICAL";
    else if (atRisk > 0 || pendingReview > 5 || dueSoon > 0) overallStatus = "NEEDS_ATTENTION";
    else if (approved > 0 || aging > 0) overallStatus = "STABLE";

    const mainStrength = publishedRate >= 80 ? "High publication rate" : total === 0 ? "No procedures yet" : "Workflow is progressing";
    const mainWeakness = pendingReview > 5 ? "Validation backlog" : rejected > 3 ? "High rejection rate" : overdue > 0 ? "Overdue procedures" : "No significant issues";
    const mainRisk = overdue > 0 ? "Overdue deadlines" : rejectionRate > 30 ? "High rejection rate" : pendingReview > 5 ? "Validation delays" : "No critical risks identified";
    const recommendedPriority = pendingReview > 0 ? "Review pending procedures" : rejected > 0 ? "Review rejected procedures" : approved > 0 ? "Publish approved procedures" : "Maintain current workflow";

    const conclusion: ExecutiveConclusion = {
      overallStatus,
      mainStrength,
      mainWeakness,
      mainRisk,
      recommendedPriority,
    };

    return {
      generatedAt: now.toISOString(),
      periodLabel,
      filters,
      executiveSummary,
      workflowAnalysis,
      healthAnalysis,
      validationAnalysis,
      complianceAnalysis,
      deadlineAnalysis,
      ageAnalysis,
      insights,
      decisions,
      conclusion,
    };
  }
};
