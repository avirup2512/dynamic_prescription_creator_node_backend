import { BaseModel } from "../common/base.model";
import { Format } from "../../types/entities";

export class FormatModel extends BaseModel<Format> {
  constructor() {
    super(
      "formats",
      "id",
      ['value'],
      ['value'],
    );
  }
}
