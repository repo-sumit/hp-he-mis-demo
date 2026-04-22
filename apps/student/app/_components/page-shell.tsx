"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";
import { LocaleToggle } from "./locale-toggle";
import { useLocale } from "./locale-provider";

/**
 * Retained for API stability. The shell now renders every page at a uniform
 * `max-w-6xl` container, so this prop is a no-op — existing callers can keep
 * passing it without behaviour changes.
 */
export type ShellWidth = "narrow" | "comfortable" | "wide";

type PageShellProps = {
  children: ReactNode;
  /** Optional back-link target; hides the back arrow when omitted. */
  backHref?: string;
  /** Small eyebrow text shown above the title. */
  eyebrow?: string;
  /** Page title shown in the header. */
  title?: string;
  /** Hide the language toggle (e.g. on the language-selector screen itself). */
  hideLocaleToggle?: boolean;
  /** Sticky footer (e.g. bottom tab bar, action bar). */
  footer?: ReactNode;
  /**
   * Deprecated — the shell now always renders at the system width. The prop
   * stays accepted so existing callers don't break.
   */
  width?: ShellWidth;
  /** Remove outer padding so a child can bleed to the edges (e.g. hero image). */
  bleed?: boolean;
  /** Extra class on the inner scroll container. */
  className?: string;
};

/**
 * System layout: a single responsive frame used by every student screen.
 *
 * The inner container is always `mx-auto w-full max-w-6xl px-6` with `py-6`
 * vertical padding on the main area. Header and sticky footer strips use
 * the same container so chrome and content stay aligned edge-to-edge.
 *
 * Pages that want a narrower reading or form column should constrain their
 * own content (e.g. wrap a `<form>` in `max-w-xl`) — the outer chrome stays
 * uniform across every screen.
 */
export function PageShell({
  children,
  backHref,
  eyebrow,
  title,
  hideLocaleToggle,
  footer,
  bleed,
  className,
}: PageShellProps) {
  const { t } = useLocale();
  const containerClass = "mx-auto w-full max-w-6xl px-6";

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/92 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/80">
        <div className={cn("flex items-center justify-between gap-3 py-3", containerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label={t("cta.back")}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-interactive-brand-hover)]"
              >
                <span aria-hidden="true">←</span>
              </Link>
            ) : (
              <Image
                src="/hpu-logo.png"
                alt="HPU"
                width={40}
                height={40}
                priority
                className="h-10 w-10 flex-none rounded-[var(--radius-pill)] bg-white p-0.5 shadow-[var(--shadow-sm)]"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
                {eyebrow ?? t("app.name")}
              </p>
              {title ? (
                <h1 className="truncate text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] sm:text-[var(--text-lg)]">
                  {title}
                </h1>
              ) : null}
            </div>
          </div>
          {hideLocaleToggle ? null : <LocaleToggle />}
        </div>
      </header>

      <main
        className={cn(
          "flex-1",
          bleed ? "" : cn("py-6", containerClass),
          className,
        )}
      >
        {children}
      </main>

      {footer ? (
        <div className="sticky bottom-0 z-10 border-t border-[var(--color-border-subtle)] bg-[var(--color-surface)]/95 backdrop-blur">
          <div className={containerClass}>{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
