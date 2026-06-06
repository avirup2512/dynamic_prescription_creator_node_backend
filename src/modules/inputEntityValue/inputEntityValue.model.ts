import { BaseModel } from "../common/base.model";
import { InputEntityValue } from "../../types/entities";

export class InputEntityValueModel extends BaseModel<InputEntityValue> {
  constructor() {
    super(
      "input_entity_values",
      "id",
      ['input_entity_id', 'value'],
      ['value'],
    );
  }
}
