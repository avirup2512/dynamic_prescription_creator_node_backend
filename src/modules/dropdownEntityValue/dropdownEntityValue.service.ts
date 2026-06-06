import { BaseService } from "../common/base.service";
import { DropdownEntityValueModel } from "./dropdownEntityValue.model";
import { DropdownEntityValue } from "../../types/entities";

export class DropdownEntityValueService extends BaseService<DropdownEntityValue> {
  constructor() {
    super(new DropdownEntityValueModel());
  }
}

export default new DropdownEntityValueService();
