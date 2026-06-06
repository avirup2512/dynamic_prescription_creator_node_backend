import { BaseService } from "../common/base.service";
import { TemplateColumnInputModel } from "./templateColumnInput.model";
import { TemplateColumnInput } from "../../types/entities";

export class TemplateColumnInputService extends BaseService<TemplateColumnInput> {
  constructor() {
    super(new TemplateColumnInputModel());
  }
}

export default new TemplateColumnInputService();
