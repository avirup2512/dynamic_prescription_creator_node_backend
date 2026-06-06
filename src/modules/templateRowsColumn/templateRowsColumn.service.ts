import { BaseService } from "../common/base.service";
import { TemplateRowsColumnModel } from "./templateRowsColumn.model";
import { TemplateRowsColumn } from "../../types/entities";

export class TemplateRowsColumnService extends BaseService<TemplateRowsColumn> {
  constructor() {
    super(new TemplateRowsColumnModel());
  }
}

export default new TemplateRowsColumnService();
