import { ProcedureStatus } from "@epms/shared";
import { procedureRepository } from "../repositories/procedure.repository";

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
};
