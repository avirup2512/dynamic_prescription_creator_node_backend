import { QueryResultRow,Submittable } from "pg";

import { Request, Response } from "express";
import { BaseService } from "./base.service";
import { successResponse, paginatedResponse } from "../../utils/apiResponse";

export class BaseController<T extends any[] | QueryResultRow | Submittable> {
  constructor(protected service: BaseService<T>) {}

  async create(req: Request, res: Response) {
    const result = await this.service.create(req.body as Partial<T>);
    return res.status(201).json(successResponse(result, "Created successfully"));
  }

  async list(req: Request, res: Response) {
    const { page, limit, search, ...filters } = req.query as Record<string, any>;
    const normalizedPage = Number(page || 1);
    const normalizedLimit = Number(limit || 20);
    const result = await this.service.list({ page: normalizedPage, limit: normalizedLimit, search: typeof search === "string" ? search : undefined, filters });
    return res.status(200).json(paginatedResponse(result.items, normalizedPage, normalizedLimit, result.total));
  }

    async getListByJoin(req: Request, res: Response) {
    const { page, limit, search, ...filters } = req.query as Record<string, any>;
    const normalizedPage = Number(page || 1);
    const normalizedLimit = Number(limit || 20);
    const { tableName, localKey, foreignKey } = req.params;
    const result = await this.service.getListByJoin(tableName, localKey, foreignKey, { offset: (normalizedPage - 1) * normalizedLimit, limit: normalizedLimit, search: typeof search === "string" ? search : undefined, filters });
    return res.status(200).json(successResponse(result));
    }
    async getById(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await this.service.getById(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    return res.status(200).json(successResponse(result));
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await this.service.update(id, req.body as Partial<T>);
    if (!result) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    return res.status(200).json(successResponse(result, "Updated successfully"));
  }

  async remove(req: Request, res: Response) {
    const id = req.params.id as string;
    const result = await this.service.remove(id);
    if (!result) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    return res.status(200).json(successResponse(result, "Deleted successfully"));
  }
}
