# EcoTrack API Inventory and Postman Coverage Report

## Summary

- Total controllers: 3
- Total endpoints: 11
- GET: 4
- POST: 5
- PUT: 1
- DELETE: 1
- PATCH: 0
- Public APIs: 4
- Protected APIs: 7

## Controllers and Endpoints

| Controller | Method | Path | Auth | Request DTO | Response DTO | Notes |
|---|---|---|---|---|---|---|
| AuthController | POST | `/api/auth/register` | No | RegisterRequest | MessageResponse | Creates user with default USER role |
| AuthController | POST | `/api/auth/login` | No | LoginRequest | AuthResponse | Returns JWT access token |
| AuthController | POST | `/api/auth/forgot-password` | No | ForgotPasswordRequest | MessageResponse | Generic success response to avoid email enumeration |
| AuthController | POST | `/api/auth/reset-password` | No | ResetPasswordRequest | MessageResponse | Requires valid reset token |
| UserController | GET | `/api/users/me` | Yes | None | String | Returns authenticated principal email text |
| CarbonEntryController | POST | `/api/carbon` | Yes | CreateCarbonEntryRequest | CarbonEntryResponse | Calculates emission and stores entry |
| CarbonEntryController | GET | `/api/carbon` | Yes | None | Page<CarbonEntryResponse> | Supports pageable params |
| CarbonEntryController | GET | `/api/carbon/summary` | Yes | None | CarbonSummaryResponse | Requires startDate and endDate |
| CarbonEntryController | GET | `/api/carbon/{id}` | Yes | None | CarbonEntryResponse | Ownership enforced by user ID |
| CarbonEntryController | PUT | `/api/carbon/{id}` | Yes | UpdateCarbonEntryRequest | CarbonEntryResponse | Same-day edit restriction |
| CarbonEntryController | DELETE | `/api/carbon/{id}` | Yes | None | None | Same-day delete restriction |

## Security Model

- `/api/auth/**`, `/error`, and `/oauth2/**` are public.
- All other endpoints require authentication.
- No endpoint-level role annotations were found.
- Protected endpoints are effectively for authenticated users.

## Validation and Business Rules

### Auth
- Registration validates name, email, and password.
- Duplicate email registration returns 400.
- Login returns 401 for invalid credentials and 403 for suspended accounts.
- Forgot password does not reveal whether the email exists.
- Reset password requires a valid, unused, unexpired token.

### Carbon Tracking
- `categoryId` required.
- `subType` required, max 100 chars.
- `quantity` must be positive.
- `unit` required, max 30 chars.
- `entryDate` cannot be in the future.
- `notes` max 500 chars.
- Entry ownership is enforced by authenticated user ID.
- Update/delete only allowed for same-day entries.
- Summary aggregates by category within a date range.

## Database Tables Touched

- `users`
- `password_reset_tokens` (inferred from entity/repository)
- `carbon_entries`
- `carbon_categories`

## Exception Mapping

- 400: validation failures, malformed JSON, illegal arguments, invalid carbon category, emission factor issues
- 401: bad credentials, missing/invalid auth on protected routes
- 403: suspended account, entry modification not allowed
- 404: carbon entry not found

## Postman Collection Coverage

### Updated collection
- `postman/collections/EcoTrack API Suite`

### Added primary requests
- Authentication/Forgot Password
- Authentication/Reset Password
- Authentication/Get Current User
- Carbon Tracking/Get Carbon Entry By Id
- Carbon Tracking/Update Carbon Entry
- Carbon Tracking/Delete Carbon Entry

### Fixed existing requests
- Authentication/Register User
- Authentication/Login User
- Carbon Tracking/Create Carbon Entry
- Carbon Tracking/List User Entries
- Carbon Tracking/Get Dashboard Summary

### Added negative cases
- Authentication/Negative Cases/Invalid Login
- Authentication/Negative Cases/Duplicate Registration
- Authentication/Negative Cases/Unauthorized Current User
- Carbon Tracking/Negative Cases/Invalid Carbon Entry Payload
- Carbon Tracking/Negative Cases/Unauthorized List User Entries
- Carbon Tracking/Negative Cases/Get Missing Carbon Entry

## Variables Used

- `{{baseUrl}}`
- `{{jwtToken}}`
- `{{carbonEntryId}}`
- `{{resetToken}}`

## Automation Added

- Login saves `jwtToken` when `accessToken` is returned.
- Create Carbon Entry saves `carbonEntryId` when `id` is returned.
- Get Carbon Entry By Id also saves `carbonEntryId`.
- Primary requests include status, response time, and basic JSON assertions.

## Detected Issues Fixed

- Incorrect registration payload fields (`firstName`/`lastName`) corrected to `name`.
- Carbon create request corrected to include required `subType`.
- Several request files were normalized to consistent YAML structure.
- Authorization headers and variable-based URLs were standardized.

## Remaining Notes

- Some sample dates are static and may need adjustment depending on runtime date.
- `password_reset_tokens` schema was inferred because its migration file was not in the inspected set.
- Repository methods exist for category/date filtering of carbon entries, but those filters are not exposed by the current controller.
