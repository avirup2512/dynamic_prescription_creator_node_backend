import { Request, Response } from "express";
import SectionRowService from "./sectionRow.service";
import { BaseController } from "../common/base.controller";
import { SectionRow } from "../../types/entities";
class SectionRowController extends BaseController<SectionRow> {
  constructor() {
    super(SectionRowService);
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

export default new SectionRowController();
