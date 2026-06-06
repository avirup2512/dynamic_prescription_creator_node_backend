import { BaseModel } from "../common/base.model";
import { InputValue } from "../../types/entities";

export class InputValueModel extends BaseModel<InputValue> {
  constructor() {
    super(
      "input_values",
      "id",
      ['input_entity_type_id', 'quantity_id', 'format_id'],
      [],
    );
  }
}
