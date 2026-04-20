# HP HE MIS — V2 strategy update (2-app architecture)

**Status:** Supersedes the 3-surface architecture in `docs/project-context.md` §2–§6
**Reason for update:** Corrected requirement — this is a 2-application product, not 3.
**Scope discipline:** This document describes *what changes*, not the full V1 plan from scratch. Where sections of the old `project-context.md` remain valid (data model, copy pack, scrutiny logic, bilingual approach, Sanjauli field insights), they carry over unchanged.

> **Note on HPU_167_Colleges_Data.xlsx** — the file didn't come through the upload. Output 7 is written to work with what a typical HP-167 dataset contains (12 districts, ~135 government degree colleges under HPU, plus Sanskrit / aided / autonomous institutions rounding to ~167). Once the file lands, swap the assumed field names for real column headers. The structural recommendations hold either way.

---

## Executive summary — what changes

| Area | Before (V1 plan) | Now (V2) |
|---|---|---|
| **Surfaces** | 3: student mini app + admin portal + public web app | **2: student mini app + unified admin portal** |
| **Public landing / info content** | Dedicated `apps/public-web` on port 3000 | **Lives in student mini app pre-login** (splash, language, pre-auth explainer) |
| **State vs college operations** | Single portal already, but role scoping was loose | **Explicit role-based IA** — same portal, different navigation and dashboards per role |
| **Monorepo apps** | `apps/student`, `apps/portal`, `apps/public-web` | `apps/student`, `apps/portal`. `apps/public-web` deprecated. |
| **Dev ports** | 3000 (public) / 3001 (student) / 3002 (portal) | **3001 (student) / 3002 (portal)**. 3000 retired. |
| **Seeded college data** | ~8–10 handcrafted mock colleges | **~167 realistic colleges** from HPU dataset, district-grouped |
| **Admin filters** | Basic college / course / category | **District → block → college** cascade plus type-of-institution filter |
| **Demo narrative** | Splits attention across 3 products | **Tighter**: student flow + admin flow only |

Everything else from the prior plan (19-entity data model, bilingual strategy, scrutiny 4-outcome model, shared-mock overlay bridge, build stack) carries over unchanged.

---

## Output 1 — Corrected product architecture

### The product is 2 applications

```
┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│   Student Mini App               │      │   Unified Admin Portal           │
│   (inside SwiftChat)             │      │   (independent web app)          │
│                                  │      │                                  │
│   • Mobile-first                 │      │   • Desktop-first (tablet OK)    │
│   • Bilingual EN + HI            │      │   • English primary              │
│   • Port 3001 (dev)              │      │   • Port 3002 (dev)              │
│   • Absorbs all pre-login /      │      │   • Role-based IA —              │
│     public info content          │      │     State / College Admin /      │
│                                  │      │     Operator / Convenor /        │
│                                  │      │     Finance / DHE read-only      │
└──────────────────────────────────┘      └──────────────────────────────────┘
              │                                         │
              └───────── Shared services ───────────────┘
                        (data model, auth,
                         scrutiny overlays,
                         shared i18n,
                         shared design tokens,
                         HP colleges dataset)
```

### What's removed from the 3-surface approach

- **`apps/public-web`** — deprecated. The folder can be deleted or left dormant until decommissioned, but it stops being a shipped surface. No links to/from it in V2.
- **Port 3000** — retired from the dev script orchestra. `pnpm dev` no longer boots a third process.
- **`NEXT_PUBLIC_STUDENT_APP_URL` env var** — was introduced in the demo-polish pass to let public-web link into the student app. Becomes unnecessary; remove from the public-web `.env.local` lifecycle (the student app is now the entry point).
- **Separate "SEO-friendly landing" concern** — irrelevant. Distribution to students is through SwiftChat messaging, not Google search. Any SEO obligation Anthropic-side should be handled by a one-page DHE-maintained static site, outside this product.

### How public / pre-login content is now handled

Pre-login content (what used to live on public-web) folds into the **student mini app pre-login flow**:

| Ex-public-web content | Now lives on |
|---|---|
| "Cycle 2026-27" headline banner | Splash screen (`/` in student app) — already exists |
| Important dates | Pre-login "Dates" card on splash; also accessible via a new `/dates` route that doesn't require auth |
| "How it works" (4 steps) | New pre-login `/how-it-works` route, linked from splash |
| "Who should apply" / eligibility criteria | New pre-login `/eligibility-check` route — a light eligibility self-test that leads into Register |
| "What changes this year" highlights | Folded into splash as collapsible "Learn more" section |
| "For Admins" link (to portal) | Footer link on splash that routes to the admin portal URL |

The student mini app's splash already routes unauthenticated users sensibly (Language → Register / Login). Adding 3–4 pre-login routes (`/dates`, `/how-it-works`, `/eligibility-check`) gives public-web's content a home without a separate app.

**Acceptance criterion:** A student who lands on the student app URL without an account can read every piece of information that was on the old public-web landing, in either English or Hindi, without logging in.

---

## Output 2 — Updated role model (unified admin portal)

The portal is **one application** with **role-based IA**. A user logs in once; what they see and what they can do is derived from their `Role` on the `User` entity (already modelled in §8.2 of the original project-context).

### Role summary

| Role | User count (realistic) | Primary daily work | Login domain |
|---|---|---|---|
| **State Admin (DHE)** | ~5–10 | Cycle config, state-wide merit, cross-college oversight | `state.hp.gov.in` or SSO |
| **College Admin (Principal)** | ~167 (1 per college) | Scrutiny sign-off, local exceptions, staff management | College email |
| **College Operator** | ~500–800 (2–5 per college) | Day-in, day-out scrutiny grunt work | College email |
| **Convenor / Approver** | ~50–100 | Second-level review before state merit | College or state email |
| **Finance User** | ~5–15 | Fee configuration, reconciliation, refund approval | State finance SSO |
| **DHE Secretary (read-only)** | ~2–5 | Leadership dashboard, no write access | State SSO |

### Per-role specification

#### State Admin

| Aspect | Detail |
|---|---|
| **Purpose** | Configure the admission cycle, monitor state-wide progress, publish merit lists, handle escalations that college admins can't resolve. |
| **Can do** | Create/edit `AdmissionCycle`, `Phase`, `EligibilityRule`, `DocumentRule`, `ReservationCategory`, `RosterTemplate`. Publish merit. Approve seat-matrix changes. View every college's queue. Export state-wide reports. |
| **Cannot do** | Perform individual scrutiny decisions (that's the college's authority). Issue admission letters directly (that's the college's Principal). |
| **Screens used** | State dashboard · Cycle setup · Rules editor · Colleges master · Seat matrix (state view) · Merit publishing · State reports · Audit log · Users & roles |
| **Differs from others** | Only role that can edit cycle-level configuration. Only role with cross-college write access. |
| **Default landing** | `/state/dashboard` (KPIs across all 167 colleges) |

#### College Admin (Principal)

| Aspect | Detail |
|---|---|
| **Purpose** | Own the scrutiny quality and admission decisions for their college. Supervise operators. Sign off on exceptions. |
| **Can do** | See only their college's queue and data. Verify / Reject / Conditional-accept any application in their college (override operator decisions). Raise discrepancies. Add/remove College Operators for their college. Configure their college's seat matrix within state-approved bounds. View their college's reports. |
| **Cannot do** | See other colleges. Edit cycle-level rules. Publish state merit. |
| **Screens used** | College dashboard · Applications queue (their college) · Application detail · Scrutiny workbench · Discrepancy console · Seat matrix (their college) · Operators management · College reports |
| **Differs from others** | Scoped to one `collegeId`. Has override authority over their own operators. |
| **Default landing** | `/college/dashboard` (their college's KPIs) |

#### College Operator

| Aspect | Detail |
|---|---|
| **Purpose** | Do the day-in, day-out scrutiny work — verify documents, check facts against records, raise discrepancies, flag ambiguous cases for the Principal. |
| **Can do** | See only their college's queue (exact same scope as College Admin). Verify / Reject / Conditional-accept applications they open. Raise discrepancies. Mark docs verified/rejected. |
| **Cannot do** | Override Principal decisions. Add/remove users. Edit seat matrix. See other colleges. |
| **Screens used** | College dashboard (operator flavour: my queue, my decisions today) · Applications queue · Application detail · Scrutiny workbench · Discrepancy console (own) |
| **Differs from Principal** | No operator management. No seat-matrix edit. Decisions are logged but can be overridden by Principal. |
| **Default landing** | `/college/my-queue` — applications assigned to / picked up by this operator |

#### Convenor / Approver

| Aspect | Detail |
|---|---|
| **Purpose** | Second-level review. In HP's existing process, convenors review edge cases (SGC claims, Lahaul-Spiti / tribal claims, disputed domicile) before they enter the state merit pool. |
| **Can do** | See the state-wide queue filtered to applications flagged for convenor review. Approve or send back to college with a note. Read-only everywhere else. |
| **Cannot do** | Make admission decisions directly. Edit data. See applications outside their assigned convenor bucket. |
| **Screens used** | Convenor queue · Application detail (read-only + approve/send-back action) · Convenor notes log |
| **Differs from Principal/Operator** | Cross-college read access, but only for applications in the `convenor_review` state. No write except approve/send-back. |
| **Default landing** | `/convenor/queue` |

#### Finance User

| Aspect | Detail |
|---|---|
| **Purpose** | Configure the 42-head fee structure per college/course, reconcile incoming payments, approve refunds for the duplicate-payment and withdrawal cases. |
| **Can do** | Edit fee heads per course/college. View payment transactions. Approve/reject refund requests. Export financial reports. |
| **Cannot do** | Touch student or application data. See scrutiny decisions. |
| **Screens used** | Finance dashboard · Fee structure editor · Transaction ledger · Refund approval queue · Finance reports |
| **Differs from others** | Orthogonal to the admission flow — operates on payments and fee configuration only. |
| **Default landing** | `/finance/dashboard` |

#### DHE Secretary (read-only leadership)

| Aspect | Detail |
|---|---|
| **Purpose** | Weekly/daily leadership glance at state-wide progress. No operational work. |
| **Can do** | View any dashboard, any report, any aggregate. |
| **Cannot do** | Write anything. Even "raise discrepancy" is disabled. |
| **Screens used** | Leadership dashboard · State reports · Read-only application detail |
| **Differs from State Admin** | Read-only. No configuration, no publishing. |
| **Default landing** | `/leadership/dashboard` |

### Role → scope matrix

| Capability | State Admin | College Admin | College Operator | Convenor | Finance | DHE Secretary |
|---|---|---|---|---|---|---|
| See all colleges' data | ✓ | ✗ | ✗ | ✓ (convenor-flagged only) | ✓ (fee/txn only) | ✓ |
| See own college's applications | ✓ | ✓ | ✓ | ✓ (if flagged to them) | – | ✓ |
| Verify / reject / conditional-accept | ✗ | ✓ | ✓ | ✗ | – | ✗ |
| Raise discrepancy | ✗ | ✓ | ✓ | ✗ (approve/send-back) | – | ✗ |
| Override operator decision | – | ✓ | ✗ | ✗ | – | ✗ |
| Edit cycle config | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Publish merit | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit seat matrix | ✓ (approve) | ✓ (own college) | ✗ | ✗ | ✗ | ✗ |
| Manage users | ✓ (all) | ✓ (own college ops) | ✗ | ✗ | ✗ | ✗ |
| Edit fee heads | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Approve refunds | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |

---

## Output 3 — Updated module-to-surface mapping

All 30 V1 modules from project-context.md §4.2, remapped. Everything previously assigned to "public-web" now lives in **Student Mini App pre-login** or **Shared services**.

### Package 1 — Institutional Management (7 modules, all P0)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M1.1 Cycle setup | Portal | **Portal** (State Admin only) | – |
| M1.2 Phase management | Portal | **Portal** (State Admin) | – |
| M1.3 College master | Portal | **Portal** (State read, College read-own) | **Seed from HPU-167 dataset** |
| M1.4 Course & combination master | Portal | **Portal** (State) | – |
| M1.5 Seat matrix | Portal | **Portal** (State approve, College edit-own) | – |
| M1.6 Eligibility rules | Portal | **Portal** (State) | – |
| M1.7 Document rules | Portal | **Portal** (State) | – |

### Package 2 — Student Portal (8 modules: 3 P0 + 5 P1)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M2.1 Registration | Student | **Student** | – |
| M2.2 Login & session | Student | **Student** | – |
| M2.3 Profile builder (5 steps) | Student | **Student** | – |
| M2.4 Document upload | Student | **Student** | – |
| M2.5 Eligibility discovery | Student | **Student** | – |
| M2.6 Preference selection & ranking | Student | **Student** | – |
| M2.7 Application review & submission | Student | **Student** | – |
| M2.8 Student dashboard | Student | **Student** | – |

### Package 3 — Admission Processing (5 modules, all P2)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M3.1 Scrutiny workbench | Portal | **Portal** (College Admin + Operator) | – |
| M3.2 Discrepancy console | Portal | **Portal** (College + student-facing view lives in Student) | – |
| M3.3 Merit list compilation | Portal | **Portal** (State) | – |
| M3.4 Allotment engine | Portal | **Portal** (State trigger, College view) | – |
| M3.5 Admission letter issuance | Portal | **Portal** (College Admin) | – |

### Package 7 — Financial (1 module, Ph2)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M7.1 Fee configuration & reconciliation | Portal | **Portal** (Finance role) | – |

### Package 9 — Analytics (1 module, Ph2)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M9.1 Dashboards & reports | Portal (+ public stubs) | **Portal only**, role-filtered | **Public stub removed** |

### Package 10 — Platform Services (8 modules: 1 P0 + 5 P1 + 2 Ph2)

| Module | V1 surface | V2 surface | Change? |
|---|---|---|---|
| M10.1 Auth & SSO | Shared | **Shared** | – |
| M10.2 Notifications (SMS/email/in-app) | Shared | **Shared** | – |
| M10.3 Audit log | Shared | **Shared** | – |
| M10.4 File storage | Shared | **Shared** | – |
| M10.5 i18n service | Shared | **Shared** | – |
| M10.6 **Public landing / info content** | **Public-web** | **Student app pre-login routes** | **MIGRATED** |
| M10.7 Reporting export | Shared | **Shared** | – |
| M10.8 Data export / backup | Shared | **Shared** | – |

### Changes called out explicitly

1. **M10.6** is the only module that moves surface. Everything else is already on student or portal; the portal just gains explicit role-based IA rather than a loose single-view.
2. **M9.1** had a "public stubs" element in the old plan (publishing merit lists, seat availability on the public landing). That's now part of the Student pre-login experience (merit list lookup by roll number is a pre-login feature, doesn't require auth).
3. **M1.3 College master** gains significant realism now that it's seeded from the HPU-167 dataset.

---

## Output 4 — UX / IA recommendation

### Student mini app — pre-login IA

```
/ (splash)
├── Pre-login entry points (new, absorbs public-web content)
│   ├── /dates                  — Important dates (pre-login, static)
│   ├── /how-it-works           — 4-step explainer (pre-login, static)
│   ├── /eligibility-check      — Self-test, leads into Register
│   └── /merit-lookup           — Check merit by roll number (post-publish only)
│
├── Auth flow
│   ├── /language               — Language picker (unchanged)
│   ├── /register               — Existing
│   ├── /login                  — Existing
│   └── /forgot-password        — Existing
│
└── Post-login
    └── /dashboard + all existing authed routes (unchanged)
```

**Design principle:** splash screen becomes the *one* surface the whole ecosystem drives traffic to. A government ad, SwiftChat banner, DHE circular — all lead here. The splash then branches into "Just want info" (`/dates`, `/how-it-works`) vs "Ready to apply" (`/register`).

**Splash layout update:**
```
┌────────────────────────────────┐
│ HP Govt emblem · Cycle 2026-27 │
│                                │
│ [Cycle headline banner]        │
│                                │
│ [Register] ← primary           │
│ [Login]    ← secondary         │
│                                │
│ Learn before applying:         │
│ • Important dates    →         │
│ • How it works       →         │
│ • Am I eligible?     →         │
│ • Check merit list   → (when open) │
│                                │
│ Trust line · Language toggle   │
│ Admin login →                  │
└────────────────────────────────┘
```

### Admin portal — role-based IA

The portal has **one top-level shell** (the existing `PortalFrame`) and **one login** (`/login`). After login, the shell renders a **role-specific sidebar** and a **role-specific default landing page**.

**No separate URL subtrees per role.** A URL like `/applications/HP-ADM-2026-001234` is valid for State Admin, College Admin, Operator, Convenor, and DHE Secretary — the *same URL* renders with role-appropriate affordances and scope. (College Admin at `collegeId=X` gets a 403 for an application from college `Y`; State sees everything.)

**Sidebar by role:**

```
STATE ADMIN                      COLLEGE ADMIN / OPERATOR
├── Overview                     ├── Overview
├── Applications (all 167)       ├── Applications (my college)
├── Colleges                     ├── Seat matrix (my college)
├── Courses & combinations       ├── Scrutiny queue
├── Seat matrix                  ├── Discrepancies
├── Merit & allocation           ├── Users (Admin only)
├── Rules                        └── Reports (my college)
├── Users
├── Reports
└── Audit

CONVENOR                         FINANCE                  DHE SECRETARY
├── Overview                     ├── Overview             ├── Leadership dashboard
├── My queue                     ├── Fee structure        ├── State reports
└── Decision log                 ├── Transactions         └── (Everything read-only)
                                 ├── Refund queue
                                 └── Reports
```

**Implementation:** Already foreshadowed by the polish-pass `portal-frame.tsx` work. Each `NAV_ITEM` gains a `roles: Role[]` property. The sidebar filters items by the logged-in user's role. The 8 "Coming soon" items become real when they launch, but the sidebar stays consistent.

### Dashboard differences by role

**State Admin dashboard:**
- 4 KPI tiles: total applications today, merit published Y/N, discrepancies open (all-state), colleges active
- Activity feed: state-wide events
- Phase card: current phase of cycle, advance button
- Geographic heat map: applications by district
- Pipeline funnel: submitted → under scrutiny → verified → allotted

**College Admin dashboard:**
- 4 KPI tiles: my college's apps today, in-queue, discrepancies-raised, verified today
- Activity feed: this college's events
- Operator leaderboard: who's reviewed what
- Seat fill: my college's matrix progress

**College Operator dashboard:**
- 3 KPI tiles: my reviews today, my queue, my pending discrepancies
- My activity feed: only my own actions
- Next-action card: "23 applications waiting — start scrutiny"

**Convenor dashboard:**
- 2 KPI tiles: flagged to me, decided this week
- My queue preview
- SLA timer: oldest flagged application age

**Finance dashboard:**
- 4 KPI tiles: receipts today, reconciled, refunds pending, fee heads configured
- Transaction feed
- Refund queue preview

**DHE Secretary dashboard:**
- 6 KPI tiles: state-wide aggregates (total applications, merit published, allocations done, refusals, girl-child count, SC/ST/OBC share)
- Trend chart: daily application volume
- Top 5 colleges by volume
- Read-only indicator banner

### Navigation differences summary

| Dimension | State Admin | College | Convenor | Finance | Leadership |
|---|---|---|---|---|---|
| Sidebar items | 9 | 5 | 2 | 5 | 2 |
| Default landing | State dashboard | College/operator dashboard | Convenor queue | Finance dashboard | Leadership dashboard |
| Application queue scope | All | Own college | Convenor-flagged | n/a | All (read-only) |
| Write access | Cycle config, merit | Scrutiny, seats (own) | Approve/send-back | Fee, refunds | None |

---

## Output 5 — Updated screen inventory

Previous total: 88 screens (42 student + 44 portal + 3 shared + public-web implied).
**Revised total: 79 screens (46 student + 30 portal + 3 shared)**.

### Student Mini App — 46 screens

Grouped by flow. **Bold** = new in V2 (absorbed pre-login content). Strikethrough = removed (n/a).

**Auth & entry (6)**
- Splash (`/`) — updated layout
- Language picker (`/language`)
- Register (`/register`)
- Login (`/login`)
- Forgot password (`/forgot-password`)
- OTP verify (inline modal)

**Pre-login info (4) — new in V2**
- **Important dates (`/dates`)**
- **How it works (`/how-it-works`)**
- **Eligibility self-check (`/eligibility-check`)**
- **Merit lookup (`/merit-lookup`)** — only live after merit publishes

**Profile builder (7)**
- Profile steps 1–5 (`/profile/step/1..5`)
- BoF calculator (`/profile/tools/bof-calculator`)
- CGPA converter (`/profile/tools/cgpa-converter`)

**Documents (4)**
- Checklist (`/documents`)
- Upload picker (`/documents/upload/[docType]`)
- Preview (`/documents/preview/[docType]`)
- Rejection detail (`/documents/rejection/[docType]`)

**Discovery & eligibility (3)**
- Discover hub (`/discover`)
- College detail (`/discover/college/[collegeId]`)
- Course detail (`/discover/course/[courseId]`)

**Apply flow (7)**
- Apply hub (`/apply`)
- Preferences picker (`/apply/[courseId]/preferences`)
- Rank preferences (`/apply/[courseId]/rank`)
- Declaration (`/apply/[courseId]/declaration`)
- Review (`/apply/[courseId]/review`)
- Submit / payment (`/apply/[courseId]/submit`)
- Submitted confirmation (`/apply/[courseId]/submitted`)

**Post-submit (7)**
- Dashboard (`/dashboard`)
- Applications list (`/applications`)
- Application detail / issues (`/applications/[courseId]/issues`)
- Allotment view — new for V2 scope if time permits
- Accept/Freeze/Slide decision — new for V2 scope if time permits
- Withdrawal — Ph2
- Payment receipt — stub

**Help & settings (4)**
- Help (`/help`)
- Notifications (inline on dashboard; no separate screen in V1)
- Profile overview (read view — stub)
- Logout confirmation (inline modal)

**Discrepancy (4)** (separate conceptual screens, some are overlays)
- Discrepancy alert card (dashboard inline)
- Discrepancy detail (`/applications/[courseId]/issues`)
- Re-upload flow (uses documents/upload)
- Discrepancy resolved toast

### Unified Admin Portal — 30 screens

**State admin (9)**
- State overview dashboard (`/`)
- Cycle setup (`/cycle`)
- Phase controls (`/cycle/phases`)
- Colleges master (`/colleges`) — **seeded from HPU-167**
- College detail (`/colleges/[collegeId]`)
- Courses & combinations master (`/courses`)
- Seat matrix — state view (`/seats`)
- Rules — eligibility + documents (`/rules`)
- Audit log (`/audit`)

**Applications (5) — shared across roles**
- Queue (`/applications`) — **scoped by role**
- Detail (`/applications/[id]`) — **scoped**
- Scrutiny workbench (`/applications/[id]/scrutiny`) — College only
- Discrepancy form (`/applications/[id]/discrepancy`) — College only
- Application audit trail (`/applications/[id]/audit`) — new split from detail

**College admin (3)**
- College overview dashboard (`/college/dashboard` or `/` with role)
- My operators (`/users`) — scoped to own college
- My seat matrix (`/seats`) — scoped

**Merit & allocation (3)**
- Merit compilation (`/merit`) — State
- Merit publication (`/merit/publish`) — State
- Allotment rounds (`/allocation`) — State

**Convenor (2)**
- Convenor queue (`/convenor/queue`)
- Decision log (`/convenor/log`)

**Finance (4)**
- Finance dashboard (`/finance`)
- Fee structure editor (`/finance/fees`)
- Transaction ledger (`/finance/txn`)
- Refund queue (`/finance/refunds`)

**Leadership (2)**
- Leadership dashboard (`/leadership`)
- Leadership reports (`/leadership/reports`)

**Auth & shell (2)**
- Portal login (`/login`)
- Forgot password (`/forgot-password`)

### Shared (3)
- 404 / not-found (both apps)
- 403 / forbidden (portal — when a role hits a scoped URL)
- Offline / maintenance notice (both apps)

---

## Output 6 — Updated development strategy

### What to keep (no change needed)

- **Student mini app** — every screen, every state provider (`ProfileProvider`, `ApplicationsProvider`, `DocumentsProvider`, `LocaleProvider`, `ScrutinyBridgeProvider`). All carry over.
- **Shared packages** — `@hp-mis/design-tokens`, `@hp-mis/i18n`, `@hp-mis/shared-mock`, `@hp-mis/types`, `@hp-mis/ui`. All carry over.
- **Shared-mock bridge** (`hp-mis:scrutiny` localStorage key, overlay model) — this is the cross-surface glue and it works. Don't touch.
- **Portal scrutiny workbench, discrepancy console, applications queue** — the three polished portal screens. Keep.
- **Bilingual strategy** — EN + HI on student, EN on portal. Unchanged.
- **Data model** — all 19 entities + 2 logs. Unchanged.
- **i18n strings** — all 685 keys in both languages. Retain; add pre-login strings as an extension, not a rewrite.

### What to de-scope / remove

- **`apps/public-web`** — stop shipping. Two options:
  1. **Delete the folder outright** (cleanest; any future "public site" is a separate project owned by DHE).
  2. **Leave it dormant** (don't include in `pnpm dev` orchestration, keep the code in-repo as a reference until end of demo period, then delete).
  Recommendation: **option 2 for the demo, option 1 right after.** The deletion isn't urgent and keeping it lets you cannibalise copy/components for the new pre-login routes.
- **`NEXT_PUBLIC_STUDENT_APP_URL`** env var in public-web — irrelevant after public-web goes away.
- **3-port `pnpm dev`** — collapse to 2.

### What to merge / repurpose

| Ex-public-web asset | Destination | Effort |
|---|---|---|
| "4 steps" explainer copy | Student app `/how-it-works` route | ~2 hours (new route, copy + layout) |
| "Important dates" list | Student app `/dates` route, also linked from splash | ~1 hour |
| "Who should apply" eligibility criteria | Student app `/eligibility-check` — make it interactive (enter board, stream, marks → "you qualify for X") | ~4 hours (interactive version) |
| "What changes this year" highlights | Splash `<details>` accordion | ~30 min |
| Hero heading / subheading | Reuse Hindi translations; splash already has equivalent | 0 (existing) |
| Footer disclaimer / DHE contact | Student app footer on splash and `/help` | ~30 min |
| Any landing-page images/illustrations | Copy to `apps/student/public/` | 0 |

**Total migration effort: ~1 day.** Much less than building a parallel 3rd surface.

### What to reposition (portal — role-based IA)

The portal codebase already handles most of this; what's missing is the **role-aware sidebar and scope enforcement**. Practical implementation:

1. **Add `Role` to the mock user** (`apps/portal/app/_components/data/mock-applications.ts` currently has `REVIEWER_NAME/ROLE/COLLEGE` constants — extend to a full mock session).
2. **Add a `SessionProvider`** at the portal root with a role-switcher in the header (demo-only — in production this comes from SSO).
3. **Filter `NAV_ITEMS`** in `portal-frame.tsx` by role. The "Soon" items from the polish pass become role-scoped real items.
4. **Add role-gated routes:**
   - `/college/dashboard` → College Admin/Operator landing
   - `/convenor/queue` → Convenor landing
   - `/finance/*` → Finance
   - `/leadership` → DHE Secretary
5. **Scope enforcement** on the applications queue: if `role === "college_operator"` and `user.collegeId === "SANJAULI"`, filter `MOCK_APPLICATIONS` to `app.collegeId === "SANJAULI"`. This is already computed in `MOCK_APPLICATIONS`; just add the filter at the queue page level.

**Implementation effort: ~2 days** for a hi-fi demo-grade role switcher + 6 role dashboards + sidebar filtering. The expensive work (queue, detail, scrutiny, discrepancy) is already done.

### What to absorb into the student app (pre-login)

Create 4 new routes under `apps/student/app/`:
- `/dates/page.tsx` — table view, bilingual, read from shared dates source
- `/how-it-works/page.tsx` — 4 cards, bilingual
- `/eligibility-check/page.tsx` — 3-question wizard (board, stream, marks → eligible courses preview)
- `/merit-lookup/page.tsx` — roll-number entry, reads from mock merit data (stub for V1)

All 4 use the existing `PageShell` and i18n system. No new dependencies.

**Implementation effort: ~1 day** (mostly copy + layout; interactive eligibility-check is the biggest item at ~4 hours).

---

## Output 7 — Data realism using the HPU-167 dataset

**Note:** Working from typical structure of such datasets. Once the file is re-uploaded, validate column names and swap field values. The recommendations below hold regardless.

### Expected dataset shape (typical HP colleges master)

| Column | Example | Use in portal |
|---|---|---|
| `aisheCode` | U-0573 | Unique key in `College` entity |
| `collegeName` | Government College, Sanjauli | Display name everywhere |
| `shortName` | Govt College Sanjauli | Breadcrumbs, table headers |
| `district` | Shimla | **Primary filter**, dashboard grouping |
| `block` / `tehsil` | Shimla (Urban) | Secondary filter, hyperlocal search |
| `type` | Government / Government-Aided / Private / Sanskrit | Type filter, type-specific rules |
| `affiliatingUniversity` | Himachal Pradesh University | Filter for cross-university seats |
| `establishedYear` | 1961 | Shown on college-detail cards |
| `coEdStatus` | Co-educational / Women-only / Men-only | Filter for students; gender-sensitive matching |
| `hostelAvailable` | Yes (Boys + Girls) / Yes (Girls) / No | Card badge + student filter |
| `principalName` | Dr. X. Y. | Scrutiny identity ("verified by Principal") |
| `contactPhone` | 0177-XXX | Help desk surface |
| `contactEmail` | principal@gcsanjauli.ac.in | Operator + principal login domain seed |
| `pinCode` | 171006 | Address verification |
| `coursesOffered` | BA, BSc (NonMed), BCom, BCA | Course master seed |
| `totalSanctionedSeats` | 840 | Seat matrix baseline |
| `scSeats` / `stSeats` / `obcSeats` / `ewsSeats` | per rules | Reservation roster seed |
| `isActive` | Yes | Exclude dormant from queue |

### Specific wiring recommendations

#### 1. College master seed (`packages/fixtures`)

Stop leaving `packages/fixtures` as a stub. Populate it with the real dataset:

```
packages/fixtures/src/
├── colleges.ts          // 167 entries, typed as HPCollege
├── districts.ts         // 12 districts with bounding boxes + aggregates
├── courses.ts           // Course master (BA, BSc variants, BCom, BCA, BBA, BVoc)
├── combinations.ts      // BA combinations (the 60 from Sanjauli, generalised)
├── reservation-rules.ts // 1-120 HP roster template
└── index.ts             // re-exports + helpers (getByAishe, byDistrict, etc.)
```

Write a Node script `scripts/import-hpu-dataset.mjs` that reads the xlsx and generates `colleges.ts`. Checked-in output only — the xlsx itself is the source of truth but the generated TS is what the app imports. This keeps the demo runtime xlsx-free.

#### 2. College-card display (student app `/discover/college/[collegeId]`)

Today shows: name, location string, seats. **Upgrade to:**
```
┌────────────────────────────────────────┐
│ Govt College Sanjauli           [U-0573]│
│ Shimla (Urban) · Shimla district        │
│ Co-educational · Est. 1961              │
│ 🎓 840 seats · 🏠 Hostel (B+G)          │
│ Principal: Dr. X. Y.                    │
│                                         │
│ Courses: BA · BSc (NonMed) · BCom · BCA │
│ [View seats → ]                         │
└────────────────────────────────────────┘
```

Every field comes from the dataset. The student sees a *real* college card.

#### 3. Admin queue filters (portal `/applications`)

Current filter bar has: status, college, course, category. **Add:**
- **District filter (primary)** — 12 districts, multi-select. Dramatically improves scanning for state admins.
- **Type filter** — Government / Aided / Sanskrit. Useful because rules vary.
- **Co-ed status** — Women-only colleges have different SGC patterns.
- **Hostel filter** — surfaces accommodation-sensitive cases.

Rework filter bar layout:
```
[Search] [Status ▾] [District ▾] [College ▾]
[Course ▾] [Category ▾] [Type ▾] [☐ Only discrepancy]
```

#### 4. District grouping (state admin dashboard)

State dashboard's current "4 KPI tiles" should add a **district-level breakdown** below them:

```
Applications by district
┌──────────────────────────────────────┐
│ Shimla       1,247  ████████████     │
│ Kangra       1,103  ██████████       │
│ Mandi          842  ████████         │
│ Solan          756  ███████          │
│ ...                                   │
│ Lahaul-Spiti    89  █                │
└──────────────────────────────────────┘
```

A small bar chart like this, seeded with mock volumes per district, is enormously more convincing than 4 floating KPI tiles. One afternoon of work.

#### 5. State-level views — college ranking

Admins will want to answer "which colleges are behind on scrutiny?" The colleges-master screen needs a scrutiny-progress column:

```
College                    District    Pending  Done   SLA
Govt Sanjauli              Shimla       23      147    ✓ On track
Govt College Dharamshala   Kangra       89      52     ⚠ Behind
Govt College Reckong Peo   Kinnaur      4       8      ✓ On track
```

Pull the raw numbers from the scrutiny overlay; render a ranked table with a sort toggle. No new entities, just a computed view.

#### 6. Search — fuzzy across realistic data

Student's `/discover` search and portal's `/applications` search should both support:
- College name (with / without "Govt" prefix — normalise)
- AISHE code (students don't know these; admins do)
- District name in English and Hindi (Shimla / शिमला)
- Course code
- Application number

Implementing this is a single client-side fuse.js setup over the fixture data. Maybe 2 hours of work, massive realism payoff.

#### 7. Production-grade touches the dataset unlocks

- **Merit list by college**: because you now have 167 real colleges, the merit export per college looks plausible.
- **Seat-matrix allocation tour**: showing how 167 colleges × N courses × reservation categories rolls up is far more compelling than 10 mock colleges.
- **Geographic heat map** on state dashboard: using district lat/lng + application counts. Even a simple coloured HP outline works for demos.
- **Realistic email domains**: `principal@gcsanjauli.ac.in`-style emails seed the login mock for College Admin roles.
- **Hostel + co-ed combinations**: female applicants with SGC claim filtered to women-only colleges with hostels yields meaningfully small, realistic shortlists — a powerful demo moment.

### Replacement effort (calibrated)

| Task | Hours |
|---|---|
| Import script (xlsx → colleges.ts) | 2 |
| Update `College` type + migrate existing mock refs | 2 |
| Student college-card upgrade | 2 |
| Portal filter-bar district/type additions | 3 |
| State dashboard district breakdown | 3 |
| Colleges-master scrutiny-progress view | 3 |
| Fuzzy search wiring | 2 |
| Geographic heatmap (optional, nice to have) | 4 |
| **Total** | **~21 hours (~3 days)** |

---

## Output 8 — Final revised build roadmap

### Demo-date-anchored view

Assuming demo is in 2 weeks (10 working days), one developer full-time or two half-time.

**Day 1–2: Public-web retirement and pre-login absorption**
- Stop including public-web in `pnpm dev`
- Build 4 student pre-login routes (`/dates`, `/how-it-works`, `/eligibility-check`, `/merit-lookup`)
- Splash layout refresh with "Learn before applying" card

**Day 3–4: HPU-167 dataset integration**
- Import script + `colleges.ts` generation
- Swap out current mock college references
- Upgrade student college card + course card
- Update portal filter bar

**Day 5–6: Portal role-based IA**
- `SessionProvider` + role-switcher in header (demo-only UI for flipping between roles)
- Role-filtered sidebar in `PortalFrame`
- Scope enforcement on applications queue
- Build College Admin dashboard (reuse existing layout patterns, role-filter data)

**Day 7: Portal role dashboards (rest)**
- Convenor queue
- Finance dashboard (stub — fee structure editor is the real work; for V1 ship a read-only view)
- Leadership dashboard (read-only aggregates)

**Day 8: State dashboard polish**
- District bar chart
- Colleges-master scrutiny-progress view
- Real seeded data everywhere

**Day 9: Copy, bilingual parity, regression pass**
- Pre-login routes get HI translations
- Splash tested end-to-end in both languages
- Every new URL reachable from at least one button
- i18n key count checked

**Day 10: Demo rehearsal + script update**
- Update demo script (from §13 of previous project-context) to 2-app narrative
- Run through twice, record video as backup
- Final bug-bash

### Priority tiers (what ships in each cut)

**Tier 1 — must ship (demo-blocking if missing):**
- Retire public-web from dev orchestra
- Student pre-login routes (dates, how-it-works, eligibility-check)
- HPU-167 dataset seed for colleges
- Role-based sidebar + queue scoping in portal
- College Admin dashboard

**Tier 2 — should ship (demo-strengthening):**
- District breakdown on state dashboard
- Colleges-master with scrutiny progress
- Merit lookup pre-login route
- Convenor + Finance dashboards (even as stubs)
- Upgraded filter bar with district/type
- Interactive eligibility-check (vs static)

**Tier 3 — ship if time (demo-delighters):**
- Geographic heat map
- Leadership dashboard
- Fuzzy search with Hindi district names
- Admission letter template preview
- Allotment round simulator

**Tier 4 — deprioritise / defer:**
- Withdrawal + refund flow (Ph2)
- Public-web folder deletion (do after demo)
- Fee structure editor (Finance) — read-only for V1 demo is fine
- Actual PDF generation for admission letters
- Real SMS sending (toast-only is fine)

### Demo narrative (2-app update)

The prior §13 demo script was 18 min for 3 surfaces. **Revised 15-minute arc:**

1. **Setup (1 min)** — "Everything in this demo is seeded with 167 real HP colleges across 12 districts."
2. **Student mini app pre-login (2 min)** — Show splash, tap "How it works", "Important dates", "Am I eligible" self-check. "No separate landing page — if you're a student, you're in the app."
3. **Student full flow (6 min)** — Asha's journey: Register → profile → documents → discover (upgraded college card) → apply → submit.
4. **Portal — College Operator (3 min)** — Login, see only Sanjauli queue, run scrutiny, raise discrepancy.
5. **Portal — State Admin (2 min)** — Same login URL, switch role via demo toggle, see all 167 colleges, district breakdown, approve the merit publish.
6. **Student gets the Hindi discrepancy SMS (1 min)** — toast on dashboard, re-upload, closing beat.

Demo story is cleaner: one student experience, one admin experience that shifts role mid-flight. The 3-surface version spent time narrating *why* there were 3 surfaces — V2 doesn't have that tax.

---

## Change log vs prior plan

| Prior project-context.md section | V2 status |
|---|---|
| §1 Context & goal | Unchanged |
| §2 Scope (30 modules) | Unchanged |
| §3 Data model (19 entities) | Unchanged |
| **§4 Architecture** | **Superseded — see Output 1 + 3 above** |
| §5 Bilingual strategy | Unchanged |
| **§6 UX principles** | **Updated — see Output 4 (pre-login IA, role IA)** |
| §7 Sanjauli field insights | Unchanged |
| §8 Entity field lists | Unchanged |
| §9 Copy pack | Extend — new pre-login strings required (EN + HI) |
| **§10 Screen inventory (88)** | **Superseded — see Output 5 (79 screens)** |
| §11 Build plan + monorepo | **Updated — see Output 6 (`apps/public-web` deprecated)** |
| §12 Permissions matrix | **Updated — see Output 2 (explicit role model)** |
| §13 Demo script | **Updated — see Output 8 (15-min 2-app version)** |
| §14 Copy strings (~250) | Carry forward, add pre-login additions |
| §15 Bilingual QA matrix | Unchanged |
| §16 Roll-out plan | Unchanged |

---

## Summary for the team

1. **Two apps. Student + unified portal. Public-web retires.**
2. **Public info content moves to student pre-login — ~1 day migration.**
3. **Portal gains role-based IA — ~2 days work on top of existing code.**
4. **HPU-167 dataset is the single biggest realism upgrade — ~3 days.**
5. **Demo timeline: 10 working days, landing a hi-fi 2-app build that looks like something HP would actually buy.**
6. **All prior polish, bilingual work, scrutiny workbench, and state-bridge logic carries forward untouched.**

This is not a rewrite. It's a **retargeting** of what's already built, plus a deliberate absorption of public-web content into a place it belongs (student pre-login) and an explicit codification of role-based IA in a portal that was already *almost* unified.

Once you re-upload `HPU_167_Colleges_Data.xlsx`, Output 7's recommendations become immediately actionable — I can write the import script and generate the TypeScript seed file in one more pass.
