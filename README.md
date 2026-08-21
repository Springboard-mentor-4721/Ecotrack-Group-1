# AI-Powered Carbon Footprint & Sustainability Management Platform (EcoTrack)

## Project Overview

EcoTrack is a full-stack carbon-footprint and sustainability-management platform using an Angular frontend and a Spring Boot backend. It empowers users to monitor, manage, and analyze their environmental impact through a secure, gamified, and AI-enhanced interface.

## Key Features

- **Authentication:** Secure JWT authentication, Google OAuth2, and Role-Based Access Control (RBAC).
- **Carbon Tracking:** Comprehensive dashboard to log emissions and visualize footprint trends.
- **Goals & Challenges:** Create personal carbon reduction goals and participate in global community challenges.
- **Gamification:** Earn XP, maintain daily streaks, unlock badges, and level up your sustainability profile.
- **Leaderboard:** Compete against other users in global leaderboards using dense ranking.
- **AI Integration:** Receive AI-powered recommendations, daily tips, and journal summaries.
- **Notifications:** Real-time push notifications and in-app alerts.
- **Admin Analytics:** Dedicated admin dashboard for platform-wide analytics and user management.
- **Reporting:** Export data in PDF, Excel, and CSV formats.

## Technology Stack

- **Frontend:** Angular 22, TypeScript, RxJS, Bootstrap
- **Backend:** Java 21, Spring Boot 3.5.16, Spring Security 6
- **Database:** MySQL 8.x, Hibernate, Flyway Migrations
- **AI Services:** Google Gemini API

## Repository Overview

- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Fresh Evaluator Setup

1. **Create an empty MySQL database:**
   Create a completely fresh database named `ecotrack_dev`.

2. **Configure the Backend:**
   Navigate to the `backend/` directory.

3. **Set up Environment Variables:**
   Copy the example environment file to `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Configure Local Credentials:**
   Edit the `.env` file to include your database and required service credentials using safe placeholders. Do not commit this file.

5. **Configure the Initial Administrator:**
   Set the following variables in `.env` to bootstrap your administrator account. Replace the safe placeholders with your own name, email, and strong password:
   ```env
   ECOTRACK_INITIAL_ADMIN_NAME=System Administrator
   ECOTRACK_INITIAL_ADMIN_EMAIL=admin@example.com
   ECOTRACK_INITIAL_ADMIN_PASSWORD=your-strong-password
   ```
   **Note on Administrator Bootstrap:**
   - The normal Sign Up flow creates normal users only.
   - The initial ADMIN creation is handled automatically by `AdminBootstrapRunner`.
   - On a fresh database with zero ADMIN users, the configured administrator is created automatically.
   - The password is securely hashed.
   - The associated user profile and gamification initialization is performed automatically by the backend.
   - If an ADMIN already exists, the bootstrap process is skipped.
   - If the configured email already belongs to a normal USER, the existing user is not promoted.
   - **The evaluator does NOT need to manually INSERT an administrator.**

6. **Start the Backend:**
   Windows:
   ```cmd
   .\mvnw.cmd spring-boot:run
   ```
   Linux/macOS:
   ```bash
   ./mvnw spring-boot:run
   ```

7. **Database Migrations:**
   Flyway automatically applies all schema migrations and necessary reference data when the backend starts. The `dataset/*.sql` files are local testing data only and are NOT part of the normal fresh evaluator setup.

8. **Start the Frontend:**
   Navigate to the `frontend/` directory and run:
   ```bash
   npm install
   npm start
   ```

9. **Access the Application:**
   Open the frontend at `http://localhost:4200`.
10. **Login:**
   Log in using the administrator credentials configured in `backend/.env`. The backend API runs at `http://localhost:8080`.

## Testing & Verification

Testing is optional and separated from normal application startup.

Windows:
```cmd
.\mvnw.cmd clean test
```

Linux/macOS:
```bash
./mvnw clean test
```

Optional compilation without running tests:

Windows:
```cmd
.\mvnw.cmd clean compile
```

Linux/macOS:
```bash
./mvnw clean compile
```

## Development Team

- Jeevan Marshal P
- Gokul S
- Anushka Kumari

## Project Status

Ready for Evaluation.