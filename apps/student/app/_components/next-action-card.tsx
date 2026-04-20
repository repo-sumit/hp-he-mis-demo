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
        "!border-[var(--color-border-brand)] !bg-[var(--color-background-brand-softer)] !p-5",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)]"
        >
          {icon ?? "→"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-base)] font-[var(--weight-semibold)] leading-[var(--leading-snug)] text-[var(--color-text-primary)]">
            {title}
          </p>
          <p className="mt-1.5 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {body}
          </p>
          {deadline ? (
            <p className="mt-2.5 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]">
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
            className="mt-4 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-interactive-brand-hover)]"
          >
            {cta}
            <span aria-hidden="true" className="ml-1.5">→</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
