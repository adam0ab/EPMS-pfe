import { AuditAction } from "@epms/shared";
import { auditLogRepository } from "../repositories/auditLog.repository";

export const auditService = {
  log(actor: string, action: AuditAction, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    return auditLogRepository.create({
      actor,
      action,
      entityType,
      entityId,
      metadata,
    } as never);
  },

  recent(limit?: number) {
    return auditLogRepository.recent(limit);
  },
};
