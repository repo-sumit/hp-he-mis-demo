import type { ReactNode } from "react";
import { ApplicationsProvider } from "../_components/apply/applications-provider";

export default function ApplyLayout({ children }: { children: ReactNode }) {
  return <ApplicationsProvider>{children}</ApplicationsProvider>;
}
