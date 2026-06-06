import { BaseModel } from "../common/base.model";
import { TemplateRow } from "../../types/entities";

export class TemplateRowModel extends BaseModel<TemplateRow> {
  constructor() {
    super(
      "template_rows",
      "id",
      ['name', 'is_deleted'],
      ['name'],
    );
  }
}
