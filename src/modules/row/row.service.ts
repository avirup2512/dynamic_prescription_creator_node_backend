import { BaseService } from "../common/base.service";
import { RowModel } from "./row.model";
import { Row } from "../../types/entities";

export class RowService extends BaseService<Row> {
  constructor() {
    super(new RowModel());
  }
}

export default new RowService();
