import { BaseService } from "../common/base.service";
import { TemplateColumnModel } from "./templateColumn.model";
import { TemplateColumn } from "../../types/entities";

export class TemplateColumnService extends BaseService<TemplateColumn> {
  constructor() {
    super(new TemplateColumnModel());
  }
}

export default new TemplateColumnService();
