import { StudentChecklistDocument, StudentChecklistModel } from "../models/StudentChecklist.model";
import { BaseRepository } from "./base.repository";

export class StudentChecklistRepository extends BaseRepository<StudentChecklistDocument> {
  constructor() { super(StudentChecklistModel); }

  findByStudentAndProcedure(studentId: string, procedureId: string) {
    return this.model.findOne({ student: studentId, procedure: procedureId });
  }

  findForStudent(studentId: string) {
    return this.model.find({ student: studentId }).populate({ path: "procedure", populate: [{ path: "category", select: "name group" }] }).sort({ updatedAt: -1 });
  }
}

export const studentChecklistRepository = new StudentChecklistRepository();
