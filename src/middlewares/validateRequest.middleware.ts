import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError } from "../utils/apiResponse";

export interface ValidatedRequest extends Request {
  validatedBody?: any;
  validatedQuery?: any;
  validatedParams?: any;
}

/**
 * Validate request body
 */
export const validateBody = (schema: ZodSchema) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.body);
      req.validatedBody = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        next(new AppError(messages.join(", "), 400));
      } else {
        next(new AppError("Validation error", 400));
      }
    }
  };
};

/**
 * Validate request query parameters
 */
export const validateQuery = (schema: ZodSchema) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.query);
      req.validatedQuery = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        next(new AppError(messages.join(", "), 400));
      } else {
        next(new AppError("Validation error", 400));
      }
    }
  };
};

/**
 * Validate request parameters
 */
export const validateParams = (schema: ZodSchema) => {
  return (req: ValidatedRequest, res: Response, next: NextFunction): void => {
    try {
      const validatedData = schema.parse(req.params);
      req.validatedParams = validatedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
        next(new AppError(messages.join(", "), 400));
      } else {
        next(new AppError("Validation error", 400));
      }
    }
  };
};
