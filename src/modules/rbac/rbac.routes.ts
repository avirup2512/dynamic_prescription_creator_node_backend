import { Router } from "express";
import { rbacController } from "./rbac.controller";
import { authenticate } from "../middlewares/authenticate.middleware";
import { authorize } from "../middlewares/authorize.middleware";
import { validateBody, validateParams } from "../middlewares/validateRequest.middleware";
import {
  createRoleSchema,
  createPermissionSchema,
  assignRoleSchema,
} from "../validators/auth.validators";
import { z } from "zod";

const router = Router();

// All RBAC routes require authentication
router.use(authenticate);

/**
 * POST /api/rbac/roles
 * Create new role (requires role:create permission)
 */
router.post(
  "/roles",
  authorize("role:create"),
  validateBody(createRoleSchema),
  (req, res, next) => {
    rbacController.createRole(req, res).catch(next);
  }
);

/**
 * GET /api/rbac/roles
 * Get all roles
 */
router.get("/roles", (req, res, next) => {
  rbacController.getAllRoles(req, res).catch(next);
});

/**
 * POST /api/rbac/permissions
 * Create new permission (requires permission management)
 */
router.post(
  "/permissions",
  authorize("role:create"),
  validateBody(createPermissionSchema),
  (req, res, next) => {
    rbacController.createPermission(req, res).catch(next);
  }
);

/**
 * GET /api/rbac/permissions
 * Get all permissions
 */
router.get("/permissions", (req, res, next) => {
  rbacController.getAllPermissions(req, res).catch(next);
});

/**
 * POST /api/rbac/users/:userId/roles
 * Assign role to user (requires user:update permission)
 */
router.post(
  "/users/:userId/roles",
  authorize("user:update"),
  validateBody(assignRoleSchema),
  (req, res, next) => {
    rbacController.assignRoleToUser(req, res).catch(next);
  }
);

/**
 * GET /api/rbac/users/:userId/roles
 * Get user roles
 */
router.get("/users/:userId/roles", (req, res, next) => {
  rbacController.getUserRoles(req, res).catch(next);
});

/**
 * GET /api/rbac/users/:userId/permissions
 * Get user permissions
 */
router.get("/users/:userId/permissions", (req, res, next) => {
  rbacController.getUserPermissions(req, res).catch(next);
});

export default router;
