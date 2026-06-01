import { Schema, model, Types } from "mongoose";

export interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  group: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true },
    group: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1, group: 1 }, { unique: true });

export const CategoryModel = model<CategoryDocument>("Category", categorySchema);
