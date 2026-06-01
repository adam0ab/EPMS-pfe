import { Schema, model, Types } from "mongoose";

export interface DepartmentDocument {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<DepartmentDocument>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export const DepartmentModel = model<DepartmentDocument>("Department", departmentSchema);
