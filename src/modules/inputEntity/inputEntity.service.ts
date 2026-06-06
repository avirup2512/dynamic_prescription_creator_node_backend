import { BaseService } from "../common/base.service";
import { InputEntityModel } from "./inputEntity.model";
import { InputEntity } from "../../types/entities";

export class InputEntityService extends BaseService<InputEntity> {
  constructor() {
    super(new InputEntityModel());
  }
  async getInputTypeUUIDByName(name: string) {
    const model = this.model as InputEntityModel;
    return model.getInputTypeUUIDByName(name);
  }
  async getAllInputEntities(filters: Record<string, unknown> = {}) {
    const model = this.model as InputEntityModel;
    const result = await model.findAllInputEntity(filters);
    return result;
  }
  async getAllInputInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
    const model = this.model as InputEntityModel;
    const result = await model.getAllInputInformationById(id, filters);
    return result;
  }
  async getAllDropdownInputInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
    const model = this.model as InputEntityModel;
    const result = await model.getAllDropdownInputInformationById(id, filters);
    return result;
  }
  async createInputEntity(data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.createInputEntity(data);
    return result;
  }
  async updateInputEntity(id: string | string[], data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.updateInputEntity(id, data);
    return result;
  }
  async deleteInputEntity(id: string | string[]) {
    const model = this.model as InputEntityModel;
    const result = await model.deleteInputEntity(id);
    return result;
  }
  // Methods for Dropdown
  async createDropdownEntity(data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.createDropdownEntity(data);
    return result;
  }
  async updateDropdownEntity(id: string | string[], data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.updateDropdownEntity(id, data);
    return result;
  }
}

export default new InputEntityService();
