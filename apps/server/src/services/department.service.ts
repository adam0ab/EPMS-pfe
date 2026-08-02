import { departmentRepository } from "../repositories/department.repository";
import { procedureRepository } from "../repositories/procedure.repository";
import { ApiError } from "../utils/ApiError";

export const departmentService = {
  async list() {
    const departments = await departmentRepository.find({}, { sort: { name: 1 } });
    const counts = await procedureRepository.countByDepartment();
    const countMap = new Map(counts.map((c) => [c.department, c.count]));

    return departments.map((d) => ({
      _id: d._id.toString(),
      name: d.name,
      description: d.description,
      procedureCount: countMap.get(d.name) ?? 0,
    }));
  },

  async create(name: string, description?: string) {
    const existing = await departmentRepository.findByName(name);
    if (existing) throw ApiError.conflict("Department already exists");
    return departmentRepository.create({ name, description });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    const department = await departmentRepository.updateById(id, data as never);
    if (!department) throw ApiError.notFound("Department not found");
    return department;
  },

  async remove(id: string) {
    const procedureCount = await procedureRepository.countByDepartmentId(id);
    if (procedureCount > 0) {
      throw ApiError.conflict("This department is used by existing procedures and cannot be deleted");
    }
    const department = await departmentRepository.deleteById(id);
    if (!department) throw ApiError.notFound("Department not found");
    return department;
  },
};
