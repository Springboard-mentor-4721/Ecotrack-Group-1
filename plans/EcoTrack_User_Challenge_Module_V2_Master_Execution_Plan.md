# EcoTrack User Challenge Module V2 — Master Execution Plan

**Classification:** Engineering Blueprint — Production Ready  
**Audience:** 4-person frontend development team + Tech Lead  
**Version:** 1.0 Final  
**Status:** Ready for Implementation  
**Based On:** Architecture Audit · Product Experience Report · V2 UX Specification · V2 Implementation Plan · Live Codebase Review  

---

## Phase 1 — Architecture Review

### 1.1 Missing Architectural Decisions (Identified from Codebase)

#### 1.1.1 No Shared Challenge Folder
The current codebase has no `app/shared/challenges/` folder. Challenge-related reusable components exist in page-specific folders, making sharing impossible without circular dependency.

**Decision:** Create `app/components/challenges/shared/` as the canonical home for all reusable challenge components. This folder is owned by no single page developer.

#### 1.1.2 No Shared Pipes
Five component `.ts` files each contain a local copy of `resolveImageUrl()`. There are no Angular Pipes declared anywhere in the app for challenge data transformation.

**Decision:** Three pipes must be created before any page development begins:
- `ChallengeImagePipe` — URL resolution
- `ChallengeStatusLabelPipe` — status string to human-readable label
- `ProgressColorPipe` — progress percentage + evaluation type → CSS class

#### 1.1.3 Magic String Proliferation
Participant statuses (`'ACTIVE'`, `'WITHIN_BUDGET'`, `'EXCEEDED'`, `'COMPLETED'`, `'FAILED'`, `'DROPPED'`) are written as raw strings scattered across five files. Backend enum changes will silently break the UI.

**Decision:** Create `app/components/challenges/shared/constants/challenge-status.constants.ts` containing typed string constants and helper arrays. All logic using status strings must import from this file.

#### 1.1.4 `ChallengeService` is Anemic
The current `ChallengeService` (45 lines) exposes only raw API calls with no state logic. Each page component re-implements:
- Active challenge filtering (status `in` array)
- XP sum calculation
- Progress percentage calculation

**Decision:** `ChallengeService` must be expanded with pure helper methods. A `ChallengeFacadeService` should not be created yet — keep it lean and focused, but eliminate re-implementations in components.

#### 1.1.5 `MyChallengeDisplay` Defined in Multiple Files
The interface `{ participant: ChallengeParticipant; challenge: ChallengeDetail }` is defined locally in both `challenges-dashboard-page.component.ts` and `my-challenges-page.component.ts`.

**Decision:** Move to `challenge.models.ts` as an exported interface named `MyChallengeEntry`.

#### 1.1.6 `challenge-types.config.ts` is Admin-Only and Incomplete
The config lives inside `admin/challenges-new/shared/` and only defines two challenge types (`COMMUNITY`, `SEASONAL`). The User Dashboard imports it via a cross-module path, which creates a hidden dependency on the Admin module.

**Decision:** Move `CHALLENGE_TYPES` config to `app/components/challenges/shared/config/challenge-type.config.ts`. Admin module imports from this shared location.

#### 1.1.7 Image URL Base Path is Hardcoded Per Component
Every component independently calls `environment.apiUrl.replace(/\/api$/, '')`. This pattern will break if the URL format changes.

**Decision:** The `ChallengeImagePipe` must be the single source of this logic. It reads `environment.apiUrl` once internally. No component may call `.replace(/\/api$/, '')` directly.

#### 1.1.8 No Route Guard for Challenge Detail
Any user can navigate directly to `/challenges/{id}` for a challenge that is `PENDING`, `ARCHIVED`, or `CLOSED`. The backend will return data, but the UI should handle these gracefully.

**Decision:** The `challenge-detail-page` must handle non-ACTIVE challenge status gracefully with an `UnavailableStateBanner` component — not a route guard (since the backend does return the data).

#### 1.1.9 N+1 Problem on Dashboard and My Challenges
Both pages call `GET /api/challenges/my` then fire one `GET /api/challenges/{id}` per participation. With 10 active challenges, this is 11 sequential API calls.

**Decision:** For V2 Phase 1 (Core), this pattern is acceptable but must be capped at a maximum of 10 participations on the Dashboard via `size=10`. Document as a known issue for Phase 2 backend optimization.

#### 1.1.10 Missing `ChallengeEvaluationType` as a TypeScript Union
The type `'ACHIEVEMENT' | 'BUDGET'` is written inline as an optional field in `Challenge` and `ChallengeRequest` interfaces, but is not exported as a named type.

**Decision:** Export `export type ChallengeEvaluationType = 'ACHIEVEMENT' | 'BUDGET';` from `challenge.models.ts`.

---

### 1.2 Component Ownership Decisions

| Component | Scope | Owner | Cannot Be Used By |
| :--- | :--- | :--- | :--- |
| `ChallengeImagePipe` | Global Shared | `challenges/shared/pipes/` | Nobody — universal |
| `ChallengeStatusBadge` | Global Shared | `challenges/shared/components/` | Nobody — universal |
| `ProgressColorPipe` | Global Shared | `challenges/shared/pipes/` | Nobody — universal |
| `ChallengeStatusLabelPipe` | Global Shared | `challenges/shared/pipes/` | Nobody — universal |
| `ChallengeCard` | Global Shared | `challenges/shared/components/` | Admin module (admin has its own) |
| `AchievementProgressWidget` | Global Shared | `challenges/shared/components/progress/` | Admin module |
| `BudgetProgressWidget` | Global Shared | `challenges/shared/components/progress/` | Admin module |
| `CommunityImpactWidget` | Global Shared | `challenges/shared/components/` | Admin module |
| `LeaderboardWidget` | Global Shared | `challenges/shared/components/` | Admin module |
| `ChallengeHero` | Page-Specific | `challenge-detail-page/` | Other pages |
| `ChallengeActionsPanel` | Page-Specific | `challenge-detail-page/` | Other pages |
| `ManualProgressModal` | Page-Specific | `challenge-detail-page/` | Other pages |
| `DashboardStatsWidget` | Page-Specific | `challenges-dashboard-page/` | Other pages |
| `UrgencyAlertBanner` | Page-Specific | `challenges-dashboard-page/` | Other pages |
| `HistoryCard` | Page-Specific | `challenge-history-page/` | Other pages |

---

### 1.3 Dependency Graph (Resolved)

```text
challenge.models.ts (types)
        │
        ├── challenge-status.constants.ts (constants, no imports)
        │
        ├── challenge-type.config.ts (config, no imports)
        │
        ├── ChallengeImagePipe (pipe, imports environment only)
        ├── ProgressColorPipe (pipe, imports constants)
        ├── ChallengeStatusLabelPipe (pipe, imports constants)
        │
        ├── ChallengeStatusBadge (imports label pipe, status constants)
        │
        ├── AchievementProgressWidget (imports models, color pipe)
        ├── BudgetProgressWidget (imports models, color pipe)
        │
        ├── ChallengeCard (imports badge, image pipe, models)
        ├── MyChallengeCard (imports badge, image pipe, progress widgets, models)
        │
        ├── ChallengeHero (imports image pipe, badge, models)
        ├── CommunityImpactWidget (imports models only)
        ├── LeaderboardWidget (imports models, ChallengeService)
        ├── ChallengeActionsPanel (imports models — emits events only)
        │
        ├── challenges-dashboard-page (imports cards, widgets, ChallengeService)
        ├── challenge-list-page (imports ChallengeCard, ChallengeService)
        ├── my-challenges-page (imports MyChallengeCard, ChallengeService)
        ├── challenge-detail-page (imports all detail widgets, ChallengeService)
        └── challenge-history-page (imports HistoryCard, ChallengeService)
```

**Zero circular dependencies** when following this graph. Each layer only imports from layers above it.

---

## Phase 2 — Design System Sprint

This sprint produces no UI. It only defines standards that all developers must follow from day one.

### 2.1 Typography

| Token Name | Size | Weight | Use Case |
| :--- | :--- | :--- | :--- |
| `--text-hero` | 2.5rem | 700 | Page headings, challenge title in hero |
| `--text-card-title` | 1.125rem | 700 | Challenge card title |
| `--text-stat` | 1.75rem | 800 | XP counters, large progress numbers |
| `--text-label` | 0.75rem | 600 | Badge labels, category tags (ALL CAPS) |
| `--text-body` | 0.875rem | 400 | Descriptions, rules text |
| `--text-micro` | 0.6875rem | 500 | Meta info, timestamps |

**Font Family:** System stack: `'Inter', 'Segoe UI', sans-serif`. No Google Fonts dependency required (already loaded in project).

---

### 2.2 Color Token System

#### Base Status Tokens
| Token | Hex | Use |
| :--- | :--- | :--- |
| `--color-success` | `#10b981` | Completed, Within Budget, Active (good) |
| `--color-success-bg` | `#d1fae5` | Success background tints |
| `--color-warning` | `#f59e0b` | Budget 60–80%, Upcoming, Milestone |
| `--color-warning-bg` | `#fef3c7` | Warning background tints |
| `--color-danger` | `#ef4444` | Exceeded, Failed, Critical Budget |
| `--color-danger-bg` | `#fee2e2` | Danger background tints |
| `--color-info` | `#3b82f6` | Community, Information, Leaderboard |
| `--color-info-bg` | `#dbeafe` | Info background tints |
| `--color-xp` | `#8b5cf6` | XP, Rewards, Gamification accents |
| `--color-xp-bg` | `#ede9fe` | XP background tints |

#### Achievement Challenge Color System
| State | Primary Color | Background | Usage |
| :--- | :--- | :--- | :--- |
| In Progress | `--color-success` | `--color-success-bg` | Progress bar, milestones |
| Completed | `--color-xp` | `--color-xp-bg` | Completion state overlay |
| 0% | `--color-neutral-300` | `--color-surface` | Empty bar |

#### Budget Challenge Color System
| Budget Used | Primary Color | Emotion |
| :--- | :--- | :--- |
| 0–59% | `--color-success` | Safe |
| 60–79% | `--color-warning` | Caution |
| 80–99% | `--color-danger` | Critical |
| 100%+ | `--color-danger` (pulsing) | Exceeded |

---

### 2.3 Spacing Scale

Use only these spacing values. No arbitrary pixel values.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--space-1` | 0.25rem (4px) | Tight gaps, icon margins |
| `--space-2` | 0.5rem (8px) | Small gaps between elements |
| `--space-3` | 0.75rem (12px) | Badge padding, small card internals |
| `--space-4` | 1rem (16px) | Standard padding |
| `--space-5` | 1.25rem (20px) | Widget internal padding |
| `--space-6` | 1.5rem (24px) | Section gaps |
| `--space-8` | 2rem (32px) | Large card padding |
| `--space-10` | 2.5rem (40px) | Page section spacing |
| `--space-12` | 3rem (48px) | Hero padding |

---

### 2.4 Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-sm` | 0.375rem | Badges, small pills |
| `--radius-md` | 0.75rem | Small cards, inputs |
| `--radius-lg` | 1rem | Standard cards, widgets |
| `--radius-xl` | 1.5rem | Large cards, hero sections |
| `--radius-full` | 9999px | Pills, circular elements |

---

### 2.5 Elevation & Shadows

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--shadow-sm` | `0 1px 3px rgba(0,0,0,0.08)` | Default card state |
| `--shadow-md` | `0 4px 12px rgba(0,0,0,0.10)` | Hovered card state |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.12)` | Modals, floating panels |
| `--shadow-budget-critical` | `0 0 0 3px rgba(239,68,68,0.3)` | Budget critical ring glow |

---

### 2.6 Animation Standards

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--transition-fast` | `150ms ease` | Button hover, badge color |
| `--transition-base` | `300ms ease` | Card hover, component transitions |
| `--transition-slow` | `600ms ease` | Progress bar fill |
| `--transition-progress` | `1000ms ease-out` | Initial progress bar animation on mount |
| `--transition-milestone` | `400ms cubic-bezier(0.34, 1.56, 0.64, 1)` | Milestone bounce animation |

**Rule:** All animations must respect `@media (prefers-reduced-motion: reduce)`. Wrap all animation declarations in a motion check.

---

### 2.7 Loading Skeleton Standards

- **Background:** `#e5e7eb` → `#f3f4f6` (shimmer animation)
- **Animation:** `shimmer` keyframe moving from left to right over 1.5s
- **All skeletons must match the exact dimensions of the element they replace**
- **No text placeholders. Shape-based skeletons only.**
- Existing `app-loading-skeleton` must be extended, not replaced

---

### 2.8 Empty State Standards

Every empty state must have:
1. A meaningful icon (not a spinner)
2. A title (What is empty)
3. A subtitle (Why and what to do)
4. A primary CTA button linking to the resolution

---

### 2.9 Responsive Breakpoints

| Name | Min Width | Layout Change |
| :--- | :--- | :--- |
| `xs` | 360px | Base mobile — single column |
| `sm` | 576px | 2-column grid for cards |
| `md` | 768px | Sidebar appears in Detail page |
| `lg` | 1024px | Full 2-col Detail layout |
| `xl` | 1280px | Max content width with padding |

**Max content width:** `1280px` centered. No full-bleed content except hero images.

---

### 2.10 Icon Guidelines

- Use only icons from the existing icon set (SVG inline or Lucide Angular — already imported)
- Icons that convey status must always be paired with a text label (accessibility rule)
- Icon size: `16px` micro, `20px` standard, `24px` hero
- Budget-critical state: use a `shield-alert` or `gauge` icon, never a plain `x`

---

### 2.11 Dark Mode Readiness

All color tokens must be defined on `:root`. A `[data-theme="dark"]` selector can override them without touching component CSS. Components must not hardcode hex values in their templates or CSS — only token variables.

> **Note:** Dark mode is NOT in V2 Phase 1 scope. But following this rule now costs nothing and prevents a full rewrite later.

---

### 2.12 Button Hierarchy

| Variant | Use Case | Styling Rule |
| :--- | :--- | :--- |
| Primary (Emerald) | Join Challenge, Log Progress | `btn-emerald` — filled, `border-radius: var(--radius-full)` |
| Secondary (Outline) | View Details, Explore | `btn-outline` — border only |
| Danger | Drop Challenge | `btn-danger` — red fill, use sparingly |
| Ghost | Modal cancel, secondary actions | No border, no background |
| Disabled | Any action unavailable | Opacity 0.5, `cursor: not-allowed` |

---

## Phase 3 — Component Contract Catalog

Every component defined here is **frozen for V2**. Inputs, outputs, and public API must not change between sprints without a contract review.

---

### CONTRACT-001: `ChallengeImagePipe`

| Property | Value |
| :--- | :--- |
| **Type** | Angular Pipe (Pure) |
| **Selector** | `challengeImage` |
| **File Location** | `challenges/shared/pipes/challenge-image.pipe.ts` |
| **Purpose** | Converts a raw `imageUrl` from the backend into a fully-qualified src URL |
| **Input** | `url: string \| null \| undefined` |
| **Input (optional)** | `fallbackIndex: number` (default 0) |
| **Output** | `string` — resolved URL or local placeholder path |
| **Logic** | If null/undefined → return `assets/images/challenge-placeholder-{n}.jpg`. If starts with `http` or `data:` → return as-is. Otherwise → `${environment.apiUrl.replace(/\/api$/, '')}/uploads/${url}` |
| **Pure?** | Yes |
| **Reusable Locations** | All components that render a challenge image |
| **Extension Points** | Future: add CDN URL prefix support |

---

### CONTRACT-002: `ProgressColorPipe`

| Property | Value |
| :--- | :--- |
| **Type** | Angular Pipe (Pure) |
| **Selector** | `progressColor` |
| **File Location** | `challenges/shared/pipes/progress-color.pipe.ts` |
| **Purpose** | Returns a CSS class name based on progress % and evaluation type |
| **Inputs** | `progress: number`, `target: number`, `evaluationType: ChallengeEvaluationType` |
| **Output** | `string` — one of: `'color-success'`, `'color-warning'`, `'color-danger'` |
| **Logic** | ACHIEVEMENT: always `color-success`. BUDGET: < 60% → `color-success`, 60–79% → `color-warning`, ≥ 80% → `color-danger` |
| **Pure?** | Yes |
| **Reusable Locations** | Progress widgets, challenge cards |

---

### CONTRACT-003: `ChallengeStatusLabelPipe`

| Property | Value |
| :--- | :--- |
| **Type** | Angular Pipe (Pure) |
| **Selector** | `statusLabel` |
| **File Location** | `challenges/shared/pipes/challenge-status-label.pipe.ts` |
| **Purpose** | Converts a raw backend status enum string into a human-readable display label |
| **Input** | `status: ChallengeParticipantStatus \| ChallengeStatus` |
| **Output** | `string` — e.g. `'WITHIN_BUDGET'` → `'On Track'`, `'EXCEEDED'` → `'Budget Exceeded'` |
| **Mapping Table** | ACTIVE → 'Active', WITHIN_BUDGET → 'On Track', EXCEEDED → 'Budget Exceeded', COMPLETED → 'Completed', FAILED → 'Not Achieved', DROPPED → 'Dropped Out' |
| **Pure?** | Yes |

---

### CONTRACT-004: `ChallengeStatusBadgeComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-challenge-status-badge>` |
| **File Location** | `challenges/shared/components/status-badge/` |
| **Purpose** | Renders a semantic colored badge pill for any challenge or participant status |
| **Input: `status`** | `ChallengeParticipantStatus \| ChallengeStatus` (required) |
| **Input: `size`** | `'sm' \| 'md'` (optional, default: `'sm'`) |
| **Output** | None — display only |
| **Child Dependencies** | `ChallengeStatusLabelPipe` |
| **Behavior** | Uses `ProgressColorPipe` to determine badge background token. Renders: icon + label text |
| **Accessibility** | Must include `role="status"` and `aria-label` |
| **Reusable Locations** | ChallengeCard, MyChallengeCard, Detail page hero, History card |

---

### CONTRACT-005: `ChallengeCardComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-challenge-card>` |
| **File Location** | `challenges/shared/components/challenge-card/` |
| **Purpose** | Universal card for the Explore page and Recommendations — shows challenge metadata without user-specific data |
| **Input: `challenge`** | `Challenge` (required) |
| **Input: `isJoined`** | `boolean` (optional, default: false) — shows "Joined" overlay |
| **Input: `highlightEvaluationType`** | `boolean` (optional, default: true) — shows BUDGET/ACHIEVEMENT badge |
| **Output: `cardClicked`** | `EventEmitter<number>` — emits challenge ID |
| **Displays** | Hero image, Title, Type badge, Evaluation type badge, XP reward, Days remaining, Participant count, Status badge |
| **Does NOT display** | User-specific progress, community totals, rules |
| **Child Dependencies** | `ChallengeImagePipe`, `ChallengeStatusBadgeComponent` |
| **Reusable Locations** | Explore, Dashboard Recommendations, Related Challenges section |
| **NOT for use in** | My Challenges (use `MyChallengeCardComponent` instead) |

---

### CONTRACT-006: `MyChallengeCardComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-my-challenge-card>` |
| **File Location** | `challenges/shared/components/my-challenge-card/` |
| **Purpose** | Card variant for challenges the user has joined — includes participant-specific progress |
| **Input: `entry`** | `MyChallengeEntry` (challenge + participant, required) |
| **Input: `compact`** | `boolean` (optional, default: false) — compact mode for Dashboard carousel |
| **Output: `cardClicked`** | `EventEmitter<number>` — emits challenge ID |
| **Displays (Achievement)** | Mini progress bar, progress value vs target, % complete |
| **Displays (Budget)** | Mini risk indicator (colored dot), remaining budget, status label |
| **Child Dependencies** | `ChallengeImagePipe`, `ChallengeStatusBadgeComponent`, `ProgressColorPipe`, `AchievementProgressWidget` (mini), `BudgetProgressWidget` (mini) |
| **Reusable Locations** | My Challenges page, Dashboard carousel |

---

### CONTRACT-007: `AchievementProgressWidgetComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-achievement-progress>` |
| **File Location** | `challenges/shared/components/progress/achievement-progress/` |
| **Purpose** | Full-size progress visualization for Achievement-type challenges |
| **Input: `progress`** | `number` — current user progress (required) |
| **Input: `target`** | `number` — target value (required) |
| **Input: `unit`** | `string` — display unit e.g. "km", "entries" (required) |
| **Input: `variant`** | `'full' \| 'mini'` (optional, default: `'full'`) |
| **Output: `milestoneReached`** | `EventEmitter<25 \| 50 \| 75 \| 100>` — fires once per threshold crossing |
| **Visual States** | 0% (empty), 1–99% (progress), 100% (complete, color: xp purple) |
| **Milestone Markers** | Tick marks at 25%, 50%, 75% on the progress bar |
| **Animation** | Bar width transitions from 0 to current value on mount (`--transition-progress`) |
| **Mini Variant** | Compact bar, no milestone markers, no unit label |

---

### CONTRACT-008: `BudgetProgressWidgetComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-budget-progress>` |
| **File Location** | `challenges/shared/components/progress/budget-progress/` |
| **Purpose** | Full-size risk visualization for Budget-type challenges |
| **Input: `progress`** | `number` — current usage (required) |
| **Input: `target`** | `number` — budget limit (required) |
| **Input: `unit`** | `string` — e.g. "kg CO2" (required) |
| **Input: `variant`** | `'full' \| 'mini'` (optional, default: `'full'`) |
| **Output: `budgetCritical`** | `EventEmitter<boolean>` — emits true when usage crosses 80% |
| **Visual States** | Safe (green), Caution (yellow), Critical (red), Exceeded (red + pulse) |
| **Full Variant Displays** | Risk meter bar, "Used" amount, "Remaining" amount, "Daily Allowance" (target / challenge duration days) |
| **Mini Variant** | Colored dot indicator + remaining label only |
| **Critical Animation** | Box shadow pulse using `--shadow-budget-critical` when ≥ 80% |
| **Exceeded State** | Bar turns fully red, "EXCEEDED" label replaces remaining |

---

### CONTRACT-009: `CommunityImpactWidgetComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-community-impact>` |
| **File Location** | `challenges/shared/components/community-impact/` |
| **Purpose** | Displays the global community progress for a challenge with a real-world impact translation |
| **Input: `communityProgress`** | `number` (required) |
| **Input: `targetValue`** | `number` (required) |
| **Input: `participantCount`** | `number` (required) |
| **Input: `typeCode`** | `string` — used to determine impact translation unit (required) |
| **Output** | None |
| **Impact Translation Logic** | `CARBON_REDUCTION` → "trees saved" (÷ 25), `WATER_CONSERVATION` → "liters saved", others → raw number |
| **Displays** | Community progress bar, participant count, real-world impact statement |
| **Reusable Locations** | Challenge Detail only (full variant) |

---

### CONTRACT-010: `ChallengeHeroComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-challenge-hero>` |
| **File Location** | `challenge-detail-page/components/hero/` (page-specific) |
| **Purpose** | Immersive full-width hero banner for the Challenge Detail page |
| **Input: `challenge`** | `ChallengeDetail` (required) |
| **Output** | None |
| **Displays** | Full-width image with gradient overlay, Title, Category badge, Evaluation type badge (BUDGET/ACHIEVEMENT), Status badge, Start/End dates |
| **NOT Reusable** | This component is specific to the detail page only |

---

### CONTRACT-011: `ChallengeActionsPanelComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-challenge-actions>` |
| **File Location** | `challenge-detail-page/components/actions/` (page-specific) |
| **Purpose** | Context-aware action block — renders the correct action based on participation state |
| **Input: `challenge`** | `ChallengeDetail` (required) |
| **Input: `isLoading`** | `boolean` (optional) |
| **Output: `joinClicked`** | `EventEmitter<void>` |
| **Output: `logProgressClicked`** | `EventEmitter<void>` |
| **State → Rendered Action** | Not joined → "Join Challenge" button. Joined + MANUAL → "Log Today's Impact" button. Joined + AUTOMATIC → Info banner with icon. Completed → "Challenge Complete" read-only. Failed → "Better luck next time" read-only. Challenge CLOSED → "This challenge has ended" banner. |

---

### CONTRACT-012: `ManualProgressModalComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-manual-progress-modal>` |
| **File Location** | `challenge-detail-page/components/progress-modal/` (page-specific) |
| **Purpose** | Modal dialog for manually logging a progress increment |
| **Input: `challenge`** | `ChallengeDetail` (required) |
| **Input: `currentProgress`** | `number` (required) |
| **Input: `visible`** | `boolean` (required) |
| **Output: `submitted`** | `EventEmitter<number>` — emits the delta amount |
| **Output: `cancelled`** | `EventEmitter<void>` |
| **Validation** | Amount must be > 0 and not null. Show error inline. |
| **Accessibility** | Focus must be trapped within modal when open. ESC key closes modal. |

---

### CONTRACT-013: `LeaderboardWidgetComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-leaderboard-widget>` |
| **File Location** | `challenges/shared/components/leaderboard/` |
| **Purpose** | Displays top participants in a challenge ranked by progress |
| **Input: `challengeId`** | `number` (required) |
| **Input: `currentUserId`** | `number` (optional) — highlights the current user's row |
| **Input: `limit`** | `number` (optional, default: 5) |
| **Output** | None |
| **API Called** | `GET /api/challenges/{id}/participants?size={limit}&sort=progress,desc` |
| **States** | Loading, Empty, Populated |
| **Displays** | Rank number, User ID (or "You"), Progress value, Status badge |
| **Note** | Does not fetch user names — Phase 2 enhancement |

---

### CONTRACT-014: `ChallengeRulesWidgetComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-challenge-rules>` |
| **File Location** | `challenges/shared/components/rules/` |
| **Purpose** | Renders challenge rules from backend data — NO hardcoded text |
| **Input: `challenge`** | `ChallengeDetail` (required) |
| **Output** | None |
| **Displays** | Tracking method (AUTOMATIC/MANUAL with explanation), Evaluation type (ACHIEVEMENT/BUDGET with description), Allowed subcategories (if restricted), Blocked subcategories (if any) |
| **Rule:** | Must not contain any text like `"Use sustainable transport..."`. All text derives from data. |

---

### CONTRACT-015: `UrgencyAlertBannerComponent`

| Property | Value |
| :--- | :--- |
| **Selector** | `<app-urgency-alerts>` |
| **File Location** | `challenges-dashboard-page/components/urgency-alerts/` (page-specific) |
| **Purpose** | Shows contextual urgency alerts for budget-critical or expiring challenges |
| **Input: `challenges`** | `MyChallengeEntry[]` (required) |
| **Output: `alertClicked`** | `EventEmitter<number>` — emits challenge ID |
| **Logic** | Iterate active challenges. Flag BUDGET challenges where progress/target ≥ 0.80. Flag any ACHIEVEMENT challenge where `endDate` is within 48 hours. |
| **Displays** | At most 3 alert rows. Each row has icon + text + "View" link. |

---

## Phase 4 — Refined Sprint Plan

---

### Sprint 0 — Design System & Architecture Setup
**Objective:** Establish the shared folder structure, constants, types, and design tokens. No UI is built.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | `challenges/shared/` folder, constants file, `challenge.models.ts` audit, `ChallengeEvaluationType` type export, `MyChallengeEntry` interface, move `CHALLENGE_TYPES` config, CSS token variables |
| **Required APIs** | None |
| **Required Components** | None |
| **Regression Risk** | Low — no UI changes |
| **Complexity** | Small |
| **DoD** | TypeScript interfaces match backend DTOs 1:1. Zero circular imports in dependency graph. Constants file reviewed and approved. |

---

### Sprint 1 — Shared Pipes & Status Badge
**Objective:** Build all shared pipes and the Status Badge component.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | `ChallengeImagePipe`, `ProgressColorPipe`, `ChallengeStatusLabelPipe`, `ChallengeStatusBadgeComponent` |
| **Required APIs** | None |
| **Dependencies** | Sprint 0 |
| **Regression Risk** | Low — additive only |
| **Complexity** | Small |
| **DoD** | All 8 participant statuses render correct badge color and label. Pipe handles null/undefined without throwing. Unit tests pass. |

---

### Sprint 2 — Progress Widgets
**Objective:** Build `AchievementProgressWidget` and `BudgetProgressWidget` in full and mini variants.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Both progress widgets (full + mini) with all visual states and animations |
| **Required APIs** | None (data passed via inputs) |
| **Dependencies** | Sprint 1 (needs `ProgressColorPipe`) |
| **Regression Risk** | None — new components |
| **Complexity** | Medium |
| **DoD** | Budget widget changes color at correct thresholds. Milestone event fires exactly once per threshold. Animation obeys `prefers-reduced-motion`. |

---

### Sprint 3 — Challenge Cards
**Objective:** Build `ChallengeCardComponent` and `MyChallengeCardComponent`.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Both card variants with all display states |
| **Required APIs** | None (data passed via inputs) |
| **Dependencies** | Sprint 1 + Sprint 2 |
| **Regression Risk** | None — new components |
| **Complexity** | Medium |
| **DoD** | BUDGET and ACHIEVEMENT cards are visually distinguishable. Joined overlay shows correctly. Mini progress variants display in compact layout. |

---

### Sprint 4 — Dashboard Page
**Objective:** Fully rebuild `challenges-dashboard-page` using new components.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Rebuilt dashboard with stats, urgency alerts, carousel, and recommendations |
| **Required APIs** | `GET /api/challenges/my`, `GET /api/challenges/{id}` (×N), `GET /api/challenges` |
| **Dependencies** | Sprint 3 |
| **Regression Risk** | Medium — replaces existing dashboard |
| **Complexity** | High |
| **DoD** | All 3 stats show real API data. Budget alert shows at ≥80%. Skeleton shown during load. Carousel does not render completed challenges. |

---

### Sprint 5 — Explore Page
**Objective:** Rebuild `challenge-list-page` with filter bar and real cards.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Rebuilt explore page with filter bar and pagination |
| **Required APIs** | `GET /api/challenges` (pageable) |
| **Dependencies** | Sprint 3 |
| **Regression Risk** | Medium — replaces existing list |
| **Complexity** | Medium |
| **DoD** | Filter by evaluation type (BUDGET/ACHIEVEMENT) shows only matching challenges. Joined challenges show overlay. Pagination works. Empty state shown when no results. |

---

### Sprint 6 — My Challenges Page
**Objective:** Rebuild `my-challenges-page` with tabs and type-aware cards.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Tabbed My Challenges page |
| **Required APIs** | `GET /api/challenges/my`, `GET /api/challenges/{id}` (×N) |
| **Dependencies** | Sprint 3 |
| **Regression Risk** | Medium — replaces existing page |
| **Complexity** | Medium |
| **DoD** | Tabs filter correctly by participant status group. Budget and Achievement cards render their distinct progress visualizations. Empty state per tab. |

---

### Sprint 7 — Challenge Detail Page (Core)
**Objective:** Rebuild `challenge-detail-page` — the most complex page.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Full detail page with hero, progress, actions, rules, community, rewards |
| **Required APIs** | `GET /api/challenges/{id}`, `POST /api/challenges/{id}/join`, `PUT /api/challenges/{id}/progress`, `GET /api/challenges/{id}/participants` |
| **Dependencies** | Sprint 1 + Sprint 2 + Sprint 3 |
| **Regression Risk** | High — replaces primary page |
| **Complexity** | Very High |
| **DoD** | ACHIEVEMENT and BUDGET pages render entirely different progress sections. Join updates state without reload. AUTOMATIC challenges show info banner. MANUAL challenges show log modal. Rules section has zero hardcoded text. |

---

### Sprint 8 — History Page & Community Leaderboard
**Objective:** New history page + leaderboard widget integrated into Detail.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | `challenge-history-page`, `HistoryCardComponent`, `LeaderboardWidgetComponent` added to Detail sidebar |
| **Required APIs** | `GET /api/challenges/my`, `GET /api/challenges/{id}/participants` |
| **Dependencies** | Sprint 6 + Sprint 7 |
| **Regression Risk** | Low — new features |
| **Complexity** | Medium |
| **DoD** | History lists all terminal-status participations. Completed shows green + date + XP. Failed shows encouraging message. Leaderboard shows top 5, current user highlighted. |

---

### Sprint 9 — Polish, Mobile, Accessibility
**Objective:** Final quality pass.

| Item | Detail |
| :--- | :--- |
| **Deliverables** | Mobile sticky action bar, full ARIA audit, motion query support, regression pass |
| **Required APIs** | None |
| **Dependencies** | All previous sprints |
| **Regression Risk** | Medium — touches all pages |
| **Complexity** | Medium |
| **DoD** | Lighthouse Accessibility ≥ 90. All pages functional at 360px. No layout overflow at any breakpoint. Console zero errors/warnings. |

---

## Phase 5 — Parallel Development Plan

Assumes **4 frontend developers** working simultaneously post Sprint 0.

---

### Developer A — Shared Components (Sprint 1, 2, 3)
**Owns:** `app/components/challenges/shared/`  
**Works on:** All pipes, status badge, progress widgets, challenge cards  
**Files touched:** Only files inside `challenges/shared/`  
**Merge risk:** Very low — no overlap with page developers  
**Blocks:** Developer B, C, D cannot start their pages until A delivers cards (Sprint 3)

**Sprint 1 Week:** Pipes + Badge  
**Sprint 2 Week:** Progress Widgets  
**Sprint 3 Week:** ChallengeCard + MyChallengeCard  

---

### Developer B — Dashboard (Sprint 4, starts after A's Sprint 3)
**Owns:** `challenges-dashboard-page/`  
**Works on:** Dashboard page rebuild + page-specific sub-components  
**Files touched:** `challenges-dashboard-page/` only  
**Merge risk:** None with Developer C or D  
**After Sprint 4:** Supports Developer A with component usage feedback

---

### Developer C — Explore + My Challenges (Sprint 5 + 6, parallel to B)
**Owns:** `challenge-list-page/`, `my-challenges-page/`  
**Works on:** Both list pages (parallel after Sprint 3)  
**Files touched:** `challenge-list-page/`, `my-challenges-page/` only  
**Merge risk:** None with Developer B or D  
**Note:** Sprint 5 and 6 can overlap since they share no files

---

### Developer D — Challenge Detail (Sprint 7, starts after Sprint 2)
**Owns:** `challenge-detail-page/`  
**Works on:** All detail page sub-components  
**Files touched:** `challenge-detail-page/` only  
**Merge risk:** Lowest — most isolated page  
**Can begin:** Building `ChallengeHeroComponent`, `ChallengeActionsPanel`, and `ManualProgressModal` immediately after Sprint 2 (progress widgets are ready)

---

### Merge Points

| Merge Point | When | Who Reviews |
| :--- | :--- | :--- |
| **MP-1:** Shared pipes + badge merge | End of Sprint 1 | Tech Lead + all devs |
| **MP-2:** Progress widgets merge | End of Sprint 2 | Tech Lead + Dev D |
| **MP-3:** Cards merge | End of Sprint 3 | All devs (they will all use these) |
| **MP-4:** Dashboard merge | End of Sprint 4 | Tech Lead |
| **MP-5:** Explore + My Challenges merge | End of Sprint 5+6 | Tech Lead |
| **MP-6:** Detail page merge | End of Sprint 7 | Full team — highest risk merge |
| **MP-7:** History + Leaderboard | End of Sprint 8 | Tech Lead |
| **MP-8:** Final Polish | End of Sprint 9 | Full team |

---

## Phase 6 — Regression Checklist

Apply after every sprint merge.

### Universal Regression Checklist

| Category | Test | Pass Condition |
| :--- | :--- | :--- |
| **Desktop (1280px)** | All pages render full layout | No overflow, no collapsed elements |
| **Tablet (768px)** | Sidebar drops below content | No horizontal scroll |
| **Mobile (360px)** | Single column, sticky bar visible | No clipping, all text readable |
| **API Integration** | All pages load real data | Zero hardcoded test values in UI |
| **Loading States** | Navigate to page on slow 3G simulation | Skeleton visible before data |
| **Empty States** | Remove all data for test user | Empty state with CTA shown, not blank |
| **Images** | Test with null imageUrl in API | Placeholder image shown, no broken img |
| **Budget Challenge** | View a budget challenge at 85% | Red risk meter, alert banner on dashboard |
| **Achievement Challenge** | View achievement at 60% | Emerald bar, milestone marker at 50% visible |
| **Routing** | Navigate between pages | No blank screens, no extra API calls |
| **Console Errors** | Open DevTools during full flow | Zero console errors |
| **Join Flow** | Join a challenge | Button updates without page reload |
| **Log Progress** | Log progress on MANUAL challenge | Progress bar updates, modal closes |
| **Auto Tracking** | View AUTOMATIC challenge | No log button shown, info banner present |
| **Accessibility** | Keyboard-only navigation | All buttons/links reachable via Tab |
| **ARIA** | Screen reader test | All interactive elements have descriptive labels |

---

## Phase 7 — Technical Debt Prevention Guide

### 7.1 Anti-Patterns Banned in V2

| Anti-Pattern | Current V1 Occurrence | V2 Rule |
| :--- | :--- | :--- |
| Local `resolveImageUrl()` | 5 component files | **BANNED.** Must use `ChallengeImagePipe` |
| Magic status strings | `['ACTIVE', 'WITHIN_BUDGET']` in component | **BANNED.** Must use constants file |
| Hardcoded rules text | `*ngIf="typeCode === 'CARBON_REDUCTION'"` | **BANNED.** All rules text derived from data |
| XP calculation in component | `reduce((sum, c) => sum + c.rewardXp)` | **ALLOWED** only in service method |
| `MyChallengeDisplay` re-defined | 2 component files | **BANNED.** Single export from `challenge.models.ts` |
| Cross-module imports (Admin → User) | Dashboard imports from Admin shared | **BANNED.** Move config to shared/challenges/ |
| Large component files (>300 lines) | Multiple V1 files | **WARNING** at 250 lines, refactor at 300 |
| Inline progress color calculations | `if (percentage >= 80) return 'text-warning'` | **BANNED.** Must use `ProgressColorPipe` |

### 7.2 Monitoring Rules

- **No component template may contain an `if` comparing to a raw status string.** Always pipe through `ChallengeStatusLabelPipe` or compare against imported constants.
- **No component may contain its own API call except** via `ChallengeService`. Sub-components receive data via `@Input()` only.
- **LeaderboardWidget is the only exception** — it calls the API itself, because it is lazy-loaded data.

---

## Phase 8 — Future Roadmap (Strictly Phased)

### Phase 1 — Core (V2 Launch)
Only what is required for the module to be functional and production-ready:
- Dashboard rebuild
- Explore rebuild
- My Challenges rebuild
- Challenge Detail rebuild
- Shared component library (all contracts above)
- Budget and Achievement challenge UX
- Manual and Automatic tracking UX

### Phase 2 — Enhancements
- History page
- Leaderboard widget (in Detail page)
- Milestone toasts
- XP animation on completion
- Streak display on Dashboard (frontend-calculated from `joinedAt`)
- Certificate view (display only — no PDF generation yet)

### Phase 3 — Future (Not in V2 scope)
- Live community activity feed (requires new backend endpoint)
- Friend system and direct challenge invites
- Push notifications
- AI-powered challenge recommendations
- Seasonal challenge collections
- Dark mode
- Social sharing (image generation)
- PDF certificate download

---

## Risk Matrix

| Risk | Likelihood | Impact | Sprint | Mitigation |
| :--- | :--- | :--- | :--- | :--- |
| N+1 API calls on Dashboard | High | Medium | Sprint 4 | Cap at 10 active challenges, document for Phase 2 |
| Progress widget animation on mobile | Medium | Low | Sprint 2 | Use CSS-only, test on real device |
| Challenge Detail page complexity > estimate | High | Medium | Sprint 7 | Start page-specific sub-components in Sprint 2+3 in parallel |
| Merge conflicts on `challenge.models.ts` | Medium | Low | Sprint 0 | Lock model file after Sprint 0 — PRs require Tech Lead approval |
| Developer B blocks on Sprint 3 delivery | Medium | Medium | Sprint 4 | Dev B builds dashboard shell and mock data in Sprint 3 week |
| Backend `participantCount` = 0 on detail | Low | High | Sprint 7 | Already fixed in `ChallengeService.java` — verify in Sprint 7 API test |
| CSS token conflicts with existing global styles | Medium | Medium | Sprint 0 | Namespace all new tokens with `--ch-` prefix |

---

## Definition of Done — Per Sprint

### Sprint 0 DoD
- [ ] `challenges/shared/` directory created with correct folder structure
- [ ] `challenge.models.ts` has `ChallengeEvaluationType` and `MyChallengeEntry` exports
- [ ] `challenge-status.constants.ts` exported and reviewed
- [ ] `CHALLENGE_TYPES` moved to shared location
- [ ] CSS design tokens added to global stylesheet
- [ ] Dependency graph diagram reviewed and approved by Tech Lead

### Sprint 1 DoD
- [ ] All 3 pipes created, pure, and unit tested
- [ ] `ChallengeStatusBadge` renders all 8 statuses with correct color
- [ ] All components export from a barrel index file in `challenges/shared/`
- [ ] No component outside shared imports from another page's folder

### Sprint 2 DoD
- [ ] Achievement widget milestone event fires at exactly 25/50/75/100
- [ ] Budget widget color transitions at correct thresholds
- [ ] Both widgets have `mini` variant
- [ ] `prefers-reduced-motion` honored by all animations
- [ ] Storybook-ready (inputs testable in isolation)

### Sprint 3 DoD
- [ ] `ChallengeCard` displays BUDGET and ACHIEVEMENT type distinctly
- [ ] `MyChallengeCard` renders correct progress variant by evaluation type
- [ ] Both cards have loading skeleton via `compact` input
- [ ] Joined overlay shown correctly when `isJoined=true`

### Sprint 4 DoD
- [ ] Dashboard shows zero hardcoded values
- [ ] Stats reflect real API counts
- [ ] Urgency alert fires for budget ≥ 80%
- [ ] Skeleton shows before data, transitions cleanly
- [ ] Empty state present with CTA to Explore

### Sprint 5 DoD
- [ ] Explore page paginated and filterable
- [ ] Filter by BUDGET / ACHIEVEMENT works correctly
- [ ] Joined challenges show overlay badge
- [ ] Empty state per filter shown

### Sprint 6 DoD
- [ ] Three tabs (Active, Completed, Failed) each show correct subset
- [ ] Budget cards show risk gauge, not standard bar
- [ ] Completion date shown on Completed tab
- [ ] Empty state per tab

### Sprint 7 DoD
- [ ] Hero image loads with fallback placeholder
- [ ] ACHIEVEMENT and BUDGET render entirely different progress sections
- [ ] Join action updates participant count and button state without reload
- [ ] AUTOMATIC challenge shows info banner, zero log buttons
- [ ] MANUAL challenge log modal validates amount > 0
- [ ] Rules section contains zero hardcoded text strings
- [ ] Responsive layout correct at all three breakpoints

### Sprint 8 DoD
- [ ] History lists all terminal-state participations
- [ ] Tabs filter All / Completed / Failed correctly
- [ ] Leaderboard shows top 5 on detail page
- [ ] Current user row highlighted in leaderboard

### Sprint 9 DoD
- [ ] Lighthouse Accessibility ≥ 90 on all pages
- [ ] All pages functional at 360px minimum
- [ ] Sticky action bar present on mobile detail page
- [ ] Zero console errors across all pages
- [ ] Full regression checklist passed
- [ ] Tech Lead sign-off received

---

## Final Recommended Build Sequence

```text
SPRINT 0  ─── Architecture Setup (All devs, 1–2 days)
     │
     ▼
SPRINT 1  ─── Pipes + Status Badge (Dev A, 2–3 days)
     │
     ▼
SPRINT 2  ─── Progress Widgets (Dev A | Dev D starts Hero + Actions)
     │         └─ Dev D: builds ChallengeHero, ActionsPanel, Modal in parallel
     ▼
SPRINT 3  ─── Cards (Dev A delivers, all devs review)
     │
     ├──── Dev B: Dashboard (Sprint 4)
     │
     ├──── Dev C: Explore (Sprint 5) + My Challenges (Sprint 6) [parallel]
     │
     └──── Dev D: Challenge Detail (Sprint 7)
               │
               └──────── Sprint 8 ─── History + Leaderboard (Dev C + D)
                              │
                              └──── Sprint 9 ─── Polish (All devs)
```
