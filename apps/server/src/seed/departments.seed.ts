import { DEPARTMENTS } from "@epms/shared";
import { DepartmentModel } from "../models/Department.model";

export async function seedDepartments() {
  const docs = await Promise.all(
    DEPARTMENTS.map((name) =>
      DepartmentModel.findOneAndUpdate({ name }, { name }, { upsert: true, new: true })
    )
  );
  console.log(`[seed] ${docs.length} departments ready`);
  return docs;
}
