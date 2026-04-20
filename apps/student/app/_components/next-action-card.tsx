"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, cn } from "@hp-mis/ui";

type Props = {
  title: string;
  body: string;
  cta: string;
  href: string;
  /** Emphasised deadline line — rendered in brand colour under the body. */
  deadline?: string;
  /** Neutral secondary metadata (e.g. application number). Rendered muted. */
  meta?: string;
  icon?: ReactNode;
  className?: string;
};

export function NextActionCard({
  title,
  body,
  cta,
  href,
  deadline,
  meta,
  icon,
  className,
}: Props) {
  return (
    <Card
      className={cn(
        "!border-[var(--color-border-brand)] !bg-[var(--color-background-brand-subtle)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]"
        >
          {icon ?? "→"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {title}
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">{body}</p>
          {deadline ? (
            <p className="mt-2 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-brand)]">
              {deadline}
            </p>
          ) : null}
          {meta ? (
            <p className="mt-1 font-mono text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              {meta}
            </p>
          ) : null}
          <Link
            href={href}
            className="mt-3 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {cta}
          </Link>
        </div>
      </div>
    </Card>
  );
}
