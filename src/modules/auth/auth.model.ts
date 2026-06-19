import {pool} from '../../database/client'; // adjust path to your typed pg Pool instance
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {
  User,
  CreateUserInput,
  LoginResult,
  PasswordResetRequestResult,
} from './auth.types';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = '1d';
const RESET_TOKEN_EXPIRY_MINUTES = 30;

export class AuthModel {

    // ---------------------- CREATE USER ----------------------
    async createUser(input: CreateUserInput): Promise<any> {
    const { firstname, lastname, email, password } = input;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
        if (existing.rows.length > 0) {
        throw new Error('Email already registered');
        }

        const userResult = await client.query<User>(
        `INSERT INTO users (firstname, lastname, email)
        VALUES ($1, $2, $3)
        RETURNING id, firstname, lastname, email, is_active, created_at`,
        [firstname, lastname, email]
        );
        const user = userResult.rows[0];

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await client.query(
        `INSERT INTO user_passwords (user_id, password) VALUES ($1, $2)`,
        [user.id, hashedPassword]
        );

        await client.query('COMMIT');
        const token = jwt.sign({ id: user.id, email: email }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });
        return { user, token };
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
    }
    // ---------------------- LOGIN USER ----------------------
    async loginUser(email: string, password: string): Promise<LoginResult> {
    const result = await pool.query<User & { password: string }>(
        `SELECT u.id, u.firstname, u.lastname, u.email, u.is_active, u.created_at, p.password
        FROM users u
        JOIN user_passwords p ON p.user_id = u.id
        WHERE u.email = $1`,
        [email]
    );

    if (result.rows.length === 0) {
        throw new Error('Invalid email or password');
    }

    const row = result.rows[0];

    if (row.is_active !== 1) {
        throw new Error('Account is inactive');
    }

    const isMatch = await bcrypt.compare(password, row.password);
    if (!isMatch) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign({ id: row.id, email: row.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });

    const { password: _discard, ...user } = row;
    return { user, token };
    }

    // ---------------------- FORGOT PASSWORD (request reset) ----------------------
    async generatePasswordResetToken(
    email: string
    ): Promise<PasswordResetRequestResult> {
    const userResult = await pool.query<{ id: string }>(
        'SELECT id FROM users WHERE email = $1',
        [email]
    );
    if (userResult.rows.length === 0) {
        throw new Error('No account found with this email');
    }
    const userId = userResult.rows[0].id;

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (user_id)
        DO UPDATE SET token = $2, expires_at = $3, created_at = now()`,
        [userId, hashedToken, expiresAt]
    );

    return { userId, rawToken, expiresAt };
    }
    // ---------------------- RESET PASSWORD (consume token) ----------------------
    async resetPassword(
    rawToken: string,
    newPassword: string
    ): Promise<{ userId: string }> {
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const tokenResult = await pool.query<{ user_id: string; expires_at: Date }>(
        `SELECT user_id, expires_at FROM password_reset_tokens WHERE token = $1`,
        [hashedToken]
    );

    if (tokenResult.rows.length === 0) {
        throw new Error('Invalid or expired reset token');
    }

    const { user_id: userId, expires_at: expiresAt } = tokenResult.rows[0];

    if (new Date(expiresAt) < new Date()) {
        throw new Error('Reset token has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        await client.query(
        `UPDATE user_passwords SET password = $1, updated_at = now() WHERE user_id = $2`,
        [hashedPassword, userId]
        );

        await client.query(`DELETE FROM password_reset_tokens WHERE user_id = $1`, [userId]);

        await client.query('COMMIT');
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }

    return { userId };
    }
    async getUserById(userId: string)
    {
        try {
            if (!userId || userId.length === 0) {
                throw new Error('Invalid user id.');
            }
            const getUserQuery = `SELECT u.id, u.firstname, u.lastname, u.email, u.is_active, u.created_at FROM users u WHERE u.id = $1`
            console.log(userId)
            const result = await pool.query(getUserQuery,[userId]);
            if (result.rows.length === 0) {
                throw new Error('Invalid email or password');
            }
            console.log((await result))
            const row = result.rows[0];
            if (row.is_active !== 1) {
                throw new Error('Account is inactive');
            }
            const { ...user } = row;
            return { user };
        } catch (error) {
            console.log(error)
        }
    }
}
