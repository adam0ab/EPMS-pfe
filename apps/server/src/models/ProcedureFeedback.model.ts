import { Schema, model, Types } from "mongoose";

export const feedbackCategories = ["INFORMATION_UNCLEAR", "STEP_CONFUSING", "DOCUMENTS_UNCLEAR", "OUTDATED", "DEADLINE_UNCLEAR", "DIFFICULT_TO_FOLLOW", "EVERYTHING_CLEAR", "OTHER"] as const;
export const feedbackStatuses = ["NEW", "REVIEWED", "ACTION_REQUIRED", "RESOLVED"] as const;
export interface ProcedureFeedbackDocument { _id: Types.ObjectId; student: Types.ObjectId; procedure: Types.ObjectId; procedureVersion: string; rating: number; category?: typeof feedbackCategories[number]; comment?: string; status: typeof feedbackStatuses[number]; createdAt: Date; updatedAt: Date; }
const schema = new Schema<ProcedureFeedbackDocument>({ student: { type: Schema.Types.ObjectId, ref: "User", required: true }, procedure: { type: Schema.Types.ObjectId, ref: "Procedure", required: true }, procedureVersion: { type: String, required: true }, rating: { type: Number, min: 1, max: 5, required: true }, category: { type: String, enum: feedbackCategories }, comment: { type: String, trim: true, maxlength: 500 }, status: { type: String, enum: feedbackStatuses, default: "NEW" } }, { timestamps: true });
schema.index({ student: 1, procedure: 1 }, { unique: true }); schema.index({ procedure: 1, createdAt: -1 }); schema.index({ status: 1, createdAt: -1 });
export const ProcedureFeedbackModel = model<ProcedureFeedbackDocument>("ProcedureFeedback", schema);
