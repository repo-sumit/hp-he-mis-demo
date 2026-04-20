import type { ReactNode } from "react";

/**
 * Intentionally a pass-through — DocumentsProvider is mounted at the root so
 * /apply, /discover, and /dashboard can all derive readiness and submission
 * state from the same map.
 */
export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
