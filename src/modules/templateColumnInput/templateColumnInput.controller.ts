import { Request, Response } from "express";
import TemplateColumnInputService from "./templateColumnInput.service";
import { BaseController } from "../common/base.controller";
import { TemplateColumnInput } from "../../types/entities";
class TemplateColumnInputController extends BaseController<TemplateColumnInput> {
  constructor() {
    super(TemplateColumnInputService);
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

export default new TemplateColumnInputController();
