import { BaseService } from "../common/base.service";
import { ColumnInputModel } from "./columnInput.model";
import { ColumnInput } from "../../types/entities";

export class ColumnInputService extends BaseService<ColumnInput> {
  constructor() {
    super(new ColumnInputModel());
  }
}

export default new ColumnInputService();
