import { CategoryDocument, CategoryModel } from "../models/Category.model";
import { BaseRepository } from "./base.repository";

export class CategoryRepository extends BaseRepository<CategoryDocument> {
  constructor() {
    super(CategoryModel);
  }

  findByNameAndGroup(name: string, group: string) {
    return this.model.findOne({ name, group });
  }
}

export const categoryRepository = new CategoryRepository();
