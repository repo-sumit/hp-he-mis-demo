"use client";

import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";

interface Props {
  icon?: string;
  title?: string;
  body: string;
  action?: ReactNode;
  tone?: "default" | "success";
  className?: string;
}

/**
 * Reusable empty-state block used when a section of the checklist has nothing
 * to show (nothing uploaded yet, or nothing pending).
 */
export function EmptyState({ icon, title, body, action, tone = "default", className }: Props) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-dashed px-4 py-5 text-center",
        tone === "success"
          ? "border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)]"
          : "border-[var(--color-border-strong)] bg-[var(--color-background-subtle)]",
        className,
      )}
    >
      {icon ? (
        <div aria-hidden="true" className="text-2xl">
          {icon}
        </div>
      ) : null}
      {title ? (
        <p className="mt-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {title}
        </p>
      ) : null}
      <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">{body}</p>
      {action ? <div className="mt-3 flex justify-center">{action}</div> : null}
    </div>
  );
}
