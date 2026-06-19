import nodemailer, { Transporter } from "nodemailer";
import { config } from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });
  }

  /**
   * Send email
   */
  async send(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: config.smtpFrom,
        ...options,
      });
      console.log(`Email sent to ${options.to}`);
    } catch (error) {
      console.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  /**
   * Verify SMTP connection
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log("SMTP connection verified");
      return true;
    } catch (error) {
      console.error("SMTP connection failed:", error);
      return false;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email: string, token: string, firstName: string): Promise<void> {
    const verificationLink = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Verify Your Email</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${firstName},</p>
          <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email
            </a>
          </div>
          <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link will expire in 24 hours.</p>
          <p>If you did not register for this account, please ignore this email.</p>
        </div>
      </div>
    `;

    await this.send({
      to: email,
      subject: "Verify Your Email Address",
      html,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetLink = `${process.env.APP_URL || "http://localhost:3000"}/reset-password?token=${token}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #333;">Reset Your Password</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password. Click the link below to create a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>Or copy this link: <a href="${resetLink}">${resetLink}</a></p>
          <p style="color: #999; font-size: 12px;">This link will expire in 1 hour.</p>
          <p>If you did not request a password reset, please ignore this email or contact support.</p>
        </div>
      </div>
    `;

    await this.send({
      to: email,
      subject: "Reset Your Password",
      html,
    });
  }

  /**
   * Send invitation email
   */
  async sendInvitationEmail(email: string, invitedBy: string, inviteLink: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #333;">You're Invited</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi,</p>
          <p>${invitedBy} has invited you to join our platform. Click the link below to get started:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${inviteLink}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Accept Invitation
            </a>
          </div>
          <p>Or copy this link: <a href="${inviteLink}">${inviteLink}</a></p>
          <p style="color: #999; font-size: 12px;">This invitation expires in 7 days.</p>
        </div>
      </div>
    `;

    await this.send({
      to: email,
      subject: "You're Invited",
      html,
    });
  }

  /**
   * Send login notification email
   */
  async sendLoginNotificationEmail(email: string, firstName: string, device?: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #333;">New Login Detected</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${firstName},</p>
          <p>Your account was just accessed from ${device || "a new device"}.</p>
          <p>If this wasn't you, please change your password immediately and contact support.</p>
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `;

    await this.send({
      to: email,
      subject: "New Login to Your Account",
      html,
    });
  }

  /**
   * Send suspicious activity email
   */
  async sendSuspiciousActivityEmail(email: string, firstName: string, reason: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
          <h1 style="color: #d32f2f;">Suspicious Activity Detected</h1>
        </div>
        <div style="padding: 20px;">
          <p>Hi ${firstName},</p>
          <p>We detected suspicious activity on your account: <strong>${reason}</strong></p>
          <p>Your account has been temporarily locked for security. Please verify it's you by resetting your password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.APP_URL}/reset-password" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Secure Your Account
            </a>
          </div>
          <p>If this wasn't you, contact our support team immediately.</p>
        </div>
      </div>
    `;

    await this.send({
      to: email,
      subject: "Suspicious Activity on Your Account",
      html,
    });
  }
}

// Export singleton instance
export const emailService = new EmailService();
