# EcoTrack Backend

## Project Overview
The backend for the EcoTrack platform, providing secure user authentication, stateless JWT session management, and Google OAuth2 integration.

## Features
- **Core Architecture:** Spring Boot 3.x, Spring Security 6, Spring Data JPA, Maven Wrapper.
- **Local Authentication:** Email/Password registration and login with BCrypt hashing.
- **Stateless Sessions:** JWT generation, validation, and Bearer token API filtering.
- **Google OAuth2:** Integrated OAuth2 login, automatic account linking by email, and database persistence for OAuth users.
- **Account Recovery:** Forgot password and Reset password workflows.

## Tech Stack
- Java 21
- Spring Boot 3.3+
- Spring Security 6
- JWT (io.jsonwebtoken)
- MySQL 8.x
- Maven

## Architecture
- Layered architecture: Controllers -> Services -> Repositories -> Entities
- Security: Stateless JWT configuration with integrated Google OAuth2 provider fallback

## Folder Structure
```text
src/main/java/com/ecotrack/
├── auth/           # Authentication, Registration, Password Reset logic
├── common/         # Enums, Global Exception Handling, Email Services
├── security/       # JWT Filters, OAuth2 Handlers, WebSecurity configuration
├── user/           # User entities and repository
└── EcotrackBackendApplication.java
```

## Requirements
- Java Development Kit (JDK) 21
- MySQL Server 8.x running on port 3306
- Maven (or use the provided `./mvnw` wrapper)

## Environment Setup
Duplicate the provided example environment file to configure your local credentials:
```bash
cp .env.example .env
```
Fill in the `.env` file with your local MySQL credentials, Mailtrap SMTP settings, and Google OAuth2 Client ID/Secret. **Never commit `.env` to Git.**

## Database Setup
1. Open your MySQL client.
2. Create the database: `CREATE DATABASE ecotrack_db;`
3. Spring Boot will automatically generate the schema on startup based on the JPA entities.

## Google OAuth Setup
1. Go to Google Cloud Console.
2. Create a new OAuth 2.0 Client ID.
3. Add `http://localhost:8080/login/oauth2/code/google` to the Authorized redirect URIs.
4. Copy the Client ID and Secret into your `.env` file.

## Mail Configuration
We use Mailtrap for local email testing (password reset links).
1. Go to Mailtrap.io and create a free account.
2. Retrieve your SMTP credentials and place them in the `.env` file.

## Build & Run Instructions
```bash
# Clean and compile the project
./mvnw clean install

# Run the Spring Boot application
./mvnw spring-boot:run
```
The server will start on `http://localhost:8080`.

## Test Instructions
To run the automated test suite:
```bash
./mvnw test
```

## API Documentation
The OpenAPI specifications and Postman collections are stored in the `/postman` directory. You can import `postman/collections/API_EcoTrack` directly into Postman to test the endpoints.

## Troubleshooting
- **`ApplicationContext` fails to load:** Ensure your `.env` file is properly configured. The application requires DB and Mail properties to boot.
- **OAuth2 Redirects loop:** Verify your Google Authorized Redirect URI matches `http://localhost:8080/login/oauth2/code/google`.
- **CORS Errors:** The backend currently explicitly allows requests from `http://localhost:4200`. Update `SecurityConfig` if testing from a different origin.
