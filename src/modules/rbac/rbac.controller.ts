import { Response } from "express";
import { AuthRequest } from "../middlewares/authenticate.middleware";
import { ValidatedRequest } from "../middlewares/validateRequest.middleware";
import { rbacService } from "./rbac.service";
import { ApiSuccess, AppError } from "../utils/apiResponse";
import {
  CreateRoleRequest,
  CreatePermissionRequest,
  AssignRoleRequest,
} from "../validators/auth.validators";

export class RBACController {
  /**
   * Create role
   * POST /api/rbac/roles
   */
  async createRole(req: ValidatedRequest & AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description, isSystem } = req.validatedBody as CreateRoleRequest;

      const role = await rbacService.createRole(name, description, isSystem);

      res.status(201).json(new ApiSuccess(role, "Role created successfully", 201));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Create permission
   * POST /api/rbac/permissions
   */
  async createPermission(req: ValidatedRequest & AuthRequest, res: Response): Promise<void> {
    try {
      const { resource, action, description } = req.validatedBody as CreatePermissionRequest;

      const permission = await rbacService.createPermission(resource, action, description);

      res.status(201).json(new ApiSuccess(permission, "Permission created successfully", 201));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Assign role to user
   * POST /api/rbac/users/:userId/roles
   */
  async assignRoleToUser(req: ValidatedRequest & AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { roleId } = req.validatedBody as AssignRoleRequest;

      const userRole = await rbacService.assignRoleToUser(userId, roleId, req.user?.userId);

      res.status(201).json(new ApiSuccess(userRole, "Role assigned to user successfully", 201));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get all roles
   * GET /api/rbac/roles
   */
  async getAllRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const roles = await rbacService.getAllRoles();
      res.json(new ApiSuccess(roles));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get all permissions
   * GET /api/rbac/permissions
   */
  async getAllPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const permissions = await rbacService.getAllPermissions();
      res.json(new ApiSuccess(permissions));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get user roles
   * GET /api/rbac/users/:userId/roles
   */
  async getUserRoles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const userRoles = await rbacService.getUserRoles(userId);
      res.json(new ApiSuccess(userRoles));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }

  /**
   * Get user permissions
   * GET /api/rbac/users/:userId/permissions
   */
  async getUserPermissions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const permissions = await rbacService.getUserPermissions(userId);
      res.json(new ApiSuccess(permissions));
    } catch (error: any) {
      throw error instanceof AppError ? error : new AppError(error.message, 500);
    }
  }
}

export const rbacController = new RBACController();
