import type { ReactNode } from "react";
import { ScrutinyProvider } from "../_components/data/scrutiny-provider";

/**
 * Scopes the ScrutinyProvider to /allocation. Allocation doesn't rewrite
 * scrutiny state itself, but the page surfaces per-application details
 * (student name, category, course code) that come from the same layer the
 * scrutiny workbench reads. Keeping the provider scoped avoids leaking it
 * into unrelated routes.
 */
export default function AllocationLayout({ children }: { children: ReactNode }) {
  return <ScrutinyProvider>{children}</ScrutinyProvider>;
}
