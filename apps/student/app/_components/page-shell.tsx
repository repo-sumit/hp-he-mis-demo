"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";
import { LocaleToggle } from "./locale-toggle";
import { useLocale } from "./locale-provider";

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
   * Content width. Forms default to "narrow"; reading screens use
   * "comfortable"; dashboards / discover use "wide".
   */
  width?: ShellWidth;
  /** Remove outer padding so a child can bleed to the edges (e.g. hero image). */
  bleed?: boolean;
  /** Extra class on the inner scroll container. */
  className?: string;
};

const WIDTH_CLASS: Record<ShellWidth, string> = {
  narrow: "max-w-[var(--content-narrow)]",
  comfortable: "max-w-[var(--content-comfortable)]",
  wide: "max-w-[var(--content-wide)]",
};

/**
 * Responsive frame for every student screen.
 *
 * Mobile → single column filling the viewport, sticky bottom footer slot.
 * Tablet → same layout with generous gutters.
 * Desktop → constrained reading column (width variant), full-bleed header
 * and footer strips for visual weight without the "phone mockup in grey
 * canvas" look. The app no longer draws a card-wrapper around every screen.
 */
export function PageShell({
  children,
  backHref,
  eyebrow,
  title,
  hideLocaleToggle,
  footer,
  width = "narrow",
  bleed,
  className,
}: PageShellProps) {
  const { t } = useLocale();
  const containerClass = cn("mx-auto w-full px-4 sm:px-6 lg:px-8", WIDTH_CLASS[width]);

  return (
    <div className="flex min-h-dvh flex-col bg-[var(--color-background)] text-[var(--color-text-primary)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)]/90 backdrop-blur supports-[backdrop-filter]:bg-[var(--color-surface)]/75">
        <div className={cn("flex items-center justify-between gap-3 py-3", containerClass)}>
          <div className="flex min-w-0 items-center gap-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label={t("cta.back")}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] text-[var(--color-text-primary)] transition-colors hover:bg-[var(--color-background-subtle)]"
              >
                <span aria-hidden="true">←</span>
              </Link>
            ) : (
              <Image
                src="/hpu-logo.png"
                alt="HPU"
                width={36}
                height={36}
                priority
                className="h-9 w-9 flex-none rounded-[var(--radius-sm)]"
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
          bleed ? "" : cn("py-6 sm:py-8 lg:py-10", containerClass),
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
