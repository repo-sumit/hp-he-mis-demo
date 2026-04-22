import type { ReactNode } from "react";
import { cn } from "./cn";

export interface FooterLink {
  label: ReactNode;
  href: string;
  /** Optional — opens in a new tab when true. */
  external?: boolean;
}

export interface FooterColumn {
  heading: ReactNode;
  links: readonly FooterLink[];
}

export interface FooterProps {
  /** Brand block — institution name, sub-line, cycle tag. First column. */
  brand?: ReactNode;
  /** 2–3 link columns rendered alongside the brand block. */
  columns?: readonly FooterColumn[];
  /** Bottom-strip legal text. Kept neutral and factual, not marketing. */
  note?: ReactNode;
  /** Bottom-strip secondary line (optional) — e.g. official site link. */
  noteSecondary?: ReactNode;
  className?: string;
}

/**
 * Institutional page footer used across the portal and student app.
 *
 * Design-system rhythm:
 *   - Layer: `color/background/surface` (subtle contrast vs page bg)
 *   - Spacing: `space/24` inner, `space/32–48` between top grid + legal strip
 *   - Typography: Label/Small uppercase column headings, Body/Medium links,
 *                 Caption legal strip
 *   - Border: 1px `color/border/subtle` at the top only
 *
 * Responsive grid (aligned to `grid/*`):
 *   - Mobile (4 col)  : single column stack
 *   - Tablet (8 col)  : 2 columns → brand | 3 link columns split 2/1
 *   - Desktop (12 col): brand spans 4/12, 3 link columns each 2–3/12
 */
export function Footer({
  brand,
  columns = [],
  note,
  noteSecondary,
  className,
}: FooterProps) {
  const hasColumns = columns.length > 0;
  return (
    <footer
      className={cn(
        "mt-12 border-t border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)]",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--content-ultra)] px-4 py-12 md:px-9 md:py-16 lg:px-16">
        {brand || hasColumns ? (
          <div
            className={cn(
              "grid gap-8 md:gap-12",
              // Brand on its own row for mobile; brand + N link columns for
              // ≥tablet. Using a CSS grid so link columns can be flexible
              // (never go narrower than 160px).
              "md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(160px,1fr))]",
            )}
          >
            {brand ? (
              <div className="min-w-0 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {brand}
              </div>
            ) : null}
            {columns.map((col, idx) => (
              <div key={idx} className="min-w-0">
                <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-primary)]">
                  {col.heading}
                </p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer noopener" : undefined}
                        className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] text-[var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-brand)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                      >
                        <span className="truncate">{link.label}</span>
                        {link.external ? (
                          <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">
                            ↗
                          </span>
                        ) : null}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : null}

        {note || noteSecondary ? (
          <div className="mt-12 flex flex-col gap-2 border-t border-[var(--color-border-subtle)] pt-6 sm:flex-row sm:items-center sm:justify-between md:gap-4">
            {note ? (
              <p className="text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-tertiary)]">
                {note}
              </p>
            ) : (
              <span />
            )}
            {noteSecondary ? (
              <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                {noteSecondary}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
