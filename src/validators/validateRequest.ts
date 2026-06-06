import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: AnyZodObject, property: "body" | "params" | "query" = "body") => {
  return (req: Request, res: Response, next: NextFunction) => {
    // const result = schema.safeParse(req[property]);
    // if (!result.success) {
    //   return res.status(400).json({ success: false, error: result.error.flatten() });
    // }
    // if (property === "body") req.body = result.data;
    // if (property === "params") req.params = result.data;
    // if (property === "query") req.query = result.data;
    next();
  };
};
