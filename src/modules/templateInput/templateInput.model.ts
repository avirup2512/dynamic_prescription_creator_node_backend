import { BaseModel } from "../common/base.model";
import { TemplateInput } from "../../types/entities";

export class TemplateInputModel extends BaseModel<TemplateInput> {
  constructor() {
    super(
      "template_inputs",
      "id",
      ['type_id', 'label', 'show_label', 'show_quantity', 'value', 'is_deleted'],
      ['label', 'value'],
    );
  }
}
