import type { ReactNode } from "react";
import { ScrutinyProvider } from "../_components/data/scrutiny-provider";

/**
 * Scopes the ScrutinyProvider to every route under /applications so all four
 * views (queue / detail / scrutiny / discrepancy) share the same overlay
 * without leaking into /colleges, /merit, etc.
 */
export default function ApplicationsLayout({ children }: { children: ReactNode }) {
  return <ScrutinyProvider>{children}</ScrutinyProvider>;
}
