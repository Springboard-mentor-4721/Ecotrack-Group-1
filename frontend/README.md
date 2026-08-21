# EcoTrack Frontend

This is the frontend application for the EcoTrack platform. It is built using modern Angular 17+ with standalone components and reactive forms.

## Key Features

- **Authentication:** Fully integrated authentication supporting both standard email/password login and Google OAuth2.
- **Responsive Dashboard:** View personal carbon tracking metrics, recent activities, and AI-generated insights.
- **Goals & Challenges:** Interactive interfaces to manage personal sustainability goals and join community challenges.
- **Gamification & Leaderboard:** Track your XP, Streaks, and Badges. Compete with others on the global Leaderboard.
- **AI Integration:** Receive personalized daily eco-tips and journal summaries directly in the UI.
- **Reports:** Generate and download detailed sustainability reports in PDF format.
- **Admin Panel:** Dedicated views for platform administrators to manage users, monitor analytics, and configure challenges.
- **State & Error Handling:** Interceptors are configured to handle API tokens and cleanly manage session expiration (e.g., automatic logout on 401 Unauthorized).

## Technology Stack

- Angular (Standalone Components)
- TypeScript
- RxJS
- Bootstrap

## Development Setup

### 1. Environment Configuration

The frontend needs to know where the backend API is located. Ensure your environment files in `src/environments/` are correctly configured. By default, it expects the backend to be running on `http://localhost:8080`.

*Note: The frontend requires the backend to be running. Administrator credentials are not configured here; the Initial Administrator is created automatically by the backend via the `backend/.env` configuration.*

### 2. Running the Application

To start the local development server:

```bash
npm install
npm start
```

Once running, navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### 3. Building for Production

To create a production build:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

## Documentation References

- **Backend Integration:** For backend architecture, API details, and server-side setup, please see the `backend/` directory documentation.
- **Project Overview:** For the high-level project goals, complete system architecture, and repository guidelines, refer to the [Root README](../README.md).
