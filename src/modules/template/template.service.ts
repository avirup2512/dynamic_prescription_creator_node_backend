import { BaseService } from "../common/base.service";
import { TemplateModel } from "./template.model";
import { Template } from "../../types/entities";

export class TemplateService extends BaseService<Template> {
  constructor() {
    super(new TemplateModel());
  }
  async createTemplate(data: Partial<any>) {
    const model = this.model as TemplateModel;
    return model.createTemplate(data);
  }
  async createDraftTemplate(data: Partial<any>) {
    const model = this.model as TemplateModel;
    return model.createDraftTemplate(data);
  }
  async updateTemplate(id: string, data: Partial<any>) {
    const model = this.model as TemplateModel;
    return model.updateTemplate(id, data);
  }
  async getAllTemplateInfoById(id: string | string[], filters: Record<string, unknown> = {}) {
    const model = this.model as TemplateModel;
    const result = await model.getAllTemplateInfoById(id, filters);
    return result;
  }
  async getAllTemplates(filters: Record<string, unknown> = {}) {
    const model = this.model as TemplateModel;
    return await model.getAllTemplates(filters);
  }
  async createAndAssignSectionToTemplate(data: Partial<any>) {
    const model = this.model as TemplateModel;
    return model.createAndAssignSectionToTemplate(data);
  }

  searchAllTypesOfInputByKeyword(keyword: string) {
    const model = this.model as TemplateModel;
    return model.searchAllTypesOfInputByKeyword(keyword);
  }
  addIndividualRowToTemplateSection(templateSectionId: string, rowData: any) {
    const model = this.model as TemplateModel;
    return model.addIndividualRowToTemplateSection(templateSectionId, rowData);
  }
  addColumnToRow(templateRowId: string, columnData: any) {
    const model = this.model as TemplateModel;
    return model.addColumnToRow(templateRowId, columnData);
  }
}

export default new TemplateService();
