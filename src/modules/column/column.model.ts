import { BaseModel } from "../common/base.model";
import { Column } from "../../types/entities";

export class ColumnModel extends BaseModel<Column> {
  constructor() {
    super(
      "columns",
      "id",
      ['name', 'width', 'is_deleted'],
      ['name'],
    );
  }
}
