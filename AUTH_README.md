# Enterprise Authentication & Authorization System

A production-ready authentication and authorization backend for SaaS applications built with Node.js, Express, TypeScript, PostgreSQL, and Prisma ORM.

## 🎯 Features

### Authentication

- ✅ Email & password registration with validation
- ✅ Email verification via token-based links
- ✅ Secure login with JWT access tokens
- ✅ Refresh token rotation (30-day expiry)
- ✅ Password reset via email
- ✅ Password change (authenticated users)
- ✅ Session management with device tracking
- ✅ Account lockout after failed login attempts
- ✅ Suspicious activity detection
- ✅ Audit logging

### Authorization (RBAC)

- ✅ Role-Based Access Control (RBAC)
- ✅ Permission management (resource:action format)
- ✅ Dynamic role assignment
- ✅ Permission inheritance through roles
- ✅ Multiple roles per user

### Security

- ✅ Helmet.js for HTTP headers
- ✅ CORS protection
- ✅ Rate limiting (global & endpoint-specific)
- ✅ Bcrypt password hashing (10 rounds)
- ✅ Token hashing for secure storage
- ✅ HTTPS-only secure cookies
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Brute-force protection
- ✅ Account lockout mechanism

### Session Management

- ✅ Multi-device login support
- ✅ Session revocation
- ✅ Login history tracking
- ✅ Device identification
- ✅ IP address tracking
- ✅ User agent tracking

### Developer Experience

- ✅ Full TypeScript support
- ✅ No `any` types
- ✅ Comprehensive error handling
- ✅ Request validation middleware
- ✅ Dependency injection friendly
- ✅ Repository pattern ready
- ✅ Service layer abstraction
- ✅ Reusable utilities
- ✅ Complete API documentation
- ✅ Example requests file

## 📋 Project Structure

```
src/
├── config/              # Configuration management
│   └── index.ts
├── database/           # Database utilities
│   ├── client.ts
│   ├── createTable.ts
│   └── redis.ts
├── middlewares/        # Express middlewares
│   ├── authenticate.middleware.ts
│   ├── authorize.middleware.ts
│   ├── error.middleware.ts
│   ├── rateLimiter.middleware.ts
│   └── validateRequest.middleware.ts
├── modules/           # Feature modules
│   ├── auth/          # Authentication
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.routes.ts
│   ├── rbac/          # Role-based access control
│   │   ├── rbac.controller.ts
│   │   ├── rbac.service.ts
│   │   └── rbac.routes.ts
│   └── session/       # Session management
│       ├── session.controller.ts
│       ├── session.service.ts
│       └── session.routes.ts
├── utils/            # Utility functions
│   ├── apiResponse.ts
│   ├── email.ts
│   ├── jwt.ts
│   ├── password.ts
│   └── tokenGenerator.ts
├── validators/       # Zod schemas
│   ├── auth.validators.ts
│   └── entity.validators.ts
└── app.ts           # Express app setup

prisma/
└── schema.prisma    # Database schema

server.ts           # Server entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd project-directory
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   JWT_SECRET="your-secret-key-min-32-characters"
   JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-characters"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   ```

4. **Set up Prisma**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run migrations
   npx prisma migrate dev
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Server will start at `http://localhost:4000`

### Build for Production

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 🔐 Default Roles & Permissions

The system initializes with three default roles:

### Admin

- All permissions including user management, role management, and audit log access

### User

- Create, read, and update templates
- Read user information

### Guest

- Read-only access to templates and user information

## 📡 API Endpoints

### Authentication (`/api/auth`)

- `POST /register` - Register new user
- `POST /verify-email` - Verify email address
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh` - Refresh access token
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password
- `POST /change-password` - Change password
- `GET /me` - Get current user

### RBAC (`/api/rbac`)

- `POST /roles` - Create role
- `GET /roles` - Get all roles
- `POST /permissions` - Create permission
- `GET /permissions` - Get all permissions
- `POST /users/:userId/roles` - Assign role to user
- `GET /users/:userId/roles` - Get user roles
- `GET /users/:userId/permissions` - Get user permissions

### Sessions (`/api/sessions`)

- `GET /` - Get all user sessions
- `GET /:sessionId` - Get session details
- `DELETE /:sessionId` - Revoke specific session
- `DELETE /` - Revoke all sessions
- `GET /login-history` - Get login history

## 🔒 Security Features

### Password Security

- Minimum 8 characters
- Requires uppercase, lowercase, number, and special character
- Hashed with bcrypt (10 rounds)
- 10-round salt for additional security

### Token Management

- Access tokens: 24-hour expiry
- Refresh tokens: 30-day expiry with rotation
- Automatic token rotation on refresh
- Token hashing before database storage

### Account Protection

- 5-attempt login limit with 15-minute lockout
- Automatic account lockout notification
- Session tracking across devices
- Suspicious activity detection
- IP address and user agent logging

### Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Password Reset**: 3 requests per hour

### HTTPS & Cookies

- Secure flag (HTTPS-only in production)
- HttpOnly flag (JavaScript cannot access)
- SameSite=strict (CSRF protection)
- 30-day cookie expiry for refresh tokens

## 🧪 Testing

### Using REST Client Extension

1. Install VS Code extension: `REST Client`
2. Open `requests.http` file
3. Click "Send Request" on any endpoint

### Using cURL

```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"SecurePass123!"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}'

# Get current user
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:4000/api/auth/me
```

## 📚 Database Schema

### Users

- `id` - Primary key
- `email` - Unique email
- `password` - Hashed password
- `firstName, lastName` - User info
- `isEmailVerified` - Email verification status
- `isActive` - Account active status
- `isLockedOut` - Account lock status
- `failedLoginAttempts` - Failed login counter
- `lockedUntil` - Lock expiry time
- `lastLoginAt` - Last login timestamp
- `lastPasswordChangeAt` - Password change timestamp
- `googleId` - Google OAuth ID
- Timestamps: `createdAt, updatedAt`

### Sessions

- `id` - Primary key
- `userId` - Foreign key to User
- `refreshTokenHash` - Hashed refresh token
- `ipAddress` - Login IP address
- `userAgent` - Browser info
- `deviceName` - Device identifier
- `createdAt, expiresAt, lastActiveAt` - Session timing
- `isRevoked, revokedAt, revokedReason` - Revocation tracking

### Roles & Permissions

- `roles` - Role definitions
- `permissions` - Permission definitions
- `userRoles` - User-to-role assignments
- `rolePermissions` - Role-to-permission assignments

### Audit Logs

- `id` - Primary key
- `userId` - User who performed action
- `action` - Action type (e.g., USER_REGISTERED)
- `entity, entityId` - What was affected
- `metadata` - Additional data (JSON)
- `ipAddress, userAgent` - Request info
- `createdAt` - Timestamp

## 🛠️ Configuration

All configuration is managed through environment variables. See `.env.example` for complete list.

### Key Configuration Options

```env
# Server
PORT=4000
NODE_ENV=development

# JWT Tokens
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
SESSION_EXPIRY_HOURS=24
REFRESH_TOKEN_EXPIRY_DAYS=30

# Security
MAX_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

## 📖 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference including:

- Detailed endpoint descriptions
- Request/response examples
- Error responses
- Status codes
- Security best practices

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check DATABASE_URL in .env
# Ensure PostgreSQL is running
# Verify credentials and host
```

### Email Not Sending

```bash
# Check SMTP credentials
# Enable "Less secure app access" for Gmail
# Use app-specific password for Gmail
# Check SMTP_PORT (usually 587 or 465)
```

### Rate Limit Errors

- Reduce request frequency
- Wait for the specified timeout period
- Check rate limit configuration in `.env`

## 🔄 Deployment

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
CMD ["node", "dist/server.js"]
```

### Environment Variables for Production

```env
NODE_ENV=production
JWT_SECRET=STRONG_SECRET_KEY
JWT_REFRESH_SECRET=STRONG_REFRESH_SECRET
DATABASE_URL=postgresql://user:password@prod-host:5432/dbname
SMTP_HOST=smtp.sendgrid.net
CORS_ORIGIN=https://yourdomain.com
```

## 📝 Development Notes

### Adding New Endpoints

1. Create validators in `src/validators/`
2. Create service in `src/modules/{feature}/`
3. Create controller in `src/modules/{feature}/`
4. Create routes in `src/modules/{feature}/`
5. Import routes in `src/app.ts`

### Adding New Permissions

```typescript
// In RBAC initialization
await rbacService.createPermission("resource", "action", "description");
```

### Custom Middleware

```typescript
// Protect endpoint with permission
router.post(
  "/endpoint",
  authenticate,
  authorize("permission:name"),
  controller,
);
```

## 📦 Dependencies

- **express** - Web framework
- **prisma** - ORM
- **jsonwebtoken** - JWT tokens
- **bcryptjs** - Password hashing
- **zod** - Input validation
- **nodemailer** - Email service
- **helmet** - HTTP headers
- **express-rate-limit** - Rate limiting
- **cookie-parser** - Cookie handling
- **cors** - CORS handling

## 📄 License

MIT License

## 👨‍💻 Author

Your Name/Organization

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:

- Create an issue on GitHub
- Contact support@yourdomain.com
- Check documentation at [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
