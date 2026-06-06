import { Request, Response } from "express";
import SectionService from "./section.service";
import { BaseController } from "../common/base.controller";
import { Section } from "../../types/entities";

class SectionController extends BaseController<Section> {
  constructor() {
    super(SectionService);
  }

  async create(req: Request, res: Response) {
    return super.create(req, res);
  }
  async createSection(req: Request, res: Response) {
    const data = req.body?.data;
    try {
      const result = await (this.service as typeof SectionService).createSection(data);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to create section", details: error instanceof Error ? error.message : error });
    }
  }
  async getAllSection(req: Request, res: Response)
  {
    const service = this.service as typeof SectionService;
    const result = await service.getAllSections(req.query as Record<string, unknown>);
    return res.status(200).json({ success: true, data: result.rows });
  }
  async getByAllSectionInformationById(req: Request, res: Response) {
    const service = this.service as typeof SectionService;
    const result = await service.getAllSectionInformationById(req.params.id, req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Section not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
  async updateSection(req: Request, res: Response) {
    const sectionId = req.params.id;
    const data = req.body?.data;
    const id = req.params.id as string;
    try {
      const result = await (this.service as typeof SectionService).updateSection(id, data);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to update section", details: error instanceof Error ? error.message : error });
    }
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

export default new SectionController();
