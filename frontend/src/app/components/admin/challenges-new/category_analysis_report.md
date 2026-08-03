# Architectural Verification Report: Challenge Category System

## Objective
To determine whether the Challenge Category system has a SINGLE source of truth across the database, backend, API, and frontend layers.

## Verdict
**FAILED.** There is **no single source of truth**. The architecture is heavily fractured, with massive inconsistencies between the database schema, backend entities, API payloads, and frontend models. The frontend mistakenly uses `typeCode` to represent categories, mapping to entirely hardcoded arrays that do not exist in the database, while ignoring the actual `linkedCategoryId` foreign key relationship.

---

### 1. Database Findings
- **Storage:** Categories are natively stored in the `carbon_categories` table.
- **Master List:** 
  1. Transportation
  2. Electricity
  3. Fuel
  4. Food
  5. Waste
  6. Water Usage
  7. Online Shopping
  8. Travel
- **Challenge Table Integration:** The `challenges` table contains two relevant columns:
  - `linked_category_id` (BIGINT): Intended to map to `carbon_categories.id`.
  - `type_code` (VARCHAR(30)): Constrained by a Foreign Key (`fk_challenges_type`) to the `challenge_type_config` table. The ONLY valid values for `type_code` are `PERSONAL`, `COMMUNITY`, `SEASONAL`, and `RECURRING`.

### 2. Backend & Entity Analysis
- **Challenge Entity:** `Challenge.java` stores `typeCode` (String) and `linkedCategoryId` (Long). It does not use a `@ManyToOne` relationship for the category, instead storing the raw ID.
- **Service Logic (`ChallengeService.java`):**
  - Blocks `typeCode` values of `PERSONAL` and `RECURRING`.
  - For `AUTOMATIC` tracking, it enforces that `linkedCategoryId` must not be null.
  - For `MANUAL` tracking, it forces `linkedCategoryId` to null.
- **Fatal Flaw:** The backend accepts any string for `typeCode` without validation against the `challenge_type_config` table.

### 3. API Findings
- Endpoints (e.g., `POST /api/admin/challenges`) expect `ChallengeRequest`, which contains `typeCode` and `linkedCategoryId`.
- Because the frontend sends environmental categories (e.g., "TRANSPORT") inside the `typeCode` field, the backend blindly passes this to the database, resulting in a **MySQL Foreign Key Constraint Violation** (`fk_challenges_type`) at runtime.

### 4. Frontend Findings
- **Data Source:** Categories are **100% hardcoded**.
- **Used Values:** Environment, Transport, Water, Energy, Lifestyle, Community.
- **Mapping Error:** The frontend maps the "Category" dropdown directly to the `typeCode` field instead of `linkedCategoryId`.
- **Missing Field:** The frontend `ChallengeRequest` model and wizard forms completely omit `linkedCategoryId`. Thus, creating an `AUTOMATIC` challenge is currently impossible from the UI (backend will throw a 400 error).

### 5. Category Usage & Duplication Map
- **Wizard (`wizard.component.ts`):** Hardcoded pill filters and form `<option>` tags (TRANSPORT, ENVIRONMENT, WATER, ENERGY, LIFESTYLE).
- **Library (`library.component.ts`):** Hardcodes badges/filtering.
- **Overview (`overview.component.ts`):** Hardcodes CSS badge classes (e.g., `.bg-environment { background: #8b5cf6; }`).
- **Analytics (`analytics.component.ts`):** Hardcodes data grouping for the doughnut chart.

### 6. Consistency Check Answers
1. **Is there exactly ONE category source?** NO.
2. **Do database IDs match backend?** NO (Frontend categories have no IDs; they are string enums).
3. **Do backend DTOs match frontend models?** NO (Frontend model is missing `linkedCategoryId`).
4. **Does every page use the same categories?** NO (Different components have slightly different hardcoded strings).
5. **Are categories duplicated anywhere?** YES (Duplicated across templates, component logic, and CSS files).
6. **Are categories hardcoded anywhere?** YES (Everywhere in the frontend).

---

## Identified Risks
1. **Application Crash / Save Failure:** Any attempt to create a challenge from the new wizard will instantly fail at the database level because `'TRANSPORT'` is not a valid `challenge_type_config` enum.
2. **Inability to use Automatic Tracking:** The missing `linkedCategoryId` in the frontend payload means automatic tracking validation will always fail in the backend.
3. **Data Drift:** If an admin modifies `carbon_categories` in the database, the frontend will not reflect these changes.

## Recommended Architecture
1. **Backend Endpoints:** Expose a dedicated `GET /api/categories` endpoint (returning `CarbonCategoryDto` items).
2. **Frontend Dynamic Loading:** The frontend should fetch the category list on app initialization or route resolution and inject it into the Wizard, Library, and Overview filters.
3. **Payload Correction:** 
   - The frontend's "Category" selection must map to `linkedCategoryId`.
   - The `typeCode` field should be abstracted away from the UI and statically set to `"COMMUNITY"` or dynamically chosen based on challenge privacy settings, not environmental category.
4. **Centralized UI Tokens:** Create a shared Angular Pipe or UI Service (e.g., `CategoryBadgeComponent`) that dynamically assigns colors based on category IDs rather than hardcoding `.bg-environment` classes across multiple stylesheets.
