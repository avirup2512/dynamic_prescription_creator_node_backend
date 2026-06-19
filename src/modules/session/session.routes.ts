import { Router } from "express";
import { sessionController } from "./session.controller";
import { authenticate } from "../middlewares/authenticate.middleware";

const router = Router();

// All session routes require authentication
router.use(authenticate);

/**
 * GET /api/sessions
 * Get all user sessions
 */
router.get("/", (req, res, next) => {
  sessionController.getUserSessions(req, res).catch(next);
});

/**
 * GET /api/sessions/:sessionId
 * Get session details
 */
router.get("/:sessionId", (req, res, next) => {
  sessionController.getSessionDetails(req, res).catch(next);
});

/**
 * DELETE /api/sessions/:sessionId
 * Revoke specific session
 */
router.delete("/:sessionId", (req, res, next) => {
  sessionController.revokeSession(req, res).catch(next);
});

/**
 * DELETE /api/sessions
 * Revoke all sessions
 */
router.delete("/", (req, res, next) => {
  sessionController.revokeAllSessions(req, res).catch(next);
});

/**
 * GET /api/sessions/login-history
 * Get login history
 */
router.get("/login-history", (req, res, next) => {
  sessionController.getLoginHistory(req, res).catch(next);
});

export default router;
