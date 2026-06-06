import { BaseModel } from "../common/base.model";
import { TemplateSectionRow } from "../../types/entities";

export class TemplateSectionRowModel extends BaseModel<TemplateSectionRow> {
  constructor() {
    super(
      "template_section_rows",
      "id",
      ['section_id', 'row_id'],
      [],
    );
  }
}
