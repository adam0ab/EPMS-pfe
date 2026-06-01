import { Schema, model, Types } from "mongoose";
import { AuditAction } from "@epms/shared";

export interface AuditLogDocument {
  _id: Types.ObjectId;
  actor: Types.ObjectId;
  action: AuditAction;
  entityType: string;
  entityId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: Object.values(AuditAction), required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

auditLogSchema.index({ entityType: 1, entityId: 1 });

export const AuditLogModel = model<AuditLogDocument>("AuditLog", auditLogSchema);
