import { Request, Response } from "express";
import InputEntityService from "./inputEntity.service";
import { BaseController } from "../common/base.controller";
import { InputEntity } from "../../types/entities";
class InputEntityController extends BaseController<InputEntity> {
  constructor() {
    super(InputEntityService);
  }

  async create(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const inputType = req.body.type;
    if (!inputType) {
      return res.status(400).json({ success: false, message: "Input type is required" });
    };
    if(req.body.value === undefined || req.body.value === null || req.body.value === "" || req.body.name === undefined || req.body.name === null || req.body.name === "") {
      return res.status(400).json({ success: false, message: "Value and name are required" });
    }
    {
      const result = inputType === "INPUT_TYPE_1" || inputType === "INPUT_TYPE_3" ? await service.createInputEntity(req.body) : inputType === "INPUT_TYPE_2"  ? await service.createDropdownEntity(req.body) : null;
      if (!result) {
        return res.status(500).json({ success: false, message: "Failed to create input entity" });
      }
      return res.status(201).json({ success: true, data: result });
    }
  }

  async getAllInput(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const filters = {
      user_id: req.query.user_id,
      type_name: req.query.type_name,
    };
    const result = await service.getAllInputEntities(req.query as Record<string, unknown>);
    return res.status(200).json({ success: true, data: result.rows });
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
  async getByAllInputInformationById(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const result = await service.getAllInputInformationById(req.params.id, req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result.rows });
  }
  async updateInputEntity(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const data = req.body;
    console.log(data);
    const result = await service.updateInputEntity(id, data);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async deleteInputEntity(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const result = await service.deleteInputEntity(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async getByAllDropdownInputInformationById(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const result = await service.getAllDropdownInputInformationById(req.params.id, req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
  async updateDropdownEntity(req: Request, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const data = req.body;
    const result = await service.updateDropdownEntity(id, data);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
}

export default new InputEntityController();
