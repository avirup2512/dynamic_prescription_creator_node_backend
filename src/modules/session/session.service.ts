import { PrismaClient } from "@prisma/client";
import { AppError } from "../utils/apiResponse";

const prisma = new PrismaClient();

export class SessionService {
  /**
   * Get all user sessions
   */
  async getUserSessions(userId: string): Promise<any[]> {
    const sessions = await prisma.userSession.findMany({
      where: {
        userId,
        isRevoked: false,
      },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
      },
    });

    return sessions;
  }

  /**
   * Get session details
   */
  async getSessionDetails(userId: string, sessionId: string): Promise<any> {
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
      select: {
        id: true,
        deviceName: true,
        deviceType: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        lastActiveAt: true,
        expiresAt: true,
        isRevoked: true,
      },
    });

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    return session;
  }

  /**
   * Revoke specific session
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await prisma.userSession.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new AppError("Session not found", 404);
    }

    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "user_revoked",
      },
    });
  }

  /**
   * Revoke all sessions
   */
  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    const where: any = {
      userId,
    };

    if (exceptSessionId) {
      where.id = { not: exceptSessionId };
    }

    await prisma.userSession.updateMany({
      where,
      data: {
        isRevoked: true,
        revokedAt: new Date(),
        revokedReason: "user_revoked_all",
      },
    });
  }

  /**
   * Update session activity
   */
  async updateSessionActivity(sessionId: string): Promise<void> {
    await prisma.userSession.update({
      where: { id: sessionId },
      data: {
        lastActiveAt: new Date(),
      },
    });
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await prisma.userSession.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return result.count;
  }

  /**
   * Get active sessions count
   */
  async getActiveSessionsCount(userId: string): Promise<number> {
    const count = await prisma.userSession.count({
      where: {
        userId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return count;
  }

  /**
   * Get login history
   */
  async getLoginHistory(userId: string, limit: number = 20): Promise<any[]> {
    const loginHistory = await prisma.loginHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        status: true,
        failureReason: true,
        createdAt: true,
      },
    });

    return loginHistory;
  }
}

export const sessionService = new SessionService();
