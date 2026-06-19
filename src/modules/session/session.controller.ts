import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate.middleware";
import { sessionService } from "./session.service";
import { ApiSuccess, AppError } from "../utils/apiResponse";

export class SessionController {
  /**
   * Get all user sessions
   * GET /api/sessions
   */
  async getUserSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      const sessions = await sessionService.getUserSessions(req.user.userId);
      res.json(new ApiSuccess(sessions));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get session details
   * GET /api/sessions/:sessionId
   */
  async getSessionDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      const { sessionId } = req.params;
      const session = await sessionService.getSessionDetails(req.user.userId, sessionId);
      res.json(new ApiSuccess(session));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Revoke specific session
   * DELETE /api/sessions/:sessionId
   */
  async revokeSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      const { sessionId } = req.params;
      await sessionService.revokeSession(req.user.userId, sessionId);
      res.json(new ApiSuccess({ success: true }, "Session revoked successfully"));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Revoke all sessions
   * DELETE /api/sessions
   */
  async revokeAllSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      await sessionService.revokeAllSessions(req.user.userId);
      res.json(new ApiSuccess({ success: true }, "All sessions revoked successfully"));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get login history
   * GET /api/sessions/login-history
   */
  async getLoginHistory(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError("User not authenticated", 401);
      }

      const limit = parseInt(req.query.limit as string) || 20;
      const loginHistory = await sessionService.getLoginHistory(req.user.userId, limit);
      res.json(new ApiSuccess(loginHistory));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }
}

export const sessionController = new SessionController();
