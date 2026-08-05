# EcoTrack User Challenge Module V2 — Implementation Plan

**Version:** 2.0  
**Status:** Planning  
**Date:** August 2026  
**Based on:** Architecture Audit + Product Experience Report + V2 Functional & UX Specification  

---

## Section 1: Executive Summary

### Why V2 Exists

The User Challenge Module V1 was built incrementally on top of an existing, unstructured foundation. Over multiple iterations, hardcoded data, copy-pasted HTML, duplicate utility functions, missing DTO bindings, and an absence of shared component architecture created a module that:

- Does not visually or functionally distinguish between Achievement and Budget challenges
- Uses duplicated `resolveImageUrl` logic in every component file
- Renders hardcoded rules, community stats, and progress visuals disconnected from backend data
- Provides no gamification loop — XP is mentioned but never reinforced
- Lacks a consistent design language across Dashboard, Explore, My Challenges, and Detail pages

The backend, meanwhile, has been fully modernized and supports:
- `ChallengeEvaluationType` (ACHIEVEMENT / BUDGET)
- `ChallengeEngine` with carbon entry event integration
- `StrategyResolver` pattern (AchievementStrategy / BudgetStrategy)
- `ChallengeLifecycleScheduler` for automated transitions
- Full DTOs (`ChallengeDTO`, `ChallengeDetailDTO`, `ChallengeParticipantDTO`)
- Progress tracking (MANUAL and AUTOMATIC)
- Community progress aggregation

V2 exists to close this gap — to rebuild the User Challenge frontend from scratch using the V2 Functional & UX Specification as the master blueprint, consuming the existing backend without any changes.

### Goals
1. Deliver a fully redesigned, component-based User Challenge module
2. Support ACHIEVEMENT and BUDGET challenges with differentiated UX
3. Eliminate all duplicate logic through a shared component library
4. Introduce gamification reinforcement loops within the existing XP system
5. Build a maintainable, scalable Angular architecture

### Expected Outcome
A User Challenge experience that feels premium, emotionally engaging, and architecturally clean — with every screen powered by real backend data and no hardcoded values.

### Scope
**In Scope:** Dashboard, Explore, My Challenges, Challenge Detail, History  
**Out of Scope (Phase 3+):** Live social feed, push notifications, certificate PDF generation, leaderboard backend, friend system

---

## Section 2: Development Strategy

Development will happen in **9 sequential phases**. Each phase has a clear purpose and cannot begin until its predecessor is complete. This is intentional — foundation work must be done first to prevent component duplication from re-emerging.

---

### Phase 1: Foundation — Shared Architecture

**Purpose:** Build the shared component library, design tokens, utilities, and service layer that all subsequent phases depend on. Nothing user-visible is built here.

**Deliverables:**
- `shared/challenge/` component folder structure
- `ChallengeImagePipe` — a shared Angular pipe to resolve image URLs from backend paths
- `ChallengeStatusBadgeComponent` — reusable pill badge mapping any `ChallengeParticipantStatus` or `ChallengeStatus` to a color/label
- `challenge.models.ts` validation — confirm all TypeScript interfaces match backend DTOs exactly
- CSS design token additions: status colors (emerald/yellow/red/purple), badge sizes, animation timing variables
- `ChallengeService` audit and cleanup — remove any hardcoded fallback logic

**Dependencies:** None. This is the root phase.

**Completion Criteria:**
- `ChallengeImagePipe` resolves relative paths and external URLs correctly
- `ChallengeStatusBadgeComponent` renders all 8 participant statuses with correct color
- TypeScript interface fields match backend DTO fields 1:1
- No component contains a local `resolveImageUrl` method

---

### Phase 2: Dashboard Rebuild

**Purpose:** Rebuild the Dashboard page as the user's Mission Control center using Phase 1 components.

**Deliverables:**
- New `challenges-dashboard-page` component (replaces V1)
- `DashboardStatsWidget` — displays Active count, Completed count, Total XP
- `UrgencyAlertBanner` — renders budget-critical and expiry-near alerts
- `ContinueChallengeCarousel` — horizontal scrolling cards for active joined challenges
- `RecommendedChallengesGrid` — top 3 non-joined active challenges

**Dependencies:** Phase 1 (shared components, design tokens)

**Completion Criteria:**
- Dashboard loads with skeleton states and transitions cleanly
- Shows correct counts from API (not hardcoded)
- Budget challenge at >80% usage triggers a visible alert
- Challenges joined but completed do not appear in "Continue" section

---

### Phase 3: Explore / Challenge List Rebuild

**Purpose:** Rebuild the challenge discovery experience with filter, search, and type-aware cards.

**Deliverables:**
- New `challenge-list-page` component (replaces V1)
- `ChallengeFilterBar` — filters by Category, Type (Budget/Achievement), Tracking Method
- `ChallengeCardComponent` — the single reusable challenge card used across all pages
- Empty state, loading skeleton, and error state for all filter combinations

**Dependencies:** Phase 1 (ChallengeCard depends on shared badge/image components)

**Completion Criteria:**
- Filtering by type shows only Budget or Achievement challenges
- Card shows image, title, type badge, XP reward, days remaining, participant count
- Joined challenges show a "Joined" overlay
- Pagination works correctly

---

### Phase 4: My Challenges Rebuild

**Purpose:** Rebuild the My Challenges list as a management hub with tabs for Active, Completed, and Failed.

**Deliverables:**
- New `my-challenges-page` component (replaces V1)
- Tab navigation: Active | Completed | Failed
- `MyChallengeCardComponent` — an enhanced card variant showing participant-specific progress
- Achievement mini-bar and Budget mini-gauge in card layout

**Dependencies:** Phase 1 + Phase 3 (shares ChallengeCardComponent base design)

**Completion Criteria:**
- Each tab fetches and filters correctly from the `/api/challenges/my` endpoint
- Budget challenges show the risk gauge in cards, not a standard bar
- Completed challenges show completion date and XP earned

---

### Phase 5: Challenge Detail Rebuild

**Purpose:** Rebuild the Challenge Detail page as the central immersive experience with full type-aware layouts.

**Deliverables:**
- New `challenge-detail-page` component (replaces V1)
- `ChallengeHeroComponent` — full-width hero banner with image, gradient overlay, type badge, status
- `AchievementProgressWidgetComponent` — milestone markers, animated fill bar
- `BudgetProgressWidgetComponent` — risk meter, remaining budget, daily burn rate
- `CommunityImpactWidgetComponent` — community progress with real-world translation
- `ChallengeRewardWidgetComponent` — XP and badge preview
- `ChallengeRulesWidgetComponent` — renders tracking method, eligible actions, evaluation type
- `ChallengeActionsPanel` — Join / Log Progress / Automatic badge (context-aware)
- Manual progress log modal (for MANUAL tracking challenges)

**Dependencies:** Phase 1 + Phase 2 + Phase 3

**Completion Criteria:**
- Achievement and Budget challenges render different progress widget
- Join button updates UI optimistically and disables after join
- AUTOMATIC challenges show info banner instead of log button
- MANUAL challenges show log progress modal with validation
- Community progress renders correctly from `communityProgress` field

---

### Phase 6: History Page

**Purpose:** Build the History & Trophy page showing all past challenge participations.

**Deliverables:**
- New `challenge-history-page` component (new route)
- `HistoryCardComponent` — shows challenge title, final status, completion date, XP earned
- Tabs: All | Completed | Failed | Dropped
- Statistics summary at top (total completed, total XP, total CO2 saved estimate)

**Dependencies:** Phase 4 (shares My Challenges API + card design language)

**Completion Criteria:**
- All historical participations are listed
- Correct final status is shown for each
- Dates are formatted consistently

---

### Phase 7: Community Features (Scoped)

**Purpose:** Add community depth to the Detail page and a standalone Leaderboard section.

**Deliverables:**
- `LeaderboardWidgetComponent` — top participants within a challenge (ranked by progress)
- `CommunityGoalBarComponent` — community-wide progress toward a shared target
- Leaderboard data sourced from existing `/api/challenges/{id}/participants` endpoint

**Dependencies:** Phase 5 (rendered within the Challenge Detail page sidebar)

**Completion Criteria:**
- Leaderboard shows top 5 participants with progress values
- Current user is highlighted in the leaderboard

---

### Phase 8: Gamification Reinforcement

**Purpose:** Add the lightweight gamification layer on top of the rebuilt module.

**Deliverables:**
- `MilestoneToastComponent` — appears when user crosses 25/50/75/100%
- `XpBadgeAnimationComponent` — animated XP counter shown on completion
- CSS confetti animation layer (completion celebration)
- Streak display on Dashboard (requires `joinedAt` date math on frontend)

**Dependencies:** Phase 5 + Phase 6

**Completion Criteria:**
- Milestone toast appears at correct threshold crossings
- XP animation plays smoothly without layout shift
- Streak calculation is correct based on participation history

---

### Phase 9: Polish, Accessibility & Responsiveness

**Purpose:** Final pass on all screens for visual polish, mobile responsiveness, and accessibility compliance.

**Deliverables:**
- Mobile sticky action bar on Challenge Detail (Join/Log button always visible)
- Reduced motion support for all animations
- ARIA labels on all interactive elements
- Focus management on modals
- Performance audit: N+1 API call elimination in My Challenges
- Skeleton loading on every async surface

**Dependencies:** All previous phases

**Completion Criteria:**
- All pages pass Lighthouse accessibility score ≥ 90
- All pages are fully functional on mobile (360px width minimum)
- No layout overflow or clipping on any breakpoint

---

## Section 3: Screen Breakdown

---

### Screen 1: Dashboard

| Property | Value |
| :--- | :--- |
| **Purpose** | Mission control — daily engagement hub |
| **User Goal** | Understand current status at a glance and take the next action |
| **Primary Actions** | Navigate to active challenge detail, Navigate to Explore |
| **Secondary Actions** | View full My Challenges list, View Leaderboard |
| **Widgets** | DashboardStatsWidget, UrgencyAlertBanner, ContinueChallengeCarousel, RecommendedChallengesGrid |
| **Data Required** | All user participations (active, completed), All active challenges |
| **API Used** | `GET /api/challenges/my`, `GET /api/challenges` (pageable), `GET /api/challenges/{id}` (detail per participation) |
| **Acceptance Criteria** | 1. Stats reflect real API data. 2. Alert shows for Budget challenge > 80%. 3. Skeleton shown on load. 4. Empty state if no active challenges. |

**Empty State:** Full-width CTA hero: "No Active Challenges — Start Your Journey" with a button to Explore.

**Error State:** Inline error banner with retry button.

**Loading State:** Skeleton cards for carousel and stats widgets.

---

### Screen 2: Explore Challenges

| Property | Value |
| :--- | :--- |
| **Purpose** | Challenge discovery |
| **User Goal** | Find and evaluate challenges to join |
| **Primary Actions** | Filter by type/category, View challenge detail |
| **Secondary Actions** | Search by title |
| **Widgets** | ChallengeFilterBar, ChallengeCardComponent (grid), Pagination |
| **Data Required** | All ACTIVE challenges, Carbon category list |
| **API Used** | `GET /api/challenges` (pageable, status=ACTIVE) |
| **Acceptance Criteria** | 1. Cards show type badge (BUDGET/ACHIEVEMENT). 2. Filter reduces visible list correctly. 3. Joined challenges show "Joined" indicator. 4. Pagination works. |

---

### Screen 3: My Challenges

| Property | Value |
| :--- | :--- |
| **Purpose** | Centralized management of all joined challenges |
| **User Goal** | Monitor progress and navigate to active challenges |
| **Primary Actions** | Switch tabs, Navigate to challenge detail |
| **Secondary Actions** | None |
| **Widgets** | Tab bar, MyChallengeCardComponent (grid), Pagination |
| **Data Required** | All user participations with challenge detail hydrated |
| **API Used** | `GET /api/challenges/my`, then `GET /api/challenges/{id}` for each |
| **Acceptance Criteria** | 1. Tabs filter correctly by participant status. 2. Budget cards show risk gauge. 3. Achievement cards show progress bar. 4. Completion date shown on Completed tab. |

---

### Screen 4: Challenge Detail

| Property | Value |
| :--- | :--- |
| **Purpose** | In-depth challenge experience and action center |
| **User Goal** | Understand the challenge fully and take action |
| **Primary Actions** | Join Challenge (if not joined), Log Progress (if MANUAL), View My Progress |
| **Secondary Actions** | View rules, Share challenge |
| **Widgets** | ChallengeHeroComponent, AchievementProgressWidget OR BudgetProgressWidget, CommunityImpactWidget, ChallengeRewardWidget, ChallengeRulesWidget, ChallengeActionsPanel, LeaderboardWidget |
| **Data Required** | Single challenge detail with user progress embedded |
| **API Used** | `GET /api/challenges/{id}`, `POST /api/challenges/{id}/join`, `PUT /api/challenges/{id}/progress` |
| **Acceptance Criteria** | 1. Achievement challenges render progress bar with milestones. 2. Budget challenges render risk gauge. 3. AUTOMATIC challenges show info banner, no log button. 4. Community progress displays correctly. 5. Join updates UI immediately without reload. |

**Responsive:** Desktop = 2-column (content left, sidebar right). Mobile = stacked, sticky action bar at bottom.

---

### Screen 5: History

| Property | Value |
| :--- | :--- |
| **Purpose** | Trophy room and reflection |
| **User Goal** | Review past challenge history and celebrate wins |
| **Primary Actions** | Filter by outcome (Completed/Failed) |
| **Secondary Actions** | None (Phase 2: Certificate download) |
| **Widgets** | Stats summary banner, HistoryCardComponent, Tabs |
| **Data Required** | All historical participations (status = COMPLETED / FAILED / DROPPED) |
| **API Used** | `GET /api/challenges/my` |
| **Acceptance Criteria** | 1. Completed challenges show green badge + XP earned. 2. Failed challenges show appropriate encouraging state. 3. Dates are displayed. |

---

## Section 4: Component Inventory

---

### Shared Infrastructure Components (Phase 1)

#### `ChallengeImagePipe`
- **Purpose:** Converts a raw `imageUrl` string from the backend to a fully qualified URL
- **Inputs:** `url: string | null | undefined`
- **Outputs:** `string` (resolved URL or placeholder path)
- **Reusable Locations:** All components rendering challenge images
- **Priority:** Critical — Phase 1

#### `ChallengeStatusBadgeComponent`
- **Purpose:** Renders a semantic pill badge for any challenge or participant status
- **Inputs:** `status: ChallengeStatus | ChallengeParticipantStatus`, `size?: 'sm' | 'md'`
- **Outputs:** None (display only)
- **Reusable Locations:** ChallengeCard, MyChallengeCard, Challenge Detail, History Card
- **Priority:** Critical — Phase 1

---

### Card Components (Phase 3)

#### `ChallengeCardComponent`
- **Purpose:** Universal challenge card for Explore and Recommendations
- **Inputs:** `challenge: ChallengeDTO`, `isJoined: boolean`
- **Outputs:** `cardClicked: EventEmitter<number>` (challenge ID)
- **Dependencies:** ChallengeStatusBadgeComponent, ChallengeImagePipe
- **Reusable Locations:** Explore page, Dashboard Recommendations, Related Challenges
- **Priority:** High — Phase 3
- **Complexity:** Medium

#### `MyChallengeCardComponent`
- **Purpose:** Enhanced card for user's own participations, showing progress inline
- **Inputs:** `challenge: ChallengeDetailDTO`, `participant: ChallengeParticipantDTO`
- **Outputs:** `cardClicked: EventEmitter<number>`
- **Child Components:** AchievementProgressWidget OR BudgetProgressWidget (conditionally), ChallengeStatusBadgeComponent
- **Reusable Locations:** My Challenges page, Dashboard Carousel
- **Priority:** High — Phase 4
- **Complexity:** High

---

### Progress Components (Phase 5)

#### `AchievementProgressWidgetComponent`
- **Purpose:** Visualizes achievement-type progress (growth, momentum)
- **Inputs:** `progress: number`, `targetValue: number`, `unit: string`
- **Outputs:** `milestoneReached: EventEmitter<number>` (emits at 25/50/75/100)
- **Reusable Locations:** Challenge Detail (main), My Challenge Card (mini variant)
- **Priority:** Critical — Phase 5
- **Complexity:** Medium

#### `BudgetProgressWidgetComponent`
- **Purpose:** Visualizes budget-type progress as a risk meter (Green → Yellow → Red)
- **Inputs:** `progress: number`, `targetValue: number`, `unit: string`
- **Outputs:** `budgetCritical: EventEmitter<boolean>` (true when > 80%)
- **Reusable Locations:** Challenge Detail (main), My Challenge Card (mini variant), Dashboard Alert
- **Priority:** Critical — Phase 5
- **Complexity:** High

---

### Detail Page Components (Phase 5)

#### `ChallengeHeroComponent`
- **Purpose:** Full-width immersive banner with gradient overlay
- **Inputs:** `challenge: ChallengeDetailDTO`
- **Outputs:** None
- **Dependencies:** ChallengeImagePipe, ChallengeStatusBadgeComponent
- **Reusable Locations:** Challenge Detail only
- **Priority:** High
- **Complexity:** Low

#### `CommunityImpactWidgetComponent`
- **Purpose:** Shows community-wide progress with real-world environmental translation
- **Inputs:** `communityProgress: BigDecimal`, `targetValue: number`, `typeCode: string`, `participantCount: number`
- **Outputs:** None
- **Used APIs:** None (data passed from parent)
- **Reusable Locations:** Challenge Detail
- **Priority:** Medium
- **Complexity:** Low

#### `ChallengeRewardWidgetComponent`
- **Purpose:** Previews the XP reward available on completion
- **Inputs:** `rewardXp: number`, `challengeTitle: string`
- **Outputs:** None
- **Reusable Locations:** Challenge Detail sidebar
- **Priority:** Medium
- **Complexity:** Low

#### `ChallengeRulesWidgetComponent`
- **Purpose:** Renders challenge rules in human-readable format
- **Inputs:** `rulesConfig: RulesConfig`, `typeCode: string`, `trackingMethod: TrackingMethod`, `challengeEvaluationType: ChallengeEvaluationType`
- **Outputs:** None
- **Reusable Locations:** Challenge Detail
- **Priority:** Medium
- **Complexity:** Low

#### `ChallengeTimelineWidgetComponent`
- **Purpose:** Visualizes start/end date as a timeline bar showing progress through time
- **Inputs:** `startDate: Date`, `endDate: Date`
- **Outputs:** None
- **Reusable Locations:** Challenge Detail
- **Priority:** Low
- **Complexity:** Low

#### `ChallengeActionsPanelComponent`
- **Purpose:** Context-aware action panel (Join / Log Progress / Automatic badge / Completed state)
- **Inputs:** `challenge: ChallengeDetailDTO`, `isActionLoading: boolean`
- **Outputs:** `joinClicked: EventEmitter<void>`, `logProgressClicked: EventEmitter<void>`
- **Reusable Locations:** Challenge Detail only
- **Priority:** Critical — Phase 5
- **Complexity:** Medium

#### `ManualProgressModalComponent`
- **Purpose:** Modal for manually logging progress on MANUAL tracking challenges
- **Inputs:** `challenge: ChallengeDetailDTO`, `currentProgress: number`
- **Outputs:** `submitted: EventEmitter<number>` (amount), `cancelled: EventEmitter<void>`
- **Used APIs:** `PUT /api/challenges/{id}/progress`
- **Reusable Locations:** Challenge Detail (modal overlay)
- **Priority:** High — Phase 5
- **Complexity:** Low

---

### Dashboard Components (Phase 2)

#### `DashboardStatsWidgetComponent`
- **Purpose:** Three-stat summary (Active, Completed, Total XP)
- **Inputs:** `activeChallenges: number`, `completedChallenges: number`, `totalXp: number`
- **Reusable Locations:** Dashboard only
- **Priority:** High — Phase 2

#### `UrgencyAlertBannerComponent`
- **Purpose:** Contextual alert for critical budget or expiring challenge
- **Inputs:** `alerts: UrgencyAlert[]` (array of type + message + challengeId)
- **Outputs:** `alertClicked: EventEmitter<number>` (challenge ID)
- **Reusable Locations:** Dashboard only
- **Priority:** Medium — Phase 2

#### `ContinueChallengeCarouselComponent`
- **Purpose:** Horizontally scrollable row of active challenges
- **Inputs:** `challenges: MyChallengeDisplay[]`
- **Outputs:** `challengeSelected: EventEmitter<number>`
- **Child Components:** MyChallengeCardComponent
- **Reusable Locations:** Dashboard
- **Priority:** High — Phase 2

---

### Gamification Components (Phase 8)

#### `MilestoneToastComponent`
- **Purpose:** Animated toast notification at milestone thresholds (25/50/75/100%)
- **Inputs:** `percentage: number`, `challengeTitle: string`
- **Outputs:** `dismissed: EventEmitter<void>`
- **Priority:** Medium — Phase 8

#### `XpBadgeAnimationComponent`
- **Purpose:** Animated XP counter shown after challenge completion
- **Inputs:** `xpAmount: number`
- **Outputs:** None
- **Priority:** Medium — Phase 8

---

### History Components (Phase 6)

#### `HistoryCardComponent`
- **Purpose:** Read-only summary card for past challenge participation
- **Inputs:** `challenge: ChallengeDetailDTO`, `participant: ChallengeParticipantDTO`
- **Outputs:** None
- **Child Components:** ChallengeStatusBadgeComponent
- **Reusable Locations:** History page
- **Priority:** Medium — Phase 6

---

### Community Components (Phase 7)

#### `LeaderboardWidgetComponent`
- **Purpose:** Shows top participants within a specific challenge
- **Inputs:** `challengeId: number`
- **Outputs:** None
- **Used APIs:** `GET /api/challenges/{id}/participants` (pageable)
- **Reusable Locations:** Challenge Detail sidebar
- **Priority:** Medium — Phase 7
- **Complexity:** Medium

---

## Section 5: Component Hierarchy

```text
User Challenge Module
│
├── challenges-dashboard-page
│   ├── DashboardStatsWidget
│   ├── UrgencyAlertBanner (conditional)
│   ├── ContinueChallengeCarousel
│   │   └── MyChallengeCardComponent (×n)
│   │       ├── ChallengeImagePipe
│   │       ├── ChallengeStatusBadgeComponent
│   │       └── AchievementProgressWidget | BudgetProgressWidget (mini)
│   └── RecommendedChallengesGrid
│       └── ChallengeCardComponent (×3)
│           ├── ChallengeImagePipe
│           └── ChallengeStatusBadgeComponent
│
├── challenge-list-page (Explore)
│   ├── ChallengeFilterBar
│   └── ChallengeCardComponent (grid ×n)
│       ├── ChallengeImagePipe
│       └── ChallengeStatusBadgeComponent
│
├── my-challenges-page
│   ├── TabBarComponent (Active | Completed | Failed)
│   └── MyChallengeCardComponent (grid ×n)
│       ├── AchievementProgressWidget | BudgetProgressWidget
│       └── ChallengeStatusBadgeComponent
│
├── challenge-detail-page
│   ├── ChallengeHeroComponent
│   │   ├── ChallengeImagePipe
│   │   └── ChallengeStatusBadgeComponent
│   ├── ChallengeStatusBanner (joined state)
│   ├── Main Content Column
│   │   ├── AchievementProgressWidgetComponent [if ACHIEVEMENT]
│   │   │   └── → emits milestoneReached → MilestoneToastComponent
│   │   ├── BudgetProgressWidgetComponent [if BUDGET]
│   │   │   └── → emits budgetCritical → UrgencyAlertBanner
│   │   ├── CommunityImpactWidgetComponent
│   │   ├── ChallengeRulesWidgetComponent
│   │   └── ChallengeTimelineWidgetComponent
│   └── Sidebar Column
│       ├── ChallengeRewardWidgetComponent
│       ├── ChallengeActionsPanelComponent
│       │   └── ManualProgressModalComponent (overlay)
│       └── LeaderboardWidgetComponent
│
├── challenge-history-page
│   ├── Tab Bar (All | Completed | Failed)
│   ├── Stats Summary Banner
│   └── HistoryCardComponent (list ×n)
│       └── ChallengeStatusBadgeComponent
│
└── Shared (challenges/shared/)
    ├── ChallengeImagePipe
    └── ChallengeStatusBadgeComponent
```

---

## Section 6: API Mapping

| Component | Endpoint | Method | DTO Used | Required Fields | Optional Fields | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Dashboard (Active) | `/api/challenges/my` | GET | `ChallengeParticipantDTO` | `challengeId`, `status`, `progress` | `completedAt` | N+1: fetch detail per challenge |
| Dashboard (Explore) | `/api/challenges` | GET | `ChallengeDTO` | `id`, `title`, `status`, `challengeEvaluationType`, `imageUrl` | `description` | Pageable |
| Explore Filter | `/api/challenges` | GET | `ChallengeDTO` | All fields | None | Frontend-side filtering only |
| My Challenges | `/api/challenges/my` | GET | `ChallengeParticipantDTO` | All | None | Pageable, N+1 hydration |
| Challenge Detail | `/api/challenges/{id}` | GET | `ChallengeDetailDTO` | All fields incl. `userProgress`, `participantCount` | None | `userProgress` null if not joined |
| Join Challenge | `/api/challenges/{id}/join` | POST | `ChallengeParticipantDTO` | `status`, `progress` | None | Optimistic UI update on success |
| Log Progress | `/api/challenges/{id}/progress` | PUT | `ChallengeProgressUpdateRequest` | `amount` | None | MANUAL tracking only |
| Leaderboard | `/api/challenges/{id}/participants` | GET | `ChallengeParticipantDTO` | `userId`, `progress`, `status` | None | Sorted by progress descending |
| History | `/api/challenges/my` | GET | `ChallengeParticipantDTO` | `status`, `completedAt`, `progress` | None | Filter status ∈ {COMPLETED, FAILED, DROPPED} |

---

## Section 7: State Matrix

| Component | Loading | Empty | Available (not joined) | Joined/Active | Completed | Failed | Budget Safe | Budget Warning | Budget Critical | Error |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| ChallengeCardComponent | ✓ | — | ✓ | ✓ (overlay) | ✓ | ✓ | — | — | — | ✓ |
| MyChallengeCardComponent | ✓ | — | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| AchievementProgressWidget | — | ✓ (0%) | — | ✓ | ✓ (full) | — | — | — | — | — |
| BudgetProgressWidget | — | ✓ (full) | — | ✓ | ✓ | ✓ (red) | ✓ | ✓ | ✓ | — |
| ChallengeActionsPanelComponent | ✓ | — | ✓ (Join btn) | ✓ (Log/Auto) | ✓ (disabled) | ✓ (message) | — | — | — | ✓ |
| CommunityImpactWidget | ✓ | ✓ (0) | ✓ | ✓ | ✓ | — | — | — | — | — |
| LeaderboardWidget | ✓ | ✓ | ✓ | ✓ | ✓ | — | — | — | — | ✓ |
| Dashboard Page | ✓ | ✓ (no challenges) | — | ✓ | — | — | — | ✓ (alert) | ✓ (alert) | ✓ |
| My Challenges Page | ✓ | ✓ per tab | — | ✓ | ✓ | ✓ | — | — | — | ✓ |

---

## Section 8: Navigation Flow

```text
/challenges (Dashboard)
   ├── /challenges/explore         ← Explore / Discover
   ├── /challenges/my              ← My Challenges
   │     └── /challenges/{id}      ← Detail (from My Challenges)
   ├── /challenges/history         ← History / Trophy Room
   └── /challenges/{id}            ← Challenge Detail (from any card)
         ├── Join → stays on /challenges/{id}  (state update)
         ├── Log Progress → modal on /challenges/{id}
         ├── Back → /challenges/explore or /challenges/my
         └── Related Challenge → /challenges/{other-id}
```

**Route Definitions (existing routes to update/add):**
- `/challenges` → Dashboard (existing, rebuild)
- `/challenges/explore` → Explore (currently the dashboard's lower section — extract to own route)
- `/challenges/my` → My Challenges (existing, rebuild)
- `/challenges/history` → History (new route)
- `/challenges/:id` → Detail (existing, rebuild)

---

## Section 9: User Stories

---

**US-001:** Challenge Discovery  
*As a user, I want to browse all available challenges filtered by type (Budget or Achievement), so that I can find challenges that match my sustainability goals.*  
**Acceptance Criteria:**  
- Filter dropdown shows Budget and Achievement options  
- Cards visually distinguish between types with a colored badge  
- Filter applies without page reload  

---

**US-002:** Challenge Detail Evaluation  
*As a user, I want to view full challenge details including rules, community progress, and reward preview, so that I can make an informed decision before joining.*  
**Acceptance Criteria:**  
- Rules section dynamically reflects tracking method and evaluation type  
- Community progress is shown as a percentage and member count  
- Reward section shows the exact XP value from the backend  

---

**US-003:** Joining a Challenge  
*As a user, I want to join a challenge with a single click, so that I can start tracking my progress immediately.*  
**Acceptance Criteria:**  
- Join button is only visible when not already joined  
- After join, the button changes to reflect the joined state without reload  
- Error is shown gracefully if the challenge has expired or was already joined  

---

**US-004:** Budget Challenge Awareness  
*As a user on a Budget challenge, I want a risk meter that shows how much of my budget I've used, so that I can manage my consumption to stay within limits.*  
**Acceptance Criteria:**  
- Meter is green when < 60% used, yellow at 60–80%, red at > 80%  
- A dashboard alert appears when any budget challenge exceeds 80%  
- "Remaining" value is shown numerically (not just as a percentage)  

---

**US-005:** Achievement Challenge Momentum  
*As a user on an Achievement challenge, I want milestone markers at 25%, 50%, and 75%, so that I feel motivated by intermediate progress.*  
**Acceptance Criteria:**  
- Milestone markers are visible on the progress bar  
- A toast notification appears the first time a milestone is crossed  

---

**US-006:** Automatic Tracking Clarity  
*As a user on an automatic tracking challenge, I want to clearly understand that my progress is tracked automatically, so that I don't try to manually log entries.*  
**Acceptance Criteria:**  
- No "Log Progress" button appears on AUTOMATIC challenges  
- An informational banner explains that the challenge tracks carbon entries automatically  
- The banner links or explains which entry type counts toward the challenge  

---

**US-007:** Viewing My Progress  
*As a user, I want a dedicated "My Challenges" page with tabs for Active, Completed, and Failed challenges, so that I can manage and review all my commitments.*  
**Acceptance Criteria:**  
- Three tabs exist (Active, Completed, Failed)  
- Each tab fetches the correct subset from the API  
- Each card shows type-appropriate progress visualization  

---

**US-008:** Challenge History  
*As a user, I want to view my past completed and failed challenges in a History section, so that I can reflect on my sustainability journey.*  
**Acceptance Criteria:**  
- All terminal-state participations are shown  
- Completion date and XP earned are visible for completed challenges  
- Failed challenges show an encouraging message  

---

## Section 10: Sprint Planning

---

### Sprint 1 — Foundation & Shared Infrastructure
**Goal:** Build the shared component and utility layer  
**Tasks:**
- Audit and clean `challenge.models.ts` TypeScript interfaces vs backend DTOs
- Create `challenges/shared/` folder structure
- Build `ChallengeImagePipe`
- Build `ChallengeStatusBadgeComponent`
- Add status color tokens to global CSS

**Deliverables:** Shared pipe, shared badge, clean model interfaces  
**Risk:** Low  
**Estimated Complexity:** Medium (2–3 days)

---

### Sprint 2 — Dashboard Rebuild
**Goal:** Fully replace V1 Dashboard  
**Tasks:**
- Rebuild `challenges-dashboard-page` component (new, clean)
- Build `DashboardStatsWidget`
- Build `UrgencyAlertBanner`
- Build `ContinueChallengeCarousel` skeleton (uses cards from Sprint 3)
- Build `RecommendedChallengesGrid` skeleton

**Deliverables:** New Dashboard shell with real data and loading states  
**Dependency:** Sprint 1  
**Risk:** Medium (N+1 API calls for hydrating participant challenge details)  
**Estimated Complexity:** High (4–5 days)

---

### Sprint 3 — ChallengeCardComponent & Explore Page
**Goal:** Build the universal card and Explore discovery page  
**Tasks:**
- Build `ChallengeCardComponent`
- Build `ChallengeFilterBar`
- Rebuild `challenge-list-page`
- Wire up filtering logic

**Deliverables:** Working Explore page with type-aware cards  
**Dependency:** Sprint 1  
**Risk:** Low  
**Estimated Complexity:** Medium (3–4 days)

---

### Sprint 4 — My Challenges Rebuild
**Goal:** Rebuild My Challenges with tabbed layout and progress-aware cards  
**Tasks:**
- Build `MyChallengeCardComponent`
- Build progress widget mini-variants for cards
- Rebuild `my-challenges-page` with tab navigation
- Wire tabs to filtered API results

**Deliverables:** Working My Challenges page with Budget and Achievement card variants  
**Dependency:** Sprint 3  
**Risk:** Medium  
**Estimated Complexity:** High (4–5 days)

---

### Sprint 5 — Progress Widgets
**Goal:** Build the core progress display components  
**Tasks:**
- Build `AchievementProgressWidgetComponent` (full variant)
- Build `BudgetProgressWidgetComponent` with risk states
- Integrate milestone output events

**Deliverables:** Two fully functional progress widgets with animations  
**Dependency:** Sprint 1  
**Risk:** Medium (animation and transition complexity)  
**Estimated Complexity:** High (4–5 days)

---

### Sprint 6 — Challenge Detail Rebuild
**Goal:** Fully replace V1 Challenge Detail page  
**Tasks:**
- Build `ChallengeHeroComponent`
- Build `CommunityImpactWidgetComponent`
- Build `ChallengeRewardWidgetComponent`
- Build `ChallengeRulesWidgetComponent`
- Build `ChallengeTimelineWidgetComponent`
- Build `ChallengeActionsPanelComponent`
- Build `ManualProgressModalComponent`
- Rebuild `challenge-detail-page` assembling all widgets
- Wire join and progress API calls

**Deliverables:** Full Challenge Detail page, functioning for both challenge types  
**Dependency:** Sprint 5 (progress widgets)  
**Risk:** High (most complex page)  
**Estimated Complexity:** Very High (6–8 days)

---

### Sprint 7 — History Page & Community/Leaderboard
**Goal:** Build History page and Leaderboard widget  
**Tasks:**
- Build `HistoryCardComponent`
- Build `challenge-history-page`
- Build `LeaderboardWidgetComponent`
- Integrate Leaderboard into Detail page sidebar
- Add new route `/challenges/history` to router

**Deliverables:** History page, Leaderboard widget in Detail page  
**Dependency:** Sprint 4  
**Risk:** Low  
**Estimated Complexity:** Medium (3–4 days)

---

### Sprint 8 — Gamification Layer
**Goal:** Add milestone toasts and XP animation  
**Tasks:**
- Build `MilestoneToastComponent`
- Connect milestone output from `AchievementProgressWidget` to toast
- Build `XpBadgeAnimationComponent`
- Add frontend streak calculation to Dashboard

**Deliverables:** Milestone toasts working, XP animation on completion  
**Dependency:** Sprint 5 + Sprint 6  
**Risk:** Low  
**Estimated Complexity:** Medium (3 days)

---

### Sprint 9 — Polish, Mobile, Accessibility
**Goal:** Final quality pass  
**Tasks:**
- Mobile sticky action bar on Detail page
- ARIA labels audit
- Reduced motion media query support
- Lighthouse accessibility pass (target ≥ 90)
- Eliminate any remaining hardcoded strings
- Full regression test pass

**Deliverables:** Production-ready module  
**Dependency:** All previous sprints  
**Risk:** Low  
**Estimated Complexity:** Medium (3–4 days)

---

## Section 11: Development Order

```text
PHASE 1 — FOUNDATION
ChallengeImagePipe
↓
ChallengeStatusBadgeComponent
↓
challenge.models.ts (audit & fix)
↓
Global CSS tokens

PHASE 2 — CARDS
ChallengeCardComponent
↓
MyChallengeCardComponent

PHASE 3 — PROGRESS WIDGETS
AchievementProgressWidgetComponent
↓
BudgetProgressWidgetComponent

PHASE 4 — DASHBOARD
DashboardStatsWidget
↓
UrgencyAlertBanner
↓
ContinueChallengeCarousel
↓
RecommendedChallengesGrid
↓
challenges-dashboard-page (assembles all above)

PHASE 5 — EXPLORE
ChallengeFilterBar
↓
challenge-list-page

PHASE 6 — MY CHALLENGES
my-challenges-page (uses MyChallengeCard)

PHASE 7 — DETAIL PAGE
ChallengeHeroComponent
↓
CommunityImpactWidgetComponent
↓
ChallengeRewardWidgetComponent
↓
ChallengeRulesWidgetComponent
↓
ChallengeTimelineWidgetComponent
↓
ChallengeActionsPanelComponent
↓
ManualProgressModalComponent
↓
challenge-detail-page (assembles all above)

PHASE 8 — HISTORY & COMMUNITY
HistoryCardComponent
↓
challenge-history-page
↓
LeaderboardWidgetComponent

PHASE 9 — GAMIFICATION
MilestoneToastComponent
↓
XpBadgeAnimationComponent

PHASE 10 — POLISH
Mobile responsive pass → Accessibility pass → Regression
```

---

## Section 12: Testing Strategy

### Phase 1 (Foundation)
- **Unit:** ChallengeImagePipe — test null inputs, relative paths, absolute paths
- **Unit:** ChallengeStatusBadgeComponent — test all 8 status values render correct class
- **Integration:** Ensure pipe resolves correct URL against `environment.apiUrl`

### Phase 3–4 (Cards & Dashboard)
- **Unit:** ChallengeCardComponent — test joined vs. not-joined display states
- **UI:** Dashboard renders skeleton → data → correct empty state
- **API Test:** Mock `/api/challenges` returns paginated data correctly bound to cards
- **Edge Cases:** Empty participation list, single challenge, maximum 100 challenges

### Phase 5 (Progress Widgets)
- **Unit:** AchievementProgressWidget — milestone event fires at exactly 25/50/75/100
- **Unit:** BudgetProgressWidget — color class changes at correct thresholds
- **Edge Cases:** progress = 0, progress = target, progress > target (exceeded)

### Phase 6 (Detail Page)
- **Unit:** ChallengeActionsPanel renders correct button state for each scenario (not joined / manual / automatic / completed)
- **Integration:** Join → API call → UI update without page reload
- **Integration:** Log Progress → modal → API call → progress bar updates
- **Edge Cases:** Challenge expired mid-session, user already joined error response

### Phase 8 (Gamification)
- **Unit:** MilestoneToast fires only once per milestone threshold (not repeatedly)

### Phase 9 (Polish)
- **Regression:** All previous test scenarios pass
- **Responsive:** Test all pages at 360px, 768px, 1024px, 1440px
- **Accessibility:** Keyboard navigation on modals, ARIA roles on buttons

---

## Section 13: Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
| :--- | :--- | :--- | :--- |
| **N+1 API calls on Dashboard** (one detail call per participation) | High | Medium | Batch first page of participations (max 10), lazy load the rest |
| **Animation performance on mobile** | Medium | Low | Use CSS transitions only, avoid JS-driven animations |
| **Backend `participantCount` missing** | Low | High | Was already fixed — verify on every API call response |
| **`challengeEvaluationType` missing from older challenges** | Low | High | DatabaseMigrationRunner handles this — verify data integrity |
| **MANUAL vs AUTOMATIC tracking confusion in UI** | Medium | High | Always test both modes on the same challenge detail page |
| **TypeScript model drift** | Medium | High | Sprint 1 audit locks this down — models must match DTOs exactly |
| **My Challenges tab performance with many participations** | Low | Medium | Paginate at 9 items per tab |

---

## Section 14: Definition of Done

### Every Phase must satisfy:

**Functional Checklist:**
- [ ] All displayed values come from API, zero hardcoded strings
- [ ] All error states have a visible, user-friendly message
- [ ] All loading states use skeleton components (not spinners)
- [ ] All empty states have a CTA pointing the user to the next action

**Visual Checklist:**
- [ ] Achievement and Budget challenges are visually distinguishable at a glance
- [ ] Status badges use the correct token color for all statuses
- [ ] Images load with a graceful placeholder if URL is missing
- [ ] Typography hierarchy is consistent with global design system

**Performance Checklist:**
- [ ] Dashboard load time < 2 seconds on a standard connection
- [ ] No visible layout shift after data loads
- [ ] No duplicate API calls for the same resource in a single page load

**Responsive Checklist:**
- [ ] Mobile (360px): No overflow, stacked layouts, sticky action bar on Detail
- [ ] Tablet (768px): Fluid grid, sidebar drops below content
- [ ] Desktop (1024px+): Two-column Detail layout, sidebar visible

**Accessibility Checklist:**
- [ ] All interactive elements have descriptive ARIA labels
- [ ] Keyboard navigation reaches all buttons and links
- [ ] Focus is trapped correctly within open modals
- [ ] Color is never the sole conveyor of meaning (icon + color always paired)

---

## Section 15: Final Master Roadmap

| Phase | Key Deliverables | Depends On | Priority | Size | Completion Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Sprint 1** — Foundation | ImagePipe, StatusBadge, Model audit | None | Critical | M | All shared components unit tested |
| **Sprint 2** — Dashboard | DashboardPage rebuild, Stats, Alerts, Carousel | Sprint 1 | Critical | L | Dashboard loads real data, empty + error state work |
| **Sprint 3** — Explore & Card | ChallengeCard, FilterBar, Explore page | Sprint 1 | High | M | Cards display correct type badge, filter works |
| **Sprint 4** — My Challenges | MyChallengeCard, tabbed page | Sprint 3 | High | L | Tabs filter correctly, progress shown per type |
| **Sprint 5** — Progress Widgets | AchievementWidget, BudgetWidget | Sprint 1 | Critical | L | Both widgets handle edge cases, milestones emit |
| **Sprint 6** — Detail Page | All detail widgets, Actions panel, Modal | Sprint 5 | Critical | XL | Full detail page works for both challenge types |
| **Sprint 7** — History & Community | HistoryPage, LeaderboardWidget | Sprint 4 | Medium | M | History lists all past challenges, leaderboard renders |
| **Sprint 8** — Gamification | MilestoneToast, XpAnimation, Streaks | Sprint 6 | Medium | S | Toasts fire at milestones, XP animates on completion |
| **Sprint 9** — Polish | Mobile, A11y, Regression | All | High | M | Lighthouse ≥ 90, zero regression failures |
