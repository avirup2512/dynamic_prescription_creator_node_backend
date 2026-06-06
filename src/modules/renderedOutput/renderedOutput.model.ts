import { BaseModel } from "../common/base.model";
import { RenderedOutput } from "../../types/entities";

export class RenderedOutputModel extends BaseModel<RenderedOutput> {
  constructor() {
    super(
      "rendered_outputs",
      "id",
      ['template_id'],
      [],
    );
  }
}
