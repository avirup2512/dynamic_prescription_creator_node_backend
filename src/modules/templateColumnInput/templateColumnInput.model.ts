import { BaseModel } from "../common/base.model";
import { TemplateColumnInput } from "../../types/entities";

export class TemplateColumnInputModel extends BaseModel<TemplateColumnInput> {
  constructor() {
    super(
      "template_column_inputs",
      "id",
      ['column_id', 'input_id'],
      [],
    );
  }
}
