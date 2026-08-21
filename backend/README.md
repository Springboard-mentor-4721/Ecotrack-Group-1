# EcoTrack Backend

## 1. Overview
EcoTrack Backend is a comprehensive Spring Boot application providing secure REST APIs for carbon tracking, goal setting, challenge participation, gamification (XP, badges, leaderboards), AI-powered insights, notifications, comprehensive reporting, and admin analytics.

## 2. Technology Stack
- **Core**: Java 21, Spring Boot 3.5.x
- **Security**: Spring Security 6, JWT, Google OAuth2
- **Database**: MySQL 8.x, Spring Data JPA, Hibernate
- **Migrations**: Flyway
- **Build Tool**: Maven

## 3. Backend Architecture
- **Presentation**: REST Controllers securing endpoints with JWT filtering and `@PreAuthorize`.
- **Business**: Modular services (`auth`, `tracking`, `gamification`, `leaderboard`, `ai`, `report`, `admin`).
- **Data Access**: Spring Data JPA repositories.
- **Integrations**: Gemini AI for insights, Mailtrap for SMTP emails.

## 4. Prerequisites
- **Java**: JDK 21
- **Database**: MySQL Server 8.x running on port `3306`
- **Maven**: Use the included `./mvnw` wrapper

## 5. Environment Configuration
Duplicate the provided example environment file to configure your local credentials:
```bash
cp .env.example .env
```
Fill in the `.env` file with your environment settings.

**Crucial Variables**:
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`: Your local MySQL credentials.
- `JWT_SECRET`: A secure 256-bit Base64 Key.
- `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`: SMTP credentials (e.g., Mailtrap).
- `GEMINI_API_KEY`: API key for Gemini AI features.
- `ECOTRACK_INITIAL_ADMIN_EMAIL`, `ECOTRACK_INITIAL_ADMIN_PASSWORD`, `ECOTRACK_INITIAL_ADMIN_NAME`: Initial credentials for the `AdminBootstrapRunner`.

**Security Note**: Never commit your `.env` file containing real secrets to version control.

## 6. Database & Initial ADMIN Setup

This project uses an automated **Initial ADMIN Bootstrap** process to ensure a secure, zero-friction setup for evaluators on a completely fresh install.

Follow this exact fresh-install flow:

1. **Create an empty database:** Open your MySQL client and run:
   ```sql
   CREATE DATABASE ecotrack_dev;
   ```
2. **Configure Environment:** Copy the `backend/.env.example` file to `backend/.env`.
   *Note: `backend/.env` is local/private and must never be committed. `backend/.env.example` contains safe placeholders only.*
3. **Configure Initial Administrator:** In your new `backend/.env` file, replace the safe placeholder values for the following variables with your desired initial administrator details. **Ensure you replace the password with a strong private password:**
   ```env
   ECOTRACK_INITIAL_ADMIN_EMAIL=admin@example.com
   ECOTRACK_INITIAL_ADMIN_PASSWORD=change-me-to-a-strong-password
   ECOTRACK_INITIAL_ADMIN_NAME=System Administrator
   ```
4. **Configure Connections:** Configure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and `GEMINI_API_KEY` in the `.env` file.
5. **Start the Backend:** Run `.\mvnw.cmd spring-boot:run`.
6. **Automatic Schema Creation:** Flyway will automatically create and apply the database schema and reference data (categories, badges, etc.) upon startup. Flyway migrations are the authoritative mechanism for creating the application schema.
7. **Automatic Admin Creation:** The `AdminBootstrapRunner` will check if an ADMIN already exists.
   - **If no ADMIN exists:** It automatically creates the administrator account using your `.env` variables, securely hashes the password, creates the associated profile, and initializes the required gamification profile.
   - **If an ADMIN already exists:** Bootstrap is safely skipped to preserve existing administrators.
   - **If the configured email already belongs to a normal USER:** The bootstrap process does NOT overwrite or promote that user, preventing accidental account takeover.
8. **Login:** After a successful startup, you can log in to the frontend using the configured administrator email and password.

*Please note: "Initial ADMIN Bootstrap" is distinct from ordinary user registration. The normal registration UI only creates standard users. You do NOT need to manually execute SQL inserts to create an administrator.*

## 7. Running the Backend
```bash
# Clean and compile the project
.\mvnw.cmd clean compile

# Run the application
.\mvnw.cmd spring-boot:run
```
The server will start on `http://localhost:8080`.

## 8. Authentication
The backend uses **JWT (JSON Web Tokens)** for stateless session management.
- Protected endpoints require an `Authorization: Bearer <token>` header.
- Token expiration and secrets are configured in `application.yaml`.

## 9. Key Modules
- **AI Integration**: Uses Google Gemini for insights, tips, and summaries. Ensure `GEMINI_API_KEY` is set in your `.env`. AI features can be globally toggled via `ecotrack.ai.enabled` in `application.yaml`.
- **Gamification & Leaderboard**: Users earn **XP** for carbon entries and challenges. **Badges** are awarded based on milestones. The global **Leaderboard** uses dense ranking to fairly display top users (admins are excluded).
- **Reports & Exports**: EcoTrack generates comprehensive analytics available to users and admins. Supported formats: **PDF**, **Excel**, **CSV/ZIP**.
- **Admin Features**: Admins have access to privileged endpoints (`/api/admin/**`) for platform-wide analytics, user management, and global challenges configuration.

## 10. Testing
Run the comprehensive test suite (Unit and Integration):
```bash
.\mvnw.cmd clean test
```
