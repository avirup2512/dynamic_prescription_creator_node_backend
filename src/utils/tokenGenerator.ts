import crypto from "crypto";

/**
 * Generate secure random token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString("hex");
};

/**
 * Generate secure random OTP (6 digits)
 */
export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Generate device ID
 */
export const generateDeviceId = (): string => {
  return `device_${generateToken(16)}`;
};

/**
 * Generate session ID
 */
export const generateSessionId = (): string => {
  return `session_${generateToken(16)}`;
};
