import { Schema, model, Types } from "mongoose";
import { ProcedureAudience, ProcedureStatus, ProcedureStep } from "@epms/shared";

export interface ProcedureDocument {
  _id: Types.ObjectId;
  title: string;
  description: string;
  department: Types.ObjectId;
  category: Types.ObjectId;
  keywords: string[];
  requiredDocuments: string[];
  steps: ProcedureStep[];
  responsiblePerson: string;
  effectiveDate: Date;
  lastUpdate: Date;
  versionNumber: string;
  status: ProcedureStatus;
  targetAudience: ProcedureAudience[];
  submittedAt?: Date;
  submittedBy?: Types.ObjectId;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  publishedAt?: Date;
  publishedBy?: Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  deadline?: Date;
  showInCalendar: boolean;
  eventType?: string;
  lastValidationComment?: string;
  viewCount: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stepSchema = new Schema<ProcedureStep>(
  {
    order: { type: Number, required: true },
    description: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const procedureSchema = new Schema<ProcedureDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    keywords: { type: [String], default: [] },
    requiredDocuments: { type: [String], default: [] },
    steps: { type: [stepSchema], default: [] },
    responsiblePerson: { type: String, required: true, trim: true },
    effectiveDate: { type: Date, required: true },
    lastUpdate: { type: Date, default: Date.now },
    versionNumber: { type: String, required: true, default: "1.0" },
    status: {
      type: String,
      enum: Object.values(ProcedureStatus),
      default: ProcedureStatus.DRAFT,
    },
    targetAudience: {
      type: [{ type: String, enum: Object.values(ProcedureAudience) }],
      default: [ProcedureAudience.STUDENT, ProcedureAudience.EMPLOYEE],
      validate: {
        validator: (audiences: ProcedureAudience[]) => Array.isArray(audiences) && audiences.length > 0,
        message: "A procedure must target at least one audience",
      },
    },
    submittedAt: { type: Date },
    submittedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: "User" },
    startDate: { type: Date },
    endDate: { type: Date },
    deadline: { type: Date },
    showInCalendar: { type: Boolean, default: false },
    eventType: { type: String, trim: true },
    lastValidationComment: { type: String, trim: true },
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

procedureSchema.index({ title: "text", description: "text", keywords: "text" });
procedureSchema.index({ department: 1, status: 1 });
procedureSchema.index({ category: 1 });
procedureSchema.index({ status: 1, targetAudience: 1 });

export const ProcedureModel = model<ProcedureDocument>("Procedure", procedureSchema);
