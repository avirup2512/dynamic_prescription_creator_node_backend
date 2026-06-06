import { BaseModel } from "../common/base.model";
import { SectionRow } from "../../types/entities";

export class SectionRowModel extends BaseModel<SectionRow> {
  constructor() {
    super(
      "section_rows",
      "id",
      ['section_id', 'row_id'],
      [],
    );
  }
}
