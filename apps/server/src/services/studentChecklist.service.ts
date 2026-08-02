import { ProcedureStatus } from "@epms/shared";
import { ApiError } from "../utils/ApiError";
import { procedureRepository } from "../repositories/procedure.repository";
import { studentChecklistRepository } from "../repositories/studentChecklist.repository";
import { StudentChecklistDocument } from "../models/StudentChecklist.model";

function toChecklistDto(checklist: StudentChecklistDocument & { procedure?: any }) {
  const procedure = checklist.procedure;
  if (!procedure || typeof procedure === "string") return null;
  // Procedure steps are Mongoose subdocuments. Serialize only the existing
  // task fields rather than spreading their internal document properties.
  const steps = [...(procedure.steps ?? [])].sort((a, b) => a.order - b.order).map((step) => ({
    order: step.order,
    description: step.description,
    completed: checklist.completedStepOrders.includes(step.order),
  }));
  const completedCount = steps.filter((step) => step.completed).length;
  return {
    _id: checklist._id.toString(),
    procedure: {
      _id: procedure._id.toString(), title: procedure.title, category: procedure.category,
      status: procedure.status, versionNumber: procedure.versionNumber,
    },
    steps,
    completedCount,
    totalCount: steps.length,
    progressPercent: steps.length ? Math.round((completedCount / steps.length) * 100) : 0,
    isComplete: steps.length > 0 && completedCount === steps.length,
    createdAt: checklist.createdAt,
    updatedAt: checklist.updatedAt,
  };
}

export const studentChecklistService = {
  async list(studentId: string) {
    const checklists = await studentChecklistRepository.findForStudent(studentId);
    return checklists.map((checklist) => toChecklistDto(checklist as any)).filter(Boolean);
  },

  async add(studentId: string, procedureId: string) {
    const procedure = await procedureRepository.findById(procedureId);
    if (!procedure) throw ApiError.notFound("Procedure not found");
    if (procedure.status !== ProcedureStatus.PUBLISHED) throw ApiError.forbidden("Only published procedures can be added to a checklist");
    const existing = await studentChecklistRepository.findByStudentAndProcedure(studentId, procedureId);
    if (existing) return this.get(studentId, procedureId);
    await studentChecklistRepository.create({ student: studentId, procedure: procedureId, completedStepOrders: [] } as never);
    return this.get(studentId, procedureId);
  },

  async get(studentId: string, procedureId: string) {
    const checklist = await studentChecklistRepository.findByStudentAndProcedure(studentId, procedureId)
      .populate({ path: "procedure", populate: [{ path: "category", select: "name group" }] });
    if (!checklist) throw ApiError.notFound("Checklist not found");
    const result = toChecklistDto(checklist as any);
    if (!result) throw ApiError.notFound("Procedure not found");
    return result;
  },

  async setStepCompletion(studentId: string, procedureId: string, stepOrder: number, completed: boolean) {
    const checklist = await studentChecklistRepository.findByStudentAndProcedure(studentId, procedureId)
      .populate("procedure");
    if (!checklist) throw ApiError.notFound("Checklist not found");
    const procedure = checklist.procedure as any;
    if (!procedure?.steps?.some((step: { order: number }) => step.order === stepOrder)) throw ApiError.badRequest("Procedure step not found");
    checklist.completedStepOrders = completed
      ? [...new Set([...checklist.completedStepOrders, stepOrder])]
      : checklist.completedStepOrders.filter((order) => order !== stepOrder);
    await checklist.save();
    return this.get(studentId, procedureId);
  },

  async attention(studentId: string) {
    const checklists = await this.list(studentId);
    return checklists.filter((checklist: any) => checklist.totalCount > 0 && !checklist.isComplete);
  },
};
