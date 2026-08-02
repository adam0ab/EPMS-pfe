import { ProcedureAudience, ProcedureStatus, Role } from "@epms/shared";
import { StudentCalendarEntryModel } from "../models/StudentCalendarEntry.model";
import { procedureService } from "./procedure.service";
import { ApiError } from "../utils/ApiError";

function hasDate(procedure: any) { return Boolean(procedure.deadline || procedure.startDate || procedure.endDate); }

export const studentCalendarService = {
  async list(studentId: string) {
    const entries = await StudentCalendarEntryModel.find({ student: studentId }).populate({ path: "procedure", populate: [{ path: "department", select: "name" }, { path: "category", select: "name group" }] }).sort({ createdAt: -1 });
    return entries.map((entry: any) => entry.procedure).filter((procedure: any) => procedure && procedure.status === ProcedureStatus.PUBLISHED && procedure.targetAudience?.includes(ProcedureAudience.STUDENT) && hasDate(procedure));
  },

  async add(studentId: string, procedureId: string) {
    const procedure = await procedureService.getById(procedureId, false, Role.STUDENT);
    if (!hasDate(procedure)) throw ApiError.badRequest("A procedure needs a deadline, start date, or end date before it can be added to your calendar");
    await StudentCalendarEntryModel.updateOne({ student: studentId, procedure: procedureId }, { $setOnInsert: { student: studentId, procedure: procedureId } }, { upsert: true });
    return procedure;
  },

  async remove(studentId: string, procedureId: string) {
    await StudentCalendarEntryModel.deleteOne({ student: studentId, procedure: procedureId });
  },
};
