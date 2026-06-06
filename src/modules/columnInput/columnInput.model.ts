import { BaseModel } from "../common/base.model";
import { ColumnInput } from "../../types/entities";

export class ColumnInputModel extends BaseModel<ColumnInput> {
  constructor() {
    super(
      "column_inputs",
      "id",
      ['column_id', 'input_id'],
      [],
    );
  }
}
