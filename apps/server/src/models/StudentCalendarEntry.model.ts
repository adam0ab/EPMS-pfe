import { Schema, model, Types } from "mongoose";

export interface StudentCalendarEntryDocument {
  _id: Types.ObjectId;
  student: Types.ObjectId;
  procedure: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentCalendarEntrySchema = new Schema<StudentCalendarEntryDocument>({
  student: { type: Schema.Types.ObjectId, ref: "User", required: true },
  procedure: { type: Schema.Types.ObjectId, ref: "Procedure", required: true },
}, { timestamps: true });

studentCalendarEntrySchema.index({ student: 1, procedure: 1 }, { unique: true });
export const StudentCalendarEntryModel = model<StudentCalendarEntryDocument>("StudentCalendarEntry", studentCalendarEntrySchema);
