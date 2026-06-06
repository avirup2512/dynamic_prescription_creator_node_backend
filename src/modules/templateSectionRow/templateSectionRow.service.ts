import { BaseService } from "../common/base.service";
import { TemplateSectionRowModel } from "./templateSectionRow.model";
import { TemplateSectionRow } from "../../types/entities";

export class TemplateSectionRowService extends BaseService<TemplateSectionRow> {
  constructor() {
    super(new TemplateSectionRowModel());
  }
}

export default new TemplateSectionRowService();
