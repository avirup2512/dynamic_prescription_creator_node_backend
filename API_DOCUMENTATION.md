# Authentication & Authorization API Documentation

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [RBAC Endpoints](#rbac-endpoints)
3. [Session Management Endpoints](#session-management-endpoints)
4. [Error Responses](#error-responses)
5. [Security Best Practices](#security-best-practices)

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Rate Limit:** 5 requests per 15 minutes

**Description:** Register a new user account

**Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Requirements:**

- Email must be valid and unique
- Password must be at least 8 characters
- Password must contain uppercase, lowercase, number, and special character

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": false,
      "isActive": true
    }
  },
  "message": "Verification email sent. Please check your email to verify your account."
}
```

**Error Responses:**

- `400`: Invalid input validation
- `409`: Email already registered
- `429`: Rate limit exceeded

---

### 2. Email Verification

**Endpoint:** `POST /api/auth/verify-email`

**Description:** Verify user email with token from registration email

**Request Body:**

```json
{
  "token": "verification_token_from_email"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Email verified successfully"
}
```

**Error Responses:**

- `400`: Invalid or expired token
- `400`: Token already used

---

### 3. User Login

**Endpoint:** `POST /api/auth/login`

**Rate Limit:** 5 requests per 15 minutes

**Description:** Authenticate user and receive tokens

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123abc",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isEmailVerified": true,
      "isActive": true,
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

**Cookies Set:**

- `refreshToken`: HTTP-only secure cookie (30 days expiry)

**Error Responses:**

- `401`: Invalid credentials
- `401`: Email not verified
- `403`: Account deactivated
- `423`: Account locked (after 5 failed attempts)
- `429`: Too many login attempts

---

### 4. Get Current User

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required (Bearer token)

**Description:** Get authenticated user information

**Headers:**

```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "userId": "clx123abc",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses:**

- `401`: No token provided or invalid token

---

### 5. Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Generate new access token using refresh token

**Request Body:**

```json
{
  "refreshToken": "refresh_token_from_login"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "new_access_token",
    "refreshToken": "new_refresh_token"
  }
}
```

**Error Responses:**

- `401`: Invalid or expired refresh token
- `401`: Session revoked

---

### 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required (Bearer token)

**Description:** Logout and revoke session

**Request Body (Optional):**

```json
{
  "sessionId": "specific_session_to_revoke"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Logged out successfully"
}
```

**Side Effects:**

- Refresh token is revoked
- Session is marked as revoked
- HTTP-only refresh token cookie is cleared

---

### 7. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Rate Limit:** 3 requests per hour

**Description:** Request password reset email

**Request Body:**

```json
{
  "email": "john@example.com"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "If an account with this email exists, a password reset link has been sent."
}
```

**Note:** Response is same regardless of whether email exists (security best practice)

---

### 8. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Rate Limit:** 3 requests per hour

**Description:** Reset password with token from email

**Request Body:**

```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePass123!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Password reset successfully. Please log in with your new password."
}
```

**Side Effects:**

- All sessions are revoked
- User must login again with new password

**Error Responses:**

- `400`: Invalid or expired token
- `400`: Token already used

---

### 9. Change Password

**Endpoint:** `POST /api/auth/change-password`

**Authentication:** Required (Bearer token)

**Description:** Change password for authenticated user

**Request Body:**

```json
{
  "currentPassword": "SecurePass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Password changed successfully. Please log in again."
}
```

**Side Effects:**

- All sessions are revoked
- User must login again

**Error Responses:**

- `401`: Current password incorrect

---

## RBAC Endpoints

### 1. Create Role

**Endpoint:** `POST /api/rbac/roles`

**Authentication:** Required + `role:create` permission

**Description:** Create new role

**Request Body:**

```json
{
  "name": "editor",
  "description": "Editor role with content management permissions",
  "isSystem": false
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "role_123",
    "name": "editor",
    "description": "Editor role with content management permissions",
    "isSystem": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Role created successfully"
}
```

---

### 2. Create Permission

**Endpoint:** `POST /api/rbac/permissions`

**Authentication:** Required + `role:create` permission

**Description:** Create new permission

**Request Body:**

```json
{
  "resource": "template",
  "action": "publish",
  "description": "Permission to publish templates"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "perm_123",
    "name": "template:publish",
    "resource": "template",
    "action": "publish",
    "description": "Permission to publish templates",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3. Get All Roles

**Endpoint:** `GET /api/rbac/roles`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "role_admin",
      "name": "admin",
      "description": "Administrator",
      "isSystem": true,
      "rolePermissions": [
        {
          "id": "rp_1",
          "permission": {
            "id": "perm_1",
            "name": "user:create",
            "resource": "user",
            "action": "create"
          }
        }
      ]
    }
  ]
}
```

---

### 4. Get All Permissions

**Endpoint:** `GET /api/rbac/permissions`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "perm_1",
      "name": "user:create",
      "resource": "user",
      "action": "create",
      "description": "Create new user"
    },
    {
      "id": "perm_2",
      "name": "template:read",
      "resource": "template",
      "action": "read",
      "description": "Read templates"
    }
  ]
}
```

---

### 5. Assign Role to User

**Endpoint:** `POST /api/rbac/users/:userId/roles`

**Authentication:** Required + `user:update` permission

**Request Body:**

```json
{
  "roleId": "role_editor"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "ur_123",
    "userId": "user_456",
    "roleId": "role_editor",
    "assignedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Role assigned to user successfully"
}
```

---

### 6. Get User Roles

**Endpoint:** `GET /api/rbac/users/:userId/roles`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "ur_123",
      "role": {
        "id": "role_editor",
        "name": "editor",
        "description": "Editor role",
        "rolePermissions": [
          {
            "permission": {
              "name": "template:create",
              "resource": "template",
              "action": "create"
            }
          }
        ]
      }
    }
  ]
}
```

---

### 7. Get User Permissions

**Endpoint:** `GET /api/rbac/users/:userId/permissions`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    "template:create",
    "template:read",
    "template:update",
    "template:delete",
    "user:read"
  ]
}
```

---

## Session Management Endpoints

### 1. Get All User Sessions

**Endpoint:** `GET /api/sessions`

**Authentication:** Required

**Description:** Get all active sessions for authenticated user

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "session_123",
      "deviceName": "Chrome on MacOS",
      "deviceType": "desktop",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-15T10:00:00Z",
      "lastActiveAt": "2024-01-15T11:30:00Z",
      "expiresAt": "2024-02-14T10:00:00Z"
    },
    {
      "id": "session_124",
      "deviceName": "Safari on iPhone",
      "deviceType": "mobile",
      "ipAddress": "192.168.1.101",
      "userAgent": "Mozilla/5.0...",
      "createdAt": "2024-01-14T15:30:00Z",
      "lastActiveAt": "2024-01-14T16:00:00Z",
      "expiresAt": "2024-02-13T15:30:00Z"
    }
  ]
}
```

---

### 2. Get Session Details

**Endpoint:** `GET /api/sessions/:sessionId`

**Authentication:** Required

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "session_123",
    "deviceName": "Chrome on MacOS",
    "deviceType": "desktop",
    "ipAddress": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2024-01-15T10:00:00Z",
    "lastActiveAt": "2024-01-15T11:30:00Z",
    "expiresAt": "2024-02-14T10:00:00Z",
    "isRevoked": false
  }
}
```

---

### 3. Revoke Specific Session

**Endpoint:** `DELETE /api/sessions/:sessionId`

**Authentication:** Required

**Description:** Logout from a specific device/session

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "Session revoked successfully"
}
```

---

### 4. Revoke All Sessions

**Endpoint:** `DELETE /api/sessions`

**Authentication:** Required

**Description:** Logout from all devices

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "success": true
  },
  "message": "All sessions revoked successfully"
}
```

---

### 5. Get Login History

**Endpoint:** `GET /api/sessions/login-history?limit=20`

**Authentication:** Required

**Query Parameters:**

- `limit` (optional): Number of records to return (default: 20)

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "lh_123",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "failureReason": null,
      "createdAt": "2024-01-15T11:30:00Z"
    },
    {
      "id": "lh_124",
      "ipAddress": "192.168.1.200",
      "userAgent": "Mozilla/5.0...",
      "status": "failure",
      "failureReason": "invalid_password",
      "createdAt": "2024-01-15T11:20:00Z"
    }
  ]
}
```

---

## Error Responses

### Standard Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Status Codes

| Code | Meaning               | Typical Cause                     |
| ---- | --------------------- | --------------------------------- |
| 400  | Bad Request           | Invalid input validation          |
| 401  | Unauthorized          | Missing or invalid authentication |
| 403  | Forbidden             | Insufficient permissions          |
| 404  | Not Found             | Resource not found                |
| 409  | Conflict              | Resource already exists           |
| 423  | Locked                | Account locked due to security    |
| 429  | Too Many Requests     | Rate limit exceeded               |
| 500  | Internal Server Error | Server error                      |

### Example Error Responses

**Validation Error (400):**

```json
{
  "success": false,
  "message": "email: Invalid email address, password: Password must be at least 8 characters",
  "statusCode": 400
}
```

**Unauthorized (401):**

```json
{
  "success": false,
  "message": "Invalid token",
  "statusCode": 401
}
```

**Forbidden (403):**

```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

**Rate Limited (429):**

```json
{
  "success": false,
  "message": "Too many requests, please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "statusCode": 429
}
```

---

## Security Best Practices

### 1. Token Storage

- **Access Token**: Store in memory or state management (Redux, Zustand)
- **Refresh Token**: Store in HTTP-only, secure, SameSite cookie
- Never store tokens in localStorage (XSS vulnerable)

### 2. Token Rotation

- Refresh tokens are automatically rotated on use
- Old tokens are invalidated
- Reduces token compromise window

### 3. Account Lockout

- After 5 failed login attempts, account is locked for 15 minutes
- Security notification email is sent
- Counters reset on successful login

### 4. Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### 5. Session Management

- Multiple device support
- Session tracking with device info
- Ability to revoke individual sessions
- Login history tracking

### 6. CORS & CSRF

- CORS is configured for specific origins
- All state-changing operations require CSRF tokens (implicit in POST/PUT/DELETE)
- SameSite cookie policy prevents CSRF

### 7. Rate Limiting

- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- Password reset: 3 requests per hour

### 8. HTTPS & Secure Cookies

- Always use HTTPS in production
- Cookies set with `secure` flag (HTTPS only)
- Cookies set with `httpOnly` flag (JavaScript cannot access)
- Cookies set with `sameSite=strict` (CSRF protection)

---

## Example cURL Commands

### Register

```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Current User

```bash
curl -X GET http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Logout

```bash
curl -X POST http://localhost:4000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -b cookies.txt
```

---

## Environment Variables

```
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# JWT
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
SESSION_EXPIRY_HOURS=24
REFRESH_TOKEN_EXPIRY_DAYS=30
VERIFICATION_TOKEN_EXPIRY_MINUTES=1440
PASSWORD_RESET_TOKEN_EXPIRY_MINUTES=60

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
SMTP_FROM="noreply@yourdomain.com"

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN="http://localhost:3000"
```
