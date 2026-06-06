import { BaseService } from "../common/base.service";
import { DropdownOptionModel } from "./dropdownOption.model";
import { DropdownOption } from "../../types/entities";

export class DropdownOptionService extends BaseService<DropdownOption> {
  constructor() {
    super(new DropdownOptionModel());
  }
}

export default new DropdownOptionService();
