import { Request, Response, NextFunction } from "express";
import { errorResponse } from "../utils/apiResponse";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const statusCode = err?.statusCode || 500;
  return res.status(statusCode).json(errorResponse(err?.message || "Internal server error", statusCode));
}
