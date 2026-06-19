import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/apiResponse";

const prisma = new PrismaClient();

export class RBACService {
  /**
   * Create role
   */
  async createRole(name: string, description?: string, isSystem: boolean = false): Promise<any> {
    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new AppError("Role already exists", 409);
    }

    const role = await prisma.role.create({
      data: {
        name,
        description,
        isSystem,
      },
    });

    return role;
  }

  /**
   * Create permission
   */
  async createPermission(resource: string, action: string, description?: string): Promise<any> {
    // Check if permission exists
    const existingPermission = await prisma.permission.findFirst({
      where: {
        resource,
        action,
      },
    });

    if (existingPermission) {
      throw new AppError("Permission already exists", 409);
    }

    const permission = await prisma.permission.create({
      data: {
        name: `${resource}:${action}`,
        resource,
        action,
        description,
      },
    });

    return permission;
  }

  /**
   * Assign role to user
   */
  async assignRoleToUser(userId: string, roleId: string, assignedBy?: string): Promise<any> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Check if user already has this role
    const existingUserRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        removedAt: null,
      },
    });

    if (existingUserRole) {
      throw new AppError("User already has this role", 409);
    }

    const userRole = await prisma.userRole.create({
      data: {
        userId,
        roleId,
        assignedBy,
      },
    });

    return userRole;
  }

  /**
   * Revoke role from user
   */
  async revokeRoleFromUser(userId: string, roleId: string): Promise<void> {
    const userRole = await prisma.userRole.findFirst({
      where: {
        userId,
        roleId,
        removedAt: null,
      },
    });

    if (!userRole) {
      throw new AppError("User role not found", 404);
    }

    await prisma.userRole.update({
      where: { id: userRole.id },
      data: { removedAt: new Date() },
    });
  }

  /**
   * Assign permission to role
   */
  async assignPermissionToRole(roleId: string, permissionId: string): Promise<any> {
    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Check if role already has this permission
    const existingRolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
      },
    });

    if (existingRolePermission) {
      throw new AppError("Role already has this permission", 409);
    }

    const rolePermission = await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    return rolePermission;
  }

  /**
   * Remove permission from role
   */
  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permissionId,
      },
    });

    if (!rolePermission) {
      throw new AppError("Role permission not found", 404);
    }

    await prisma.rolePermission.delete({
      where: { id: rolePermission.id },
    });
  }

  /**
   * Get all roles
   */
  async getAllRoles(): Promise<any[]> {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return roles;
  }

  /**
   * Get all permissions
   */
  async getAllPermissions(): Promise<any[]> {
    const permissions = await prisma.permission.findMany();
    return permissions;
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<any[]> {
    const userRoles = await prisma.userRole.findMany({
      where: {
        userId,
        removedAt: null,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    return userRoles;
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: string): Promise<string[]> {
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
      return [];
    }

    const roleIds = userRoles.map((ur: any) => ur.roleId);

    const rolePermissions = await prisma.rolePermission.findMany({
      where: {
        roleId: {
          in: roleIds,
        },
      },
      include: {
        permission: true,
      },
    });

    const permissions: string[] = rolePermissions.map((rp: any) => rp.permission.name);
    return [...new Set(permissions)];
  }

  /**
   * Initialize default roles and permissions
   */
  async initializeDefaultRoles(): Promise<void> {
    const roles = await prisma.role.findMany();

    if (roles.length === 0) {
      // Create default roles
      const adminRole = await this.createRole("admin", "Administrator role with full access", true);
      const userRole = await this.createRole("user", "Regular user role", true);
      const guestRole = await this.createRole("guest", "Guest role with limited access", true);

      // Create default permissions
      const permissions = [
        { resource: "user", action: "create" },
        { resource: "user", action: "read" },
        { resource: "user", action: "update" },
        { resource: "user", action: "delete" },
        { resource: "template", action: "create" },
        { resource: "template", action: "read" },
        { resource: "template", action: "update" },
        { resource: "template", action: "delete" },
        { resource: "role", action: "create" },
        { resource: "role", action: "read" },
        { resource: "role", action: "update" },
        { resource: "role", action: "delete" },
        { resource: "audit", action: "read" },
      ];

      const createdPermissions = await Promise.all(
        permissions.map((p) => this.createPermission(p.resource, p.action))
      );

      // Assign all permissions to admin
      for (const permission of createdPermissions) {
        await this.assignPermissionToRole(adminRole.id, permission.id);
      }

      // Assign limited permissions to user
      const userPermissions = createdPermissions.filter(
        (p) =>
          (p.resource === "template" && p.action !== "delete") ||
          (p.resource === "user" && p.action === "read")
      );

      for (const permission of userPermissions) {
        await this.assignPermissionToRole(userRole.id, permission.id);
      }

      // Assign read-only permissions to guest
      const guestPermissions = createdPermissions.filter(
        (p) =>
          (p.resource === "template" && p.action === "read") ||
          (p.resource === "user" && p.action === "read")
      );

      for (const permission of guestPermissions) {
        await this.assignPermissionToRole(guestRole.id, permission.id);
      }

      console.log("Default roles and permissions initialized");
    }
  }
}

export const rbacService = new RBACService();
