import { Request, Response } from "express";
import RowsColumnService from "./rowsColumn.service";
import { BaseController } from "../common/base.controller";
import { RowsColumn } from "../../types/entities";
class RowsColumnController extends BaseController<RowsColumn> {
  constructor() {
    super(RowsColumnService);
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

export default new RowsColumnController();
