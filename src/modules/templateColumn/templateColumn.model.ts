import { BaseModel } from "../common/base.model";
import { TemplateColumn } from "../../types/entities";

export class TemplateColumnModel extends BaseModel<TemplateColumn> {
  constructor() {
    super(
      "template_columns",
      "id",
      ['name', 'width'],
      ['name'],
    );
  }
}
