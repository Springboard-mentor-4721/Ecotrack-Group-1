# EcoTrack Backend

## 1. EcoTrack Backend Overview
EcoTrack is a comprehensive sustainability tracking platform. The backend provides secure REST APIs for carbon tracking, goal setting, challenge participation, gamification (XP/badges), AI-powered insights, notifications, comprehensive reporting, and admin analytics.

## 2. Technology Stack
- **Core**: Java 21, Spring Boot 3.5.x
- **Security**: Spring Security 6, JWT, Google OAuth2
- **Database**: MySQL 8.x, Spring Data JPA, Hibernate
- **Migrations**: Flyway
- **Build Tool**: Maven

## 3. Backend Architecture
- **Presentation**: REST Controllers securing endpoints with JWT filtering and `@PreAuthorize`.
- **Business**: Modular services (`auth`, `tracking`, `gamification`, `ai`, `report`, `admin`).
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

## 6. Database Setup
1. Open your MySQL client and create the database:
   ```sql
   CREATE DATABASE ecotrack_dev;
   ```
2. Flyway will automatically manage schema initialization and migrations upon startup based on the scripts in `src/main/resources/db/migration`. 
   *(Do NOT rely on `spring.jpa.hibernate.ddl-auto=update`)*.

## 7. Initial ADMIN Setup
To ensure a secure environment on a fresh clone, the platform includes a **First-Admin Bootstrap**:
1. Before starting the backend, define your desired admin credentials in your `.env` file (e.g., `ECOTRACK_INITIAL_ADMIN_EMAIL` and `ECOTRACK_INITIAL_ADMIN_PASSWORD`).
2. When the backend starts, if exactly **0** admins exist in the database, `AdminBootstrapRunner` will securely create a brand new admin account using these credentials, assign `Role.ADMIN`, and hash the password with BCrypt.
3. If an admin already exists, or if the email is taken by a normal user, the bootstrap safely skips execution to prevent overrides.
4. You can log in via `/api/auth/login` using these credentials. Normal users registering via the frontend will strictly receive `Role.USER`.

## 8. Running the Backend
```bash
# Clean and compile the project
.\mvnw.cmd clean install

# Run the application
.\mvnw.cmd spring-boot:run
```
The server will start on `http://localhost:8080`.

## 9. Running the Frontend
The backend is configured to accept CORS requests from `http://localhost:4200`. Start the Angular frontend in a separate terminal:
```bash
cd ../frontend
npm install
npm start
```

## 10. Authentication
The backend uses **JWT (JSON Web Tokens)** for stateless session management.
- Protected endpoints require an `Authorization: Bearer <token>` header.
- Token expiration and secrets are configured in `application.yaml`.

## 11. AI Configuration
EcoTrack uses Google Gemini for insights, tips, and summaries. 
- Ensure `GEMINI_API_KEY` is set in your `.env`. 
- AI features can be globally toggled via `ecotrack.ai.enabled` in `application.yaml`.

## 12. Reports & Exports
EcoTrack generates comprehensive analytics available to users and admins:
- Supported Formats: **PDF**, **Excel**, **CSV/ZIP**.
- Features include user carbon tracking reports, goals/challenges progress, and overall sustainability metrics.

## 13. Gamification
- Users earn **XP** for carbon entries and challenges.
- **Badges** are awarded based on milestones.
- Managed centrally by the `gamification` and `challenge` modules.

## 14. Admin Features
Admins have access to privileged endpoints (`/api/admin/**`) for:
- Platform-wide Analytics and Metrics.
- User management (viewing, suspending, role management).
- Global challenges and badge configuration.

## 15. Testing
Run the comprehensive test suite (Unit and Integration):
```bash
.\mvnw.cmd test
```

## 16. Fresh Clone / Infosys Evaluation Procedure
1. Clone the repository.
2. Create `.env` from `.env.example` and fill in secrets (DB, SMTP, GEMINI, ADMIN credentials).
3. Create the `ecotrack_dev` database in MySQL.
4. Run the backend: `.\mvnw.cmd spring-boot:run`. Flyway will initialize the schema, and the bootstrap will create your initial admin.
5. Run the frontend: `npm start`.
6. Log in as ADMIN to verify the setup, and register a new USER to verify normal operations.
