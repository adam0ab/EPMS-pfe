import { DepartmentDocument, DepartmentModel } from "../models/Department.model";
import { BaseRepository } from "./base.repository";

export class DepartmentRepository extends BaseRepository<DepartmentDocument> {
  constructor() {
    super(DepartmentModel);
  }

  findByName(name: string) {
    return this.model.findOne({ name });
  }
}

export const departmentRepository = new DepartmentRepository();
