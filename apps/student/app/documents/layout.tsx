import type { ReactNode } from "react";
import { DocumentsProvider } from "../_components/documents/documents-provider";

export default function DocumentsLayout({ children }: { children: ReactNode }) {
  return <DocumentsProvider>{children}</DocumentsProvider>;
}
