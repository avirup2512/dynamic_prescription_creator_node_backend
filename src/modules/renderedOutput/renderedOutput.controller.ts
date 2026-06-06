import { Request, Response } from "express";
import RenderedOutputService from "./renderedOutput.service";
import { BaseController } from "../common/base.controller";
import { RenderedOutput } from "../../types/entities";
class RenderedOutputController extends BaseController<RenderedOutput> {
  constructor() {
    super(RenderedOutputService);
  }

  async create(req: Request, res: Response) {
    return super.create(req, res);
  }

  async list(req: Request, res: Response) {
    return super.list(req, res);
  }

  async getById(req: Request, res: Response) {
    return super.getById(req, res);
  }

  async update(req: Request, res: Response) {
    return super.update(req, res);
  }

  async remove(req: Request, res: Response) {
    return super.remove(req, res);
  }
}

export default new RenderedOutputController();
