# EcoTrack Backend Architecture & Developer Guide

## 1. Project Structure
This backend strictly follows a **feature/module-based architecture** driven by the System Architecture Document (SAD). 
Instead of organizing by technical layers (e.g., all controllers together), the project groups code by functional capabilities.

## 2. Package Responsibilities
Root Package: `com.ecotrack`
All implementation code must belong to one of these core domain packages:
- **`admin`**: Cross-module administration and user moderation.
- **`auth`**: Registration, login, and token generation flows.
- **`challenge`**: Community challenges and participant tracking.
- **`common`**: Reusable generic infrastructure (e.g., GlobalExceptionHandler, base responses).
- **`config`**: Global Spring configurations (Security, CORS, OpenAPI).
- **`email`**: SMTP abstractions and templating.
- **`gamification`**: Badges, points, and eco-score logic.
- **`goal`**: Sustainability goal tracking.
- **`notification`**: Core alerts (in-app, push, email dispatch).
- **`recommendation`**: Spring AI integrations.
- **`report`**: PDF/Excel report generation.
- **`security`**: JWT filters, authentication entry points, and Spring Security core providers.
- **`tracking`**: Core carbon footprint entries and calculation engine.
- **`user`**: User profile, settings, and interests management.

*Note: Inside each package, code is further separated into `controller`, `service`, `repository`, `entity`, and `dto`.*

## 3. Coding Rules
- **SOLID Principles:** Every class should have one reason to change. 
- **Injection:** Always use Constructor Injection (`@RequiredArgsConstructor`). **Never use Field Injection (`@Autowired`)**.
- **Controllers:** Must remain thin. They parse requests, pass to services, and return DTOs.
- **Services:** All business logic belongs here. Services communicate across modules if needed.
- **Repositories:** Pure persistence layer. Use Spring Data JPA methods where possible.
- **Entities & DTOs:** Never expose JPA Entities to the client. Always map to Request/Response DTOs.
- **Exceptions:** Throw typed custom exceptions. Handle them centrally in `GlobalExceptionHandler`.

## 4. Naming Convention
- **Packages:** lowercase (e.g., `tracking`, not `Tracking`)
- **Classes:** PascalCase (e.g., `CarbonEntryService`)
- **Methods/Variables:** camelCase (e.g., `findByEmail`)
- **Database Tables/Columns:** snake_case (e.g., `carbon_entries`, `created_at`)
- **REST Endpoints:** kebab-case, nouns only (e.g., `/api/carbon-entries`)

## 5. Dependency Rules
Dependencies are added strictly on a **need-to-learn** basis.
**Current Dependencies:**
- Spring Web, Spring Security, Spring Data JPA, Spring Validation, Spring OAuth2 Client, Spring Mail
- MySQL Driver, DevTools, Test Dependencies
**Prohibited Dependencies (Until requested):**
- JWT libraries (JJWT), Lombok, Swagger/OpenAPI, MapStruct, Spring AI, Redis, Docker

## 6. Implementation Order & Learning Progress
Implementation is handled module by module. 
**Current Progress:**
- Backend skeleton created. Packages defined.
- *Next Up:* Security and Authentication Basics (Concept explanation pending user approval).

*Note: This file must be kept synchronized with the codebase whenever architectural components change.*
