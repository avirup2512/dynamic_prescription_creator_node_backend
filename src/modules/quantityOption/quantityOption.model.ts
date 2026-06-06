import { BaseModel } from "../common/base.model";
import { QuantityOption } from "../../types/entities";

export class QuantityOptionModel extends BaseModel<QuantityOption> {
  constructor() {
    super(
      "quantity_options",
      "id",
      ['quantity_id', 'value'],
      ['value'],
    );
  }
}
