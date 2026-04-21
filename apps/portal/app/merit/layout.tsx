import type { ReactNode } from "react";
import { ScrutinyProvider } from "../_components/data/scrutiny-provider";

/**
 * Scopes the ScrutinyProvider to /merit. The merit page needs to read the
 * scrutiny overlay — verified applications are the input to the merit
 * engine, and overlay-overridden statuses must win over baseStatus.
 */
export default function MeritLayout({ children }: { children: ReactNode }) {
  return <ScrutinyProvider>{children}</ScrutinyProvider>;
}
