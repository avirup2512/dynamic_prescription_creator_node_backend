import { BaseService } from "../common/base.service";
import { InputEntityModel } from "./inputEntity.model";
import { InputEntity } from "../../types/entities";

export class InputEntityService extends BaseService<InputEntity> {
  constructor() {
    super(new InputEntityModel());
  }
  vaildJSON(json: any)
  {
    try {
      JSON.parse(json);
      return true;
    } catch (error) {
      return false;
    }
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
  async deleteInputEntity(id: string | string[], user_id:string) {
    const model = this.model as InputEntityModel;
    const result = await model.deleteInputEntity(id,user_id);
    return result;
  }
  // Methods for Dropdown
  async createDropdownEntity(data: Partial<InputEntity>, isGlobal:number) {
    const model = this.model as InputEntityModel;
    const result = await model.createDropdownEntity(data,isGlobal);
    return result;
  }
  async updateDropdownEntity(id: string | string[], data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.updateDropdownEntity(id, data);
    return result;
  }
  async AddSingleDropdownEntity(id: string | string[], data: Partial<InputEntity>) {
    const model = this.model as InputEntityModel;
    const result = await model.AddSingleDropdownEntity(id, data);
    return result;
  }
  async getDropdownContentFromAI(text:string) {
    const model = this.model as InputEntityModel;
    const result: any = await model.getDropdownContentFromAI(text);
    console.log(result);
    if(this.vaildJSON(result))
      return result;
    return null;
  }
  async searchGlobalDropdownOptionsInDB(searchText: string)
  {
    const model = this.model as InputEntityModel;
    const result: any = await model.searchGlobalDropdownOptionsInDB(searchText);
    return result;
  }
  async createGlobalDropdown(data: Partial<InputEntity>)
  {
    const model = this.model as InputEntityModel;
    const result = await model.createGlobalDropdown(data);
    return result;
  }
}

export default new InputEntityService();
