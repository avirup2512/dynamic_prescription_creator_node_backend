import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/apiResponse";
import { AuthRequest } from "./authenticate.middleware";

const prisma = new PrismaClient();

/**
 * Authorization middleware - checks permissions
 */
export const authorize = (requiredPermission: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      // Check if user has required permission
      const hasPermission = await checkPermission(req.user.userId, requiredPermission);

      if (!hasPermission) {
        throw new AppError("You do not have permission to perform this action", 403);
      }

      next();
    } catch (error: any) {
      next(error instanceof AppError ? error : new AppError(error.message, 500));
    }
  };
};

/**
 * Authorize by role
 */
export const authorizeRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError("Authentication required", 401);
      }

      if (!req.user.role || !roles.includes(req.user.role)) {
        throw new AppError("You do not have the required role", 403);
      }

      next();
    } catch (error: any) {
      next(error instanceof AppError ? error : new AppError(error.message, 500));
    }
  };
};

/**
 * Check if user has permission
 */
async function checkPermission(userId: string, permissionName: string): Promise<boolean> {
  try {
    // Get user roles
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        removedAt: null,
      },
      select: {
        roleId: true,
      },
    });

    if (userRoles.length === 0) {
      return false;
    }

    const roleIds = userRoles.map((ur: any) => ur.roleId);

    // Parse permission (format: resource:action)
    const [resource, action] = permissionName.split(":");

    // Check if any role has this permission
    const permission = await prisma.rolePermission.findFirst({
      where: {
        roleId: {
          in: roleIds,
        },
        permission: {
          resource,
          action,
        },
      },
    });

    return !!permission;
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

/**
 * Check permission helper function
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  return checkPermission(userId, permission);
}
