import { BaseService } from "../common/base.service";
import { TemplateRowModel } from "./templateRow.model";
import { TemplateRow } from "../../types/entities";

export class TemplateRowService extends BaseService<TemplateRow> {
  constructor() {
    super(new TemplateRowModel());
  }
}

export default new TemplateRowService();
