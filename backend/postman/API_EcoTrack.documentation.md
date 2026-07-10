# API_EcoTrack API Documentation

This documentation was prepared from the [API_EcoTrack](file/postman/collections/API_EcoTrack) collection and the backend controller/DTO definitions.

## Base URL

`http://localhost:8080`

## Authentication

Protected endpoints require a bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt-token>
```

## Endpoints

### 1. Register user

- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Description:** Creates a new user account.

**Request body**

```json
{
  "name": "name2",
  "email": "name2@test.com",
  "password": "password123"
}
```

**Success response**

- **Status:** `201 Created`

```json
{
  "message": "User registered successfully"
}
```

**Validation rules**

- `name`: required, 2 to 100 characters
- `email`: required, valid email format
- `password`: required, minimum 8 characters

---

### 2. Login user

- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Description:** Authenticates the user and returns a JWT access token.

**Request body**

```json
{
  "email": "name@test.com",
  "password": "password123"
}
```

**Success response**

- **Status:** `200 OK`

```json
{
  "accessToken": "jwt-token-value",
  "tokenType": "Bearer",
  "message": "Login successful"
}
```

**Validation rules**

- `email`: required, valid email format
- `password`: required

---

### 3. Login with Google

- **Method:** `GET`
- **Path:** `/oauth2/authorization/google`
- **Description:** Starts the Google OAuth2 authentication flow by redirecting the user to Google's authentication page.

#### Authentication

None required.

#### Request

- No request body.
- No Authorization header required.

#### Success Response

- **Status:** `302 Found`

The backend redirects the browser to Google's OAuth2 consent page. After the user successfully signs in and grants permission, Google redirects back to the backend. The backend authenticates the user, generates a JWT access token, and finally redirects the user to the configured frontend callback URL with the JWT token.

Example:

```
http://localhost:4200/oauth2/success?token=<JWT_TOKEN>
```

#### Frontend Usage

To start Google Sign-In, redirect the user's browser to:

```http
GET /oauth2/authorization/google
```

or

```javascript
window.location.href = "http://localhost:8080/oauth2/authorization/google";
```

Do **not** call this endpoint using AJAX, `fetch()`, Axios, or Postman in production. It is designed for full browser redirection.

#### Notes

- This endpoint is public and does not require authentication.
- The JWT is generated only after successful Google authentication.
- The frontend should read the token from the callback URL and store it according to the application's authentication strategy.

> **Do not document** `/login/oauth2/code/google`.
>
> It is an internal Spring Security callback endpoint handled automatically by Spring Security and is not intended to be called directly by clients.
---

### 4. Forgot password

- **Method:** `POST`
- **Path:** `/api/auth/forgot-password`
- **Description:** Requests a password reset link for the given email.

**Request body**

```json
{
  "email": "name@test.com"
}
```

**Success response**

- **Status:** `200 OK`

```json
{
  "message": "If an account with that email exists, a password reset link has been sent."
}
```

---

### 5. Reset password

- **Method:** `POST`
- **Path:** `/api/auth/reset-password`
- **Description:** Resets the password using a reset token.

**Request body**

```json
{
  "token": "reset-token-value",
  "newPassword": "newPassword123"
}
```

**Success response**

- **Status:** `200 OK`

```json
{
  "message": "Password has been reset successfully"
}
```

**Validation rules**

- `token`: required
- `newPassword`: required, minimum 8 characters

---

### 6. Get current user

- **Method:** `GET`
- **Path:** `/api/users/me`
- **Description:** Returns the currently authenticated user identity.

**Headers**

```http
Authorization: Bearer <jwt-token>
```

**Success response**

- **Status:** `200 OK`

```text
Authenticated as: name@test.com
```

- **Error:** `401 Unauthorized` when token is missing or invalid.

## Files created

- OpenAPI schema: [API_EcoTrack.openapi.yaml](file/postman/API_EcoTrack.openapi.yaml)
- Markdown documentation: [API_EcoTrack.documentation.md](file/postman/API_EcoTrack.documentation.md)

## Notes

- The collection currently contains `register`, `login`, and `me` requests.
- The backend source also includes `forgot-password` and `reset-password`, so they were added to the schema/documentation for completeness.
- The `/api/users/me` endpoint currently returns plain text rather than a JSON object.
