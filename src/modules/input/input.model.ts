import { BaseModel } from "../common/base.model";
import { Input } from "../../types/entities";

export class InputModel extends BaseModel<Input> {
  constructor() {
    super(
      "inputs",
      "id",
      ['type_id', 'label', 'show_label', 'show_quantity', 'is_deleted'],
      ['label'],
    );
  }
}
