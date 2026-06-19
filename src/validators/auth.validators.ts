import { z } from "zod";

// Password validation schema with strong security requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Email validation
const emailSchema = z.string().email("Invalid email address");

// ============= Registration Validators =============
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters")
    .trim(),
  email: emailSchema.toLowerCase(),
  password: passwordSchema,
});

export type RegisterRequest = z.infer<typeof registerSchema>;

// ============= Login Validators =============
export const loginSchema = z.object({
  email: emailSchema.toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginRequest = z.infer<typeof loginSchema>;

// ============= Email Verification Validators =============
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required").trim(),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;

// ============= Forgot Password Validators =============
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;

// ============= Reset Password Validators =============
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required").trim(),
  password: passwordSchema,
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;

// ============= Change Password Validators =============
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
});

export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;

// ============= Refresh Token Validators =============
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required").trim(),
});

export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;

// ============= Guest Login Validators =============
export const guestLoginSchema = z.object({
  deviceName: z.string().optional(),
});

export type GuestLoginRequest = z.infer<typeof guestLoginSchema>;

// ============= Google OAuth Validators =============
export const googleCallbackSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
  state: z.string().optional(),
});

export type GoogleCallbackRequest = z.infer<typeof googleCallbackSchema>;

// ============= Update Profile Validators =============
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  profileImage: z.string().url().optional(),
});

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;

// ============= Role and Permission Validators =============
export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, "Role name is required")
    .max(50, "Role name must not exceed 50 characters")
    .regex(/^[a-z_]+$/, "Role name must contain only lowercase letters and underscores")
    .trim(),
  description: z.string().max(500, "Description must not exceed 500 characters").optional(),
  isSystem: z.boolean().optional().default(false),
});

export type CreateRoleRequest = z.infer<typeof createRoleSchema>;

export const createPermissionSchema = z.object({
  resource: z
    .string()
    .min(1, "Resource is required")
    .regex(/^[a-z_]+$/, "Resource must contain only lowercase letters and underscores")
    .trim(),
  action: z
    .string()
    .min(1, "Action is required")
    .regex(/^[a-z_]+$/, "Action must contain only lowercase letters and underscores")
    .trim(),
  description: z.string().optional(),
});

export type CreatePermissionRequest = z.infer<typeof createPermissionSchema>;

export const assignRoleSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
});

export type AssignRoleRequest = z.infer<typeof assignRoleSchema>;

export const revokeRoleSchema = z.object({
  roleId: z.string().min(1, "Role ID is required"),
});

export type RevokeRoleRequest = z.infer<typeof revokeRoleSchema>;
