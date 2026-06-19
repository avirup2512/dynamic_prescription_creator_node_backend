import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/apiResponse";
export interface AuthenticatedRequest extends Request {
  user?: Record<string, any>;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const token = req?.cookies ? req.cookies.accessToken : '';

    if (!token) {
      throw new AppError("Unauthorized", 401);
    }

    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string };

    req.user = payload;
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
}
