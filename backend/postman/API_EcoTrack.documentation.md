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

### 3. Forgot password

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

### 4. Reset password

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

### 5. Get current user

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
