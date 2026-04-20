# HP Higher Education Admission Platform

This is a V1 demo build for the HP Higher Education MIS — a unified
admission platform with two surfaces: a SwiftChat student mini app and
an official web portal.

## Read this first
Always read `project-context.md` at the repo root before making any
product, design, data model, or architectural decisions. That document
is the single source of truth for:
- V1 scope (30 modules only, strictly)
- Two-surface architecture
- Data model (19 entities + 2 logs)
- Screen inventory (88 screens)
- UX patterns and bilingual copy
- Demo requirements

## Hard rules
- V1 only. Do not add features from P2, Phase 2, or outside the 30-module list.
- Student mini app must be bilingual (English + Hindi) for all Tier-1 screens.
- BA preferences are combinations (not subjects). Max 6 for BA, 3 for BSc.
- Best-of-five is student-declared, never system-computed from subject marks.
- Three scrutiny outcomes: Accept / Conditional Accept / Reject.
- Email is the primary student identifier, not mobile.
- 42 fee heads, collapsed by default.
- No real payment gateway — simulated 3-outcome mock.

## Tech stack
- Next.js 14 (App Router) + TailwindCSS + shadcn/ui
- next-intl for i18n
- MSW + Express mock API
- Zustand + React Query
- Montserrat + Noto Sans Devanagari fonts

## Where to find things
- Full scope and decisions: `project-context.md` §2
- Data model: `project-context.md` §8
- Screen list: `project-context.md` §9
- Route trees: `project-context.md` §11.3–11.4
- Bilingual copy: `project-context.md` §14
- What NOT to do: `project-context.md` §15

## Anti-patterns (from §15)
- Don't add screens not in the inventory
- Don't wire a real payment gateway
- Don't skip Hindi on Tier-1 student screens
- Don't hard-code rules, fees, or seat counts

