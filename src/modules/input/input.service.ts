import { BaseService } from "../common/base.service";
import { InputModel } from "./input.model";
import { Input } from "../../types/entities";

export class InputService extends BaseService<Input> {
  constructor() {
    super(new InputModel());
  }
}

export default new InputService();
