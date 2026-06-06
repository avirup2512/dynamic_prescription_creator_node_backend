import { Request, Response } from "express";
import QuantityService from "./quantity.service";
import { BaseController } from "../common/base.controller";
import { Quantity } from "../../types/entities";
class QuantityController extends BaseController<Quantity> {
  constructor() {
    super(QuantityService);
  }

  async create(req: Request, res: Response) {
    const service = this.service as typeof QuantityService;
    if(req.body.value === undefined || req.body.value === null || req.body.value === "" || req.body.name === undefined || req.body.name === null || req.body.name === "") {
      return res.status(400).json({ success: false, message: "Value and name are required" });
    }
    const result = await service.createQuantity(req.body);
    if (!result) {
      return res.status(500).json({ success: false, message: "Failed to create quantity" });
    }
    return res.status(201).json({ success: true, data: result });
  }
  async getQuantityInputInformationById(req: Request, res: Response)
  {
    const service = this.service as typeof QuantityService;
    const result = await service.getAllQuantityInputInformationById(req.params.id, req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Quantity not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
   async getAllInput(req: Request, res: Response) {
      const service = this.service as typeof QuantityService;
      const result = await service.findAllQuantity(req.query as Record<string, unknown>);
      return res.status(200).json({ success: true, data: result.rows });
    }
  async updateQuantityEntity(req: Request, res: Response) {
    const service = this.service as typeof QuantityService;
    const result = await service.updateQuantityEntity(req.params.id, req.body as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Quantity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async deleteQuantity(req: Request, res: Response) {
    const service = this.service as typeof QuantityService;
    const id = req.params.id;
    const result = await service.deleteQuantity(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Quantity not found" });
    }
    return res.status(200).json({ success: true, data: result });
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

export default new QuantityController();
