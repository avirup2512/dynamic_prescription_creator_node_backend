import { BaseService } from "../common/base.service";
import { InputEntityValueModel } from "./inputEntityValue.model";
import { InputEntityValue } from "../../types/entities";

export class InputEntityValueService extends BaseService<InputEntityValue> {
  constructor() {
    super(new InputEntityValueModel());
  }
}

export default new InputEntityValueService();
