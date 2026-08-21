# AI-Powered Carbon Footprint & Sustainability Management Platform

## Project Overview

The **AI-Powered Carbon Footprint & Sustainability Management Platform (EcoTrack)** is a full-stack web application designed to support sustainable practices. It empowers users to monitor, manage, and analyze their carbon footprint through a secure, gamified, and AI-enhanced interface.

Built with an Angular frontend and a Spring Boot backend, EcoTrack delivers a responsive, scalable, and secure architecture.

---

## Key Features

EcoTrack is fully implemented and feature-complete, including:

- **Authentication & Security:** Secure JWT login, Google OAuth 2.0, and Role-Based Access Control (RBAC).
- **Carbon Tracking & Dashboard:** Comprehensive dashboard to log emissions, visualize footprint trends, and track sustainability metrics.
- **Goals & Challenges:** Create personal carbon reduction goals and participate in global community challenges.
- **Gamification:** Earn **XP**, maintain daily **Streaks**, unlock **Badges**, and level up your sustainability profile.
- **Leaderboard:** Compete against other users in global, all-time, or monthly leaderboards using dense ranking.
- **AI Integration:** Receive AI-powered daily tips, smart suggestions, and journal summaries powered by Google Gemini.
- **Notifications:** Real-time push notifications and in-app alerts for achievements and challenge updates.
- **Admin Analytics & Reporting:** Dedicated admin dashboard for platform-wide analytics, user management, and PDF/Excel/CSV data exports.

---

## Technology Stack

- **Frontend:** Angular 17+ (Standalone Components), TypeScript, RxJS, Bootstrap.
- **Backend:** Java 21, Spring Boot 3.5.x, Spring Security 6.
- **Database:** MySQL 8.x, Spring Data JPA, Hibernate, Flyway Migrations.
- **AI Services:** Google Gemini API.

---

## Repository Overview

| Module | Description |
|--------|-------------|
| [**frontend/**](./frontend/README.md) | Angular-based client application. Contains UI components, services, and routing. |
| [**backend/**](./backend/README.md) | Spring Boot REST API. Contains business logic, security, and database models. |

Detailed technical documentation, setup instructions, and architecture details are available in the respective module directories.

---

## Quick Setup

### Prerequisites
- **Java:** JDK 21
- **Node.js:** v18+ & npm
- **Database:** MySQL Server 8.x (running on port `3306`)

### 1. Database, Backend, & Initial ADMIN Setup
EcoTrack uses an automated **Initial ADMIN Bootstrap** process. A fresh evaluator database is expected to start entirely empty.

1. Create a MySQL database named `ecotrack_dev`.
2. Navigate to the `backend/` directory.
3. Copy `backend/.env.example` to `backend/.env` (never commit real `.env` credentials).
4. Configure your required credentials in `backend/.env` (DB, SMTP, Gemini API).
5. Configure the required initial administrator variables in `backend/.env` (`ECOTRACK_INITIAL_ADMIN_NAME`, `ECOTRACK_INITIAL_ADMIN_EMAIL`, `ECOTRACK_INITIAL_ADMIN_PASSWORD`), replacing placeholders with a strong private password.
6. Run tests to verify the environment: `.\mvnw.cmd clean test`
7. Start the backend: `.\mvnw.cmd spring-boot:run`

*Note: Upon backend startup, Flyway will automatically create the database schema and reference data. The `AdminBootstrapRunner` will then securely create the initial administrator account if no admin exists. You do NOT need to manually insert an admin into MySQL. See `backend/README.md` for full environment setup details.*

### 2. Frontend Setup
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the application: `npm start`
4. Access the platform at `http://localhost:4200`.

---

## Development Team

- Jeevan Marshal P
- Gokul S
- Anushka Kumari

---

## Project Status

**Complete and Submission-Ready.** All planned milestones, including AI integrations, leaderboards, and gamification, are fully implemented and verified.