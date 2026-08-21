# AI-Powered Carbon Footprint & Sustainability Management Platform (EcoTrack)

## 1. Project Introduction

EcoTrack is a comprehensive, AI-powered carbon footprint and sustainability management platform. It is designed to help users accurately monitor their environmental impact, manage daily carbon emissions, and adopt sustainable lifestyle practices through an engaging, gamified interface.

## 2. Project Overview

The platform enables users to take actionable steps toward sustainability by providing a suite of interactive tools. EcoTrack allows users to:
- Monitor and manage daily carbon emissions
- Track sustainability activities and progress over time
- Set personalized carbon reduction goals
- Participate in community-driven sustainability challenges
- Engage with a gamified system utilizing experience points (XP), daily streaks, and unlockable badges
- View dense-ranked global leaderboards to foster healthy competition
- Receive AI-powered sustainability insights, smart recommendations, and journal summaries
- Receive real-time notifications for achievements and challenge updates
- Access comprehensive sustainability reports (PDF, Excel, CSV)
- Provide administrators with dedicated analytics, reporting, and management capabilities

## 3. Key Features

- **Secure Authentication:** Robust JWT-based authentication, Google OAuth 2.0 integration, and Role-Based Access Control (RBAC).
- **Carbon Tracking Dashboard:** Interactive visualizations of footprint trends and daily emissions logs.
- **Goals & Challenges Management:** Interactive modules for setting personal goals and joining global challenges.
- **Gamification Engine:** Real-time calculation of XP, streaks, levels, and badges based on user activities.
- **Global Leaderboard:** Accurate, dense-ranked leaderboards excluding administrative accounts.
- **AI Integration (Google Gemini):** Automated generation of daily eco-tips, behavioral insights, and periodic journal summaries.
- **Data Export & Reporting:** Extensible reporting engine supporting PDF, Excel (XLSX), and CSV generation.
- **Admin Analytics:** Dedicated dashboard for monitoring platform usage, managing users, and overseeing global challenges.

## 4. Technology Stack

- **Frontend:** Angular 22, TypeScript, RxJS, Bootstrap
- **Backend:** Java 21, Spring Boot 3.5.x, Spring Security 6
- **Database:** MySQL 8.x, Spring Data JPA, Hibernate, Flyway
- **Authentication:** JWT (JSON Web Tokens), Google OAuth2
- **AI Services:** Google Gemini API
- **Reporting:** OpenPDF, Apache POI, XChart

## 5. Platform Architecture

EcoTrack is built on a modern, decoupled client-server architecture:
- **Frontend (Angular):** A responsive, standalone-component-based web application that provides a dynamic user interface and communicates securely via REST APIs.
- **Backend (Spring Boot):** A robust RESTful API server that handles business logic, security rules, gamification state, and AI orchestrations.
- **Database (MySQL):** A relational database managed automatically by Flyway migrations to ensure schema consistency and safe deployments.
- **Security Layer:** Implements stateless session management using JWTs alongside standard OAuth2 workflows for seamless Google sign-in.
- **AI Integration:** Securely proxies requests to the Google Gemini API to generate personalized sustainability insights without exposing API keys to the client.
- **Reporting Engine:** Server-side generation of analytics and document exports for both standard users and administrators.

## 6. Project Access / Getting Started

**Important:** You are currently viewing the `main` branch, which serves exclusively as the clean presentation and documentation landing page for the project submission. **The application source code is not present on this branch.**

To access the application source code, configuration files, and detailed setup instructions, please navigate to the active development branch:

👉 **[Access the Application Branch (milestone_4)](https://github.com/Springboard-mentor-4721/Ecotrack-Group-1/tree/milestone_4)**

*Please do not attempt to run setup commands (such as `npm install` or `mvnw`) from the `main` branch, as the source files are safely isolated in the `milestone_4` branch.*

## 7. Documentation / Resources

Comprehensive technical documentation is available in the application branch:

- **[Root Project Setup Guide](https://github.com/Springboard-mentor-4721/Ecotrack-Group-1/blob/milestone_4/README.md):** Complete project initialization and evaluator setup instructions.
- **[Backend Documentation](https://github.com/Springboard-mentor-4721/Ecotrack-Group-1/blob/milestone_4/backend/README.md):** Environment configuration, database setup, and Initial ADMIN bootstrap details.
- **[Frontend Documentation](https://github.com/Springboard-mentor-4721/Ecotrack-Group-1/blob/milestone_4/frontend/README.md):** Frontend configuration, startup, and build instructions.

## 8. License

This project is released under the MIT License. Please refer to the [LICENSE](./LICENSE) file for more details.
