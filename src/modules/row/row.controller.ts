import { Request, Response } from "express";
import RowService from "./row.service";
import { BaseController } from "../common/base.controller";
import { Row } from "../../types/entities";
class RowController extends BaseController<Row> {
  constructor() {
    super(RowService);
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

export default new RowController();
