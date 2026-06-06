import { BaseService } from "../common/base.service";
import { TemplateSectionModel } from "./templateSection.model";
import { TemplateSection } from "../../types/entities";

export class TemplateSectionService extends BaseService<TemplateSection> {
  constructor() {
    super(new TemplateSectionModel());
  }
}

export default new TemplateSectionService();
