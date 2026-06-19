import bcryptjs from "bcryptjs";

/**
 * Hash password with bcrypt
 */
export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
  return bcryptjs.hash(password, saltRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(password, hash);
};

/**
 * Hash token for secure storage
 */
export const hashToken = async (token: string): Promise<string> => {
  return bcryptjs.hash(token, 8);
};

/**
 * Verify token against hash
 */
export const verifyTokenHash = async (token: string, hash: string): Promise<boolean> => {
  return bcryptjs.compare(token, hash);
};
