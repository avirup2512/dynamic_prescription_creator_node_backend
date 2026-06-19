import { Request, Response } from "express";
import SectionService from "./section.service";
import { BaseController } from "../common/base.controller";
import { Section } from "../../types/entities";
export interface ExtendedRequest extends Request {
  user?: Record<string, any>;
}
class SectionController extends BaseController<Section> {
  constructor() {
    super(SectionService);
  }

  async create(req: ExtendedRequest, res: Response) {
    return super.create(req, res);
  }
  async createSection(req: ExtendedRequest, res: Response) {
    const data = req.body?.data;
    data.user_id = req?.user ? req.user.id : null;
    try {
      const result = await (this.service as typeof SectionService).createSection(data);
      res.status(201).json({success: true,data:result});
    } catch (error) {
      res.status(500).json({ error: "Failed to create section", details: error instanceof Error ? error.message : error });
    }
  }
  async getAllSection(req: ExtendedRequest, res: Response)
  {
    const service = this.service as typeof SectionService;
    const user_id =  req?.user ? req.user.id : null;
    const result = await service.getAllSections({user_id} as Record<string, unknown>);
    return res.status(200).json({ success: true, data: result.rows });
  }
  async getByAllSectionInformationById(req: ExtendedRequest, res: Response) {
    const service = this.service as typeof SectionService;
    const user_id =  req?.user ? req.user.id : null;
    const result = await service.getAllSectionInformationById(req.params.id, {user_id} as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
  async updateSection(req: ExtendedRequest, res: Response) {
    const data = req.body?.data;
    const sectionId = req.params.id as string;
    data.user_id = req?.user ? req.user.id : null;
    try {
      const result = await (this.service as typeof SectionService).updateSection(sectionId, data);
      res.status(200).json({success: true,data:result});
    } catch (error) {
      res.status(500).json({ error: "Failed to update section", details: error instanceof Error ? error.message : error });
    }
  }
  async list(req: ExtendedRequest, res: Response) {
    return super.list(req, res);
  }

  async getById(req: ExtendedRequest, res: Response) {
    return super.getById(req, res);
  }

  async update(req: ExtendedRequest, res: Response) {
    return super.update(req, res);
  }

  async remove(req: ExtendedRequest, res: Response) {
    return super.remove(req, res);
  }
}

export default new SectionController();
