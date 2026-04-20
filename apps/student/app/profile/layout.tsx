import type { ReactNode } from "react";

/**
 * Intentionally a pass-through — the profile draft context lives on the root
 * layout so `/documents` (and any future post-profile flow) can derive
 * checklists from the same reactive state.
 */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
