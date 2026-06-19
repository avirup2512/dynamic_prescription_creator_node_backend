import { AuthModel } from './auth.model';
import { AppError } from '../error/app-error';
import { emailService } from '../../utils/email';
import { CreateUserInput, LoginResult, User } from './auth.types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

class AuthService {
  authModel:AuthModel;

  constructor() {
    this.authModel = new AuthModel();
  } 
    // ---------------------- REGISTER ----------------------
  async registerUser(input: CreateUserInput): Promise<User> {
    const { firstname, lastname, email, password } = input;

    if (!firstname || !lastname || !email || !password) {
      throw new AppError('firstname, lastname, email and password are all required', 400);
    }

    if (!EMAIL_REGEX.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }

    try {
      return await this.authModel.createUser(input);
    } catch (err: any) {
      if (err.message === 'Email already registered') {
        throw new AppError('Email already registered', 409);
      }
      throw new AppError('Failed to create user', 500);
    }
  }

  // ---------------------- LOGIN ----------------------
  async login(email: string, password: string): Promise<LoginResult> {
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    try {
      return await this.authModel.loginUser(email, password);
    } catch (err: any) {
      if (err.message === 'Invalid email or password') {
        throw new AppError('Invalid email or password', 401);
      }
      if (err.message === 'Account is inactive') {
        throw new AppError('Account is inactive', 403);
      }
      throw new AppError('Login failed', 500);
    }
  }

  // ---------------------- FORGOT PASSWORD (request) ----------------------
  // Always resolves successfully (even if the email doesn't exist) so callers
  // can't use this endpoint to enumerate registered emails.
  async requestPasswordReset(email: string): Promise<void> {
    if (!email) {
      throw new AppError('Email is required', 400);
    }

    try {
      const { rawToken, expiresAt } = await this.authModel.generatePasswordResetToken(email);
      await emailService.sendPasswordResetEmail(email, rawToken, '');
    } catch (err: any) {
      if (err.message !== 'No account found with this email') {
        throw new AppError('Failed to process password reset request', 500);
      }
      // silently succeed for unknown emails
    }
  }

  // ---------------------- RESET PASSWORD (confirm) ----------------------
  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      throw new AppError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`, 400);
    }

    try {
      await this.authModel.resetPassword(token, newPassword);
    } catch (err: any) {
      if (err.message === 'Invalid or expired reset token' || err.message === 'Reset token has expired') {
        throw new AppError(err.message, 400);
      }
      throw new AppError('Failed to reset password', 500);
    }
  }
  async verifyMe(userId: string): Promise<any> {
    try {
      const userData = await this.authModel.getUserById(userId);
      console.log(userData)
      return userData;
    } catch (err: any) {
      if (err.message === 'Invalid or expired reset token' || err.message === 'Reset token has expired') {
        throw new AppError(err.message, 400);
      }
      throw new AppError('Failed to reset password', 500);
    }
  }
}
export const authService = new AuthService();