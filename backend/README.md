# EcoTrack Backend

## Overview

The EcoTrack Backend is a robust Spring Boot REST API that handles user authentication, carbon tracking logic, gamification rules (XP, badges, leaderboards), AI-powered insights, notifications, and comprehensive data exporting.

## Technology Stack

- Java 21
- Spring Boot 3.5.16
- Spring Security 6, JWT, Google OAuth2
- MySQL 8.x, Spring Data JPA, Hibernate
- Flyway Migrations
- Maven wrapper

## Prerequisites

- JDK 21
- MySQL 8.x
- Maven wrapper (included in the repository)

## Environment Configuration

Copy the provided example environment file to configure your local credentials:

Linux/macOS:
```bash
cp .env.example .env
```

Windows (PowerShell):
```powershell
Copy-Item .env.example -Destination .env
```

| Variable | Purpose |
|----------|---------|
| `DB_URL` | MySQL database connection (e.g., `jdbc:mysql://localhost:3306/ecotrack_dev?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true`) |
| `DB_USERNAME` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `JWT_SECRET` | Strong 256-bit Base64 secret key for signing JWTs |
| `MAIL_HOST` | SMTP host for email functionality (optional) |
| `MAIL_PORT` | SMTP port (optional) |
| `MAIL_USERNAME` | SMTP username (optional) |
| `MAIL_PASSWORD` | SMTP password (optional) |
| `FRONTEND_URL` | URL of the frontend client (e.g., `http://localhost:4200`) |
| `GOOGLE_CLIENT_ID` | Google OAuth2 Client ID (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth2 Client Secret (optional) |
| `GEMINI_API_KEY` | Google Gemini API key required for AI-powered features |
| `ECOTRACK_INITIAL_ADMIN_EMAIL` | Initial administrator login email |
| `ECOTRACK_INITIAL_ADMIN_PASSWORD` | Initial administrator password |
| `ECOTRACK_INITIAL_ADMIN_NAME` | Initial administrator name |

**Security Note:**
`.env` is local/private and must never be committed to version control. The `.env.example` file contains placeholders only. Never expose real credentials, API keys, or JWT secrets.

## Database & Initial ADMIN Setup

Follow this exact fresh-install flow to configure the database and administrator securely:

1. **Create the Database:** Open your MySQL client and execute:
   ```sql
   CREATE DATABASE ecotrack_dev;
   ```

2. **Configure Environment:** Copy `.env.example` to `.env`.

3. **Configure Database Connection:** Set `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD` in `.env`.

4. **Configure Initial Administrator:** Set the following variables in `.env` using safe placeholder examples (replace the password with a strong private password):
   ```env
   ECOTRACK_INITIAL_ADMIN_NAME=System Administrator
   ECOTRACK_INITIAL_ADMIN_EMAIL=admin@example.com
   ECOTRACK_INITIAL_ADMIN_PASSWORD=your-strong-password
   ```

5. **Start the Backend:**
   Windows:
   ```cmd
   .\mvnw.cmd spring-boot:run
   ```
   Linux/macOS:
   ```bash
   ./mvnw spring-boot:run
   ```

6. **Automatic Schema Creation (Flyway):**
   - A fresh database is expected.
   - Flyway runs automatically during backend startup.
   - It creates and applies the schema initialization automatically.
   - The evaluator does not need to manually execute migration SQL files.

7. **Initial ADMIN Bootstrap (`AdminBootstrapRunner`):**
   - It runs automatically during application startup.
   - It checks whether an ADMIN already exists in the database.
   - If no ADMIN exists, it automatically creates the configured administrator.
   - The configured credentials come from the `ECOTRACK_INITIAL_ADMIN_*` environment variables.
   - The password is securely hashed.
   - The associated user profile and gamification initialization occurs automatically.
   - If an ADMIN already exists, bootstrap is skipped.
   - If the configured email belongs to an ordinary USER, it does not promote or overwrite that user.
   - Normal registration and administrator bootstrap are separate mechanisms.
   - **The normal registration page creates standard USER accounts, not ADMIN accounts.**
   - **Manual SQL insertion of an ADMIN is unnecessary.**

Log into the frontend using the configured admin email and password.

## Running the Backend

Expected backend URL: `http://localhost:8080`

Windows:
```cmd
.\mvnw.cmd spring-boot:run
```

Linux/macOS:
```bash
./mvnw spring-boot:run
```

## Compilation

To compile the project without running the application or tests:

Windows:
```cmd
.\mvnw.cmd clean compile
```

Linux/macOS:
```bash
./mvnw clean compile
```

## Testing

Tests are optional for normal application startup.

Windows:
```cmd
.\mvnw.cmd clean test
```

Linux/macOS:
```bash
./mvnw clean test
```

## Authentication

The application secures endpoints using JWT (JSON Web Tokens) for stateless session management and natively supports Google OAuth2 authentication integrations. Protected endpoints require an `Authorization: Bearer <token>` header.

## Key Modules

- Authentication/security
- Carbon tracking
- Goals
- Challenges
- Gamification
- Leaderboard
- AI
- Notifications
- Reporting/export
- Admin analytics
