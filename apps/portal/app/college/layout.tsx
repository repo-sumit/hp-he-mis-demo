import type { ReactNode } from "react";
import { ScrutinyProvider } from "../_components/data/scrutiny-provider";

/**
 * Mounts ScrutinyProvider for College Admin / College Operator routes
 * so the dashboard and seat matrix can read effective scrutiny outcomes
 * (verified / discrepancy / etc.) without each page having to mount it
 * locally. Mirrors the per-section layout pattern already used by
 * /applications, /merit, and /allocation.
 */
export default function CollegeLayout({ children }: { children: ReactNode }) {
  return <ScrutinyProvider>{children}</ScrutinyProvider>;
}
