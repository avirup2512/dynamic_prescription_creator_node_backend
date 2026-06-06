import { BaseService } from "../common/base.service";
import { SectionModel } from "./section.model";
import { Section } from "../../types/entities";

export class SectionService extends BaseService<Section> {
  constructor() {
    super(new SectionModel());
  }
  create(data: Partial<Section>) {
    return super.create(data);
  }
  async createSection(data: Partial<any>) {
    const model = this.model as SectionModel;
    return await model.createSection(data);
  }
  async getAllSections(filters: Record<string, unknown> = {}) {
    const model = this.model as SectionModel;
    return await model.getAllSections(filters);
  }
  async getAllSectionInformationById(id: string | string[], filters: Record<string, unknown> = {}) {
    const model = this.model as SectionModel;
    const result = await model.getAllSectionInformationById(id, filters);
    return result;
  }
  async updateSection(sectionId: string, data: Partial<any>) {
    const model = this.model as SectionModel;
    return await model.updateSection(sectionId, data);
  }
}

export default new SectionService();
