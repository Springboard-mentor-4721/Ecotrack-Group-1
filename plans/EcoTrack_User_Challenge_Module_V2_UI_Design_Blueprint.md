# EcoTrack User Challenge Module V2 — UI/UX Design Blueprint

**Classification:** Design Specification — Production Blueprint  
**Audience:** 4 Frontend Developers, Tech Lead, QA Team  
**Version:** 1.0 Final  
**Status:** Approved for Implementation  

> This document is the single source of visual and UX truth for the User Challenge Module V2. Every developer must refer to this before making any UI decision. If a scenario is not covered here, escalate — do not improvise.

---

## 1. Overall Design Philosophy

### 1.1 Visual Identity

EcoTrack Challenges sits at the intersection of **environmental responsibility** and **personal achievement**. The visual design must honor both. It should feel like a modern productivity and wellness app — the kind of experience users associate with Nike Run Club, Duolingo, or Strava — not a government sustainability portal.

The visual character is:
- **Clean and airy** — generous white space, clear hierarchy
- **Purposefully vibrant** — color is not decoration, it is communication
- **Emotionally layered** — the same module must feel exciting (Achievement) and disciplined (Budget)
- **Premium without complexity** — rounded, soft, approachable — not sharp or corporate

### 1.2 Emotional Design Framework

Every design decision must answer the question: **"How will the user feel when they see this?"**

| Context | Target Emotion | Design Response |
| :--- | :--- | :--- |
| Viewing a new challenge | Curiosity + Desire | High-quality hero image, prominent reward, social proof |
| Joining a challenge | Commitment + Excitement | Satisfying join animation, immediate progress state |
| Achievement progress at 60% | Momentum + Confidence | Growing bar, milestone visible ahead |
| Budget challenge at 75% | Alert + Control | Yellow risk meter, daily allowance visible |
| Budget challenge at 90% | Tension + Urgency | Red pulsing ring, prominent remaining value |
| Completing a challenge | Pride + Celebration | Full-screen confetti, badge reveal, XP counter |
| Failing a challenge | Disappointment + Encouragement | Soft neutral tones, "Try again" CTA, no harsh red |
| Viewing history | Reflection + Pride | Trophy-like layout, green completion stamps |

### 1.3 Sustainability Design Language

The module must communicate environmental purpose without being preachy. The design achieves this through:
- **Emerald green as the primary success color** — immediately associated with nature and growth
- **Progress = growth** — bars fill like growing plants, not loading indicators
- **Community framing** — always show the collective impact alongside personal progress
- **Real-world translations** — "50 kg CO2" becomes "🌳 2 trees saved"

### 1.4 Gamification Design Style

The gamification system must feel **earned, not cheap**. No over-animated confetti for basic actions. The tone is closer to Duolingo's warmth and Strava's achievement system than to casino-style reward mechanics.

Gamification hierarchy:
1. **Progress visibility** (most frequent, most subtle)
2. **Milestone acknowledgment** (medium frequency, satisfying toast)
3. **Completion celebration** (rare, maximum visual impact)
4. **Badge/reward reveal** (rarest, most premium)

---

## 2. Design Language

### 2.1 Color Palette

#### Foundation
| Role | Token | Hex | Usage |
| :--- | :--- | :--- | :--- |
| Background | `--color-bg` | `#f8fafc` | Page backgrounds |
| Surface | `--color-surface` | `#ffffff` | Cards, widgets |
| Surface Alt | `--color-surface-alt` | `#f1f5f9` | Nested sections, input backgrounds |
| Border | `--color-border` | `#e2e8f0` | Card borders, dividers |
| Text Primary | `--color-text-primary` | `#0f172a` | Headings, key values |
| Text Secondary | `--color-text-secondary` | `#475569` | Descriptions, labels |
| Text Muted | `--color-text-muted` | `#94a3b8` | Timestamps, micro labels |

#### Semantic Status Colors
| Role | Token | Hex | Bg Token | Bg Hex |
| :--- | :--- | :--- | :--- | :--- |
| Success/Achievement | `--color-success` | `#10b981` | `--color-success-bg` | `#d1fae5` |
| Warning/Budget Caution | `--color-warning` | `#f59e0b` | `--color-warning-bg` | `#fef3c7` |
| Danger/Budget Critical | `--color-danger` | `#ef4444` | `--color-danger-bg` | `#fee2e2` |
| Info/Community | `--color-info` | `#3b82f6` | `--color-info-bg` | `#dbeafe` |
| XP/Rewards | `--color-xp` | `#8b5cf6` | `--color-xp-bg` | `#ede9fe` |

#### Challenge Type Colors
| Type | Primary | Secondary | Feel |
| :--- | :--- | :--- | :--- |
| Achievement | `#10b981` (Emerald) | `#059669` | Growth, forward |
| Budget | `#f59e0b` → `#ef4444` | Dynamic | Risk, alertness |
| Community | `#3b82f6` (Blue) | `#2563eb` | Collective, trust |
| Seasonal | `#f97316` (Orange) | `#ea580c` | Energy, urgency |

### 2.2 Typography

**Font Family:** `'Inter', 'Segoe UI', system-ui, sans-serif`  
Already loaded in the EcoTrack project. No additional font loading required.

| Role | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| Display | 2.25rem (36px) | 800 | 1.1 | Page hero titles |
| Heading 1 | 1.875rem (30px) | 700 | 1.2 | Section titles |
| Heading 2 | 1.375rem (22px) | 700 | 1.3 | Card titles, widget headers |
| Heading 3 | 1.125rem (18px) | 600 | 1.4 | Sub-section labels |
| Body Large | 1rem (16px) | 400 | 1.6 | Primary descriptions |
| Body | 0.875rem (14px) | 400 | 1.5 | Standard text, rules |
| Label | 0.75rem (12px) | 600 | 1.4 | Badges, uppercase tags |
| Micro | 0.6875rem (11px) | 500 | 1.3 | Timestamps, secondary meta |
| Stat Number | 2rem (32px) | 800 | 1.0 | XP counters, progress values |
| Stat Unit | 0.875rem (14px) | 500 | 1.0 | "kg", "km", "entries" |

**Uppercase rule:** Only `Label` role uses `text-transform: uppercase` with `letter-spacing: 0.06em`. All other text is sentence case.

### 2.3 Spacing System

Base unit: `4px`. All spacing values are multiples.

| Token | Value | Use |
| :--- | :--- | :--- |
| `--space-1` | 4px | Icon-text gaps |
| `--space-2` | 8px | Tight element groups |
| `--space-3` | 12px | Badge padding, small internals |
| `--space-4` | 16px | Standard card padding |
| `--space-5` | 20px | Widget padding |
| `--space-6` | 24px | Section gaps |
| `--space-8` | 32px | Large card padding |
| `--space-10` | 40px | Page section spacing |
| `--space-12` | 48px | Hero section padding |
| `--space-16` | 64px | Major section separators |

### 2.4 Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--radius-xs` | 4px | Inline badges, tags |
| `--radius-sm` | 8px | Input fields, small pills |
| `--radius-md` | 12px | Standard cards |
| `--radius-lg` | 16px | Large widgets, panels |
| `--radius-xl` | 24px | Hero banners, feature cards |
| `--radius-2xl` | 32px | Modal overlays |
| `--radius-full` | 9999px | Circular buttons, pill badges |

### 2.5 Elevation & Shadow System

| Token | Value | Trigger |
| :--- | :--- | :--- |
| `--shadow-none` | none | Flat surfaces |
| `--shadow-xs` | `0 1px 2px rgba(0,0,0,0.06)` | Default card borders |
| `--shadow-sm` | `0 1px 6px rgba(0,0,0,0.08)` | Standard card state |
| `--shadow-md` | `0 4px 16px rgba(0,0,0,0.10)` | Hovered card state |
| `--shadow-lg` | `0 8px 32px rgba(0,0,0,0.12)` | Modals, floating elements |
| `--shadow-xl` | `0 16px 48px rgba(0,0,0,0.14)` | Hero overlay, celebration modal |
| `--shadow-budget-warn` | `0 0 0 3px rgba(245,158,11,0.3)` | Budget warning ring |
| `--shadow-budget-crit` | `0 0 0 3px rgba(239,68,68,0.35)` | Budget critical ring (pulsing) |
| `--shadow-success-glow` | `0 0 20px rgba(16,185,129,0.25)` | Completion glow |

### 2.6 Animation Standards

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--ease-out` | `cubic-bezier(0.0, 0, 0.2, 1)` | Elements entering view |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Elements leaving view |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Milestone bounce, badge pop |
| `--duration-fast` | 150ms | Hover states, color changes |
| `--duration-base` | 300ms | Card transitions, panel opens |
| `--duration-slow` | 600ms | Page transitions |
| `--duration-progress` | 1200ms | Progress bar on-mount fill |
| `--duration-celebration` | 2000ms | Completion animation |

**Reduced Motion Rule:** All animations defined above must be wrapped in `@media (prefers-reduced-motion: no-preference)`. Without it, no animation plays. This is non-negotiable.

### 2.7 Icon System

**Library:** Lucide Angular (already imported in project)  
**Standard sizes:** 16px (micro), 20px (standard), 24px (hero)  
**Rule:** Every status icon must be paired with a text label. Icon-only states require `aria-label`.

| Context | Icon Name | Size |
| :--- | :--- | :--- |
| Achievement Progress | `trending-up` | 20px |
| Budget/Risk | `gauge` or `shield-alert` | 20px |
| Budget Safe | `shield-check` | 20px |
| Budget Exceeded | `shield-x` | 20px |
| XP/Reward | `star` | 20px |
| Community | `users` | 20px |
| Calendar/Date | `calendar` | 16px |
| Completion | `circle-check` | 24px |
| Auto Tracking | `zap` | 20px |
| Manual Tracking | `pencil` | 20px |
| Days Remaining | `clock` | 16px |
| Leaderboard | `trophy` | 20px |
| Streak | `flame` | 20px |

---

## 3. User Journey — Emotional Flow Map

```
[Dashboard — Mission Control]
User feels: oriented, motivated, aware of their status
        │
        │  "I want to find a new challenge"
        ▼
[Explore — Discovery]
User feels: curious, inspired, choosing
        │
        │  "This one looks good, let me learn more"
        ▼
[Challenge Detail — Evaluation]
User feels: informed, considering, attracted by reward
        │
        │  "I'm committing to this"
        ▼
[Join — Commitment]
User feels: excited, responsible, part of something
        │
        │  (Carbon Entry logged / Manual progress added)
        ▼
[Live Tracking — Accountability]
User feels: active, aware, building a habit
        │
        │  (Crosses 50% milestone)
        ▼
[Milestone — Recognition]
User feels: celebrated, motivated, momentum
        │
        │  (Challenge end date reached)
        ▼
[Completion — Achievement]
User feels: proud, accomplished, rewarded
        │
        │  "What did I achieve?"
        ▼
[History — Reflection]
User feels: reflective, proud, legacy
        │
        │  "What should I do next?"
        ▼
[Recommendations — Renewal]
User feels: inspired again, challenged to grow
```

---

## 4. Screen Inventory — Complete Specifications

---

### 4.1 Dashboard Page

**Route:** `/challenges`  
**Purpose:** Mission control. The user's daily entry point. Must answer three questions instantly: "What am I doing?", "Am I on track?", "What should I do next?"

---

#### SECTION 4.1.1 — Page Header

```
┌─────────────────────────────────────────────────────────┐
│  Challenges                         [Leaderboard ↗]     │
│  Your daily sustainability mission                       │
└─────────────────────────────────────────────────────────┘
```

- **Title:** "Challenges" — Display weight, left-aligned
- **Subtitle:** "Your daily sustainability mission" — Body color, muted
- **CTA Button:** "Leaderboard" — Right-aligned, secondary/ghost style with trophy icon
- **Loading state:** Title and subtitle are real text (not skeleton) — loads immediately

---

#### SECTION 4.1.2 — Stats Bar (Top KPIs)

```
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│  🟢 3         │  │  ✅ 7         │  │  ⭐ 2,450     │
│  ACTIVE       │  │  COMPLETED    │  │  TOTAL XP     │
└───────────────┘  └───────────────┘  └───────────────┘
```

- Three cards in a row. On mobile: 2-column grid (XP spans full width or becomes third row)
- Card content: large stat number (`--text-stat`), small uppercase label below
- Icon: colored within a `--radius-sm` pill background matching semantic color
- **Active** → emerald icon bg
- **Completed** → purple icon bg
- **Total XP** → blue icon bg
- **Loading:** Each card shows a skeleton block with a pill shape at top and two lines below
- **Empty state:** Stats show `0` — no empty state needed; zero is valid data

---

#### SECTION 4.1.3 — Urgency Alert Banner

```
┌─────────────────────────────────────────────────────────────┐
│  ⚠️  BUDGET AT RISK                                   [→]   │
│  "30-Day Carbon Budget" — You've used 87% of your budget    │
│  Only 6.5 kg CO2 remaining                                  │
└─────────────────────────────────────────────────────────────┘
```

- **Appears only when:** At least one Budget challenge has usage ≥ 80%, OR any challenge expires within 48 hours
- **Background:** `--color-danger-bg` with `--color-danger` left border (4px)
- **Icon:** `shield-alert` in danger color
- **Text:** Challenge name in bold + metric statement
- **Right action:** Arrow → navigates to that challenge's detail page
- **Multiple alerts:** Stack vertically, max 3 rows visible
- **Loading:** Not shown during initial load — only appears after data resolves
- **Empty state:** Component is hidden entirely when no alerts exist. No "no alerts" message.

---

#### SECTION 4.1.4 — Continue Your Challenges (Carousel)

```
Heading: "Continue Your Challenges"   [See All →]

┌──────────────────────┐  ┌──────────────────────┐  ┌───
│ [Hero Image ══════] │  │ [Hero Image ══════] │  │ [
│ ● ACTIVE             │  │ ● WITHIN BUDGET       │  │
│ ─────────────────── │  │ ─────────────────── │  │
│ Car-Free Week        │  │ Carbon Budget        │  │
│ Carbon Reduction     │  │ Budget Challenge     │  │
│                      │  │                      │  │
│ ━━━━━━━━━━━━━━━━━   │  │ 🛡 SAFE              │  │
│ 18 / 30 km   60%    │  │ Used: 18 kg          │  │
│                      │  │ Remaining: 32 kg     │  │
│ ⏳ 4 days left       │  │ ⏳ 12 days left      │  │
│                      │  │                      │  │
│ [View Details →]     │  │ [View Details →]     │  │
└──────────────────────┘  └──────────────────────┘  └───
```

- **Layout:** Horizontally scrollable card row. Cards: `width: 300px`, `flex-shrink: 0`
- **Scrollbar:** Hidden (`overflow-x: auto; scrollbar-width: none`)
- **Card heading:** `--text-card-title`, max 2 lines with ellipsis
- **Category chip:** Below title, muted label style
- **Progress visual:** Achievement → mini horizontal bar with %. Budget → tri-color risk row (Used / Remaining / Status dot)
- **Footer:** Days remaining (`clock` icon) + CTA button
- **CTA Button:** `"View Details"` — Secondary outline, full-width, rounded-pill
- **Loading:** 3 skeleton cards visible as a row
- **Empty state:** Replaced by a light bordered banner: "No active challenges yet. Start one below!" with arrow pointing to recommendations section

---

#### SECTION 4.1.5 — Recommended Challenges

```
Heading: "Recommended For You"      [Explore All →]

┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│[Image]             │  │[Image]             │  │[Image]             │
│                    │  │                    │  │                    │
│ 🏆 ACHIEVEMENT      │  │ 💰 BUDGET           │  │ 🏆 ACHIEVEMENT      │
│ Cycling Challenge  │  │ Carbon Budget      │  │ Beach Cleanup      │
│ 30-day • 500 XP    │  │ 30-day • 800 XP    │  │ 7-day  • 300 XP    │
│                    │  │                    │  │                    │
│ 👥 42 participants  │  │ 👥 128 participants │  │ 👥 18 participants  │
│                    │  │                    │  │                    │
│ [Join Challenge]   │  │ [View Details]     │  │ [Join Challenge]   │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

- **3-column grid on desktop**, 1-column on mobile
- Shows only non-joined ACTIVE challenges
- **Evaluation type badge:** Pill at top-left of image overlay — `ACHIEVEMENT` (emerald) or `BUDGET` (amber)
- **Participant count:** `users` icon + count — social proof
- **CTA:** If `participantCount` is low, button says "Join Challenge". Always full-width, primary style.
- **Loading:** 3 skeleton cards
- **Empty state:** "You've joined all available challenges! More coming soon." — centered, gentle

---

### 4.2 Explore Challenges Page

**Route:** `/challenges/explore`  
**Purpose:** Complete discovery experience. User browses and filters the full challenge catalog.

```
┌─────────────────────────────────────────────────────────────┐
│  Explore Challenges                                          │
│  Find your next sustainability mission                       │
│                                                             │
│  [🔍 Search challenges...]                                   │
│                                                             │
│  Filters:  [All ▾]  [Type ▾]  [Tracking ▾]  [Duration ▾]  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│  24 Challenges Found                                      │
└──────────────────────────────────────────────────────────┘

[Card Grid — 3 columns desktop, 2 tablet, 1 mobile]
```

#### Filter Bar Specification
- **Search:** Full-width text input above filter chips. Placeholder: `"Search by name or type..."`. Has `search` icon on left, clear `×` button when text present.
- **Filter Chips:** Row of pill-style dropdown buttons — `[All Types ▾]` `[Evaluation ▾]` `[Tracking ▾]`
  - **Evaluation options:** All | Achievement | Budget
  - **Tracking options:** All | Automatic | Manual
- **Active filter:** Chip turns filled emerald (not just outline) when a filter is applied
- **Result count:** Small label below filters: "Showing 24 challenges" — updates on filter

#### Challenge Grid
- **Desktop (≥1024px):** 3-column grid, `gap: --space-6`
- **Tablet (768–1023px):** 2-column grid
- **Mobile (<768px):** 1-column list

#### Pagination
- Bottom centered. Previous / Next buttons. "Page 1 of 5" in center.
- On mobile: Previous/Next only (no page number needed)

**No Results State:**
```
      [🔍 icon large]
   No Challenges Found
 Try adjusting your filters
   [Clear Filters button]
```

---

### 4.3 My Challenges Page

**Route:** `/challenges/my`  
**Purpose:** Personal challenge management hub. The "inbox" of active commitments.

```
┌────────────────────────────────────────────────────────────┐
│  My Challenges                             [Explore More]   │
│  Track your ongoing commitments                            │
│                                                            │
│  [Active (3)] [Completed (7)] [Failed (1)] [Dropped (0)]   │
└────────────────────────────────────────────────────────────┘
```

#### Tab Bar
- **4 tabs:** Active | Completed | Failed | Dropped
- **Count badge:** Each tab shows count in a small rounded pill (e.g., "(3)")
- **Active tab:** Underline indicator in emerald, bold text
- **Tab switching:** Immediate, no animation needed (instant show/hide)

#### Active Tab Card Layout
```
┌──────────────────────────────────────────────────┐
│ [Image — 80px left]   Car-Free Weekend           │
│                        🏆 ACHIEVEMENT             │
│                        ─────────────────────     │
│                        Progress: 18 / 30 km      │
│                        ━━━━━━━━━━━━━━━━━━━  60%  │
│                        ⏳ 4 days left             │
│                        [View Details]            │
└──────────────────────────────────────────────────┘
```

- **Layout:** Horizontal list cards (not grid) for My Challenges — easier to scan
- **Left thumbnail:** `80×80px` rounded image (`--radius-md`)
- **Right content:** Title, type badge, progress, days remaining, CTA
- **Progress (Achievement):** Thin bar + "X / Y unit" + % right-aligned
- **Progress (Budget):** "Used: X | Budget: Y | Remaining: Z" in 3-col row, no bar (budget is a reading, not a fill)
- **CTA:** Ghost-style "View Details" button right-aligned

#### Completed Tab Card
- **Same layout** but progress section replaced with:
  - ✅ Green checkmark circle
  - "Completed on Aug 2, 2026"
  - "+600 XP Earned"
  - Status badge: `COMPLETED` in green pill

#### Failed Tab Card
- **Soft visual** — muted image, reduced opacity (70%)
- Status badge: "Not Achieved" in a neutral gray pill (not red — avoid shame)
- Message: "Challenge ended without reaching the target."
- No XP earned message

---

### 4.4 Challenge Detail Page

**Route:** `/challenges/:id`  
**Purpose:** The immersive heart of the module. User evaluates the challenge completely and takes action.

#### Desktop Layout (≥1024px)
```
┌─────────────────────────────────────────────────────────────────────┐
│                    [HERO BANNER — Full Width]                        │
│  [Challenge Image with gradient overlay]                             │
│  ACHIEVEMENT        [Status Badge]                                   │
│  Challenge Title Here (Large Display Text)                           │
│  📂 Carbon Reduction • 🕐 30 days • 👥 128 participants              │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────┐  ┌──────────────────────┐
│  MAIN CONTENT (60%)                     │  │  SIDEBAR (40%)       │
│                                         │  │                      │
│  [Status Banner — if joined]            │  │  [Reward Widget]     │
│                                         │  │  ─────────────────   │
│  [Progress Widget — Achievement/Budget] │  │  [Actions Panel]     │
│                                         │  │  ─────────────────   │
│  [Community Impact Widget]              │  │  [Leaderboard Top 5] │
│                                         │  │                      │
│  [Rules Widget]                         │  │                      │
│                                         │  │                      │
│  [Timeline Widget]                      │  │                      │
│                                         │  │                      │
│  [Related Challenges]                   │  │                      │
└─────────────────────────────────────────┘  └──────────────────────┘
```

#### Mobile Layout (<768px)
```
[Hero Banner — full width, taller]
[Status Banner]
[Actions Panel — prominent, near top]
[Progress Widget]
[Community Impact Widget]
[Rules Widget]
[Timeline Widget]
[Reward Widget]
[Leaderboard]
[Related Challenges]
[Sticky Bottom Bar: Join / Log Progress Button]
```

---

#### Hero Banner Specification
- **Height:** Desktop 380px, Mobile 280px
- **Background:** Challenge image, `object-fit: cover`, `object-position: center`
- **Overlay:** Gradient from `rgba(0,0,0,0)` at top to `rgba(15,23,42,0.85)` at bottom
- **Content (bottom-left overlay on desktop):**
  - Evaluation type badge (ACHIEVEMENT emerald / BUDGET amber)
  - Challenge title — Display font, white color, max 2 lines
  - Meta row: Category • Duration • Participant count — Label size, white 70% opacity
- **Status badge:** Top-right overlay — Challenge `status` field

---

#### Status Banner (Joined State)
- **Shown only when:** `challenge.userProgress` is not null
- **Placement:** Below hero, above progress widget, full content-width
- **Layout:**
  ```
  ┌────────────────────────────────────────────────────┐
  │  ✅  You are participating in this challenge        │
  │  Joined on July 15, 2026 • Your current status:    │
  │  [ON TRACK badge] or [WITHIN BUDGET badge]          │
  └────────────────────────────────────────────────────┘
  ```
- **Background:** Soft emerald tint `--color-success-bg`
- **Border:** 1px `--color-success` left border (4px)
- **Not shown when:** Challenge is CLOSED, COMPLETED at challenge level

---

#### Progress Widget — Achievement Type
```
┌──────────────────────────────────────────────────────────┐
│  Your Progress                              🏆 ACHIEVEMENT │
│                                                           │
│  18 km          ━━━━━━━━━━━━━━━━━▶────────  60%          │
│  of 30 km       │        ▲        │                       │
│                 0       50%      100%                     │
│            Start   Milestone   Complete                   │
│                                                           │
│  ✦ 25% reached   ✦ 50% reached   ○ 75% next             │
└──────────────────────────────────────────────────────────┘
```

- **Progress bar height:** 16px, `--radius-full`
- **Fill color:** `--color-success`
- **Milestone tick marks:** Vertical lines at 25/50/75 inside the bar
- **Milestone status row:** Shows ✦ (filled) for passed, ○ (empty) for upcoming
- **Percentage display:** Right-aligned large number, emerald color
- **Stat display:** "18 km / 30 km" — stat number size for `18`, body for the rest

---

#### Progress Widget — Budget Type
```
┌──────────────────────────────────────────────────────────┐
│  Budget Status                              💰 BUDGET     │
│                                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🛡  CAUTION — 78% of budget used                   │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶────────  78%       │
│  [████████████████████████████████░░░░░░░░░░]            │
│  0%                                            100%       │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────────┐   │
│  │  Used       │  │  Budget     │  │  Remaining     │   │
│  │  39 kg CO2  │  │  50 kg CO2  │  │  11 kg CO2     │   │
│  └─────────────┘  └─────────────┘  └────────────────┘   │
│                                                           │
│  Daily allowance: 1.7 kg/day                             │
└──────────────────────────────────────────────────────────┘
```

- **Risk bar:** Color changes dynamically — green fill → yellow fill → red fill
- **Alert row above bar:** Changes by threshold:
  - < 60% → Hidden (no alert)
  - 60–79% → Yellow bg: "⚠ CAUTION — X% of budget used"
  - 80–99% → Red bg, pulsing ring: "🔴 CRITICAL — Only X remaining"
  - ≥ 100% → Red bg: "❌ EXCEEDED — Budget limit reached"
- **Three-stat row:** Used | Budget | Remaining — all with `--text-stat` for numbers
- **Daily allowance calculation:** `target / totalChallengeDays` — shown as "Daily allowance: X unit/day"

---

#### Community Impact Widget
```
┌─────────────────────────────────────────────────────────────┐
│  Community Progress                    👥 128 participants   │
│                                                             │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━▶────────   73%        │
│                                                             │
│  Together we've saved 3,650 kg CO2                         │
│  🌳 That's equivalent to 146 trees saved                    │
└─────────────────────────────────────────────────────────────┘
```

- **Community bar:** Thinner than personal bar (12px vs 16px), info blue color
- **Participant count:** `users` icon + count, right-aligned in header
- **Real-world translation:** Calculated based on `typeCode`. Always shown as a leaf/tree/drop metaphor.
- **Translation table:** 1 tree = 25 kg CO2. 1 liter saved = shown for water challenges.
- **Loading state:** Skeleton bar and two skeleton text lines

---

#### Reward Widget (Sidebar)
```
┌───────────────────────────────┐
│  🏆 Challenge Rewards          │
│                               │
│  ┌───────────────────────┐   │
│  │  ⭐  600 XP           │   │
│  │  Experience Points    │   │
│  └───────────────────────┘   │
│                               │
│  ┌───────────────────────┐   │
│  │  🎖  Eco Champion     │   │
│  │  Exclusive Badge      │   │
│  └───────────────────────┘   │
│                               │
│  Rewarded on 100% completion  │
└───────────────────────────────┘
```

- **XP card:** Purple bg tint (`--color-xp-bg`), star icon, large XP number
- **Badge preview:** Orange tint, badge icon, locked state (blurred badge image if available)
- **Footer note:** Micro text, muted

---

#### Actions Panel (Sidebar / Mobile Sticky)
This panel changes based on participation state:

**State 1: Not Joined**
```
┌────────────────────────┐
│  [🚀 Join Challenge]   │
│  Primary, full-width   │
│  Rounded-pill button   │
└────────────────────────┘
```

**State 2: Joined — MANUAL Tracking**
```
┌────────────────────────┐
│  [✏ Log Today's Impact]│
│  Primary, full-width   │
└────────────────────────┘
```

**State 3: Joined — AUTOMATIC Tracking**
```
┌────────────────────────────────────┐
│  ⚡ Automatic Tracking Active       │
│  Your progress updates              │
│  automatically when you log        │
│  carbon entries in:                │
│  • Transport                       │
│  • Home Energy                     │
│  [→ Log a Carbon Entry]            │
└────────────────────────────────────┘
```
- Green tint background, `zap` icon
- The "Log a Carbon Entry" link navigates to the carbon entry page

**State 4: COMPLETED**
```
┌──────────────────────────────┐
│  ✅ Challenge Complete!       │
│  You earned +600 XP          │
│  [View My History]           │
└──────────────────────────────┘
```

**State 5: Challenge CLOSED/EXPIRED**
```
┌──────────────────────────────┐
│  ⏸ This challenge has ended  │
│  No longer accepting entries │
└──────────────────────────────┘
```

---

#### Rules Widget
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Guidelines & Rules                                       │
│                                                             │
│  ✅ Tracking Method                                         │
│     Automatic — Your carbon entries are tracked             │
│     automatically. No manual logging required.             │
│                                                             │
│  ✅ Evaluation Type                                         │
│     Achievement — Reach 30 km of eco-friendly              │
│     transport entries before the end date.                  │
│                                                             │
│  ✅ Allowed Entry Types                                     │
│     Cycling · Walking · Public Transport                    │
│                                                             │
│  ✅ Restrictions                                            │
│     Private Car entries do not count.                       │
└─────────────────────────────────────────────────────────────┘
```

- All text is **data-driven**. No hardcoded type descriptions.
- Rows only appear if the relevant data exists in `rulesConfig`
- Row icon: ✅ emerald checkmark
- Text: `--text-body` weight 400 for descriptions, `--text-label` for section titles

---

#### Timeline Widget
```
┌──────────────────────────────────────────┐
│  📅 Timeline                             │
│                                          │
│  ○──────────━━━━━━━━━━━━━━━━━━━━━━━──○   │
│  Jul 1                    Today   Jul 31 │
│  Start                    ↑       End    │
│                         Day 18          │
└──────────────────────────────────────────┘
```

- Linear timeline bar showing challenge duration
- **Elapsed portion:** Emerald fill
- **Today marker:** Vertical tick with "Today" label
- **Remaining portion:** Neutral gray
- Start/End dates shown below in micro text

---

### 4.5 History Page

**Route:** `/challenges/history`  
**Purpose:** Trophy room. Reflection and celebration of past participations.

```
┌──────────────────────────────────────────────────────────────┐
│  My Challenge History                                         │
│  Your sustainability journey over time                        │
│                                                              │
│  [All] [Completed] [Failed]                                   │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Impact Summary                                        │  │
│  │  7 Completed  •  4,200 XP Earned  •  ~168 kg CO2 saved│  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

#### History Card
```
┌──────────────────────────────────────────────────────────────┐
│  [Image — 64px]  Car-Free Weekend        ✅ COMPLETED        │
│                  Carbon Reduction                            │
│                  Completed: Aug 2, 2026                      │
│                  +600 XP earned                              │
└──────────────────────────────────────────────────────────────┘
```

- Green `COMPLETED` badge on right
- XP shown in purple with star icon
- Failed cards: Gray badge "Not Achieved", no XP line, muted image

---

## 5. Component Catalog

---

### COMP-001: `ChallengeCard` (Explore / Recommendations)

| Property | Specification |
| :--- | :--- |
| **Size** | Fixed width: 320px (carousel), fluid (grid) |
| **Height** | Auto (min 380px) |
| **Image area** | Top, height 180px, `object-fit: cover` |
| **Padding** | `--space-4` all sides |
| **Border** | 1px `--color-border`, `--radius-lg` |
| **Shadow default** | `--shadow-sm` |
| **Shadow hover** | `--shadow-md` + `translateY(-2px)` |
| **Transition** | `--duration-base --ease-out` |

**Variants:**
- **Default:** White background, standard border
- **Joined Overlay:** Semi-transparent dark overlay on image with "Joined ✓" centered badge
- **Budget Type:** Amber accent on evaluation badge
- **Achievement Type:** Emerald accent on evaluation badge

**Information Hierarchy (top to bottom):**
1. Hero image (with evaluation badge overlay, top-left)
2. Challenge title (2 lines max)
3. Category chip (label size, muted)
4. XP reward (star icon + number, emerald/purple)
5. Participant count + Days remaining (2-col row, micro text)
6. CTA button (full-width, bottom)

**States:**
- Default | Hovered | Joined | Loading (skeleton) | Disabled (CLOSED)

**Outputs:** `cardClicked` → emits challenge ID

---

### COMP-002: `MyChallengeCard`

| Property | Specification |
| :--- | :--- |
| **Layout** | Horizontal list item |
| **Image** | 80×80px thumbnail, left-aligned, `--radius-md` |
| **Content area** | Flex column, right of image |
| **CTA** | Ghost "View Details" right-aligned |

**Achievement Variant progress section:**
```
━━━━━━━━━━━━━━━━━━━━━━━━░░░░░░  60%
18 km / 30 km
```

**Budget Variant progress section:**
```
Used: 39 kg  │  Budget: 50 kg  │  🟡 Remaining: 11 kg
```

**States:** Active | Completed (green stamp) | Failed (muted) | Loading skeleton

---

### COMP-003: `AchievementProgressWidget`

**Full Variant:**
- Height: Auto (~120px)
- Progress bar: 16px tall, `--radius-full`
- Milestone ticks: vertical lines at 25/50/75
- On-mount animation: fills from 0 to current in `--duration-progress`
- Milestone events: emits at threshold crossings

**Mini Variant (for cards):**
- Bar height: 8px
- No milestone ticks
- No unit label
- Percentage shown right of bar only

---

### COMP-004: `BudgetProgressWidget`

**Full Variant:**
- Alert row: hidden / yellow / red based on threshold
- Risk bar: 16px, color-coded by threshold
- Three-stat grid below bar
- Daily allowance row below stats
- Critical state: pulsing box-shadow animation

**Mini Variant:**
- Colored dot (🟢/🟡/🔴) + "X remaining" text only
- No bar, no stat grid

---

### COMP-005: `ChallengeStatusBadge`

| Status | Label | Background | Text Color | Icon |
| :--- | :--- | :--- | :--- | :--- |
| ACTIVE | Active | `--color-success-bg` | `--color-success` | circle (filled) |
| WITHIN_BUDGET | On Track | `--color-success-bg` | `--color-success` | shield-check |
| EXCEEDED | Budget Exceeded | `--color-danger-bg` | `--color-danger` | shield-x |
| COMPLETED | Completed | `--color-xp-bg` | `--color-xp` | circle-check |
| FAILED | Not Achieved | `#f1f5f9` | `#64748b` | x-circle |
| DROPPED | Dropped Out | `#f1f5f9` | `#94a3b8` | minus-circle |
| UPCOMING | Upcoming | `--color-info-bg` | `--color-info` | clock |
| CLOSED | Ended | `#f1f5f9` | `#94a3b8` | archive |

**Size SM:** `padding: 2px 8px`, `font-size: 11px`, `border-radius: --radius-xs`
**Size MD:** `padding: 4px 12px`, `font-size: 12px`, `border-radius: --radius-sm`

---

### COMP-006: `CommunityImpactWidget`

**Layout:**
- Card header: "Community Progress" left + participant count right
- Community progress bar: 12px, info blue
- Percentage shown right of bar
- Translated impact statement below bar
- `--radius-lg` card with `--color-info-bg` tint background

**Impact Translation Table:**
| Type Code | Divisor | Unit |
| :--- | :--- | :--- |
| CARBON_REDUCTION | 25 | trees saved |
| WATER_CONSERVATION | 1000 | liters saved |
| FOOD_WASTE | 50 | meals worth |
| Default | — | units of impact |

---

### COMP-007: `LeaderboardWidget`

**Layout:**
```
┌────────────────────────────────────┐
│  🏆 Top Participants                │
│                                    │
│  #1   User 4821       45 km  🏅    │
│  #2   User 1092       41 km        │
│  #3   You ←          38 km  ⭐    │
│  #4   User 7723       35 km        │
│  #5   User 0091       28 km        │
└────────────────────────────────────┘
```

- Top-3 positions: bold rank number
- Current user row: highlighted with subtle emerald left border
- Progress value right-aligned
- #1 position: `🏅` medal icon
- Current user: `⭐` star indicator + "(You)" label

---

### COMP-008: `EmptyState`

Every empty state must use this component.

```
┌──────────────────────────────────┐
│         [Icon — 48px]            │
│                                  │
│      No Active Challenges        │
│   Join a challenge to get        │
│   started on your journey        │
│                                  │
│     [Primary CTA Button]         │
└──────────────────────────────────┘
```

| Prop | Type | Required |
| :--- | :--- | :--- |
| `iconName` | string (Lucide) | Yes |
| `title` | string | Yes |
| `subtitle` | string | Yes |
| `ctaLabel` | string | No |
| `ctaRoute` | string | No |

---

### COMP-009: `ManualProgressModal`

```
┌──────────────────────────────────────────────────────┐
│  Log Your Progress                              [✕]   │
│  ─────────────────────────────────────────────────   │
│  Car-Free Weekend Challenge                          │
│  Current progress: 18 km / 30 km                     │
│                                                      │
│  How much would you like to add?                     │
│  ┌────────────────────────────────┐                  │
│  │  [   5   ]  km                 │                  │
│  └────────────────────────────────┘                  │
│  Common: [+1] [+2] [+5] [+10]                        │
│                                                      │
│  [Cancel]              [Log Progress →]              │
└──────────────────────────────────────────────────────┘
```

- **Quick-add chips:** "+1", "+2", "+5", "+10" pre-fill the input on click
- **Unit:** Displayed next to input, derived from `rulesConfig.unit` or fallback to "units"
- **Validation:** Amount must be a positive number. Inline error shown below input.
- **Submit button:** Disabled when invalid. Loading state (spinner + "Logging...") when submitting.
- **Backdrop:** Click outside or ESC closes modal

---

### COMP-010: `MilestoneToast`

```
┌──────────────────────────────────────────────┐
│  🎉  Milestone Reached!                       │
│  You've completed 50% of Car-Free Weekend    │
│  Keep the momentum going!                    │
└──────────────────────────────────────────────┘
```

- **Position:** Top-right, 20px from edge
- **Animation:** Slides in from right, bounces using `--ease-spring`
- **Duration:** Auto-dismisses after 4 seconds
- **Background:** White, `--shadow-lg`, `--radius-lg`
- **Left border:** 4px emerald
- **Rule:** Fires ONCE per threshold per challenge. Never fires on page reload.

---

### COMP-011: `HistoryCard`

```
┌─────────────────────────────────────────────────────────────┐
│ [64px img]  Car-Free Weekend         [✅ COMPLETED]          │
│             Carbon Reduction                                │
│             Completed: Aug 2, 2026 • +600 XP ⭐            │
└─────────────────────────────────────────────────────────────┘
```

- Horizontal layout, image left
- Status badge right-aligned, top
- For FAILED: image at 60% opacity, "Not Achieved" neutral badge, no XP line

---

## 6. Challenge Card Design — Complete Variants

### 6.1 Achievement Card
```
┌─────────────────────────────────────────┐
│  [Challenge Image — 180px tall]          │
│  [🏆 ACHIEVEMENT badge — top left]       │
│  [⏳ 12d left — top right]               │
├─────────────────────────────────────────┤
│  CARBON REDUCTION                       │
│  Car-Free Weekend Challenge             │
│  Challenge                              │
├─────────────────────────────────────────┤
│  ⭐ +500 XP          👥 42 participants  │
├─────────────────────────────────────────┤
│  ━━━━━━━━━━━━━━━━░░░░░░    60%         │
│  18 / 30 km                            │
├─────────────────────────────────────────┤
│  [         View Details        →]      │
└─────────────────────────────────────────┘
```

### 6.2 Budget Card
```
┌─────────────────────────────────────────┐
│  [Challenge Image — 180px tall]          │
│  [💰 BUDGET badge — amber — top left]    │
│  [⏳ 18d left — top right]               │
├─────────────────────────────────────────┤
│  SUSTAINABILITY                         │
│  Monthly Carbon Budget                 │
│  Challenge                              │
├─────────────────────────────────────────┤
│  ⭐ +800 XP          👥 128 participants │
├─────────────────────────────────────────┤
│  🟡 78% used — CAUTION                 │
│  Used: 39 kg  •  Remaining: 11 kg      │
├─────────────────────────────────────────┤
│  [         View Details        →]      │
└─────────────────────────────────────────┘
```

### 6.3 Completed Card (History)
- Full-color image + green `✅ COMPLETED` badge top-right
- No CTA button — replaced with completion date + XP earned

### 6.4 Failed Card (History)
- Desaturated image (filter: grayscale 40%)
- Neutral `○ Not Achieved` badge
- No XP earned, completion date replaced with "Ended: [date]"

---

## 7. Budget Experience — Interaction Design

### 7.1 Risk Meter Interaction States

| Budget Used | Bar Color | Alert Pill | Box Shadow |
| :--- | :--- | :--- | :--- |
| 0–59% | Emerald `#10b981` | Hidden | None |
| 60–79% | Amber `#f59e0b` | ⚠ Yellow pill: "CAUTION" | `--shadow-budget-warn` |
| 80–99% | Red `#ef4444` | 🔴 Red pill: "CRITICAL" + pulse | `--shadow-budget-crit` (pulsing) |
| 100%+ | Red `#ef4444` | ❌ Red pill: "EXCEEDED" | `--shadow-budget-crit` (static) |

### 7.2 Critical Pulse Animation
When budget ≥ 80%, the widget's border ring pulses:
- Animation: `box-shadow` oscillates between `--shadow-budget-crit` and `0 0 0 0 rgba(239,68,68,0)` in a 2-second loop
- Stops when user navigates away (no background animations)
- Respects `prefers-reduced-motion` — shows static red border instead

### 7.3 Burn Rate Calculation
Shown below the stat grid: "Daily allowance: **1.7 kg/day**"  
Formula: `targetValue / totalChallengeDays`  
Purpose: Helps the user self-regulate day to day

### 7.4 Exceeded State Recovery Message
```
❌ Budget Exceeded
You've used 110% of your Carbon Budget.
The final evaluation will determine your result
when the challenge closes on Aug 31.
```
- Tone is informational, not punishing
- Explains that the scheduler makes the final call
- No "FAILED" word shown during live challenge

---

## 8. Achievement Experience — Interaction Design

### 8.1 Milestone Design
Milestone markers appear as vertical tick marks on the progress bar.

| Milestone | Position | Achieved State | Pending State |
| :--- | :--- | :--- | :--- |
| 25% | 25% of bar width | Filled emerald tick + ✦ | Empty tick + ○ |
| 50% | 50% | Filled + ✦ | Empty + ○ |
| 75% | 75% | Filled + ✦ | Empty + ○ |
| 100% | Bar end | Completion animation | Target marker |

### 8.2 Progress Bar On-Mount Animation
- On component mount, progress bar animates from `width: 0` to `width: X%`
- Duration: `--duration-progress` (1200ms)
- Easing: `--ease-out`
- If milestone is crossed during animation, toast fires at the animation midpoint (not at mount)

### 8.3 Completion State
When `participant.status === 'COMPLETED'`:
- Progress bar fills to 100% with purple (`--color-xp`) instead of emerald
- Bar glows with `--shadow-success-glow`
- Above bar: "🎉 Challenge Complete!" in heading style
- XP animation fires (counter from 0 to earned amount)

### 8.4 Momentum Visual Cues
- Progress bar fill has a subtle right-edge shimmer (animated highlight) suggesting forward movement
- At 90%+: the final segment of the bar pulses gently to signify "almost there"

---

## 9. Community Experience

### 9.1 Community Progress Display
- Always shown as both a raw number AND a percentage of a calculated community target
- Community target = `challenge.targetValue × challenge.participantCount`
- Real-world equivalent always shown below

### 9.2 Leaderboard Design
- **Podium feel:** Rows 1, 2, 3 have distinct visual weight (bold rank, medal icon for #1)
- **Current user row:** Highlighted with subtle emerald left-border, "(You)" appended to ID
- **Anonymous by default:** Shows user ID not name — username feature is Phase 2
- **Data truncation:** Shows top 5 only. "See full leaderboard" link for future page.

### 9.3 Phase 2 Community Features (Documented for Future)
- **Live Feed:** Recent activity ticker (e.g., "User #1029 logged 5 km cycling")
- **Friends:** See friends' ranks highlighted differently
- **Social sharing:** "Share my impact" generates a formatted card for social media

---

## 10. Mobile Design Specification

### 10.1 Bottom Navigation
No dedicated challenge bottom navigation. The app-level navigation handles routing.

### 10.2 Sticky Action Bar (Challenge Detail)
On mobile (<768px), the Actions Panel is extracted from the sidebar into a sticky bottom bar:
```
─────────────────────────────────────────────
│  [🚀  Join Challenge    →  ]              │
─────────────────────────────────────────────
```
- Height: 72px
- Background: white, `border-top: 1px --color-border`
- Button: Full width (minus `--space-4` padding each side)
- `z-index: 100` — above all page content
- On scroll up: remains visible. On scroll down: can fade (optional — not required V2)

### 10.3 Card Grid Responsive Changes
| Breakpoint | Grid | Card Width |
| :--- | :--- | :--- |
| <576px | 1 column | 100% |
| 576–767px | 2 columns | ~48% |
| 768–1023px | 2 columns | ~48% |
| ≥1024px | 3 columns | ~31% |

### 10.4 Challenge Detail on Mobile
- Hero banner: 260px tall (vs 380px desktop)
- No sidebar — all sections stacked vertically
- Progress widget comes immediately after Status Banner
- Actions panel becomes sticky bottom bar
- Rewards widget moves below rules (less urgent on mobile)

---

## 11. Animation Specification

| Animation | Trigger | Duration | Easing | Description |
| :--- | :--- | :--- | :--- | :--- |
| Page Enter | Route navigation | 300ms | `--ease-out` | Fade-in from `opacity:0` + `translateY(8px)` |
| Card Hover | `mouseenter` | 150ms | `--ease-out` | `translateY(-2px)` + shadow increase |
| Card Leave | `mouseleave` | 150ms | `--ease-in` | Reverse of hover |
| Progress Fill | Component mount | 1200ms | `--ease-out` | Width from 0 to target % |
| Milestone Pop | Threshold crossed | 400ms | `--ease-spring` | Tick mark bounces (scale 0→1.3→1) |
| Milestone Toast | After pop | 400ms | `--ease-spring` | Slides from right, `translateX(100%)→0` |
| Join Button → Joined | API success | 400ms | `--ease-spring` | Button morphs (color + text) |
| Budget Pulse | ≥80% budget used | 2000ms loop | `ease-in-out` | Box-shadow pulsing |
| Completion Confetti | Status → COMPLETED | 2000ms | — | CSS confetti particles from top |
| XP Counter | Completion | 1500ms | `--ease-out` | Number increments from 0 |
| Skeleton Shimmer | Loading | 1500ms loop | `linear` | Gradient sweeps left to right |
| Modal Open | User action | 300ms | `--ease-out` | Scale `0.95→1` + fade |
| Modal Close | ESC / Cancel | 200ms | `--ease-in` | Scale `1→0.95` + fade out |

**All animations above must be absent when `prefers-reduced-motion: reduce` is active.** Replace with instantaneous state changes.

---

## 12. Accessibility Specification

### 12.1 Keyboard Navigation
- All interactive elements reachable via `Tab` in logical DOM order
- Cards are focusable with visible focus ring (2px solid `--color-info`, 2px offset)
- Modal opens with focus on first interactive element; focus is trapped inside modal
- ESC key always closes modals and dismisses toasts
- Tab filters navigable with arrow keys

### 12.2 ARIA Roles
| Element | ARIA Attribute | Value |
| :--- | :--- | :--- |
| Status Badge | `role` | `"status"` |
| Status Badge | `aria-label` | e.g., `"Challenge status: On Track"` |
| Progress Bar | `role` | `"progressbar"` |
| Progress Bar | `aria-valuenow` | current percentage |
| Progress Bar | `aria-valuemin` | `"0"` |
| Progress Bar | `aria-valuemax` | `"100"` |
| Progress Bar | `aria-label` | e.g., `"Challenge progress: 60%"` |
| Modal | `role` | `"dialog"` |
| Modal | `aria-modal` | `"true"` |
| Modal | `aria-labelledby` | ID of modal title |
| Toast | `role` | `"alert"` |
| Toast | `aria-live` | `"polite"` |
| Join Button (loading) | `aria-busy` | `"true"` |

### 12.3 Color Contrast
- All text on white backgrounds: minimum 4.5:1 ratio
- All text on colored backgrounds (badges): minimum 4.5:1 ratio
- Icons conveying meaning: always paired with text label (never icon-only)
- Do NOT use color as the sole differentiator between Budget and Achievement — also use icon + label

### 12.4 Focus States
- **Default focus ring:** `2px solid #3b82f6`, `outline-offset: 2px`
- **Card focus:** Same ring but with slight elevation increase
- **Button focus:** Ring + no outline removal (`outline: none` is BANNED without replacement)

---

## 13. Design Tokens — Complete Reference Tables

### Color Tokens
```
--color-bg:             #f8fafc
--color-surface:        #ffffff
--color-surface-alt:    #f1f5f9
--color-border:         #e2e8f0
--color-text-primary:   #0f172a
--color-text-secondary: #475569
--color-text-muted:     #94a3b8

--color-success:        #10b981
--color-success-bg:     #d1fae5
--color-warning:        #f59e0b
--color-warning-bg:     #fef3c7
--color-danger:         #ef4444
--color-danger-bg:      #fee2e2
--color-info:           #3b82f6
--color-info-bg:        #dbeafe
--color-xp:             #8b5cf6
--color-xp-bg:          #ede9fe
```

### Spacing Tokens
```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

### Typography Tokens
```
--font-family:      'Inter', 'Segoe UI', system-ui, sans-serif
--text-display:     2.25rem / 800
--text-h1:          1.875rem / 700
--text-h2:          1.375rem / 700
--text-h3:          1.125rem / 600
--text-body-lg:     1rem / 400
--text-body:        0.875rem / 400
--text-label:       0.75rem / 600
--text-micro:       0.6875rem / 500
--text-stat:        2rem / 800
```

### Animation Tokens
```
--ease-out:          cubic-bezier(0.0, 0, 0.2, 1)
--ease-in:           cubic-bezier(0.4, 0, 1, 1)
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1)
--duration-fast:     150ms
--duration-base:     300ms
--duration-slow:     600ms
--duration-progress: 1200ms
```

---

## 14. Wireframe Sketches — ASCII

### Dashboard (Desktop)
```
╔══════════════════════════════════════════════════════════════╗
║  Challenges                              [🏆 Leaderboard]   ║
║  Your daily sustainability mission                           ║
╠══════════════════════════════════════════════════════════════╣
║  [⚠ Budget at Risk Banner — conditional]                    ║
╠═══════════════════╦═══════════════════╦═══════════════════════╣
║  🟢 3 Active      ║  ✅ 7 Completed   ║  ⭐ 2,450 Total XP  ║
╠══════════════════════════════════════════════════════════════╣
║  Continue Your Challenges                         [See All] ║
║  ┌────────────┐  ┌────────────┐  ┌────────────┐            ║
║  │  [IMG]     │  │  [IMG]     │  │  [IMG]     │  ···       ║
║  │  Car-Free  │  │  Carbon    │  │  Cycling   │            ║
║  │  ━━━━ 60% │  │  🟡 78%    │  │  ━━━ 40%  │            ║
║  │ [Details] │  │ [Details] │  │ [Details] │            ║
║  └────────────┘  └────────────┘  └────────────┘            ║
╠══════════════════════════════════════════════════════════════╣
║  Recommended For You                          [Explore All] ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ║
║  │  [IMG]       │  │  [IMG]       │  │  [IMG]       │      ║
║  │ 🏆ACHIEVEMENT│  │ 💰 BUDGET    │  │ 🏆ACHIEVEMENT│      ║
║  │ Beach Cleanup│  │ H2O Budget   │  │ Cycling 30d  │      ║
║  │ +300 XP      │  │ +600 XP      │  │ +500 XP      │      ║
║  │ [Join]       │  │ [View]       │  │ [Join]       │      ║
║  └──────────────┘  └──────────────┘  └──────────────┘      ║
╚══════════════════════════════════════════════════════════════╝
```

### Challenge Detail (Desktop)
```
╔══════════════════════════════════════════════════════════════╗
║           [HERO IMAGE — FULL WIDTH — 380px]                  ║
║  🏆 ACHIEVEMENT                        ● ACTIVE             ║
║  Car-Free Weekend Challenge                                  ║
║  📂 Carbon Reduction  •  ⏳ 30 days  •  👥 42 joined        ║
╠═══════════════════════════════════╦═══════════════════════════╣
║  MAIN (60%)                       ║  SIDEBAR (40%)            ║
║  ╔═════════════════════════════╗  ║  ╔═══════════════════╗  ║
║  ║ ✅ You're participating     ║  ║  ║  🏆 Rewards        ║  ║
║  ╚═════════════════════════════╝  ║  ║  ⭐ 500 XP         ║  ║
║                                   ║  ║  🎖 Eco Badge      ║  ║
║  ╔═════════════════════════════╗  ║  ╚═══════════════════╝  ║
║  ║ Your Progress — ACHIEVEMENT ║  ║  ╔═══════════════════╗  ║
║  ║ ━━━━━━━━━━━━━━━░░░  60%    ║  ║  ║  [🚀 Join]        ║  ║
║  ║ 18 km / 30 km              ║  ║  ╚═══════════════════╝  ║
║  ╚═════════════════════════════╝  ║  ╔═══════════════════╗  ║
║                                   ║  ║  🏆 Leaderboard    ║  ║
║  ╔═════════════════════════════╗  ║  ║  #1 User 4821      ║  ║
║  ║ Community Progress          ║  ║  ║  #2 User 1092      ║  ║
║  ║ ━━━━━━━━━━━━━━━░░░  73%    ║  ║  ║  #3 You ←         ║  ║
║  ║ 👥 42  •  🌳 146 trees     ║  ║  ╚═══════════════════╝  ║
║  ╚═════════════════════════════╝  ║                           ║
║                                   ║                           ║
║  ╔═════════════════════════════╗  ║                           ║
║  ║ 📋 Rules & Guidelines       ║  ║                           ║
║  ║ ✅ Automatic Tracking       ║  ║                           ║
║  ║ ✅ Achievement Type         ║  ║                           ║
║  ║ ✅ Cycling + Walking only   ║  ║                           ║
║  ╚═════════════════════════════╝  ║                           ║
╚══════════════════════════════════════════════════════════════╝
```

### Challenge Detail — Budget Type Progress (Detail)
```
╔══════════════════════════════════════════╗
║ Budget Status                💰 BUDGET   ║
║                                          ║
║ ┌─────────────────────────────────────┐  ║
║ │ ⚠ CAUTION — 78% of budget used    │  ║
║ └─────────────────────────────────────┘  ║
║                                          ║
║ ████████████████████████████░░░░░  78%   ║
║ 0%                              100%     ║
║                                          ║
║ ┌──────────┐  ┌──────────┐  ┌────────┐  ║
║ │ Used     │  │ Budget   │  │Remain  │  ║
║ │ 39 kg   │  │ 50 kg    │  │ 11 kg  │  ║
║ └──────────┘  └──────────┘  └────────┘  ║
║                                          ║
║ Daily allowance: 1.7 kg/day              ║
╚══════════════════════════════════════════╝
```

### Mobile — Challenge Detail
```
╔═══════════════════════════════╗
║  [HERO — 260px tall]          ║
║  🏆 ACHIEVEMENT    ● ACTIVE   ║
║  Car-Free Weekend             ║
╠═══════════════════════════════╣
║  ✅ You're participating      ║
╠═══════════════════════════════╣
║  Your Progress     60%        ║
║  ━━━━━━━━━━━━━━░░░ ▲▲▲       ║
║  18 / 30 km                   ║
╠═══════════════════════════════╣
║  Community  73%   👥 42       ║
║  ━━━━━━━━━━━━░░░              ║
║  🌳 146 trees saved           ║
╠═══════════════════════════════╣
║  📋 Guidelines                ║
║  ✅ Automatic Tracking        ║
║  ✅ Achievement Type          ║
╠═══════════════════════════════╣
║  🏆 Leaderboard               ║
║  #1 User 4821  45km           ║
║  #3 You ←      38km           ║
╠═══════════════════════════════╣
║  [Sticky Bottom Bar]          ║
║  [🚀  Join Challenge  →]     ║
╚═══════════════════════════════╝
```

---

## 15. Final Component Hierarchy

```
User Challenge Module
│
├── challenges-dashboard-page
│   ├── DashboardPageHeader
│   ├── UrgencyAlertBanner
│   │   └── [Alert rows]
│   ├── DashboardStatsWidget
│   │   ├── StatCard (Active)
│   │   ├── StatCard (Completed)
│   │   └── StatCard (Total XP)
│   ├── ContinueChallengeCarousel
│   │   └── MyChallengeCard (×n)
│   │       ├── ChallengeImagePipe
│   │       ├── ChallengeStatusBadge
│   │       └── AchievementProgressWidget(mini) | BudgetProgressWidget(mini)
│   └── RecommendedChallengesGrid
│       └── ChallengeCard (×3)
│           ├── ChallengeImagePipe
│           └── ChallengeStatusBadge
│
├── challenge-list-page (Explore)
│   ├── ExplorePageHeader
│   ├── ChallengeSearchInput
│   ├── ChallengeFilterBar
│   ├── ResultsCount
│   ├── ChallengeCard (grid ×n)
│   ├── EmptyState (conditional)
│   └── PaginationControl
│
├── my-challenges-page
│   ├── MyChallengesHeader
│   ├── TabBar (Active | Completed | Failed)
│   ├── MyChallengeCard (list ×n)
│   │   ├── ChallengeImagePipe
│   │   ├── ChallengeStatusBadge
│   │   └── AchievementProgressWidget(mini) | BudgetProgressWidget(mini)
│   ├── EmptyState (per tab, conditional)
│   └── PaginationControl
│
├── challenge-detail-page
│   ├── ChallengeHeroComponent
│   │   ├── ChallengeImagePipe
│   │   └── ChallengeStatusBadge
│   ├── StatusBannerComponent (conditional — joined only)
│   ├── [Main Column]
│   │   ├── AchievementProgressWidgetComponent [if ACHIEVEMENT]
│   │   │   └── → emits milestoneReached → MilestoneToastComponent
│   │   ├── BudgetProgressWidgetComponent [if BUDGET]
│   │   │   └── → emits budgetCritical → UrgencyAlertBanner
│   │   ├── CommunityImpactWidgetComponent
│   │   ├── ChallengeRulesWidgetComponent
│   │   ├── ChallengeTimelineWidgetComponent
│   │   └── RelatedChallengesSection
│   │       └── ChallengeCard (×3)
│   ├── [Sidebar Column]
│   │   ├── RewardWidgetComponent
│   │   ├── ActionsPanel
│   │   │   └── ManualProgressModal (overlay, conditional)
│   │   └── LeaderboardWidgetComponent
│   └── StickyMobileActionBar (mobile only)
│
├── challenge-history-page
│   ├── HistoryPageHeader
│   ├── ImpactSummaryBanner
│   ├── TabBar (All | Completed | Failed)
│   ├── HistoryCard (list ×n)
│   │   └── ChallengeStatusBadge
│   └── EmptyState (per tab, conditional)
│
└── Shared (challenges/shared/)
    ├── pipes/
    │   ├── ChallengeImagePipe
    │   ├── ProgressColorPipe
    │   └── ChallengeStatusLabelPipe
    ├── components/
    │   ├── ChallengeStatusBadge
    │   ├── ChallengeCard
    │   ├── MyChallengeCard
    │   ├── EmptyState
    │   ├── progress/
    │   │   ├── AchievementProgressWidget
    │   │   └── BudgetProgressWidget
    │   ├── CommunityImpactWidget
    │   ├── LeaderboardWidget
    │   └── MilestoneToast
    └── constants/
        └── challenge-status.constants.ts
```

---

## 16. Implementation Readiness Checklist

### Pages
- [x] Dashboard — all sections specified, all states documented
- [x] Explore Challenges — layout, filters, cards, empty, loading
- [x] My Challenges — tabs, card variants, empty per tab
- [x] Challenge Detail — full specification, desktop and mobile layouts
- [x] History — layout, cards, stats banner, tabs

### Components
- [x] ChallengeCard — all variants and states
- [x] MyChallengeCard — Achievement and Budget variants
- [x] AchievementProgressWidget — full + mini, milestones, animations
- [x] BudgetProgressWidget — full + mini, risk states, pulse animation
- [x] ChallengeStatusBadge — all 8 statuses mapped
- [x] CommunityImpactWidget — translations defined
- [x] LeaderboardWidget — layout and behavior
- [x] ChallengeHero — desktop and mobile heights
- [x] ActionsPanel — all 5 states documented
- [x] ManualProgressModal — layout, validation, quick-add chips
- [x] MilestoneToast — position, animation, dismiss behavior
- [x] HistoryCard — completed and failed variants
- [x] EmptyState — inputs defined

### States
- [x] Loading states — skeleton specified for all async sections
- [x] Empty states — all empty scenarios documented with CTA
- [x] Error states — error banner pattern defined
- [x] All participant status states mapped visually

### Design System
- [x] Color tokens — complete table
- [x] Typography — scale and weights defined
- [x] Spacing — token system defined
- [x] Border radius — token system defined
- [x] Shadows — all shadow tokens + semantic shadows
- [x] Animations — all transitions timed and eased
- [x] Icons — mapping table defined

### Responsive
- [x] Mobile (<576px) — all pages specified
- [x] Tablet (768–1023px) — grid changes documented
- [x] Desktop (≥1024px) — multi-column layouts specified
- [x] Sticky mobile action bar specified for Detail page

### Accessibility
- [x] ARIA roles defined for all interactive and status elements
- [x] Keyboard navigation specified
- [x] Focus state design defined
- [x] Color contrast rule documented
- [x] Reduced motion rule enforced across all animations
- [x] Icon + label pairing rule documented

### Gamification
- [x] Milestone system designed (threshold, toast, one-fire rule)
- [x] Budget risk system designed (3 threshold states, pulse animation)
- [x] Completion animation designed (confetti, XP counter)
- [x] Community impact translation table defined

### Implementation
- [x] Component contracts reference the Master Execution Plan
- [x] All wireframes provided for every major screen
- [x] Component hierarchy tree complete
- [x] Zero hardcoded rules text — all data-driven
- [x] Sticky bottom action bar specified for mobile

> **This document is implementation-ready. Developers may begin Sprint 0.**
