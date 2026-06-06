import { Request, Response } from "express";
import TemplateService from "./template.service";
import { BaseController } from "../common/base.controller";
import { Template } from "../../types/entities";
class TemplateController extends BaseController<Template> {
  constructor() {
    super(TemplateService);
  }

  async create(req: Request, res: Response) {
    const service = this.service as typeof TemplateService;
    return service.createTemplate(req.body);
  }
  async createTemplate(req: Request, res: Response) {
    const data = req.body?.data;
    try {
          const service = this.service as typeof TemplateService;
          const result = await service.createTemplate(data);
          res.status(201).json(result);
        } catch (error) {
          res.status(500).json({ error: "Failed to create template", details: error instanceof Error ? error.message : error });
        }
  }
  async getAllTemplateInfoById(req: Request, res: Response) {
    const service = this.service as typeof TemplateService;
    const result = await service.getAllTemplateInfoById(req.params.id, req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    return res.status(200).json({ success: true, data: result.rows[0] });
  }
  async getAllTemplates(req: Request, res: Response)
  {
    const service = this.service as typeof TemplateService;
    const result = await service.getAllTemplates(req.query as Record<string, unknown>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Template not found" });
    }
    return res.status(200).json({ success: true, data: result.rows });
  }
  async list(req: Request, res: Response) {
    return super.list(req, res);
  }

  async getById(req: Request, res: Response) {
    return super.getById(req, res);
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const data = req.body.data;
    if (data) {
      try {
        const service = this.service as typeof TemplateService;
        const result = await service.updateTemplate(id, data);
        return res.status(200).json({ success: true, data: result });
      } catch (error) {
        return res.status(500).json({ success: false, error: "Failed to update template", details: error instanceof Error ? error.message : error });
      }
    }else {
      return res.status(400).json({ success: false, error: "No data provided for update" });
    }
  }

  async remove(req: Request, res: Response) {
    return super.remove(req, res);
  }
}

export default new TemplateController();
