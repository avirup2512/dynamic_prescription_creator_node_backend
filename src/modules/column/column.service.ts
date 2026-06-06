import { BaseService } from "../common/base.service";
import { ColumnModel } from "./column.model";
import { Column } from "../../types/entities";

export class ColumnService extends BaseService<Column> {
  constructor() {
    super(new ColumnModel());
  }
}

export default new ColumnService();
