import { Request, Response } from "express";
import TemplateSectionService from "./templateSection.service";
import { BaseController } from "../common/base.controller";
import { TemplateSection } from "../../types/entities";
class TemplateSectionController extends BaseController<TemplateSection> {
  constructor() {
    super(TemplateSectionService);
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

export default new TemplateSectionController();
