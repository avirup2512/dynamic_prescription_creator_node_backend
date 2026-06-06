import { BaseService } from "../common/base.service";
import { FormatModel } from "./format.model";
import { Format } from "../../types/entities";

export class FormatService extends BaseService<Format> {
  constructor() {
    super(new FormatModel());
  }
}

export default new FormatService();
