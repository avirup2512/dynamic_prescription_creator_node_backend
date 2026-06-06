import { BaseModel } from "../common/base.model";
import { InputType } from "../../types/entities";

export class InputTypeModel extends BaseModel<InputType> {
  constructor() {
    super(
      "input_types",
      "id",
      ['name'],
      ['name'],
    );
  }
}
