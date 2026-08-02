import { categoryRepository } from "../repositories/category.repository";
import { procedureRepository } from "../repositories/procedure.repository";
import { ApiError } from "../utils/ApiError";

export const categoryService = {
  async list() {
    const categories = await categoryRepository.find({}, { sort: { group: 1, name: 1 } });
    return categories.map((c) => ({ _id: c._id.toString(), name: c.name, group: c.group }));
  },

  async create(name: string, group: string) {
    const existing = await categoryRepository.findByNameAndGroup(name, group);
    if (existing) throw ApiError.conflict("Category already exists in this group");
    return categoryRepository.create({ name, group });
  },

  async update(id: string, data: { name?: string; group?: string }) {
    const category = await categoryRepository.updateById(id, data as never);
    if (!category) throw ApiError.notFound("Category not found");
    return category;
  },

  async remove(id: string) {
    const procedureCount = await procedureRepository.countByCategoryId(id);
    if (procedureCount > 0) {
      throw ApiError.conflict("This category is used by existing procedures and cannot be deleted");
    }
    const category = await categoryRepository.deleteById(id);
    if (!category) throw ApiError.notFound("Category not found");
    return category;
  },
};
