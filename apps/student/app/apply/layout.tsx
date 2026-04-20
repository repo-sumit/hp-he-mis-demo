import type { ReactNode } from "react";

/**
 * Intentionally a pass-through — ApplicationsProvider is mounted at the root
 * so /applications and the dashboard can read submission state too.
 */
export default function ApplyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
