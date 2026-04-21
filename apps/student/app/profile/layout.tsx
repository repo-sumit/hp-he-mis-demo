import type { ReactNode } from "react";

/**
 * Profile steps are entirely client-state-driven (localStorage draft,
 * session context, query params via `useReviewReturn`). Opt out of static
 * prerender so `useSearchParams` doesn't need a Suspense boundary, and so
 * we don't ship a stale pre-rendered shell that differs from the hydrated
 * UI on every load.
 */
export const dynamic = "force-dynamic";

/**
 * Intentionally a pass-through — the profile draft context lives on the root
 * layout so `/documents` (and any future post-profile flow) can derive
 * checklists from the same reactive state.
 */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
