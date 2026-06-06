import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

export interface AuthenticatedRequest extends Request {
  user?: Record<string, any>;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//   const header = req.headers.authorization;
//   if (!header || !header.startsWith("Bearer ")) {
//     return res.status(401).json({ success: false, message: "Authentication token missing" });
//   }

//   const token = header.split(" ")[1];
//   try {
//     req.user = jwt.verify(token, config.jwtSecret) as Record<string, any>;
//     return next();
//   } catch (error) {
//     return res.status(401).json({ success: false, message: "Invalid authentication token" });
    //   }
    return next();
}
