"use client";

import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";

interface Props {
  children: ReactNode;
  className?: string;
  /** Optional leading text (e.g. reviewer note). */
  meta?: ReactNode;
}

/**
 * Sticky bottom bar used on the detail / scrutiny / discrepancy pages.
 * Houses the primary and secondary actions; shadow + border make it pop off
 * the content without blocking the page footer.
 */
export function ActionFooter({ children, className, meta }: Props) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-10 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 px-4 py-3 shadow-[var(--shadow-md)] backdrop-blur md:-mx-6 md:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {meta ? (
          <div className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">{meta}</div>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
