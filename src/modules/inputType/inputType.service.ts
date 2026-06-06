import { BaseService } from "../common/base.service";
import { InputTypeModel } from "./inputType.model";
import { InputType } from "../../types/entities";

export class InputTypeService extends BaseService<InputType> {
  constructor() {
    super(new InputTypeModel());
  }
}

export default new InputTypeService();
