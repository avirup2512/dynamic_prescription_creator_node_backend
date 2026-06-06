import { BaseModel } from "../common/base.model";
import { RowsColumn } from "../../types/entities";

export class RowsColumnModel extends BaseModel<RowsColumn> {
  constructor() {
    super(
      "rows_columns",
      "id",
      ['row_id', 'column_id'],
      [],
    );
  }
}
