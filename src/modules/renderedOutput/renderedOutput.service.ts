import { BaseService } from "../common/base.service";
import { RenderedOutputModel } from "./renderedOutput.model";
import { RenderedOutput } from "../../types/entities";

export class RenderedOutputService extends BaseService<RenderedOutput> {
  constructor() {
    super(new RenderedOutputModel());
  }
}

export default new RenderedOutputService();
