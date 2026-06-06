import { BaseModel } from "../common/base.model";
import { DropdownOption } from "../../types/entities";

export class DropdownOptionModel extends BaseModel<DropdownOption> {
  constructor() {
    super(
      "dropdown_options",
      "id",
      ['value'],
      ['value'],
    );
  }
}
