import { Schema, model, Types } from "mongoose";
import { ProcedureStatus, ProcedureStep } from "@epms/shared";

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
    viewCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

procedureSchema.index({ title: "text", description: "text", keywords: "text" });
procedureSchema.index({ department: 1, status: 1 });
procedureSchema.index({ category: 1 });

export const ProcedureModel = model<ProcedureDocument>("Procedure", procedureSchema);
