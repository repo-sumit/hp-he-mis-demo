import type { ReactNode } from "react";
import { cn } from "./cn";

export interface Crumb {
  label: ReactNode;
  href?: string;
  /** Render a non-link (e.g. current page). */
  current?: boolean;
}

export interface BreadcrumbsProps {
  /** Ordered list of crumbs, oldest → current. The last one is automatically styled as current when `current` is unset. */
  items: readonly Crumb[];
  /** Accessible href for the blue back-arrow chip. When omitted, the chip is not rendered. */
  backHref?: string;
  /** Small-caps accessible label. Defaults to "Breadcrumb". */
  ariaLabel?: string;
  className?: string;
}

/**
 * Breadcrumb trail — optional blue back-arrow chip, chevron separators,
 * bold terminal crumb. Matches the "TIMS > Professional Development >
 * Training Details" pattern in the Figma reference.
 *
 * Intentionally framework-agnostic for links (renders `<a>`). App-specific
 * router integration is done at the call site by wrapping the result in
 * your router's Link component when needed.
 */
export function Breadcrumbs({
  items,
  backHref,
  ariaLabel = "Breadcrumb",
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) return null;
  return (
    <nav aria-label={ariaLabel} className={cn("flex items-center gap-2 text-[var(--text-sm)]", className)}>
      {backHref ? (
        <a
          href={backHref}
          aria-label="Back"
          className="inline-flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-interactive-primary-hover)]"
        >
          <span aria-hidden="true">←</span>
        </a>
      ) : null}
      <ol className="flex min-w-0 flex-wrap items-center gap-2 text-[var(--color-text-secondary)]">
        {items.map((crumb, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = crumb.current ?? isLast;
          return (
            <li key={index} className="flex min-w-0 items-center gap-2">
              {isCurrent || !crumb.href ? (
                <span
                  aria-current={isCurrent ? "page" : undefined}
                  className={cn(
                    "truncate",
                    isCurrent
                      ? "font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
                      : "text-[var(--color-text-secondary)]",
                  )}
                >
                  {crumb.label}
                </span>
              ) : (
                <a
                  href={crumb.href}
                  className="truncate text-[var(--color-text-secondary)] hover:text-[var(--color-text-brand)] hover:underline"
                >
                  {crumb.label}
                </a>
              )}
              {!isLast ? (
                <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">
                  ›
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
