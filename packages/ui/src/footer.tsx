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
  /**
   * Two or three short link columns. Columns are stacked on mobile and
   * laid out on a responsive grid from sm upward. Omit entirely on pages
   * that don't need link nav (use `note` alone for a legal-only footer).
   */
  columns?: readonly FooterColumn[];
  /**
   * Bottom legal strip. Typically the operating body, copyright year,
   * cycle tag, or build stamp. Renders as-is — no marketing copy.
   */
  note?: ReactNode;
  /** Optional brand mark / wordmark rendered above the columns. */
  brand?: ReactNode;
  className?: string;
}

/**
 * Understated page footer shared across the portal and student apps.
 *
 * Designed as a passive chrome element: a muted surface, small type, tidy
 * link columns, a thin legal line. Not a marketing footer. Intended to
 * declutter main-body content by housing utility links (help, contact,
 * privacy, terms) that were previously scattered across screens.
 */
export function Footer({ columns = [], note, brand, className }: FooterProps) {
  const hasColumns = columns.length > 0;
  return (
    <footer
      className={cn(
        "border-t border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] text-[var(--text-sm)] text-[var(--color-text-secondary)]",
        className,
      )}
    >
      <div className="mx-auto flex w-full max-w-[var(--content-ultra)] flex-col gap-6 px-4 py-8 md:px-6">
        {hasColumns || brand ? (
          <div
            className={cn(
              "grid gap-6 sm:grid-cols-2",
              columns.length >= 3 ? "lg:grid-cols-4" : "lg:grid-cols-3",
            )}
          >
            {brand ? (
              <div className="min-w-0 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {brand}
              </div>
            ) : null}
            {columns.map((col, idx) => (
              <div key={idx} className="min-w-0">
                <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
                  {col.heading}
                </p>
                <ul className="mt-3 space-y-2">
                  {col.links.map((link, i) => (
                    <li key={i}>
                      <a
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noreferrer noopener" : undefined}
                        className="inline-flex items-center gap-1 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-brand)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
                      >
                        {link.label}
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
        {note ? (
          <p className="border-t border-[var(--color-border-subtle)] pt-4 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-tertiary)]">
            {note}
          </p>
        ) : null}
      </div>
    </footer>
  );
}
