import { BaseService } from "../common/base.service";
import { QuantityOptionModel } from "./quantityOption.model";
import { QuantityOption } from "../../types/entities";

export class QuantityOptionService extends BaseService<QuantityOption> {
  constructor() {
    super(new QuantityOptionModel());
  }
}

export default new QuantityOptionService();
