# EcoTrack Frontend

## Overview

This is the frontend application for the EcoTrack platform. It is a modern, responsive web client built with Angular that communicates with the Spring Boot backend to deliver carbon tracking, gamification, and AI-powered insights.

## Key Features

- Authentication
- Dashboard
- Carbon tracking
- Goals
- Challenges
- Gamification
- Leaderboard
- AI insights
- Reports
- Admin panel
- Error/session handling

## Technology Stack

- Angular 22
- TypeScript
- RxJS
- Bootstrap

## Environment Configuration

The frontend relies on `src/environments/environment.ts` to locate the backend API.

The actual configuration uses:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

**Administrator Credentials:**
Administrator credentials are NOT stored in the frontend. The initial administrator configuration belongs entirely to `backend/.env`. The frontend only sends authentication requests to the backend.

## Installation & Startup

The backend should be running before the frontend.

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm start
```

Frontend URL: `http://localhost:4200`

## Production Build

To generate a production build:
```bash
npm run build
```

The generated `dist/` folder contains the build artifacts. This is generated output and should not be treated as source code (it is properly ignored by `.gitignore`).

## Documentation References

- [Backend README](../backend/README.md)
- [Root README](../README.md)
