import { Schema, model, Types } from "mongoose";

export interface StudentChecklistDocument {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  procedure: Types.ObjectId;
  completedStepOrders: number[];
  createdAt: Date;
  updatedAt: Date;
}

const studentChecklistSchema = new Schema<StudentChecklistDocument>(
  {
    student: { type: Schema.Types.ObjectId, ref: "User", required: true },
    procedure: { type: Schema.Types.ObjectId, ref: "Procedure", required: true },
    completedStepOrders: { type: [Number], default: [] },
  },
  { timestamps: true }
);

studentChecklistSchema.index({ student: 1, procedure: 1 }, { unique: true });
studentChecklistSchema.index({ student: 1, updatedAt: -1 });

export const StudentChecklistModel = model<StudentChecklistDocument>("StudentChecklist", studentChecklistSchema);
