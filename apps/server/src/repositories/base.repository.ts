import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";

export class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  create(data: Partial<T>) {
    return this.model.create(data);
  }

  findById(id: string, options?: QueryOptions) {
    return this.model.findById(id, undefined, options);
  }

  findOne(filter: FilterQuery<T>) {
    return this.model.findOne(filter);
  }

  find(filter: FilterQuery<T> = {}, options?: QueryOptions) {
    return this.model.find(filter, undefined, options);
  }

  count(filter: FilterQuery<T> = {}) {
    return this.model.countDocuments(filter);
  }

  updateById(id: string, update: UpdateQuery<T>) {
    return this.model.findByIdAndUpdate(id, update, { new: true });
  }

  deleteById(id: string) {
    return this.model.findByIdAndDelete(id);
  }
}
