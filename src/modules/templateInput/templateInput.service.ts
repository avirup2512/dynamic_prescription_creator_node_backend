import { BaseService } from "../common/base.service";
import { TemplateInputModel } from "./templateInput.model";
import { TemplateInput } from "../../types/entities";

export class TemplateInputService extends BaseService<TemplateInput> {
  constructor() {
    super(new TemplateInputModel());
  }
}

export default new TemplateInputService();
