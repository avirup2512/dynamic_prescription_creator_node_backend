import { BaseService } from "../common/base.service";
import { RowsColumnModel } from "./rowsColumn.model";
import { RowsColumn } from "../../types/entities";

export class RowsColumnService extends BaseService<RowsColumn> {
  constructor() {
    super(new RowsColumnModel());
  }
}

export default new RowsColumnService();
