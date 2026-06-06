import { BaseService } from "../common/base.service";
import { SectionRowModel } from "./sectionRow.model";
import { SectionRow } from "../../types/entities";

export class SectionRowService extends BaseService<SectionRow> {
  constructor() {
    super(new SectionRowModel());
  }
}

export default new SectionRowService();
