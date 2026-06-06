import { Request, Response } from "express";
import InputTypeService from "./inputType.service";
import { BaseController } from "../common/base.controller";
import { InputType } from "../../types/entities";
class InputTypeController extends BaseController<InputType> {
  constructor() {
    super(InputTypeService);
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

export default new InputTypeController();
