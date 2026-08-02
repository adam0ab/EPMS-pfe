import { Schema, model, Types } from "mongoose";
import { ValidationAction } from "@epms/shared";

export interface ValidationHistoryDocument {
  _id: Types.ObjectId;
  procedureId: Types.ObjectId;
  action: ValidationAction;
  actor: Types.ObjectId;
  comment?: string;
  createdAt: Date;
}

const validationHistorySchema = new Schema<ValidationHistoryDocument>(
  {
    procedureId: { type: Schema.Types.ObjectId, ref: "Procedure", required: true, index: true },
    action: { type: String, enum: Object.values(ValidationAction), required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    comment: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

validationHistorySchema.index({ procedureId: 1, createdAt: 1 });

export const ValidationHistoryModel = model<ValidationHistoryDocument>("ValidationHistory", validationHistorySchema);
