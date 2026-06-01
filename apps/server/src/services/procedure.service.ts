import { NotificationType, ProcedureStatus } from "@epms/shared";
import { procedureRepository, ProcedureSearchFilters } from "../repositories/procedure.repository";
import { ApiError } from "../utils/ApiError";
import { notificationService } from "./notification.service";

export interface ProcedureInput {
  title: string;
  description: string;
  department: string;
  category: string;
  keywords?: string[];
  requiredDocuments?: string[];
  steps?: { order: number; description: string }[];
  responsiblePerson: string;
  effectiveDate: string;
  versionNumber?: string;
  status?: ProcedureStatus;
}

export const procedureService = {
  async list(filters: ProcedureSearchFilters, page = 1, pageSize = 10) {
    const { items, total } = await procedureRepository.paginate(filters, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id: string, incrementView = false) {
    const procedure = await procedureRepository.findById(id, {
      populate: [
        { path: "department", select: "name" },
        { path: "category", select: "name group" },
      ],
    });
    if (!procedure) throw ApiError.notFound("Procedure not found");

    if (incrementView) {
      await procedureRepository.updateById(id, { $inc: { viewCount: 1 } } as never);
    }

    return procedure;
  },

  async recommend(id: string, limit = 5) {
    const procedure = await procedureRepository.findById(id);
    if (!procedure) throw ApiError.notFound("Procedure not found");

    return procedureRepository.findRelated(
      id,
      procedure.department.toString(),
      procedure.category.toString(),
      procedure.keywords,
      limit
    );
  },

  async create(input: ProcedureInput, createdBy: string) {
    return procedureRepository.create({
      ...input,
      effectiveDate: new Date(input.effectiveDate),
      versionNumber: input.versionNumber ?? "1.0",
      status: input.status ?? ProcedureStatus.DRAFT,
      createdBy,
      lastUpdate: new Date(),
    } as never);
  },

  async update(id: string, input: Partial<ProcedureInput>, actorId: string) {
    const update: Record<string, unknown> = { ...input, lastUpdate: new Date() };
    if (input.effectiveDate) update.effectiveDate = new Date(input.effectiveDate);

    const procedure = await procedureRepository.updateById(id, update as never);
    if (!procedure) throw ApiError.notFound("Procedure not found");

    if (procedure.status === ProcedureStatus.PUBLISHED) {
      await notificationService.notifyAll(
        NotificationType.PROCEDURE_UPDATED,
        `Procedure "${procedure.title}" has been updated.`,
        procedure._id.toString(),
        actorId
      );
    }

    return procedure;
  },

  async changeStatus(id: string, status: ProcedureStatus, actorId: string) {
    const procedure = await procedureRepository.updateById(id, {
      status,
      lastUpdate: new Date(),
    } as never);
    if (!procedure) throw ApiError.notFound("Procedure not found");

    if (status === ProcedureStatus.PUBLISHED || status === ProcedureStatus.ARCHIVED) {
      const type =
        status === ProcedureStatus.PUBLISHED
          ? NotificationType.PROCEDURE_PUBLISHED
          : NotificationType.PROCEDURE_ARCHIVED;
      const verb = status === ProcedureStatus.PUBLISHED ? "published" : "archived";
      await notificationService.notifyAll(
        type,
        `Procedure "${procedure.title}" has been ${verb}.`,
        procedure._id.toString(),
        actorId
      );
    }

    return procedure;
  },

  async remove(id: string) {
    const procedure = await procedureRepository.deleteById(id);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    return procedure;
  },
};
