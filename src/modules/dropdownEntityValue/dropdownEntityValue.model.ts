import { BaseModel } from "../common/base.model";
import { DropdownEntityValue } from "../../types/entities";

export class DropdownEntityValueModel extends BaseModel<DropdownEntityValue> {
  constructor() {
    super(
      "dropdown_entity_values",
      "id",
      ['input_entity_id', 'option_id'],
      [],
    );
  }
}
