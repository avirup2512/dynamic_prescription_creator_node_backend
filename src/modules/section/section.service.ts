import { BaseService } from "../common/base.service";
import { SectionModel } from "./section.model";
import { Section } from "../../types/entities";
import { UUID } from "./section-types";

export class SectionService extends BaseService<Section> {
  constructor() {
    super(new SectionModel());
  }
  create(data: Partial<Section>) {
    return super.create(data);
  }
  async createSection(data: any, user_id: UUID) {
    const model = this.model as SectionModel;
    return await model.upsertSection(data, user_id);
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
  async updateSection(data: any, user_id: UUID) {
    const model = this.model as SectionModel;
    return await model.upsertSection(data, user_id);
  }
}

export default new SectionService();
