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
 *   - Layer: `color/background/subtle` (subtle contrast vs page bg)
 *   - Spacing: py-12 (space/48) mobile, py-16 (space/64) tablet+
 *   - Typography: Caption SemiBold uppercase column headings, Body/Medium
 *                 links, Caption legal strip
 *   - Border: 1px `color/border/subtle` at the top only
 *
 * Responsive grid:
 *   - Mobile (<640px)        : 1 column stack
 *   - Small (≥640px, sm)     : 2 columns — brand spans both, link groups split
 *   - Large (≥1024px, lg)    : 4 columns — brand + 3 link columns side-by-side
 *
 * Using plain Tailwind grid utilities (not arbitrary minmax/repeat) so the
 * JIT reliably emits the `grid-template-columns` rule.
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
      <div className="mx-auto w-full max-w-[var(--content-ultra)] px-6 py-12 sm:px-8 md:py-16 lg:px-16">
        {brand || hasColumns ? (
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4 lg:gap-10">
            {brand ? (
              <div className="min-w-0 sm:col-span-2 lg:col-span-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
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
                        className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] text-[var(--text-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-brand)] hover:underline underline-offset-4 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
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
          <div className="mt-12 flex flex-col gap-3 border-t border-[var(--color-border-subtle)] pt-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            {note ? (
              <p className="max-w-3xl text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-tertiary)]">
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
