import { ChangeType, NotificationType, ProcedureAudience, ProcedureStatus, Role, ValidationAction } from "@epms/shared";
import { procedureRepository, ProcedureSearchFilters } from "../repositories/procedure.repository";
import { ApiError } from "../utils/ApiError";
import { notificationService } from "./notification.service";
import { validationHistoryRepository } from "../repositories/validationHistory.repository";
import { assertWorkflowTransition } from "./workflow.service";
import { procedureVersionService } from "./procedureVersion.service";

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
  startDate?: string;
  endDate?: string;
  deadline?: string;
  showInCalendar?: boolean;
  eventType?: string;
  targetAudience?: ProcedureAudience[];
  changeType?: ChangeType;
  changeDescription?: string;
}

export const procedureService = {
  async list(filters: ProcedureSearchFilters, page = 1, pageSize = 10, role?: Role) {
    const scopedFilters =
      role === Role.VALIDATOR
        ? { ...filters, status: ProcedureStatus.PENDING_REVIEW }
        : role === Role.STUDENT
          ? { ...filters, status: ProcedureStatus.PUBLISHED, targetAudience: ProcedureAudience.STUDENT }
          : role === Role.EMPLOYEE
            ? { ...filters, status: ProcedureStatus.PUBLISHED, targetAudience: ProcedureAudience.EMPLOYEE }
          : filters;
    const { items, total } = await procedureRepository.paginate(scopedFilters, page, pageSize);
    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  },

  async getById(id: string, incrementView = false, role?: Role, notificationRecipientId?: string) {
    const procedure = await procedureRepository.findById(id, {
      populate: [
        { path: "department", select: "name" },
        { path: "category", select: "name group" },
      ],
    });
    if (!procedure) throw ApiError.notFound("Procedure not found");
    const isValidatorAccessible = role === Role.VALIDATOR && [
      ProcedureStatus.PENDING_REVIEW,
      ProcedureStatus.APPROVED,
      ProcedureStatus.REJECTED,
      ProcedureStatus.PUBLISHED,
      ProcedureStatus.ARCHIVED,
    ].includes(procedure.status);
    const hasNotificationAccess = notificationRecipientId
      ? await notificationService.hasProcedureAccess(notificationRecipientId, id)
      : false;
    const requiredAudience = role === Role.STUDENT ? ProcedureAudience.STUDENT : role === Role.EMPLOYEE ? ProcedureAudience.EMPLOYEE : undefined;
    const hasAudienceAccess = !requiredAudience || procedure.targetAudience?.includes(requiredAudience);
    const hasStatusAccess = isValidatorAccessible || procedure.status === ProcedureStatus.PUBLISHED || hasNotificationAccess;
    if (role && role !== Role.SUPER_ADMIN && (!hasStatusAccess || !hasAudienceAccess)) {
      throw ApiError.notFound("Procedure not found");
    }

    if (incrementView) {
      await procedureRepository.updateById(id, { $inc: { viewCount: 1 } } as never);
    }

    return procedure;
  },

  async recommend(id: string, limit = 5, role?: Role) {
    const procedure = await procedureRepository.findById(id);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    const isValidatorAccessible = role === Role.VALIDATOR && procedure.status !== ProcedureStatus.DRAFT;
    const requiredAudience = role === Role.STUDENT ? ProcedureAudience.STUDENT : role === Role.EMPLOYEE ? ProcedureAudience.EMPLOYEE : undefined;
    const hasAudienceAccess = !requiredAudience || procedure.targetAudience?.includes(requiredAudience);
    if (role && role !== Role.SUPER_ADMIN && ((!isValidatorAccessible && procedure.status !== ProcedureStatus.PUBLISHED) || !hasAudienceAccess)) {
      throw ApiError.notFound("Procedure not found");
    }

    return procedureRepository.findRelated(
      id,
      procedure.department.toString(),
      procedure.category.toString(),
      procedure.keywords,
      limit,
      requiredAudience
    );
  },

  async create(input: ProcedureInput, createdBy: string) {
    const update: Record<string, unknown> = {
      ...input,
      effectiveDate: new Date(input.effectiveDate),
      versionNumber: input.versionNumber ?? "1.0",
      status: ProcedureStatus.DRAFT,
      createdBy,
      lastUpdate: new Date(),
    };
    (["startDate", "endDate", "deadline"] as const).forEach((field) => {
      if (input[field] !== undefined) update[field] = input[field] ? new Date(input[field]!) : undefined;
    });

    const procedure = await procedureRepository.create(update as never);

    await validationHistoryRepository.create({
      procedureId: procedure._id.toString(),
      action: ValidationAction.RETURNED_TO_DRAFT,
      actor: createdBy,
      comment: "Procedure created as draft.",
    } as never);
    return procedure;
  },

  async update(id: string, input: Partial<ProcedureInput>, actorId: string) {
    const existing = await procedureRepository.findById(id);
    if (!existing) throw ApiError.notFound("Procedure not found");
    if (![ProcedureStatus.DRAFT, ProcedureStatus.REJECTED].includes(existing.status)) {
      throw ApiError.conflict("Only draft or rejected procedures can be edited directly. Published procedures must be revised through a new version.");
    }

    const { changeType = ChangeType.MINOR, changeDescription, ...changes } = input;
    delete changes.status;
    const update: Record<string, unknown> = { ...changes, lastUpdate: new Date() };
    if (input.effectiveDate) update.effectiveDate = new Date(input.effectiveDate);
    (["startDate", "endDate", "deadline"] as const).forEach((field) => {
      if (input[field] !== undefined) update[field] = input[field] ? new Date(input[field]!) : undefined;
    });
    if (existing.status === ProcedureStatus.REJECTED) {
      update.status = ProcedureStatus.DRAFT;
    }

    const procedure = await procedureRepository.updateById(id, update as never);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    if (existing.status === ProcedureStatus.REJECTED) {
      await validationHistoryRepository.create({
        procedureId: id,
        action: ValidationAction.RETURNED_TO_DRAFT,
        actor: actorId,
      } as never);
    }

    return procedure;
  },

  async createRevision(id: string, actorId: string, actorRole: Role) {
    if (actorRole !== Role.SUPER_ADMIN) {
      throw ApiError.forbidden("Only administrators can create procedure revisions");
    }
    const existing = await procedureRepository.findById(id);
    if (!existing) throw ApiError.notFound("Procedure not found");
    if (existing.status !== ProcedureStatus.PUBLISHED) {
      throw ApiError.conflict("Only published procedures can be revised");
    }

    await procedureVersionService.createSnapshot(id, actorId, ChangeType.MINOR, "Version before revision");

    const revision = await procedureRepository.create({
      title: existing.title,
      description: existing.description,
      department: existing.department,
      category: existing.category,
      keywords: existing.keywords,
      requiredDocuments: existing.requiredDocuments,
      steps: existing.steps,
      responsiblePerson: existing.responsiblePerson,
      effectiveDate: existing.effectiveDate,
      versionNumber: existing.versionNumber,
      status: ProcedureStatus.DRAFT,
      createdBy: actorId,
      lastUpdate: new Date(),
      startDate: existing.startDate,
      endDate: existing.endDate,
      deadline: existing.deadline,
      showInCalendar: existing.showInCalendar,
      eventType: existing.eventType,
    } as never);

    await validationHistoryRepository.create({
      procedureId: revision._id.toString(),
      action: ValidationAction.RETURNED_TO_DRAFT,
      actor: actorId,
      comment: "New revision created from published procedure.",
    } as never);

    return revision;
  },

  async submitForReview(id: string, actorId: string, actorRole: Role, comment?: string) {
    const procedure = await this.transition(id, ProcedureStatus.PENDING_REVIEW, actorId, actorRole, comment, ValidationAction.SUBMITTED);
    await notificationService.notifyRole(
      Role.VALIDATOR,
      NotificationType.PROCEDURE_SUBMITTED_FOR_REVIEW,
      `Procedure "${procedure.title}" is awaiting validation.`,
      procedure._id.toString(),
      actorId
    );
    return procedure;
  },

  async approve(id: string, actorId: string, actorRole: Role, comment?: string) {
    const procedure = await this.transition(id, ProcedureStatus.APPROVED, actorId, actorRole, comment, ValidationAction.APPROVED, true);
    await notificationService.notifyUser(
      procedure.createdBy.toString(),
      NotificationType.PROCEDURE_APPROVED,
      `Procedure "${procedure.title}" has been approved.`,
      procedure._id.toString()
    );
    return procedure;
  },

  async reject(id: string, actorId: string, actorRole: Role, comment: string) {
    if (!comment?.trim()) throw ApiError.badRequest("A rejection comment is required");
    const procedure = await this.transition(id, ProcedureStatus.REJECTED, actorId, actorRole, comment, ValidationAction.REJECTED, true);
    await notificationService.notifyUser(
      procedure.createdBy.toString(),
      NotificationType.PROCEDURE_REJECTED,
      `Procedure "${procedure.title}" has been rejected.`,
      procedure._id.toString()
    );
    return procedure;
  },

  async publish(id: string, actorId: string, actorRole: Role) {
    const procedure = await this.transition(id, ProcedureStatus.PUBLISHED, actorId, actorRole, undefined, ValidationAction.PUBLISHED);
    await notificationService.notifyAll(
      NotificationType.PROCEDURE_PUBLISHED,
      `Procedure "${procedure.title}" has been published.`,
      procedure._id.toString(),
      actorId
    );
    return procedure;
  },

  async archive(id: string, actorId: string, actorRole: Role) {
    const procedure = await this.transition(id, ProcedureStatus.ARCHIVED, actorId, actorRole, undefined, ValidationAction.ARCHIVED);
    await notificationService.notifyAll(
      NotificationType.PROCEDURE_ARCHIVED,
      `Procedure "${procedure.title}" has been archived.`,
      procedure._id.toString(),
      actorId
    );
    return procedure;
  },

  async validationHistory(procedureId: string, role: Role) {
    await this.getById(procedureId, false, role);
    return validationHistoryRepository.findByProcedure(procedureId);
  },

  async transition(
    id: string,
    targetStatus: ProcedureStatus,
    actorId: string,
    actorRole: Role,
    comment: string | undefined,
    action: ValidationAction,
    preventSelfReview = false
  ) {
    const current = await procedureRepository.findById(id);
    if (!current) throw ApiError.notFound("Procedure not found");
    if (preventSelfReview && current.createdBy.toString() === actorId) {
      throw ApiError.forbidden("A procedure cannot be validated by its creator");
    }
    assertWorkflowTransition(current.status, targetStatus);
    this.assertRoleForTransition(current.status, targetStatus, actorRole);

    const now = new Date();
    const update: Record<string, unknown> = { status: targetStatus, lastUpdate: now };
    if (targetStatus === ProcedureStatus.PENDING_REVIEW) {
      update.submittedAt = now;
      update.submittedBy = actorId;
    }
    if (targetStatus === ProcedureStatus.APPROVED) {
      update.approvedAt = now;
      update.approvedBy = actorId;
    }
    if (targetStatus === ProcedureStatus.REJECTED) {
      update.rejectedAt = now;
      update.rejectedBy = actorId;
      update.lastValidationComment = comment?.trim();
    }
    if (targetStatus === ProcedureStatus.PUBLISHED) {
      update.publishedAt = now;
      update.publishedBy = actorId;
    }

    const procedure = await procedureRepository.updateById(id, update as never);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    await validationHistoryRepository.create({ procedureId: id, action, actor: actorId, comment: comment?.trim() } as never);
    return procedure;
  },

  assertRoleForTransition(from: ProcedureStatus, to: ProcedureStatus, role: Role) {
    if (to === ProcedureStatus.PENDING_REVIEW && role !== Role.SUPER_ADMIN) {
      throw ApiError.forbidden("Only administrators can submit procedures for review");
    }
    if ([ProcedureStatus.APPROVED, ProcedureStatus.REJECTED].includes(to) && role !== Role.VALIDATOR) {
      throw ApiError.forbidden("Only validators can approve or reject procedures");
    }
    if (to === ProcedureStatus.PUBLISHED && role !== Role.SUPER_ADMIN) {
      throw ApiError.forbidden("Only administrators can publish procedures");
    }
    if (to === ProcedureStatus.ARCHIVED && role !== Role.SUPER_ADMIN) {
      throw ApiError.forbidden("Only administrators can archive procedures");
    }
  },

  async remove(id: string) {
    const procedure = await procedureRepository.deleteById(id);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    return procedure;
  },
};
