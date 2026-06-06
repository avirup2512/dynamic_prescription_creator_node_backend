import { BaseModel } from "../common/base.model";
import { TemplateSection } from "../../types/entities";

export class TemplateSectionModel extends BaseModel<TemplateSection> {
  constructor() {
    super(
      "template_sections",
      "id",
      ['name', 'section_id', 'created_by', 'is_deleted'],
      ['name'],
    );
  }
}
