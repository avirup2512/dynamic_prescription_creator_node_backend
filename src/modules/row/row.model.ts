import { BaseModel } from "../common/base.model";
import { Row } from "../../types/entities";

export class RowModel extends BaseModel<Row> {
  constructor() {
    super(
      "rows",
      "id",
      ['name', 'is_deleted'],
      ['name'],
    );
  }
}
