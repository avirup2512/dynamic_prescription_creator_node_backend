import { QueryResultRow,Submittable } from "pg";
import { BaseModel, ListOptions } from "./base.model";

export class BaseService<T extends any[] | QueryResultRow | Submittable> {
  constructor(protected model: BaseModel<T>) {}

  async create(data: Partial<T>) {
    return this.model.create(data);
  }

  async list(options: ListOptions) {
    return this.model.findAll(options);
  }
  async getListByJoin(tableName: string | string[], localKey: string | string[], foreignKey: string | string[], filters: Record<string, unknown> = {}) {
    return this.model.findAllWithJoin(tableName, localKey, foreignKey, filters);
  }
  async getById(id: string) {
    return this.model.findById(id);
  }

  async update(id: string, data: Partial<T>) {
    return this.model.update(id, data);
  }

  async remove(id: string) {
    return this.model.delete(id);
  }
}
