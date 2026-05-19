# 🔐 Authentication System

A production-ready REST API authentication system built with Node.js, Express, Prisma, and PostgreSQL. Implements industry-standard security practices including JWT refresh token rotation, token family breach detection, and event-driven email notifications.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express.js |
| ORM | Prisma |
| Database | PostgreSQL |
| Authentication | JWT (Access + Refresh Tokens) |
| Password Hashing | bcrypt |
| Email | Nodemailer |
| Validation | Zod |
| Logging | Winston |
| Events | Node.js EventEmitter |

---

## ✨ Features

- **Register & Login** with secure password hashing
- **JWT Access Tokens** (short-lived, 15 min)
- **Refresh Token Rotation** — new refresh token issued on every use
- **Token Family Breach Detection** — detects reuse of old refresh tokens and revokes all sessions
- **Logout & Logout All Devices**
- **Email Verification** with resend support
- **Forgot & Reset Password** with secure tokenized links
- **JTI Blacklist** — revoked access tokens tracked until expiry
- **Rate Limiting** per route (auth, refresh, password reset, email verify)
- **Input Validation** via Zod schemas
- **Automatic Cleanup Jobs** — purges expired tokens every 6 hours
- **Event-Driven Architecture** — emails and auth events decoupled via EventEmitter

---

## 📁 Project Structure

```
src/
├── config/          # Prisma, mailer, logger setup
├── controllers/     # Route handlers (auth.controller.js)
├── services/        # Business logic (AuthService.js)
├── repository/      # Prisma DB queries
│   ├── userRepo.js
│   ├── refreshTokenRepo.js
│   ├── tokenRevocationRepo.js
│   ├── emailVerificationRepo.js
│   └── passwordResetRepo.js
├── middleware/       # authenticate, validate, rateLimiters, asyncHandler
├── validator/        # Zod schemas (authValidator.js)
├── events/           # EventEmitter + handlers (authHandler.js)
├── utils/            # Errors, response, hashToken, generateTokens
├── jobs/             # cleanupJobs.js
└── routes/           # auth.router.js
```

---

## 🔌 API Endpoints

Base path: `/api/auth`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | ❌ | Register a new user |
| `POST` | `/login` | ❌ | Login and receive tokens |
| `POST` | `/refresh` | ❌ | Rotate refresh token |
| `POST` | `/logout` | ✅ | Logout current session |
| `POST` | `/logout-all` | ✅ | Logout all devices |

### Email Verification

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/verify-email/:token` | ❌ | Verify email address |
| `POST` | `/resend-verification` | ✅ | Resend verification email |

### Password Reset

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/forgot-password` | ❌ | Request password reset email |
| `GET` | `/reset-password/:token` | ❌ | Validate reset token |
| `POST` | `/reset-password/:token` | ❌ | Submit new password |

> ✅ = Requires `Authorization: Bearer <accessToken>` header

---

## ⚙️ Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/auth-system.git
cd auth-system
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the root:

```env
# App
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/auth_db

# JWT
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email (SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM="Auth System <your_email@gmail.com>"
```

### 4. Run database migrations

```bash
npx prisma migrate dev
```

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm start
```

---

## 🔒 Security Design

### Refresh Token Rotation
Every call to `/refresh` invalidates the old token and issues a new one. Tokens are stored as SHA-256 hashes — never in plain text.

### Token Family Breach Detection
Each refresh token belongs to a family. If an already-used (rotated) token is presented again, the system detects a potential breach and **revokes all tokens in that family**, logging out the user from all devices.

### JTI Blacklist
On logout, the current access token's `jti` (JWT ID) is stored in the `TokenRevocation` table and checked on every authenticated request — ensuring logged-out tokens cannot be reused before they expire.

### Password Reset Security
- Reset tokens are generated with `crypto.randomBytes(32)`
- Only the SHA-256 hash is stored in the database
- Tokens expire after 1 hour
- All active sessions are revoked on successful password reset

---

## 🗄️ Database Schema (Prisma)

Key models:

- `User` — account info, role, verification status
- `RefreshToken` — hashed tokens with family tracking and revocation
- `TokenRevocation` — JTI blacklist for access tokens
- `EmailVerification` — email verify tokens
- `PasswordReset` — password reset tokens

---

## 📬 Email Flow

Emails are sent via Nodemailer and triggered through a decoupled EventEmitter:

```
AuthService  →  emitter.emit(EVENT)  →  Handler  →  Nodemailer  →  User inbox
```

Events:
- `email.verify` — sent on register and resend
- `email.password.reset` — sent on forgot password request

---

## 🧹 Cleanup Jobs

Expired records are automatically purged every 6 hours:

- Expired refresh tokens
- Expired JTI revocations
- Expired email verification tokens
- Expired password reset tokens

---

## 📄 License

MIT