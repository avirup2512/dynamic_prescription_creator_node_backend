import { BaseModel } from "../common/base.model";
import { TemplateRowsColumn } from "../../types/entities";

export class TemplateRowsColumnModel extends BaseModel<TemplateRowsColumn> {
  constructor() {
    super(
      "template_rows_columns",
      "id",
      ['row_id', 'column_id'],
      [],
    );
  }
}
