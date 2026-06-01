import { Schema, model, Types } from "mongoose";
import { Role } from "@epms/shared";

export interface UserDocument {
  _id: Types.ObjectId;
  fullName: string;
  email: string;
  passwordHash: string;
  role: Role;
  department?: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: Object.values(Role), required: true, default: Role.EMPLOYEE },
    department: { type: Schema.Types.ObjectId, ref: "Department" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const UserModel = model<UserDocument>("User", userSchema);
