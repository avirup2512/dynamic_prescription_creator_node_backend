import { BaseService } from "../common/base.service";
import { InputValueModel } from "./inputValue.model";
import { InputValue } from "../../types/entities";

export class InputValueService extends BaseService<InputValue> {
  constructor() {
    super(new InputValueModel());
  }
}

export default new InputValueService();
