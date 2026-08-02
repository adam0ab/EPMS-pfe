import { ProcedureStatus } from "@epms/shared";
import { procedureRepository } from "../repositories/procedure.repository";
import { validationHistoryRepository } from "../repositories/validationHistory.repository";
import { userRepository } from "../repositories/user.repository";
import { documentRepository } from "../repositories/document.repository";
import { auditLogRepository } from "../repositories/auditLog.repository";
import { ValidationAction } from "@epms/shared";

function toCounts(items: Array<{ status?: string; action?: string; count: number }>) {
  return items.reduce<Record<string, number>>((counts, item) => {
    const key = item.status ?? item.action;
    if (key) counts[key] = item.count;
    return counts;
  }, {});
}

export const dashboardService = {
  async getStats() {
    const [total, published, archived, drafts, byDepartment, byCategory, recentlyUpdated] = await Promise.all([
      procedureRepository.count(),
      procedureRepository.countByStatus(ProcedureStatus.PUBLISHED),
      procedureRepository.countByStatus(ProcedureStatus.ARCHIVED),
      procedureRepository.countByStatus(ProcedureStatus.DRAFT),
      procedureRepository.countByDepartment(),
      procedureRepository.countByCategory(),
      procedureRepository.recentlyUpdated(5),
    ]);

    return {
      totalProcedures: total,
      publishedProcedures: published,
      archivedProcedures: archived,
      draftProcedures: drafts,
      proceduresByDepartment: byDepartment,
      proceduresByCategory: byCategory,
      recentlyUpdated,
    };
  },

  async getValidatorStats(validatorId: string) {
    const [statuses, recentlySubmitted, recentValidationActivity] = await Promise.all([
      procedureRepository.countByStatuses(),
      procedureRepository.recentlySubmitted(),
      validationHistoryRepository.recentByActor(validatorId),
    ]);
    const counts = toCounts(statuses);
    return {
      pendingProcedures: counts[ProcedureStatus.PENDING_REVIEW] ?? 0,
      approvedProcedures: counts[ProcedureStatus.APPROVED] ?? 0,
      rejectedProcedures: counts[ProcedureStatus.REJECTED] ?? 0,
      recentlySubmitted,
      recentValidationActivity,
    };
  },

  async getAdminStats() {
    const [statuses, users, documents, proceduresByDepartment, proceduresByCategory, mostViewed, validationActions, recentActivity] = await Promise.all([
      procedureRepository.countByStatuses(),
      userRepository.count(),
      documentRepository.count(),
      procedureRepository.countByDepartment(),
      procedureRepository.countByCategory(),
      procedureRepository.mostViewed(5),
      validationHistoryRepository.countByAction(),
      auditLogRepository.recent(8),
    ]);
    return {
      procedureCounts: toCounts(statuses),
      userCount: users,
      documentCount: documents,
      proceduresByDepartment,
      proceduresByCategory,
      mostViewed,
      validationCounts: toCounts(validationActions),
      recentActivity,
    };
  },

  async getWorkflowActivity(period: string = "30d") {
    const now = new Date();
    let since: Date;
    if (period === "7d") since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    else if (period === "30d") since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    else if (period === "3m") { since = new Date(now); since.setMonth(since.getMonth() - 3); }
    else if (period === "6m") { since = new Date(now); since.setMonth(since.getMonth() - 6); }
    else if (period === "1y") { since = new Date(now); since.setFullYear(since.getFullYear() - 1); }
    else since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const history = await validationHistoryRepository.workflowActivity(since);
    const counts: Record<string, Record<string, number>> = {};
    for (const entry of history) {
      const date = entry._id.date;
      const action = entry._id.action;
      if (!counts[date]) counts[date] = {};
      counts[date][action] = entry.count;
    }
    const sortedDates = Object.keys(counts).sort();
    const actions = [ValidationAction.SUBMITTED, ValidationAction.APPROVED, ValidationAction.REJECTED, ValidationAction.PUBLISHED, ValidationAction.ARCHIVED];
    return sortedDates.map((date) => {
      const point: Record<string, unknown> = { date };
      for (const action of actions) point[action] = counts[date][action] ?? 0;
      return point;
    });
  },

  async getProceduresRequiringAttention() {
    const procedures = await procedureRepository.proceduresRequiringAttention();
    const now = new Date();
    const upcoming = new Date(now);
    upcoming.setDate(now.getDate() + 7);

    const categories: Record<string, typeof procedures> = {
      overdue: [],
      pendingReview: [],
      rejected: [],
      readyToPublish: [],
      upcomingDeadline: [],
    };

    for (const procedure of procedures) {
      if (procedure.status === ProcedureStatus.PENDING_REVIEW) categories.pendingReview.push(procedure);
      else if (procedure.status === ProcedureStatus.REJECTED) categories.rejected.push(procedure);
      else if (procedure.status === ProcedureStatus.APPROVED) categories.readyToPublish.push(procedure);
      else if (procedure.deadline && new Date(procedure.deadline) < now) categories.overdue.push(procedure);
      else if (procedure.deadline && new Date(procedure.deadline) <= upcoming) categories.upcomingDeadline.push(procedure);
    }

    return {
      total: procedures.length,
      categories,
      procedures,
    };
  },

  async getHealth() {
    const statuses = await procedureRepository.countByStatuses();
    const now = new Date();
    const sevenDays = new Date(now);
    sevenDays.setDate(now.getDate() + 7);
    const thirtyDays = new Date(now);
    thirtyDays.setDate(now.getDate() - 30);

    const counts = toCounts(statuses);
    const published = counts[ProcedureStatus.PUBLISHED] ?? 0;
    const approved = counts[ProcedureStatus.APPROVED] ?? 0;
    const pendingReview = counts[ProcedureStatus.PENDING_REVIEW] ?? 0;
    const rejected = counts[ProcedureStatus.REJECTED] ?? 0;
    const draft = counts[ProcedureStatus.DRAFT] ?? 0;
    const archived = counts[ProcedureStatus.ARCHIVED] ?? 0;
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    const atRisk = approved + pendingReview;
    const critical = rejected + draft;

    return {
      total,
      healthy: published,
      atRisk,
      critical,
      breakdown: {
        published,
        approved,
        pendingReview,
        rejected,
        draft,
        archived,
      },
    };
  },
};
