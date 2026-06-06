import { BaseService } from "../common/base.service";
import { QuantityModel } from "./quantity.model";
import { Quantity } from "../../types/entities";

export class QuantityService extends BaseService<Quantity> {
  constructor() {
    super(new QuantityModel());
  }
  async createQuantity(data: Partial<Quantity>) {
      const model = this.model as QuantityModel;
      const result = await model.createQuantity(data);
      return result;
  }
  async getAllQuantityInputInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
      const model = this.model as QuantityModel;
      const result = await model.getAllQuantityInputInformationById(id, filters);
      return result;
  }
  async updateQuantityEntity(id: string | string[], data: Partial<any>) {
    const model = this.model as QuantityModel;
    const result = await model.updateQuantityEntity(id, data);
    return result;
  }
  async deleteQuantity(id: string | string[]) {
    const model = this.model as QuantityModel;
    const result = await model.deleteQuantity(id);
    return result;
  }
  async findAllQuantity(filters: Record<string, unknown> = {}) {
    const model = this.model as QuantityModel;
    const result = await model.findAllQuantity(filters);
    return result;
  }
}

export default new QuantityService();
