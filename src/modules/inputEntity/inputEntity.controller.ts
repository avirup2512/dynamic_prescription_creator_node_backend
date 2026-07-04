import { Request, Response } from "express";
import InputEntityService from "./inputEntity.service";
import { BaseController } from "../common/base.controller";
import { InputEntity } from "../../types/entities";
export interface ExtendedRequest extends Request {
  user?: Record<string, any>;
}
class InputEntityController extends BaseController<InputEntity> {
  constructor() {
    super(InputEntityService);
  }

  async create(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const inputType = req.body.type;
    if (!inputType) {
      return res.status(400).json({ success: false, message: "Input type is required" });
    };
    if (req.body.value === undefined || req.body.value === null || req.body.value === "" || req.body.name === undefined || req.body.name === null || req.body.name === "") {
      return res.status(400).json({ success: false, message: "Value and name are required" });
    }
    req.body.user_id = req?.user ? req.user.id : null;
    {
      const result = inputType === "INPUT_TYPE_1" || inputType === "INPUT_TYPE_3" ? await service.createInputEntity(req.body) : inputType === "INPUT_TYPE_2" ? await service.createDropdownEntity(req.body, 0) : null;
      if (!result) {
        return res.status(500).json({ success: false, message: "Failed to create input entity" });
      }
      return res.status(201).json({ success: true, data: result });
    }
  }

  async getAllInput(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const filters = {
      user_id: req?.user ? req.user.id : null,
      type_name: req.query.type_name,
    };
    const result = await service.getAllInputEntities(filters as Record<string, unknown>);
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
  async getByAllInputInformationById(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const user_id = req?.user ? req.user.id : null;
    console.log(req.params.id);
    const result = await service.getAllInputInformationById(req.params.id, { user_id, type_name: req.query.type_name } as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result.rows });
  }
  async updateInputEntity(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const data = req.body;
    data.user_id = req?.user ? req.user.id : null;
    const result = await service.updateInputEntity(id, data);
    console.log(result);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async deleteInputEntity(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const user_id = req?.user ? req.user.id : null;
    const result = await service.deleteInputEntity(id, user_id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async getByAllDropdownInputInformationById(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const user_id = req?.user ? req.user.id : null;
    const result = await service.getAllDropdownInputInformationById(req.params.id, { user_id } as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
  async updateDropdownEntity(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const data = req.body;
    console.log(id);
    data.user_id = req?.user ? req.user.id : null;
    const result = await service.updateDropdownEntity(id, data);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async AddSingleDropdownEntity(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const id = req.params.id;
    const data = req.body;
    data.user_id = req?.user ? req.user.id : null;
    const result = await service.AddSingleDropdownEntity(id, data);
    if (!result) {
      return res.status(404).json({ success: false, message: "Input entity not found" });
    }
    return res.status(200).json({ success: true, data: result });
  }
  async getDropdownContentFromAI(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof InputEntityService;
    const text = req.body.text;
    const resultFromDb = await service.searchGlobalDropdownOptionsInDB(text);
    console.log(resultFromDb)
    if (!resultFromDb) {
      const result = await service.getDropdownContentFromAI(text);
      if (result) {
        console.log(result)
        const parsedResult = JSON.parse(result);
        const body: any = { type: req.body.inputType };
        body.name = parsedResult?.name;
        body.value = parsedResult?.dropdown_options;
        body.user_id = req?.user ? req.user.id : null;
        const createdGlobalDropdown: any = await service.createGlobalDropdown(body);
        let responseObject: any = {};
        if (createdGlobalDropdown?.entity) {
          responseObject = createdGlobalDropdown?.entity;
          responseObject.dropdown_options = createdGlobalDropdown?.value;
        }

        return res.status(200).json({ success: true, data: responseObject, AISearchFlag: true });
      }
      if (!result) {
        return res.status(404).json({ success: false, message: "Input entity not found" });
      }
    } else
      return res.status(200).json({ success: true, data: resultFromDb, AISearchFlag: false });
  }
}
export default new InputEntityController();
