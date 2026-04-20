# HP Higher Education Admission Platform — V1 Context

**Project**: HP Higher Education MIS — Unified Admission Platform
**Scope**: V1 only (30 modules from the RFP Excel, `Release = V1` rows)
**Status**: Single source of truth for product scope, UX flows, data model, frontend architecture, and demo requirements
**Audience**: Product, design, engineering, QA, demo-day presenter

> All implementation decisions must align with this document. When the RFP, BRD, field-visit summary, or prospectuses conflict, this document reflects the resolved decision. Ambiguities are flagged explicitly where they exist.

---

## Table of contents

1. [Product overview](#1-product-overview)
2. [V1 scope](#2-v1-scope)
3. [Roles and permissions](#3-roles-and-permissions)
4. [Product architecture](#4-product-architecture)
5. [Key product truths](#5-key-product-truths)
6. [User journeys](#6-user-journeys)
7. [Bilingual and low-tech UX principles](#7-bilingual-and-low-tech-ux-principles)
8. [Data model](#8-data-model)
9. [Screen inventory](#9-screen-inventory)
10. [UI/UX patterns](#10-uiux-patterns)
11. [Frontend architecture and build plan](#11-frontend-architecture-and-build-plan)
12. [Mock data and i18n plan](#12-mock-data-and-i18n-plan)
13. [Demo requirements](#13-demo-requirements)
14. [Bilingual copy starter pack](#14-bilingual-copy-starter-pack)
15. [Anti-patterns and out-of-scope](#15-anti-patterns-and-out-of-scope)
16. [Source documents](#16-source-documents)

---

## 1. Product overview

### 1.1 What we are building

A unified state platform for undergraduate admission into Himachal Pradesh government higher-education institutions. One student identity across all colleges; one application per course type; one merit and allocation engine at the state level; college-specific configuration for combinations, seats, eligibility overrides, and fees.

### 1.2 Two surfaces

| Surface | Users | Feel |
|---|---|---|
| **SwiftChat Student Mini App** | Students | Mobile-first, guided, bilingual (English + Hindi), low-friction, trustworthy like a government portal but less intimidating. Designed for first-generation digital users. |
| **Official Web Portal** | State Admin, College Admin, College Operator, Convenor, Finance User, DHE Secretary | Operational, dashboard-driven, queue/task-oriented, auditable, English-first with Hindi-ready architecture. |

### 1.3 Non-goals for V1

- Full long-term feature set (Phase 2 modules excluded)
- Real backend integration with HPU ERP, Treasury, DigiLocker, or scholarship systems (V1 = stubs with health dashboards)
- Real payment gateway (V1 = simulated 3-outcome gateway)
- Real SMS/email gateways (V1 = simulated notification panel)
- Post-admission lifecycle (Package 4 in full scope — deferred)
- Faculty and HR, academic operations, infrastructure management (Packages 5, 6, 8 — deferred)

---

## 2. V1 scope

### 2.1 V1 module inventory — 30 modules across 6 packages

| Pkg | Package | V1 count | P0 | P1 | P2 | Ph2 |
|---|---|---|---|---|---|---|
| PKG-1 | Institutional Management (State setup) | 7 | 7 | — | — | — |
| PKG-2 | Student Application Portal | 8 | 3 | 5 | — | — |
| PKG-3 | Admission Processing | 5 | — | — | 5 | — |
| PKG-7 | Financial Management | 1 | — | — | — | 1 |
| PKG-9 | Analytics | 1 | — | — | — | 1 |
| PKG-10 | Platform Services | 8 | 1 | 5 | — | 2 |
| **Total** | | **30** | **11** | **10** | **5** | **4** |

### 2.2 Complete V1 module list

#### PKG-1 Institutional Management (all P0, owned by State Admin)

| Mod | Module | V1 behaviour (key points) |
|---|---|---|
| 1.1 | College registry and profiling | AISHE code, NAAC/NIRF, district, departments, principal, prospectus |
| 1.2 | Course, combination and offering registry | **Three-level model**: Course → SubjectCombination (college-specific) → CourseOffering (per college per cycle) |
| 1.3 | Seat matrix and intake | **Two-level**: Course-level + Combination-level. Teacher-count constraint. 75/25 HP quota. Supernumerary flag for Single Girl Child |
| 1.4 | Reservation and category master | HP taxonomy + **1-120 roster** (EWS pos 1, SC pos 7). SC/ST above cutoff → general seat |
| 1.5 | Eligibility rule engine | Marks + stream (PCM/PCB hard gate) + subjects + age, **enforced at form-submission time**, not just scrutiny |
| 1.6 | Document checklist rules | Conditional requirements by category, board, gap year, domicile |
| 1.7 | Admission cycle and schedule | Phase state machine. 10-day application window, same-day merit, 3-day rounds |

#### PKG-2 Student Application Portal

| Mod | Module | Priority | V1 behaviour |
|---|---|---|---|
| 2.1 | Public landing and discovery | P0 | Govt Degree + Sanskrit colleges together; combination-level seat view |
| 2.2 | Student registration and auth | P0 | **Email is primary identifier**; mobile + email OTP |
| 2.3 | Student profile builder | P0 | 5-step form; best-of-five **self-declared**; CGPA→% for CBSE; built-in calculators |
| 2.4 | Document vault | P1 | Dynamic checklist; per-doc lifecycle; in-app camera with guide; auto-compression |
| 2.5 | Eligibility matcher | P1 | Hard gates at application time; combination-level availability shown |
| 2.6 | Preference ranker | P1 | **Preferences are combinations, not courses**. Max 6 for BA, 3 for BSc. Separate application per course type |
| 2.7 | Application submission and payment | P1 | Rs 50 BA/BSc/BCom, Rs 300 BCA/BBA. Conditional accept re-opens fields |
| 2.8 | Student dashboard | P1 | Three scrutiny outcomes; fee link after admin approval; roll number on payment |

#### PKG-3 Admission Processing (all P2)

| Mod | Module | V1 behaviour |
|---|---|---|
| 3.1 | Application scrutiny console | **Parallel scrutiny with intake**. Three outcomes: Accept / Conditional Accept / Reject. BoF cross-check against marksheet |
| 3.2 | Merit generation engine | Merit **per combination**, not per course. Same-day publish. 1-120 roster auto-applied |
| 3.3 | Seat allocation and rounds | "Counselling" = fee-link activation (not physical). 42 fee heads. Roll number on payment. Same applicant pool across rounds |
| 3.4 | Withdrawal and fee refund | Full refund within 1 month. Physical bank verification to avoid cyber-café refund issue |
| 3.5 | College admission dashboard | Combination-level fill. 42-head revenue tracker. Covers RFP b.2 |

#### PKG-7, PKG-9, PKG-10

| Mod | Module | Priority | V1 scope |
|---|---|---|---|
| 7.4 | Finance and reconciliation | Ph2 | Read-only surface; transaction list + reconciliation status |
| 9.1 | State analytics and GER dashboard | Ph2 | Read-only aggregated dashboard. Covers RFP f.1, f.2, g.2 |
| 10.1 | User and role management | P1 | Full in V1 |
| 10.2 | Notification and alerts | P1 | SMS + email + in-app, bilingual templates |
| 10.3 | Audit and activity log | P1 | Append-only; every write logged |
| 10.4 | External integrations | P1 | Stubs + health dashboard for Treasury, DigiLocker, HPU ERP, scholarship |
| 10.5 | Report and export engine | Ph2 | CSV/PDF export on lists and merit/allotment |
| 10.6 | Data migration toolkit | P0 | Bulk Excel import for colleges, courses, combinations, seats |
| 10.7 | Grievance and helpdesk | Ph2 | Ticket create + view; SLA deferred |
| 10.8 | Training and capacity building | P1 | Nodal officer registry + training session scheduler |

### 2.3 V1 decisions anchored to source documents

| Decision | Source | Implication |
|---|---|---|
| BA admission is **combination-based** | Sanjauli field visit (60 combinations, 600 seats) | `SubjectCombination` and `CombinationSeat` are V1 entities |
| Email is primary identifier | Sanjauli field visit ("phones change hands") | Registration uses email + mobile OTP, not mobile-only |
| Best-of-five is self-declared | Sanjauli field visit | V1 does not compute BoF from subject marks; admin cross-checks during scrutiny |
| Scrutiny runs in parallel with intake | Sanjauli field visit | Scrutiny console is live from Day 1 of application window |
| Three scrutiny outcomes | Sanjauli field visit | Accept / Conditional Accept (edit allowed) / Reject (fee lost, re-apply) |
| 42 fee heads for admission fee | Sanjauli field visit | Fee engine renders breakup, not lump sum |
| "Counselling" = fee-link generation | Sanjauli field visit | Allotment flow ends at fee-link activation |
| 75/25 HP quota is **domicile-based** | Sanjauli field visit (resolves BRD ambiguity) | Domicile certificate drives quota, not school location |
| Single Girl Child is supernumerary | RKMV + Sanjauli prospectuses | Seat matrix supports "supernumerary over and above" flag |
| NIOS accepted if all 5 subjects passed | Sanjauli prospectus | Eligibility engine supports `board = NIOS` branch |
| Compartment/failed students ineligible | Both prospectuses | Eligibility blocks at form-submission |
| College-level override on eligibility | Both prospectuses (BCom thresholds differ) | `EligibilityRule` can be defined at `CourseOffering`, not only `Course` |

---

## 3. Roles and permissions

### 3.1 V1 roles (7 total)

| Role | Surface | Primary V1 job |
|---|---|---|
| Student | SwiftChat | Apply, upload, track, respond to allotment, pay |
| State Admin | Web portal | System config, cycle management, merit and allocation runs |
| College Admin (Principal) | Web portal | College-level config oversight, approver visibility, college dashboard |
| College Operator (Scrutiny Reviewer) | Web portal | Stream-specific application verification, discrepancy marking |
| Convenor / Approver | Web portal | Final approval on verified applications, exception handling |
| Finance User | Web portal | Payment reconciliation, refund approval |
| DHE Secretary | Web portal (read-only) | State analytics and GER dashboards |

Public is not a role — it is an unauthenticated surface accessing the discovery and eligibility pre-check screens.

### 3.2 Permission matrix (condensed)

Legend: `✓` = full access, `R` = read-only, `—` = no access.

| Module | Student | Operator | Convenor | College Admin | State Admin | Finance | DHE |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1.1–1.7 (Config) | R (via discovery) | R | R | R (own college) | ✓ | — | R |
| 2.2 Registration | ✓ (self) | — | — | — | — | — | — |
| 2.3 Profile | ✓ (own) | R (verify) | R | — | — | — | — |
| 2.4 Documents | ✓ (own) | R + reject | R | — | — | — | — |
| 2.5 Eligibility matcher | ✓ (own) | — | — | — | — | — | — |
| 2.6 Preferences | ✓ (own) | R | R | — | — | — | — |
| 2.7 Submission + payment | ✓ (own) | R | R | R | R | R | — |
| 2.8 Student dashboard | ✓ (own) | — | — | — | — | — | — |
| 3.1 Scrutiny | — | ✓ (own stream) | ✓ (final) | R | R | — | — |
| 3.2 Merit | R (results) | R | R | R (own) | ✓ (run + publish) | — | R |
| 3.3 Allocation | ✓ (respond) | R | R | R | ✓ (run rounds) | — | R |
| 3.4 Withdrawal/refund | ✓ (initiate) | — | — | R | R | ✓ (process) | — |
| 3.5 College dashboard | — | R | R | ✓ (own) | R (all) | — | R |
| 7.4 Finance recon | — | — | — | R (own) | R | ✓ | — |
| 9.1 State analytics | — | — | — | R (own) | ✓ | — | R |
| 10.1 User mgmt | — | — | — | ✓ (own users) | ✓ (all) | — | — |
| 10.2 Notifications | R (own) | R (own) | R (own) | R | ✓ (templates) | R | — |
| 10.3 Audit log | — | R (own) | R | R (own) | ✓ | — | — |
| 10.4 Integrations | — | — | — | R | ✓ | — | — |
| 10.5 Reports | — | R (own stream) | R | R (own) | ✓ | R (finance) | R |
| 10.6 Data migration | — | — | — | — | ✓ | — | — |
| 10.7 Grievance | ✓ (raise) | R (own) | R | ✓ | ✓ (escalate) | — | — |
| 10.8 Training | — | — | — | R | ✓ | — | R |

---

## 4. Product architecture

### 4.1 Module-to-surface mapping

| Mod | Module | SwiftChat | Web Portal | Shared Backend |
|---|---|:---:|:---:|:---:|
| 1.1 College registry | — | ✓ | ✓ |
| 1.2 Courses/combinations/offerings | — (read discovery) | ✓ | ✓ |
| 1.3 Seat matrix | — (read discovery) | ✓ | ✓ (live vacancy) |
| 1.4 Reservation master | — | ✓ | ✓ (roster engine) |
| 1.5 Eligibility rules | — (consume) | ✓ | ✓ (evaluator) |
| 1.6 Document rules | — (consume) | ✓ | ✓ (checklist gen) |
| 1.7 Admission cycle | — (consume phase) | ✓ | ✓ (phase state machine) |
| 2.1 Public landing | (pre-login home) | **Web landing** + QR to SwiftChat | — |
| 2.2 Registration/auth | ✓ | — | ✓ (identity, OTP) |
| 2.3 Profile builder | ✓ | — | ✓ (profile persistence) |
| 2.4 Document vault | ✓ (upload) | ✓ (scrutiny reads) | ✓ (object storage) |
| 2.5 Eligibility matcher | ✓ | — | ✓ |
| 2.6 Preference ranker | ✓ | — | ✓ |
| 2.7 Submission + payment | ✓ | — | ✓ (state machine, gateway) |
| 2.8 Student dashboard | ✓ | — | — |
| 3.1 Scrutiny console | — | ✓ | — |
| 3.2 Merit generation | — | ✓ | ✓ (engine + roster) |
| 3.3 Allocation + rounds | ✓ (response) | ✓ (State Admin) | ✓ (allocation engine) |
| 3.4 Withdrawal + refund | ✓ (initiate) | ✓ (Finance) | ✓ |
| 3.5 College dashboard | — | ✓ | — |
| 7.4 Finance reconciliation | — | ✓ | ✓ |
| 9.1 State analytics / GER | — | ✓ | ✓ |
| 10.1 User / role mgmt | — | ✓ | ✓ |
| 10.2 Notification engine | ✓ (in-app) | ✓ (in-app) | ✓ (template + gateways) |
| 10.3 Audit log | — | ✓ (read) | ✓ (append-only) |
| 10.4 External integrations | — (indirect) | ✓ (health) | ✓ |
| 10.5 Report/export | — | ✓ | ✓ |
| 10.6 Data migration | — | ✓ | ✓ |
| 10.7 Grievance | ✓ (student) | ✓ (admin queue) | ✓ |
| 10.8 Training | — | ✓ | — |

### 4.2 Surface summary

| Surface | V1 modules owned | V1 modules consumed (read) |
|---|---|---|
| SwiftChat Student Mini App | 10 | 7 |
| Official Web Portal | 18 | 2 |

### 4.3 Backend services (V1 logical grouping)

| Service | V1 modules | Primary consumers |
|---|---|---|
| Identity & Authorization | 2.2, 10.1, 10.3 | Both surfaces |
| Master Data | 1.1, 1.2, 1.3, 1.4, 1.6, 10.6 | Both |
| Rule Engine | 1.5, 1.4 (roster), 1.6 (evaluator) | Portal (config), SwiftChat (consume) |
| Cycle & Phase | 1.7 | Both (gates actions) |
| Student Profile & Documents | 2.3, 2.4 | SwiftChat write, portal read |
| Application Workflow | 2.6, 2.7, 2.8, 3.1, 3.3, 3.4 | Both |
| Merit & Allocation | 3.2, 3.3 | Portal runs, SwiftChat reads |
| Payment & Finance | 2.7, 3.4, 7.4 | Both |
| Notification | 10.2 | Both |
| Analytics & Reporting | 3.5, 9.1, 10.5 | Portal only |
| Integration Layer | 10.4 | Portal + internal |

---

## 5. Key product truths

These are the non-negotiables that every decision, every screen, every copy string must honour.

1. **Unified state platform, not college-wise silos.** One student identity, one login, one application per course type.
2. **Student experience is mobile-first and guided.** Students using low-end Android phones, low bandwidth, limited digital confidence — they must succeed.
3. **Admin experience is operational.** Queues, filters, audit trails, scrutiny workbench, approvals.
4. **Rules are configurable.** State-level defaults with college-level overrides where policy permits. No hard-coded eligibility or fees.
5. **The demo must prove centralisation value**, not just show static UI.
6. **Locally relevant to HP.** Districts, reservation nuances, domicile rules, Hindi-first where students need it.
7. **First-generation digital users are the design brief.** If a fourteen-year-old in Solan can't do it alone, the UX has failed.
8. **Reduce confusion, don't add it.** Every ambiguous state needs explicit copy. Every error needs a specific next step.
9. **Bilingual support and low-tech usability are core, not optional.** No feature ships without a Hindi pass and a "Asha test" (see §7.5).

---

## 6. User journeys

### 6.1 Student journey — the 11 stages

| # | Stage | Module(s) | Key moments |
|---|---|---|---|
| 1 | Discover & orient | 2.1 | Pre-login home, dates, colleges count, language selector |
| 2 | Register | 2.2 | Email + mobile, dual OTP, account created |
| 3 | Profile builder (5 steps) | 2.3 | Personal → Address → Academic → Reservation → Bank. Built-in BoF calculator and CBSE CGPA converter. |
| 4 | Document vault | 2.4 | Dynamic checklist, in-app camera with guide, auto-compression, preview-confirm |
| 5 | Eligibility discovery | 2.5 | Three buckets (eligible / conditional / not), plain-language reasons |
| 6 | Preference ranking | 2.6 | **Combinations for BA**, max 6. Multi-course application hub for BA/BSc/BCom/BCA |
| 7 | Review, submit, pay | 2.7 | Sectioned review with edit links, declaration, fee breakdown, 3-outcome payment |
| 8 | Dashboard & status | 2.8 | Status tracker + next-action card + notifications |
| 9 | Merit & allotment response | 3.3 | Freeze / Float / Decline with plain-language subtitles; double-confirm on Decline |
| 10 | Admission fee & confirmation | 3.3 | 42-head fee breakup (collapsed default), roll number on payment, provisional letter |
| 11 | Later rounds + withdrawal edge | 3.3, 3.4 | Float upgrades; withdrawal with physical verification |

### 6.2 Student journey — 15 low-tech friction points

Ordered by severity. Every item has a V1 simplification built into the design.

| # | Friction | Stage | Severity | V1 simplification |
|---|---|---|---|---|
| 1 | Best-of-five self-declaration confusion | Profile 3 | High | Built-in calculator with one-tap copy to form |
| 2 | Blurry document photos rejected | Documents | High | In-app camera with corner alignment + forced preview |
| 3 | Payment failure anxiety / double-charge | Submit | High | Unambiguous status page + "don't pay again" banner |
| 4 | Freeze/Float/Decline terminology | Allotment | High | Plain-language card-based choice + double-confirm on Decline |
| 5 | Family phone / shared OTP | Register | High | Email-first design; OTP auto-paste from SMS |
| 6 | Stream mis-selection blocking later | Profile 3 | High | Stream picker with icon + example subjects + warning if inconsistent |
| 7 | Separate BA/BSc applications confusion | Preferences | High | Upfront multi-course hub card with clear fee preview |
| 8 | APAAR ID unknown | Profile 1 | Medium | Optional in V1; in-line explainer |
| 9 | CBSE CGPA mistyped as percentage | Profile 3 | Medium | Automatic converter |
| 10 | Drag-to-reorder on small screens | Preferences | Medium | Up/Down arrows primary; drag secondary |
| 11 | 42 fee heads overwhelming | Fee payment | Medium | Collapsed total with expand option |
| 12 | "Conditional Accept" misread as rejection | Dashboard | Medium | Plain-language copy + green accent |
| 13 | Cyber-café payment → refund risk | Bank details | Medium | Prominent pre-payment warning |
| 14 | Low-bandwidth upload stall | Documents | Medium | Auto-compression, resumable chunked upload |
| 15 | PIN / district / tehsil confusion | Profile 2 | Low | District dropdown (HP first), PIN finder link |

### 6.3 Student journey — assisted mode pattern (cyber cafés and parents)

Sanjauli data: 30–40% of applications are filled with help from a cyber café operator or a relative. V1 handles this without a separate role:

- Student logs in with own email/mobile; operator uses student's credentials.
- **"Review with someone" step** before final submission — 60-second static summary screen, designed to be read aloud.
- **OTP confirmation at submission** — sent to student's mobile even inside the café session; blocks rogue submissions if student absent.
- **Post-submission SMS/WhatsApp** to student's mobile with application number + link — restores ownership.

### 6.4 College official journey — 10 stages

| # | Stage | Key action |
|---|---|---|
| 1 | Login | Role-based landing |
| 2 | Live queue monitoring | Watch applications arrive during parallel scrutiny |
| 3 | Pick application | Open detail tabs (Personal, Academic, Reservation, Documents, History) |
| 4 | Verify field-by-field | Verify / flag each field; verify / reject each document |
| 5 | Resolve outcome | Accept / Conditional Accept / Reject (Sanjauli three outcomes) |
| 6 | Convenor approval | Final approve / return. Convenor is senior-most on committee |
| 7 | Watch college dashboard | Combination-level fill, discrepancy rates, deadlines |
| 8 | Merit day | State admin runs merit; college reviews pre-publication |
| 9 | Counselling approval | Post-allotment, admin approves → triggers student fee link |
| 10 | Fee paid → roll no. | Auto-generated on payment success |

### 6.5 State official journey — 14 stages

Pre-cycle setup → Load master data → Configure policy → Set up users → Configure templates → Open registration → Open application (scrutiny starts in parallel) → Monitor intake → Close application → Run merit (same-day) → Run Round 1 → Round 2 → Round 3/mop-up → Close cycle.

---

## 7. Bilingual and low-tech UX principles

### 7.1 Language strategy

| Aspect | Decision |
|---|---|
| Default language | SwiftChat device language; prompt on first launch if unknown |
| Switch affordance | Globe icon top-right, persistent. Also in profile sheet. |
| Switch behaviour | Immediate, no reload, no modal confirm |
| Persistence | `Student.preferred_language`, syncs across devices |
| Where it hides | Third-party payment gateway iframes only |

### 7.2 What is bilingual in V1 (explicit)

**Must be bilingual:**
All CTA button labels, all form field labels, all error messages, all helper text and examples, all status labels, all notifications (in-app + SMS), all discrepancy reasons, declaration/consent text, allotment decision terms, fee head names (42).

**English-only is acceptable:**
College and department names (official names on marksheets), course codes (BA, BSc, BCA, BBA, BVoc), subject names inside combinations (names as printed on marksheets), transaction IDs, application numbers, roll numbers, IFSC/PIN/Aadhaar/APAAR inputs (format-constrained), email addresses.

### 7.3 Hindi copy principles

- Sadharan Hindi (everyday), not Shuddh Hindi (literary Sanskritised).
- Numbers stay Western Arabic (`26`, not `२६`) — universally understood, keeps layouts predictable.
- Use formal `आप`, never informal `तुम`.
- Sentence length ~30% shorter than English equivalent — Hindi on mobile takes more visual space.
- Mixed-script acceptance in helper text only (e.g., `10+2 का marksheet upload करें`). Buttons stay pure Hindi.

### 7.4 English copy principles

- Plain English, not bureaucratic. Target Hemingway level 5 or below.
- Active voice: "Upload your marksheet", not "The marksheet should be uploaded".
- Indian number format (Rs 2,500).
- Dates as `26 June 2026, Friday, 5:00 PM` — day of week spelled out.

### 7.5 Simple-mode design principles for student app (the "Asha test")

Every student screen in V1 passes all seven or it doesn't ship.

1. One primary action per screen — one big button at the bottom.
2. No jargon without a bilingual inline glossary link.
3. Examples beat explanations — "DOB (e.g., 12/08/2007)" beats "enter day/month/year".
4. Progress over perfection — every screen has a visible way forward, even on error.
5. Autosave is invisible and reliable — no "unsaved changes" anxiety.
6. Defaults do the thinking — domicile = HP, correspondence = permanent, language = device.
7. Every risky action has a double-confirm with stated consequences.

### 7.6 Standard terminology (Hindi)

| English | Hindi | Note |
|---|---|---|
| Application | आवेदन | Never use पंजीकरण for this |
| Registration | पंजीकरण | Signup step only |
| Submit | जमा करें | Primary action verb |
| Upload | अपलोड करें | Keep English loan word |
| Document | दस्तावेज़ | |
| Verify / Verification | सत्यापन | Noun; verb = सत्यापित करें |
| Merit list | मेरिट सूची | Keep "merit" transliteration |
| Allotment | सीट आवंटन | |
| Freeze (seat) | सीट स्वीकारें | Never literal "freeze" |
| Float | अस्थायी स्वीकार | Never literal "float" |
| Decline | अस्वीकार | |
| Deadline | अंतिम तिथि | |
| Fee | शुल्क | |
| Discrepancy | कमी / त्रुटि | कमी = missing; त्रुटि = wrong |
| Confirmed | पक्का / पुष्टि | "Admission confirmed" → प्रवेश पक्का |

### 7.7 Text expansion and layout rules

- Button minimum height: `48px`. Line-height `1.3` for Devanagari.
- Input fields minimum height: `56px`.
- Labels can wrap to 2 lines; no ellipsis on student screens.
- Every student screen tested at `400px` viewport in both languages.

### 7.8 Low-bandwidth rules

- Initial mini-app bundle < 400 KB, code-split by route.
- Images lazy-load; college logos fall back to text initials.
- Minimal web font use — Montserrat where cached, Noto Sans Devanagari self-hosted, system-font fallback.
- Autosave uses IndexedDB queue; replays on reconnect; shows "Saved locally" offline indicator.
- Document uploads resumable with 2 MB chunks.
- Payment page shows "Network slow?" banner after 15s of no response.
- Critical screens render server-side shell so status tracker appears within 3s on 2G.

### 7.9 Accessibility rules

- WCAG AA contrast minimum, validated in all states (enabled, hover, pressed, disabled).
- Minimum tap target `44 × 44px`.
- Focus ring visible for keyboard users.
- Font-size respects system setting (use `rem`, not fixed px).
- Colour-blind safety: status always uses icon + colour + label.
- Motion respects `prefers-reduced-motion`.
- No auto-advancing carousels.

---

## 8. Data model

19 core entities + 2 cross-cutting logs. Deliberately lean. No premature normalisation. No Phase 2 entities.

### 8.1 Entity map

```
SYSTEM CONFIG              STUDENT JOURNEY        ADMISSION PROCESSING
├─ College                 ├─ Student             ├─ VerificationRecord
├─ Department              ├─ Document            ├─ MeritList + MeritRank
├─ Course                  ├─ Application         └─ Allotment
├─ SubjectCombination      ├─ Preference
├─ CourseOffering          └─ Payment             IDENTITY & LOGS
├─ SeatMatrix + CombinationSeat                   ├─ User + Role
├─ ReservationCategory + RosterTemplate           ├─ Notification
├─ EligibilityRule                                └─ AuditEntry
├─ DocumentRule
└─ AdmissionCycle + Phase
```

### 8.2 Entity specs (condensed)

#### System configuration

| Entity | Key fields | Created by |
|---|---|---|
| **College** | `college_id`, `aishe_code`, `name_en`, `name_hi`, `type`, `district`, `address_*`, `contact_*`, `principal_name`, `logo_url`, `prospectus_pdf_url`, `is_active` | State Admin |
| **Department** | `department_id`, `college_id`, `name`, `type` | State Admin |
| **Course** | `course_id`, `code`, `name_en`, `name_hi`, `level`, `duration_years`, `stream_required` (None/PCM/PCB/Arts/Commerce), `base_eligibility_note` | State Admin |
| **SubjectCombination** | `combination_id`, `college_id`, `course_id`, `subject_a`, `subject_b`, `bucket_a`, `bucket_b`, `display_name_*`, `is_active`. Rule: `bucket_a != bucket_b` | State Admin (per college) |
| **CourseOffering** | `offering_id`, `college_id`, `course_id`, `cycle_id`, `application_fee`, `min_marks_override`, `eligibility_override_ref`, `is_active` | State Admin |
| **SeatMatrix** | `matrix_id`, `offering_id`, `category_id`, `total_seats`, `supernumerary_flag` | State Admin |
| **CombinationSeat** | `combination_seat_id`, `combination_id`, `category_id`, `total_seats`, `seats_filled`, `seats_vacant` | College Admin |
| **ReservationCategory** | `category_id`, `code`, `name_*`, `percentage`, `inter_se_priority`, `is_supernumerary`, `required_docs_ref` | State Admin |
| **RosterTemplate** | `position_number` (1–120), `category_id`, `cycle_id` | State Admin |
| **EligibilityRule** | `rule_id`, `course_id` OR `offering_id`, `min_marks_percentage`, `required_stream`, `required_subjects_json`, `max_age`, `category_relaxations_json`, `notes` | State Admin |
| **DocumentRule** | `rule_id`, `doc_type`, `name_*`, `condition_json`, `is_mandatory_if_match`, `accepted_formats`, `max_size_mb`, `instructions_*` | State Admin |
| **AdmissionCycle** | `cycle_id`, `name`, `academic_year`, `is_current` | State Admin |
| **Phase** | `phase_id`, `cycle_id`, `name`, `start_at`, `end_at`, `state` (pending/active/closed) | State Admin |

#### Student journey

| Entity | Key fields |
|---|---|
| **Student** | Identity: `student_id`, `email`, `mobile`, `password_hash`, `email_verified`, `mobile_verified`, `preferred_language` (en/hi). Personal: `full_name`, `father_name`, `mother_name`, `dob`, `gender`, `aadhaar`, `apaar_id`. Contact: `address_permanent_json`, `address_corr_json`, `district`, `pincode`. Academic: `board`, `year_of_passing`, `roll_number`, `stream`, `subjects_studied_json`, `total_marks`, `marks_obtained`, `percentage_computed`, `best_of_five_declared`, `result_status`, `gap_years`. Claims: `category_primary`, `category_secondary`, `domicile_state`, `is_pwd`, `is_single_girl_child`, `is_ex_serviceman_ward`, `claims_detail_json`. Bank: `bank_account`, `bank_ifsc`, `bank_name`, `bank_account_holder` |
| **Document** | `document_id`, `student_id`, `doc_type`, `file_url`, `original_filename`, `size_bytes`, `mime_type`, `uploaded_at`, `status`, `rejection_reason_*`, `reviewed_by_user_id`, `reviewed_at`. Statuses: `not_uploaded / uploaded / under_review / verified / rejected / re_uploaded` |
| **Application** | `application_id` (e.g., `HP-ADM-2026-000147`), `student_id`, `cycle_id`, `course_id`, `submitted_at`, `status`, `application_fee_paid`, `payment_id`, `scrutiny_outcome`, `scrutiny_notes_*`, `last_edited_at`. Statuses: `draft / submitted / under_scrutiny / conditional_edit_open / verified / rejected / in_merit / excluded_from_merit / allotted / admission_confirmed / withdrawn` |
| **Preference** | `preference_id`, `application_id`, `rank_order`, `combination_id`, `offering_id`, `category_applied_under`, `is_allotted`, `allotment_id`. Max 6 for BA, 3 for BSc |
| **Payment** | `payment_id`, `student_id`, `application_id`, `allotment_id`, `purpose` (application_fee / admission_fee / refund), `amount`, `currency`, `fee_heads_json`, `gateway`, `gateway_ref`, `initiated_at`, `completed_at`, `status`, `is_refund`. Statuses: `initiated / pending / success / failed / reversed / reconciled` |

#### Admission processing

| Entity | Key fields |
|---|---|
| **VerificationRecord** | `verification_id`, `application_id`, `scope` (field / document / whole_application), `target_ref`, `reviewer_user_id`, `outcome`, `reason_*`, `created_at`, `is_convenor_final` |
| **MeritList** | `list_id`, `cycle_id`, `round_number`, `combination_id`, `category_id`, `published_at`, `cutoff_marks`. **Merit per combination, not per course** |
| **MeritRank** | `rank_id`, `list_id`, `application_id`, `student_id`, `rank`, `merit_score`, `tie_broken_by` (marks_subject / dob / none) |
| **Allotment** | `allotment_id`, `application_id`, `preference_id`, `combination_id`, `category_allotted`, `round_number`, `offered_at`, `response_deadline`, `student_response` (pending / freeze / float / decline / auto_cancelled), `counselling_approved_at`, `counselling_approved_by`, `fee_link_activated_at`, `admission_payment_id`, `roll_number` |

#### Identity and logs

| Entity | Key fields |
|---|---|
| **User** | `user_id`, `email`, `phone`, `password_hash`, `name`, `role_id`, `assigned_college_id` (nullable), `is_active`, `last_login_at` |
| **Role** | `role_id`, `code` (state_admin / college_admin / operator / convenor / finance / dhe_secretary), `name`, `permissions_json` |
| **Notification** | `notification_id`, `recipient_type`, `recipient_id`, `channel` (sms / email / in_app / whatsapp), `template_code`, `variables_json`, `subject`, `body_en`, `body_hi`, `status`, timestamps, `related_entity_ref` |
| **AuditEntry** | `audit_id`, `actor_type`, `actor_id`, `action_code`, `entity_type`, `entity_id`, `before_json`, `after_json`, `occurred_at`, `ip_address`, `user_agent`. Append-only. |

### 8.3 Relationship map

```
College 1─N CourseOffering N─1 Course
College 1─N SubjectCombination N─1 Course
CourseOffering 1─N SeatMatrix N─1 ReservationCategory
SubjectCombination 1─N CombinationSeat N─1 ReservationCategory
AdmissionCycle 1─N Phase
AdmissionCycle 1─N CourseOffering
Course 1─N EligibilityRule
ReservationCategory 1─N DocumentRule

Student 1─N Document
Student 1─N Application
Application 1─N Preference N─1 SubjectCombination
Application 1─N VerificationRecord
Application 1─1 Payment (application fee)
Application 1─N Allotment (one per round)
Allotment 1─1 Payment (admission fee)

User N─1 Role
User 1─N VerificationRecord (as reviewer)

Notification N─1 (Student or User)
AuditEntry N─1 (any entity, polymorphic)
```

### 8.4 Deliberate V1 simplifications

| Not done | Why fine for V1 |
|---|---|
| No separate SubjectMark table | BoF self-declared; marks stored as JSON on Student |
| No separate FeeHead master | 42 heads in JSON on Payment |
| No separate Permission table | 6 roles, permissions fit in JSON on Role |
| No document versioning table | Re-uploads replace file; audit log preserves history |
| No address normalisation | Addresses as JSON; no query use case yet |
| No separate refund entity | Refund = Payment with `is_refund = true` |
| No multi-language Subject master | Subject names are English (marksheet convention) |
| No event sourcing | AuditEntry covers legal/governance needs |
| No workflow engine | State transitions in application code; 3 enums are enough |

---

## 9. Screen inventory

**Legend:** **P** = Polish (fully built), **S** = Semi-functional (pre-seeded), **M** = Mocked, **B** = Bilingual required V1, **E** = English OK V1, **B\*** = Bilingual recommended.

Total: **60 polish + 21 semi-functional + 7 mocked = 88 screens across both surfaces.**

### 9.1 Student mini app (SwiftChat) — 42 screens

| # | Screen | Purpose | Demo | i18n |
|---|---|---|---|---|
| S-01 | Mini app splash | Brand entry, auto-routes | P | B |
| S-02 | Language selector (first-run) | Pick English or Hindi | P | B |
| S-03 | Pre-login home | Orientation + CTAs | P | B |
| S-04 | Important dates | Read-only timeline | P | B |
| S-05 | Seat matrix explorer | Discover seats by district/college | P | B\* |
| S-06 | Eligibility pre-check (no login) | Self-check in 3 questions | P | B |
| S-07 | Register | Create account | P | B |
| S-08 | OTP verify (mobile) | Verify mobile | P | B |
| S-09 | OTP verify (email) | Verify email | P | B |
| S-10 | Login | Return users | P | B |
| S-11 | Forgot password | Reset flow | P | B |
| S-12 | Welcome / first action | Route new user | P | B |
| S-13 | Dashboard (post-login home) | Status tracker + next-action | P | B |
| S-14 | Profile Step 1 — Personal | Capture personal | P | B |
| S-14a | Category picker sheet | Plain-language category choice | P | B |
| S-15 | Profile Step 2 — Address | Capture address | P | B |
| S-16 | Profile Step 3 — Academic | Capture class 12 | P | B |
| S-16a | Best-of-Five calculator | Compute BoF inline | P | B |
| S-16b | CBSE CGPA converter | Convert CGPA → % | P | B |
| S-17 | Profile Step 4 — Reservation | Claims and certificate details | P | B |
| S-18 | Profile Step 5 — Bank | Bank details + cyber-café warning | P | B |
| S-19 | Document checklist | Required docs + status | P | B |
| S-20 | Document upload (per doc) | Camera/gallery tabs | P | B |
| S-20a | In-app camera with corner guide | Guided capture | P | B |
| S-20b | Document preview & confirm | Verify clarity | P | B |
| S-21 | Document rejection detail | Why + re-upload CTA | P | B |
| S-22 | Eligibility results | 3 buckets, filter, sort | P | B |
| S-23 | College detail | College profile + courses | P | B\* |
| S-24 | Course detail (with combinations for BA) | Combinations + seat availability | P | B\* |
| S-25 | Multi-course application hub | Opt-in per course with fees | P | B |
| S-26 | Preference selection | Add eligible combinations | P | B |
| S-27 | Preference ranking | Reorder with arrows + drag | P | B |
| S-28 | Application review | Sectioned summary with edit links | P | B |
| S-29 | Declaration & fee | Legal confirm + fee breakdown | P | B |
| S-30 | Payment gateway (wrapper) | Third-party iframe | P | E (gateway) |
| S-31 | Payment success | Confirmation + app number | P | B |
| S-32 | Payment pending | Reassurance + auto-refresh | P | B |
| S-33 | Payment failed | Retry with alt methods | P | B |
| S-34 | Allotment offer | Seat + deadline + 3 choices | P | B |
| S-35 | Decline confirm (double) | Safety net | P | B |
| S-36 | Admission fee breakdown | 42 heads collapsed | P | B |
| S-37 | Admission confirmation | Roll number + letter | P | B |
| S-38 | Notification centre | Chronological list | P | B |
| S-39 | My applications (multi-course) | Per-course status | P | B |
| S-40 | Help / FAQs | Self-serve support | P | B |
| S-41 | Glossary sheet | Plain-language term lookup | P | B |
| S-42 | Profile view (self) | Read-own profile | P | B |

### 9.2 Web portal — 44 screens

#### 9.2.1 Public web landing

| # | Screen | Demo | i18n |
|---|---|---|---|
| W-01 | Public landing | P | B |
| W-02 | Seat matrix explorer (web) | P | B\* |
| W-03 | Eligibility guide | P | B\* |
| W-04 | FAQs | P | B\* |
| W-05 | Prospectus downloads | S | E |

#### 9.2.2 Login + shared

| # | Screen | Demo |
|---|---|---|
| W-06 | Portal login | P |
| W-07 | 403 Unauthorised | S |
| W-08 | 404 | S |

#### 9.2.3 State admin screens

| # | Screen | Demo |
|---|---|---|
| W-09 | State dashboard | M |
| W-10 | Cycle setup | S (live phase toggle) |
| W-11 | College registry list | S |
| W-12 | College detail/edit | S |
| W-13 | Course master list | S |
| W-14 | Course detail + combinations | S |
| W-15 | Seat matrix config | S |
| W-16 | Reservation master | S |
| W-17 | Roster template (1-120) | S |
| W-18 | Eligibility rules list | S |
| W-19 | Eligibility rule builder | S |
| W-20 | Document rules list | S |
| W-21 | User management | S |
| W-22 | User add/edit | S |
| W-23 | Role + permission matrix | S |
| W-24 | Notification templates | S |
| W-25 | Data migration wizard | S |
| W-26 | Merit generation console | P |
| W-27 | Merit preview | P |
| W-28 | Allocation round runner | P |
| W-29 | Allocation preview | P |
| W-30 | Integration health | M |
| W-31 | Audit log viewer | M (live-populated) |
| W-32 | Reports/exports | M |
| W-33 | Training / nodal officers | M |

#### 9.2.4 College (Admin / Operator / Convenor)

| # | Screen | Demo |
|---|---|---|
| W-34 | College dashboard | P |
| W-35 | Application queue | P |
| W-36 | Application detail (tabs) | P |
| W-37 | Document scrutiny panel | P |
| W-38 | Discrepancy raise modal | P (text is bilingual) |
| W-39 | Outcome modal (3 outcomes) | P |
| W-40 | Convenor queue | P |
| W-41 | Convenor approval | P |
| W-42 | Combination seat fill view | P |
| W-43 | Counselling approval | P |

#### 9.2.5 Finance

| # | Screen | Demo |
|---|---|---|
| W-44 | Finance reconciliation | M |

### 9.3 Shared/system screens — 3

| # | Screen | Demo |
|---|---|---|
| Sh-01 | Maintenance notice | — |
| Sh-02 | Global error | S |
| Sh-03 | Notification delivery log (admin) | M |

---

## 10. UI/UX patterns

### 10.1 Navigation

**SwiftChat mini app** — no top-level menu. The dashboard IS the app. Bottom tab bar with exactly 3 tabs: **Home / My Applications / Help**. Persistent language switcher top-right. Top-left avatar opens a minimal profile sheet. Hardware back always returns to previous screen or dashboard; never exits mid-flow.

**Web portal** — left sidebar + breadcrumb. Role-filtered sidebar (hide, don't grey out). Top bar with college/cycle context, global search, user menu, notifications. Deep-link stable URLs for every screen.

### 10.2 Form patterns

**Student forms:**
1. One primary action per screen. One question per screen for high-risk fields (stream, category, SGC, domicile).
2. Progress indicator always visible — "Step 2 of 5" + percentage bar.
3. Autosave on blur + every 30 seconds; no "Save draft" button.
4. Field-level validation on blur (not only on submit). Inline errors below field.
5. Helper text always visible on complex fields (mobile has no hover).
6. Examples in placeholder; cleared on focus.
7. Error state = icon + colour + label.
8. Primary CTA is always full-width at bottom.
9. No dropdowns with > 8 options on mobile — use bottom sheets with search.

**Admin forms:**
1. Label-left, field-right two-column on desktop; single column under 1024px.
2. Inline validation after first submit attempt only.
3. Explicit Save + Save and continue buttons.
4. Bulk CSV upload for every master data entity.
5. Rule-builder screens have test mode.
6. Keyboard shortcuts for scrutiny (Y/N/C).

### 10.3 Dashboards

**Student dashboard — three bands, fixed order:**
1. Status tracker (7-step horizontal pipeline, current step highlighted).
2. Next-action card (one action, big, bilingual, deadline visible).
3. Supporting info (last 3 notifications, quick links).

No data grids, no charts, no stats.

**College dashboard:** KPI strip → work queues (My pending, Awaiting convenor) → combination fill chart → deadlines strip.

**State dashboard:** Statewide KPIs (12 tiles covering RFP f.1, f.2, g.2) → district heatmap → college league table → category mix.

### 10.4 Status tracker

Seven canonical steps for student applications:

```
Registered → Profile complete → Submitted → Under scrutiny →
Merit published → Allotted → Admission confirmed
```

- Horizontal on wide screens; vertical on narrow phones.
- Icons + labels always; never icon-only.
- Current step: brand blue + pulse animation (respects `prefers-reduced-motion`).
- Completed: grey tick. Future: grey, no tick.
- If rejected: pipeline stops at current step with red marker + "Rejected".
- If conditional edit open: current step amber + "Action needed".

### 10.5 Discrepancy UX

Surfaced immediately on dashboard as an action card with:
1. One discrepancy per card.
2. Plain-language reason (never codes).
3. Exact next action as a button.
4. Deadline with day of week + calendar date + time.
5. Always bilingual, both languages shown together (not switchable).

Operators author discrepancies from a dropdown of common reasons per doc type (auto-generates bilingual text). Custom reasons use translation service with operator verification. Preview shows exactly what student will see.

### 10.6 Notifications

| Event | In-app | SMS | Email | WhatsApp |
|---|:---:|:---:|:---:|:---:|
| OTP | — | ✓ | ✓ | — |
| Registration success | ✓ | ✓ | ✓ | — |
| Application submitted | ✓ | ✓ | ✓ | — |
| Discrepancy raised | ✓ | ✓ | ✓ | ✓ (if opted-in) |
| Merit published | ✓ | ✓ | ✓ | ✓ |
| Seat allotted | ✓ | ✓ | ✓ | ✓ |
| Payment reminder (T-72h, T-24h, T-4h) | ✓ | ✓ | ✓ | ✓ |
| Admission confirmed | ✓ | ✓ | ✓ | ✓ |

SMS uses Hindi for `preferred_language = hi`, English otherwise. 160-char budget for English, 70-char for Hindi Unicode.

### 10.7 Chat-like vs form UI

| Interaction | UI mode |
|---|---|
| Data entry | Structured forms |
| Help / FAQs | Chat-like (SwiftChat native bubbles) |
| Eligibility pre-check | Brief chat-style quiz |
| Status updates | Card-based feed |
| Discrepancy resolution | Form + action cards |
| Onboarding hints | Chat-like coach marks |

Net: ~85% forms/cards, ~15% chat-style in the mini app.

### 10.8 Icon strategy

Icons + labels always. Never icons alone on student-facing surfaces. Use SwiftChat's existing icon style (rounded, 20×20, filled). No emoji in official communications (applications, discrepancies, allotment); emoji acceptable in onboarding welcome only.

### 10.9 Mandatory helper text fields

| Field | Helper |
|---|---|
| Name | Exactly as on marksheet |
| DOB | Format DD/MM/YYYY with example |
| Aadhaar | 12 digits, no spaces + optional tag |
| APAAR ID | Link to explainer + optional tag |
| Mobile | 10 digits, starting 6-9 |
| Email | "Use your own email, not your father's" |
| PIN | 6-digit + PIN-finder link |
| Best-of-five % | Calculator link |
| CBSE CGPA | Converter link |
| Stream | Cannot be changed after submission |
| Category | Pick the one you have a certificate for |
| IFSC | 11-character bank code on passbook |
| Bank account holder | Must match account holder name |

---

## 11. Frontend architecture and build plan

### 11.1 Tech stack (demo-grade)

| Layer | Choice |
|---|---|
| Student mini app | Next.js 14 (App Router) + TailwindCSS + shadcn/ui |
| Web portal | Next.js 14 + TailwindCSS + shadcn/ui + TanStack Table |
| Public web landing | Next.js (same repo, different route group) |
| Styling | Tailwind + CSS variables from design tokens |
| Fonts | Montserrat (Latin) + Noto Sans Devanagari, self-hosted variable fonts |
| i18n | `next-intl` with JSON dictionaries |
| Mock API | MSW for static reads + Node/Express mock for stateful flows |
| Local persistence | `localStorage` + `IndexedDB` (via `idb`) |
| State | React Server Components + `@tanstack/react-query` (reads), Zustand (UI state) |
| Animations | `framer-motion` (light use) |
| Charts | Recharts |
| Maps | `react-simple-maps` with static HP TopoJSON |
| Payment gateway | Static mocked iframe (3 outcomes pickable) |
| SMS/WhatsApp sim | "Phone" panel in presenter mode |
| Deploy | Vercel (student + portal + landing) + Render (mock API) |

**Not in V1 demo:** no backend database, no real auth provider, no real payment gateway, no real SMS, no Docker/Kubernetes, no CI/CD beyond PR previews.

### 11.2 Repository structure

```
hp-he-mis/
├── apps/
│   ├── student/          # SwiftChat mini app (Next.js)
│   ├── portal/           # Official web portal (Next.js)
│   ├── public-web/       # Public landing (Next.js)
│   └── mock-api/         # Express stateful mock server
├── packages/
│   ├── ui/               # Shared shadcn components + HP-branded primitives
│   ├── design-tokens/    # CSS variables from the attached Color System
│   ├── i18n/             # en.json + hi.json dictionaries (shared)
│   ├── fixtures/         # Seed JSON for colleges, courses, combinations, students
│   └── types/            # Shared TypeScript types matching data model
└── docs/
    └── demo-script.md    # Presenter reference
```

pnpm workspaces + Turborepo. Three apps deployed independently; shared packages built once.

### 11.3 Student mini app — route tree

```
/                                 → Pre-login home (S-03)
/language                         → Language selector (S-02)
/register                         → Registration (S-07)
/register/verify-mobile           → OTP mobile (S-08)
/register/verify-email            → OTP email (S-09)
/login                            → Login (S-10)
/forgot-password                  → Forgot password (S-11)
/welcome                          → Post-register welcome (S-12)
/dashboard                        → Student dashboard (S-13) [auth]
/profile                          → Profile landing (S-42)
/profile/step/1..5                → Profile steps (S-14..S-18)
/profile/tools/bof-calculator     → BoF calculator (S-16a)
/profile/tools/cgpa-converter     → CGPA converter (S-16b)
/documents                        → Checklist (S-19)
/documents/upload/[docType]       → Upload flow (S-20, 20a, 20b)
/documents/rejection/[docId]      → Rejection detail (S-21)
/discover                         → Eligibility results (S-22)
/discover/college/[id]            → College detail (S-23)
/discover/course/[id]             → Course detail (S-24)
/apply                            → Multi-course hub (S-25)
/apply/[course]/preferences       → Preference selection (S-26)
/apply/[course]/rank              → Preference ranking (S-27)
/apply/[course]/review            → Review (S-28)
/apply/[course]/declaration       → Declaration (S-29)
/apply/[course]/pay               → Payment wrapper (S-30)
/apply/[course]/pay/result        → Payment result (S-31/32/33)
/allotment/[id]                   → Allotment offer (S-34)
/allotment/[id]/decline           → Decline confirm (S-35)
/allotment/[id]/fee               → Admission fee (S-36)
/allotment/[id]/confirmed         → Admission confirmation (S-37)
/applications                     → My applications (S-39)
/notifications                    → Notification centre (S-38)
/help                             → Help/FAQs (S-40)
/help/glossary                    → Glossary (S-41)
```

### 11.4 Web portal — route tree (grouped by role)

```
/login                                    → Portal login (W-06)
/                                         → Role-based landing

# State admin
/admin                                    → State dashboard (W-09)
/admin/cycle                              → Cycle setup (W-10)
/admin/colleges                           → College list (W-11)
/admin/colleges/[id]                      → College detail (W-12)
/admin/colleges/[id]/seat-matrix          → Seat matrix (W-15)
/admin/courses                            → Course master (W-13)
/admin/courses/[id]/combinations          → Combinations (W-14)
/admin/reservations                       → Reservation master (W-16)
/admin/reservations/roster                → Roster template (W-17)
/admin/eligibility                        → Rule list (W-18)
/admin/eligibility/[id]                   → Rule builder (W-19)
/admin/documents                          → Document rules (W-20)
/admin/users                              → User list (W-21)
/admin/users/[id]                         → User edit (W-22)
/admin/users/roles                        → Role matrix (W-23)
/admin/notifications/templates            → Templates (W-24)
/admin/data-migration                     → Bulk import (W-25)
/admin/merit                              → Merit console (W-26)
/admin/merit/preview/[id]                 → Merit preview (W-27)
/admin/allocation                         → Round runner (W-28)
/admin/allocation/preview/[id]            → Allocation preview (W-29)
/admin/integrations                       → Integration health (W-30)
/admin/audit                              → Audit log (W-31)
/admin/reports                            → Reports (W-32)
/admin/training                           → Training (W-33)

# College (Admin / Operator / Convenor)
/college                                  → College dashboard (W-34)
/college/applications                     → Queue (W-35)
/college/applications/[id]                → Detail (W-36)
/college/applications/[id]/documents      → Scrutiny panel (W-37)
/college/convenor                         → Convenor queue (W-40)
/college/seat-matrix                      → Combination fill (W-42)
/college/counselling                      → Counselling approval (W-43)

# Finance
/finance                                  → Reconciliation (W-44)
```

### 11.5 Component library (reusable)

**Layout**: `AppShell`, `PageHeader`, `BottomTabBar`, `SafeAreaWrapper`
**Status & progress**: `StatusTracker`, `ProgressBar`, `NextActionCard`, `DeadlineChip`, `PhaseBanner`
**Form primitives**: `LabelledField`, `TextInput`, `NumberInput`, `DateInput`, `EmailInput`, `MobileInput`, `Select`, `MultiSelect`, `RadioGroupCards`, `CheckboxCard`, `CategoryPickerSheet`, `CertificateSubForm`, `OtpInput`, `FieldHelper`, `InlineError`, `InlineSuccess`
**Document primitives**: `DocumentChecklistItem`, `CameraWithGuide`, `ImagePreviewConfirm`, `UploadProgressBar`, `RejectionCard`
**Application flow**: `EligibilityResultCard`, `CombinationCard` (Sanjauli-critical), `PreferenceListItem`, `FeeBreakdown`, `DeclarationBlock`
**Allotment**: `AllotmentOfferCard`, `ActionCard`, `DoubleConfirmSheet`
**System**: `LanguageSwitcher`, `Toast`, `BottomSheet`, `Modal`, `NotificationListItem`, `EmptyState`, `GlossaryTerm`

**Web portal extras**: `Sidebar`, `Topbar`, `Breadcrumb`, `KpiTile`, `KpiStrip`, `DataTable` (TanStack), `FilterBar`, `ApplicationDetailTabs`, `FieldVerifyControl`, `DocumentScrutinyRow`, `DiscrepancyRaiseDialog`, `OutcomeModal`, `RuleBuilder`, `BulkImportWizard`, `RosterGrid`, `MeritPreviewTable`, `AllocationRunnerPanel`, `DistrictHeatmap`, `IntegrationHealthCard`, `AuditTimeline`

### 11.6 State strategy

| State class | Owner | Tech |
|---|---|---|
| Session | App shell | Server component + cookie |
| Profile draft | Student | `localStorage` mirror + mock API persistence |
| Language | App shell | Zustand store, persisted + synced to student |
| Document upload queue | Documents page | `IndexedDB` via `idb`, retried on reconnect |
| Server data (colleges, rules) | React Query | Cached; invalidates on phase change |
| UI state (wizard step, modals) | Local or Zustand | No global store |

### 11.7 Build sequence (8 weeks)

| Sprint | Weeks | Deliverable |
|---|---|---|
| 1 | 1–2 | Design tokens, i18n foundation, shared components, mock API skeleton, auth stub. Pre-login + register/login + dashboard shell (both surfaces), English + Hindi switchable. |
| 2 | 3–4 | Student happy path: profile builder (5 steps), documents, eligibility, preferences, submit, payment-simulated, application confirmed. End-to-end dev-mode run. |
| 3 | 5–6 | Admin side: cycle setup (semi), scrutiny console (polish), merit + allocation (polish), college dashboard (polish), state admin semi-functional screens. Allotment flows back to student. |
| 4 | 7–8 | Mocks for analytics, audit, integration health, reports. Copy polish, empty states, error states. Rehearsal reset scripts. Demo smoke test. |

---

## 12. Mock data and i18n plan

### 12.1 Mock API architecture

**Stateless fixtures (MSW + static JSON)** — read-only, never change during demo:

| Fixture | Approx count |
|---|---|
| `colleges.json` | 6 colleges |
| `courses.json` | 7 courses (BA, BSc Med, BSc Non-Med, BCom, BCA, BBA, BVoc) |
| `combinations.json` | Sanjauli 60, RKMV 45, Dharamshala 30, Palampur 25, Mandi 20, Solan 20 (~200 total) |
| `course-offerings.json` | ~30 offerings |
| `seat-matrix.json` | Pre-filled from prospectuses |
| `reservation-categories.json` | 10 categories + 1-120 roster |
| `eligibility-rules.json` | 7 rules |
| `document-rules.json` | 14 document types with conditions |
| `admission-cycle.json` | Cycle 2026-27 with phases |
| `notification-templates.json` | ~15 templates, all bilingual |
| `fee-heads.json` | 42 heads per course × college |

**Stateful mock (Express + in-memory with file snapshots)** — changes during demo:

Student, Document, Application, Preference, Payment, VerificationRecord, MeritList, Allotment, Notification, AuditEntry.

**Demo reset:** `pnpm demo:reset` wipes state, reloads fixtures, sets cycle to "Application Open, Day 3 of 10".

**Time simulation:** Mock API returns a simulated current time. Presenter can "Fast-forward 3 days" from dev menu to move cycle into Verification phase on screen.

### 12.2 Demo student fixtures

| Name | Profile | Use |
|---|---|---|
| Asha Sharma | Solan, HPBOSE, Arts, 62% BoF, SC, Single Girl Child | **Hero** — created live during demo |
| Rohit Thakur | Kangra, CBSE, Science (PCM), 78% CGPA-converted, General, PwD 40% | Operator queue — multi-claim handling |
| Priya Verma | Mandi, HPBOSE, Arts, 55% BoF, OBC, rural | Second-round upgrade scenario |
| Demo cohort | 200 auto-generated across 6 colleges | Feeds college dashboard + merit realism |

### 12.3 Hardcoded vs configurable during demo

**Hardcoded (fine for V1):** 6 colleges, 7 courses, 200 combinations, roster template values (read-only), 42 fee heads, 14 document types, notification template set, gateway outcomes.

**Live-configurable during demo:**
- Cycle phase (toggle current phase)
- One eligibility rule (edit BA minimum marks at Dharamshala)
- One seat count (edit BA English+PolSci at Sanjauli from 30 to 35)
- One notification template (edit Hindi body, test discrepancy, see it)
- One user (add new operator, log in incognito)

### 12.4 i18n structure

```
packages/i18n/
├── en.json
├── hi.json
├── index.ts          # useTranslation() hook
├── formatters.ts     # Indian-format dates, numbers, currency
└── schema.ts         # TypeScript types generated from en.json
```

### 12.5 Key namespacing

```
common.*                 # buttons, actions, yes/no
screen.dashboard.*       # per-screen strings
screen.profile.step1.*
component.statusTracker.*
status.application.*     # enum translations
status.document.*
status.allotment.*
entity.college.*         # runtime bilingual fallbacks
glossary.*
error.*
notification.template.*
```

### 12.6 Content ownership

| Content | Owner | Stored |
|---|---|---|
| UI strings | Product team | `packages/i18n/*.json` |
| College / course / combination names | State Admin (mocked for demo) | Fixtures with `_en` and `_hi` |
| Notification templates | State Admin | Mock API |
| Document rule names + instructions | State Admin | Fixtures |
| Discrepancy reasons | College operators | Per-discrepancy `_en` / `_hi` |
| Glossary | Product team | `packages/i18n/glossary.json` |

### 12.7 Missing-translation fallback

If Hindi key absent, UI shows English with small `[EN]` badge in dev/staging. In production, silent fallback to English.

---

## 13. Demo requirements

### 13.1 Classification — what to polish vs mock

**Build fully polished (13 modules) — the demo spine:**
2.1 Public landing, 2.2 Registration, 2.3 Profile builder, 2.4 Document vault, 2.5 Eligibility matcher, 2.6 Preference ranker, 2.7 Application submission, 2.8 Student dashboard, 3.1 Scrutiny console, 3.2 Merit generation, 3.3 Seat allocation, 3.5 College admission dashboard, 10.2 Notification engine.

**Semi-functional (9 modules) — pre-seeded, viewable, minimally editable:**
1.1 College registry, 1.2 Courses/combinations, 1.3 Seat matrix, 1.4 Reservation master, 1.5 Eligibility rules, 1.6 Document rules, 1.7 Admission cycle (live phase toggle), 10.1 User management, 10.6 Data migration.

**Mock with believable data (6 modules):**
7.4 Finance reconciliation, 9.1 State analytics/GER, 10.3 Audit log (live-populated), 10.4 External integrations, 10.5 Report/export, 10.8 Training.

**Exclude from demo (2 modules):**
3.4 Withdrawal/refund (cover as slide), 10.7 Grievance/helpdesk (thumbnail if time).

### 13.2 Top stakeholder-confidence features

1. Combination-based preferences + merit for BA
2. 1-120 reservation roster auto-application
3. Parallel scrutiny with three outcomes
4. Same-day merit publication
5. Configurable rules (eligibility, docs, fees, seats)
6. Audit log of every write
7. Bilingual student experience end-to-end
8. Real-time district + category fill analytics
9. Combination-level seat matrix with teacher-count constraint
10. Data migration toolkit with Excel templates

### 13.3 Top student-trust features

1. Hindi throughout with visible language switcher
2. Built-in Best-of-Five calculator + CBSE CGPA converter
3. In-app camera with corner alignment guide
4. Plain-language next-action cards on dashboard
5. Specific discrepancy reasons, not "rejected"
6. Conditional Accept path that doesn't lose the fee
7. Fee breakup transparency (42 heads collapsible)
8. Receipt + application number + provisional letter downloadable
9. Autosave every 30 seconds
10. Deadline countdown + SMS + WhatsApp pings

### 13.4 Demo arc (18 minutes live + 5 minutes Q&A)

| Act | Duration | Content |
|---|---|---|
| Opening | 1.5 min | Frame the product, introduce the two surfaces and Asha persona |
| **Act 1 — State setup** | 2 min | State admin dashboard → reservation master + 1-120 roster → combination config → live edit of seat count, propagation to discovery |
| **Act 2 — Student journey** | 8 min | Pre-login home in Hindi → register → 5-step profile with BoF calculator → documents with in-app camera → eligibility with 3 buckets → combination-based preferences → review + pay → application confirmed |
| **Act 3 — Scrutiny + discrepancy** | 3 min | Operator opens Asha's application → rejects caste cert → Conditional Accept → student gets SMS in Hindi → fixes → convenor approves |
| **Act 4 — Merit + allotment** | 3 min | State admin runs merit → combination-level, roster auto-applied → Asha gets allotment → Freezes → college counselling approval → admission fee payment → roll number → provisional letter |
| Closing | 0.5 min | Three proof points: centralisation without uniformity, ground-informed design, built for Asha |
| Q&A | 5 min | Pre-prepared answers in demo script for 8 anticipated questions |

### 13.5 Anticipated Q&A

1. What if a college refuses to join the platform?
2. How do you handle HPU circulars that change policy mid-cycle?
3. Is this better than the Sanjauli portal running since 2018?
4. What about the 25% All-India seats?
5. Withdrawal and refunds?
6. NEP changes to combination structure?
7. University ERP integration?
8. Cost / timeline to roll out statewide?

Full answers in `docs/demo-script.md`.

### 13.6 Short demo variant (7 minutes)

Skip Act 1 reservation master (just mention configurability). Compress Act 2 to: pre-login → registration → filled profile → documents (one upload) → eligibility → preferences → submit. Keep Act 3 full (most memorable moment). Keep Act 4 full (emotional close).

---

## 14. Bilingual copy starter pack

### 14.1 Tone guidance

| Principle | Applied as |
|---|---|
| Formal but warm | Formal "आप" in Hindi, "you" not "u" in English |
| Plain, not bureaucratic | "Upload your marksheet" not "The marksheet should be uploaded" |
| Specific, not vague | "Re-upload by Friday, 26 June, 5 PM" not "at the earliest" |
| Kind, not patronising | |
| Direct, not passive | "We rejected this photo" not "This photo has been rejected" |
| Actionable endings | Every message ends with a next step or a closed confirmation |
| Numbers Western Arabic | `12/08/2007`, not ”१२/०८/२००७” |
| No emoji in official content | Receipts, discrepancies, allotment — none |
| No filler | Cut "thank you for your patience" |

### 14.2 Global labels

| Context | English | Hindi |
|---|---|---|
| App name | HP Admissions | एचपी प्रवेश |
| Tab: Home | Home | मुख्य पृष्ठ |
| Tab: My Applications | My Applications | मेरे आवेदन |
| Tab: Help | Help | सहायता |
| Menu: Profile | My profile | मेरी प्रोफ़ाइल |
| Menu: Logout | Log out | लॉग आउट |
| Menu: Change language | Change language | भाषा बदलें |

### 14.3 Primary CTAs

| English | Hindi |
|---|---|
| Register | पंजीकरण करें |
| Log in | लॉग इन करें |
| Send OTP | OTP भेजें |
| Verify | सत्यापित करें |
| Resend OTP | OTP दोबारा भेजें |
| Start application | आवेदन शुरू करें |
| Continue | आगे बढ़ें |
| Back | पीछे |
| Save and continue | सहेजें और आगे बढ़ें |
| Upload document | दस्तावेज़ अपलोड करें |
| Take photo | फ़ोटो लें |
| Choose from gallery | गैलरी से चुनें |
| Retake photo | फ़ोटो दोबारा लें |
| Confirm | पुष्टि करें |
| Submit application | आवेदन जमा करें |
| Pay now | अभी भुगतान करें |
| Proceed to payment | भुगतान की ओर बढ़ें |
| Download receipt | रसीद डाउनलोड करें |
| Download admission letter | प्रवेश पत्र डाउनलोड करें |
| Freeze seat | सीट स्वीकारें |
| Float for higher preference | अस्थायी स्वीकार |
| Decline seat | सीट अस्वीकार |
| Re-upload | दोबारा अपलोड करें |
| View details | विवरण देखें |
| Contact helpdesk | सहायता केंद्र से संपर्क |
| Open calculator | कैलकुलेटर खोलें |

### 14.4 Profile field labels

| Step | English | Hindi |
|---|---|---|
| 1 | Full name (as on marksheet) | पूरा नाम (मार्कशीट पर जैसा है) |
| 1 | Father's name | पिता का नाम |
| 1 | Mother's name | माता का नाम |
| 1 | Date of birth | जन्म तिथि |
| 1 | Gender | लिंग |
| 1 | Mobile number | मोबाइल नंबर |
| 1 | Email | ईमेल |
| 1 | Aadhaar number (optional) | आधार नंबर (वैकल्पिक) |
| 1 | APAAR ID (optional) | APAAR आईडी (वैकल्पिक) |
| 1 | Reservation category | आरक्षण श्रेणी |
| 1 | Are you the only daughter in your family? | क्या आप अपने परिवार की एकमात्र बेटी हैं? |
| 1 | Do you have a disability certificate? | क्या आपके पास दिव्यांगता प्रमाणपत्र है? |
| 2 | Permanent address | स्थायी पता |
| 2 | Correspondence address same as permanent | पत्राचार का पता स्थायी पते जैसा है |
| 2 | District | ज़िला |
| 2 | State | राज्य |
| 2 | PIN code | पिन कोड |
| 3 | Board | बोर्ड |
| 3 | Year of passing | उत्तीर्ण वर्ष |
| 3 | Roll number | रोल नंबर |
| 3 | Stream | स्ट्रीम |
| 3 | Subjects studied in Class 12 | 12वीं में पढ़े गए विषय |
| 3 | Best-of-five percentage | सर्वोत्तम पाँच विषयों का प्रतिशत |
| 3 | Result status | परीक्षा परिणाम |
| 3 | Gap years (if any) | गैप वर्ष (यदि हो) |
| 4 | Certificate number | प्रमाणपत्र क्रमांक |
| 4 | Issuing authority | जारीकर्ता प्राधिकारी |
| 4 | Issue date | जारी तिथि |
| 4 | I don't have this right now, will upload later | अभी उपलब्ध नहीं, बाद में अपलोड करूँगा/करूँगी |
| 5 | Account holder name | खाताधारक का नाम |
| 5 | Account number | खाता संख्या |
| 5 | IFSC code | IFSC कोड |
| 5 | Bank name | बैंक का नाम |
| 5 | Passbook front page | पासबुक पहला पृष्ठ |

### 14.5 Error messages

| Scenario | English | Hindi |
|---|---|---|
| Required field empty | This field is required. | यह जानकारी ज़रूरी है। |
| Mobile format invalid | Mobile must be 10 digits, starting with 6-9. | मोबाइल 10 अंक का हो, 6-9 से शुरू। |
| Email format invalid | Please enter a valid email address. | कृपया सही ईमेल डालें। |
| OTP wrong | OTP did not match. Check and try again. | OTP मिला नहीं। कृपया दोबारा देखें। |
| OTP expired | OTP expired. Request a new one. | OTP का समय समाप्त। नया OTP भेजें। |
| Password too short | Password must be at least 6 characters. | पासवर्ड कम से कम 6 अक्षर का हो। |
| Duplicate email | This email is already registered. Try logging in. | यह ईमेल पहले से पंजीकृत है। लॉग इन करें। |
| Duplicate mobile | This mobile is already registered. Try logging in. | यह मोबाइल पहले से पंजीकृत है। लॉग इन करें। |
| Age too young | You must be at least 15 to apply. | आवेदन के लिए न्यूनतम आयु 15 वर्ष है। |
| Percentage > 100 | Percentage cannot be more than 100. | प्रतिशत 100 से अधिक नहीं हो सकता। |
| CGPA mistyped as % | That looks like CGPA, not percentage. Use the converter? | यह CGPA जैसा लगता है। कन्वर्टर का उपयोग करें? |
| File too large | File is larger than 2 MB. We'll compress it for you. | फ़ाइल 2 MB से बड़ी है। हम छोटी कर देंगे। |
| Wrong file format | Accepted: PDF, JPG, PNG only. | केवल PDF, JPG, PNG स्वीकार्य हैं। |
| Blurry photo | This photo looks blurry. Try again for a clearer one. | फ़ोटो धुंधली लग रही है। साफ़ फ़ोटो लेने की कोशिश करें। |
| Network slow | Slow network. We're still trying. | नेटवर्क धीमा है। प्रयास जारी है। |
| Offline | You're offline. We saved your work and will sync when you're back. | आप ऑफ़लाइन हैं। आपका काम सहेज लिया गया है, नेटवर्क आने पर सिंक होगा। |
| Eligibility fail — stream | You need Physics, Chemistry, and Biology in Class 12 for BSc Medical. | BSc Medical के लिए 12वीं में भौतिकी, रसायन और जीवविज्ञान ज़रूरी है। |
| Eligibility fail — marks | Minimum required: 55%. Your best-of-five: {x}%. | न्यूनतम आवश्यक: 55%। आपका सर्वोत्तम-पाँच: {x}%। |
| Payment failed | Payment did not go through. Don't worry — no amount was charged. Try again. | भुगतान पूरा नहीं हुआ। चिंता न करें, कोई राशि नहीं कटी। पुनः प्रयास करें। |
| Payment pending | Payment is still being confirmed. Please don't pay again for 15 minutes. | भुगतान की पुष्टि हो रही है। अगले 15 मिनट तक दोबारा भुगतान न करें। |

### 14.6 Discrepancy templates

| Scenario | English | Hindi |
|---|---|---|
| Document blurry | {docName} is blurry. Seal or details are not clearly visible. Please upload a clearer photo by {deadline}. | {docName} धुंधला है। मुहर या विवरण स्पष्ट नहीं है। कृपया {deadline} तक साफ़ फ़ोटो अपलोड करें। |
| Wrong document type | You uploaded the wrong document for {docName}. Please upload the correct one by {deadline}. | {docName} के लिए ग़लत दस्तावेज़ अपलोड हुआ है। कृपया {deadline} तक सही दस्तावेज़ अपलोड करें। |
| Seal missing | Official seal is not visible on {docName}. Please upload a scan or photo that clearly shows the seal. | {docName} पर आधिकारिक मुहर नहीं दिख रही। कृपया मुहर सहित फ़ोटो या स्कैन अपलोड करें। |
| Marks mismatch | The best-of-five percentage you declared doesn't match your marksheet. Please check and update before {deadline}. | आपने जो सर्वोत्तम-पाँच प्रतिशत दिया है वह मार्कशीट से मेल नहीं खाता। कृपया {deadline} तक जाँच कर सही करें। |
| Certificate expired | The {certName} you uploaded has expired. Please upload a valid certificate by {deadline}. | आपने जो {certName} अपलोड किया है वह अमान्य हो चुका है। कृपया {deadline} तक वैध प्रमाणपत्र अपलोड करें। |
| Name mismatch | The name on your {docName} doesn't match your profile. Please check and correct. | आपके {docName} पर नाम प्रोफ़ाइल से मेल नहीं खाता। कृपया जाँचें और सुधार करें। |

### 14.7 Dashboard status labels

| English | Hindi |
|---|---|
| Registered | पंजीकरण हो गया |
| Profile complete | प्रोफ़ाइल पूरी |
| Application submitted | आवेदन जमा |
| Under review | जाँच में |
| Action needed | कार्रवाई ज़रूरी |
| Verified | सत्यापित |
| Merit published | मेरिट जारी |
| Seat allotted | सीट आवंटित |
| Waiting for better allotment | बेहतर आवंटन की प्रतीक्षा |
| Not allotted this round | इस राउंड में सीट नहीं मिली |
| Payment pending | भुगतान बाकी |
| Admission confirmed | प्रवेश पक्का |
| Application rejected | आवेदन अस्वीकृत |
| Withdrawn | वापस लिया |

### 14.8 Next-action card templates

| Trigger | English | Hindi |
|---|---|---|
| Profile incomplete | Complete your profile in {n} more steps. | प्रोफ़ाइल पूरी करने के लिए {n} चरण बाकी हैं। |
| Document missing | Upload {n} required documents to continue. | आगे बढ़ने के लिए {n} आवश्यक दस्तावेज़ अपलोड करें। |
| Ready to submit | Your application is ready. Review and submit. | आपका आवेदन तैयार है। समीक्षा करें और जमा करें। |
| Payment pending | Pay the application fee to complete submission. | आवेदन पूरा करने के लिए शुल्क का भुगतान करें। |
| Discrepancy open | {docName} needs your attention. Fix by {deadline}. | {docName} पर आपका ध्यान चाहिए। {deadline} तक सुधारें। |
| Awaiting merit | Merit will be published on {date}. | मेरिट {date} को जारी होगी। |
| Allotment offered | You've been offered a seat. Decide by {deadline}. | आपको सीट मिली है। {deadline} तक निर्णय लें। |
| Admission fee due | Pay admission fee by {deadline} to confirm your seat. | सीट पक्की करने के लिए {deadline} तक प्रवेश शुल्क चुकाएँ। |
| Admission confirmed | Your admission is confirmed. Download your admission letter. | आपका प्रवेश पक्का हो गया है। प्रवेश पत्र डाउनलोड करें। |

### 14.9 Allotment decision copy

| Element | English | Hindi |
|---|---|---|
| Screen title | Your seat offer | आपकी सीट का प्रस्ताव |
| Offer summary | Allotted: {course} ({combination}) at {college}, under {category} category. | आवंटन: {college} में {course} ({combination}), {category} श्रेणी में। |
| Deadline | Respond by {deadline}. After this, the seat will go to the next candidate. | {deadline} तक निर्णय लें। इसके बाद सीट अगले उम्मीदवार को चली जाएगी। |
| Freeze title | Freeze | सीट स्वीकारें |
| Freeze subtitle | Accept this seat. Exit from later rounds. | यह सीट लेना। बाद के राउंड में भाग नहीं। |
| Float title | Float | अस्थायी स्वीकार |
| Float subtitle | Accept this for now. Try for a higher preference in the next round. | अभी स्वीकार। अगले राउंड में बेहतर की कोशिश। |
| Decline title | Decline | अस्वीकार |
| Decline subtitle | Reject this seat. You will exit admissions. | इस सीट को अस्वीकार। आप प्रवेश प्रक्रिया से बाहर हो जाएँगे। |
| Decline double-confirm | Are you sure? Once declined, you cannot come back to this seat. | क्या आप निश्चित हैं? अस्वीकार करने के बाद यह सीट वापस नहीं मिलेगी। |

### 14.10 Declaration text

**English:**
> I confirm that all the information I have provided above is true and correct. I have uploaded my own documents. I understand that if any information is found to be wrong, my application or admission may be cancelled, and I may lose the fee I paid.

**Hindi:**
> मैं पुष्टि करता/करती हूँ कि ऊपर दी गई सभी जानकारी सही है। मैंने अपने दस्तावेज़ अपलोड किए हैं। यदि कोई जानकारी ग़लत पाई जाती है, तो मेरा आवेदन या प्रवेश रद्द हो सकता है और मेरा जमा शुल्क भी जब्त हो सकता है।

### 14.11 SMS templates (short)

| Trigger | English (≤160 chars) | Hindi (≤70 chars) |
|---|---|---|
| OTP | {otp} is your HP Admissions OTP. Valid 10 min. Do not share. | {otp} आपका HP प्रवेश OTP है। 10 मिनट वैध। साझा न करें। |
| Registration success | Welcome to HP Admissions. Complete your profile to apply. | HP प्रवेश में स्वागत है। आवेदन के लिए प्रोफ़ाइल पूरी करें। |
| Application submitted | Application {appNo} submitted. Track on HP Admissions. | आवेदन {appNo} जमा। HP प्रवेश पर ट्रैक करें। |
| Discrepancy | Action needed on your application {appNo}. Fix by {date}. | आवेदन {appNo} पर कार्रवाई चाहिए। {date} तक सुधारें। |
| Merit published | Merit published. Check your result on HP Admissions. | मेरिट जारी। HP प्रवेश पर परिणाम देखें। |
| Allotment | Seat allotted: {college}, {course}. Respond by {date}. | सीट मिली: {college}, {course}. {date} तक निर्णय। |
| Payment reminder | Pay admission fee for {college} by {date} to confirm seat. | {college} का प्रवेश शुल्क {date} तक चुकाएँ। |
| Admission confirmed | Admission confirmed at {college}, {course}. Roll No: {rollNo}. | प्रवेश पक्का: {college}, {course}. रोल नंबर: {rollNo}. |

### 14.12 Document checklist — bilingual names

| Type | English | Hindi |
|---|---|---|
| 10+2 Marksheet | Class 12 marksheet | 12वीं की मार्कशीट |
| 10th Marksheet | Class 10 marksheet (for date of birth) | 10वीं की मार्कशीट (जन्म तिथि के लिए) |
| Passport photo | Passport-size photo | पासपोर्ट साइज़ फ़ोटो |
| Signature | Your signature | आपके हस्ताक्षर |
| Character certificate | Character certificate | चरित्र प्रमाणपत्र |
| Caste certificate | Caste certificate (SC/ST/OBC) | जाति प्रमाणपत्र (SC/ST/OBC) |
| EWS certificate | EWS certificate | EWS प्रमाणपत्र |
| PwD certificate | Disability certificate | दिव्यांगता प्रमाणपत्र |
| Sports certificate | Sports certificate | खेल प्रमाणपत्र |
| Cultural certificate | Cultural activity certificate | सांस्कृतिक प्रमाणपत्र |
| Domicile certificate | HP domicile certificate | हिमाचल प्रदेश अधिवास प्रमाणपत्र |
| Migration certificate | Migration certificate | माइग्रेशन प्रमाणपत्र |
| Single Girl Child | Single Girl Child certificate/affidavit | एकमात्र बेटी प्रमाणपत्र/शपथपत्र |
| Aadhaar | Aadhaar card | आधार कार्ड |
| Bank passbook | Bank passbook (first page) | बैंक पासबुक (पहला पृष्ठ) |

### 14.13 Glossary

| Term | English explanation | Hindi explanation |
|---|---|---|
| APAAR ID | A student identity number issued by the government. You can find it on DigiLocker. | सरकार द्वारा जारी छात्र पहचान संख्या। DigiLocker पर मिल सकती है। |
| Best-of-five | Your percentage based on the best 5 subjects out of the ones you studied. | आपने जिन विषयों की परीक्षा दी उनमें से सर्वोत्तम 5 का प्रतिशत। |
| CGPA | Cumulative Grade Point Average. CBSE uses CGPA instead of percentage. We'll convert it. | CBSE प्रतिशत के बजाय CGPA देता है। हम बदल देंगे। |
| Combination | Two main subjects you'll study together in BA. Example: History + Political Science. | BA में साथ पढ़े जाने वाले दो मुख्य विषय। जैसे: इतिहास + राजनीति विज्ञान। |
| Counselling | When the college reviews your documents one last time and sends you the fee payment link. | जब कॉलेज आपके दस्तावेज़ अंतिम बार जाँचता है और शुल्क भुगतान का लिंक भेजता है। |
| Domicile | Whether you are a resident of HP. Certificate issued by SDM. | आप हिमाचल प्रदेश के निवासी हैं या नहीं। SDM से प्रमाणपत्र जारी होता है। |
| Freeze | Accept the seat and stop trying for a better one. | सीट स्वीकार कर लेना और बेहतर की कोशिश रोक देना। |
| Float | Accept the seat but keep trying for your higher preferences. | सीट स्वीकार करते हुए भी अपनी बेहतर पसंद के लिए प्रयास जारी रखना। |
| Merit list | The ranked list of students who will get seats, based on marks and reservation. | अंकों और आरक्षण के आधार पर सीट पाने वाले छात्रों की क्रमबद्ध सूची। |
| Reservation category | A group (like SC, ST, OBC) that gets a specific share of seats by government policy. | सरकारी नीति के अनुसार SC, ST, OBC जैसी श्रेणी जिसे सीटों का निश्चित हिस्सा मिलता है। |
| Roll number | Your unique number at the college. Generated when you pay admission fee. | कॉलेज में आपकी विशिष्ट संख्या। प्रवेश शुल्क चुकाने पर मिलती है। |
| Single Girl Child | Being the only daughter in your family — you may qualify for an extra seat. | अपने परिवार की एकमात्र बेटी होना — आपको अतिरिक्त सीट का लाभ मिल सकता है। |
| Stream | What you studied in Class 12 — Arts, Science, or Commerce. | 12वीं में आपने क्या पढ़ा — कला, विज्ञान, या वाणिज्य। |
| Supernumerary seat | A seat given over and above the regular seat count. | नियमित सीटों के अतिरिक्त दी गई सीट। |

### 14.14 Empty states

| Screen | English | Hindi |
|---|---|---|
| No notifications | No notifications yet. We'll tell you when something changes. | अभी कोई सूचना नहीं। कुछ बदलाव होने पर हम बताएँगे। |
| No applications | You haven't applied yet. Start your first application. | आपने अभी कोई आवेदन नहीं किया। पहला आवेदन शुरू करें। |
| No documents | No documents uploaded yet. Upload your Class 12 marksheet to begin. | अभी कोई दस्तावेज़ अपलोड नहीं। 12वीं की मार्कशीट से शुरुआत करें। |
| No eligible courses | We couldn't find any courses that match your profile. Check your class 12 details. | आपकी प्रोफ़ाइल से मेल खाते कोई कोर्स नहीं मिले। 12वीं के विवरण जाँचें। |
| No search results | No results. Try a different search. | कुछ नहीं मिला। अलग से खोजें। |

### 14.15 Success confirmations

| Event | English | Hindi |
|---|---|---|
| Registration complete | Welcome. Your account is ready. | स्वागत है। आपका खाता तैयार है। |
| Profile saved | Profile saved. Let's move to documents. | प्रोफ़ाइल सहेज ली गई। अब दस्तावेज़ों पर चलते हैं। |
| Document uploaded | Document uploaded. We'll review it soon. | दस्तावेज़ अपलोड हो गया। हम जल्द जाँच करेंगे। |
| Application submitted | Application submitted. Application number: {appNo}. | आवेदन जमा हो गया। आवेदन संख्या: {appNo}। |
| Payment successful | Payment successful. Receipt emailed and saved in the app. | भुगतान सफल। रसीद ईमेल पर भेजी गई और ऐप में सहेजी गई। |
| Seat frozen | Seat frozen. Your admission is being processed. | सीट स्वीकार हो गई। प्रवेश की प्रक्रिया जारी है। |
| Admission confirmed | Admission confirmed. Welcome to {college}. | प्रवेश पक्का। {college} में आपका स्वागत है। |

---

## 15. Anti-patterns and out-of-scope

### 15.1 Do not do

1. **Don't add screens not in Output 5's inventory.** Scope creep kills polish.
2. **Don't wire a real gateway.** One network hiccup kills the demo.
3. **Don't skip Hindi on any Tier-1 student screen** — even for first rehearsal. Hardest retrofit.
4. **Don't use skeletons as a substitute for fast mocks.** Fake data should render instantly.
5. **Don't build the audit log from real logs.** Live-populate from a fixed set of demo actions for predictable output.
6. **Don't spend more than 5 minutes on login/SSO.** Demo uses static credentials.
7. **Don't localise the portal in Sprint 1.** English OK there; Hindi retrofitted if time.
8. **Don't add features from P2 / Phase 2** unless required to explain a V1 dependency.
9. **Don't hard-code rules.** Every threshold, fee, and seat count must be configurable.
10. **Don't assume all users understand English, digital payments, or admission jargon.**

### 15.2 Explicitly out of V1 scope

- Post-admission student lifecycle (attendance, fines, certificates, promotions)
- Academic operations (timetable, curriculum, examinations beyond admission)
- Faculty and HR management
- Infrastructure and assets
- Library integration
- Real HPU ERP bidirectional integration
- Mobile app outside SwiftChat
- Offline/paper application flows (admin-assisted mode exists but within the digital platform)
- Multi-tenant operation beyond HP state

### 15.3 Ambiguities to surface with state (flagged, not decided)

| Ambiguity | Current V1 assumption | Escalation owner |
|---|---|---|
| 75/25 split — domicile vs school location | Domicile-based per Sanjauli field visit | State policy team |
| BCom eligibility thresholds vary per college | Configurable override at CourseOffering level | College admins |
| NEP curriculum changes (2 DSC → 2 DSC + 1 minor + AEC) | Keep combination data flexible; not triples in V1 | State policy + HPU |
| Tie-break order beyond "marks → DOB" | Configurable; default is subject-marks → DOB | State Admin |
| Mop-up round eligibility (waitlist only, or open?) | Waitlist only in V1 | State Admin |
| Cross-college roll number uniqueness | Roll numbers are college-scoped in V1 | HPU ERP discussion |

---

## 16. Source documents

| Document | Role in decisions |
|---|---|
| `HP_HE_MIS_Full_Scope_RFP.xlsx` | **Scope source of truth.** V1 row filter drove the 30-module inventory |
| `BRD_HP_HE_MIS.pdf` | Product structure, module descriptions, state taxonomies |
| `HP_HE_MIS_Packages_Modules.pdf` | Detailed module definitions, entity operations, priority ordering |
| `Undergraduage_Unified_Admission_Portal_Admission_Procedure_docx.pdf` | Configurable rule logic — eligibility, reservation, seats, docs, fees |
| `Field_Visit_Summary_HP_MIS.pdf` | **Operational reality.** Sanjauli findings: combinations, email-first, BoF self-declared, parallel scrutiny, three outcomes, 42 fee heads, counselling = fee link, 75/25 domicile |
| `TEXT_STYLES.png`, `Typography_System.png` | Typography tokens (Montserrat, size/weight scale) |
| `Frame_1410083500.png` | SwiftChat layout and chat patterns reference |
| `Existing.png` | Button, input, tab, modal primitives |
| `Color_System.png`, `Color_Palette.pdf` | Color tokens (primitive palette + semantic tokens, light + dark) |

---

*End of document. Version 1. Keep this document in sync with RFP updates and field findings. Any change to the 30-module V1 scope must be flagged, reviewed, and reflected here before implementation begins.*
