import { AuditLogDocument, AuditLogModel } from "../models/AuditLog.model";
import { BaseRepository } from "./base.repository";

export class AuditLogRepository extends BaseRepository<AuditLogDocument> {
  constructor() {
    super(AuditLogModel);
  }

  recent(limit = 50) {
    return this.model.find().populate("actor", "fullName email").sort({ createdAt: -1 }).limit(limit);
  }
}

export const auditLogRepository = new AuditLogRepository();
