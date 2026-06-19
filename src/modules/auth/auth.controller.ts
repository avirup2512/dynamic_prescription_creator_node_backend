import { Request, Response, NextFunction } from 'express';
import {authService} from './auth.service';

class AuthController {
  // POST /auth/register
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { firstname, lastname, email, password } = req.body;
      const response: any = await authService.registerUser({ firstname, lastname, email, password });
      res.cookie("accessToken", response.token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(201).json({ success: true, data: response.user });
    } catch (err) {
      next(err);
    }
  };

  // POST /auth/login
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const { user, token } = await authService.login(email, password);
      res.cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ success: true, data: { user, token } });
    } catch (err) {
      next(err);
    }
  };

  // POST /auth/forgot-password
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      await authService.requestPasswordReset(email);
      // Generic message regardless of whether the email exists, to avoid account enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists for this email, a password reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  };

  // POST /auth/reset-password
  resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await authService.confirmPasswordReset(token, newPassword);
      res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (err) {
      next(err);
    }
  };
  verifyMe = async (req: any, res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = req.user.id;
      const userData = await authService.verifyMe(userId);
      res.status(200).json({ success: true, message: 'you are valid.ss', data:userData });
    } catch (err) {
      next(err);
    }
  };
  logout(req: Request, res: Response, next: NextFunction) {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err) {
    next(err);
  }
}
}

export default new AuthController();