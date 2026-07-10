# EcoTrack Frontend

This is the frontend application for the EcoTrack platform. It is built using modern Angular with standalone components and reactive forms.

## Key Features

- **Authentication:** Fully integrated authentication supporting both standard email/password login and Google OAuth2.
- **Responsive Design:** Styled using Bootstrap to provide a consistent and responsive user experience across devices.
- **Routing:** Secure client-side routing with functional route guards protecting authenticated views (e.g., Dashboard, Carbon Tracker, Goals).
- **State & Error Handling:** Interceptors are configured to handle API tokens and cleanly manage session expiration (e.g., automatic logout on 401 Unauthorized).

## Technology Stack

- Angular (Standalone Components)
- TypeScript
- RxJS
- Bootstrap

## Development

To start the local development server:

```bash
npm install
npm run start
```

Once running, navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Documentation References

- **Backend Integration:** For backend architecture, API details, and server-side setup, please see the `backend/` directory documentation.
- **Project Overview:** For the high-level project goals, complete system architecture, and repository guidelines, refer to the [Root README](../README.md).
