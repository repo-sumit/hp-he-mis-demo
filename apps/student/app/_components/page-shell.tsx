"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@hp-mis/ui";
import { LocaleToggle } from "./locale-toggle";
import { useLocale } from "./locale-provider";

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
  /** Sticky footer area, e.g. bottom tab bar. */
  footer?: ReactNode;
  /** Extra class on the inner scroll container. */
  className?: string;
};

/**
 * Mobile-first frame for every student screen. On wider viewports the content
 * is centered inside a 430px column to mimic the SwiftChat phone frame.
 */
export function PageShell({
  children,
  backHref,
  eyebrow,
  title,
  hideLocaleToggle,
  footer,
  className,
}: PageShellProps) {
  const { t } = useLocale();

  return (
    <div className="flex min-h-dvh w-full justify-center bg-[var(--color-background-subtle)]">
      <div
        className={cn(
          "flex min-h-dvh w-full max-w-[var(--mobile-max)] flex-col bg-[var(--color-background)] shadow-[var(--shadow-lg)]",
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            {backHref ? (
              <Link
                href={backHref}
                aria-label={t("cta.back")}
                className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
              >
                <span aria-hidden="true">←</span>
              </Link>
            ) : (
              <Image
                src="/hpu-logo.png"
                alt="HPU"
                width={32}
                height={32}
                priority
                className="h-8 w-8 flex-none rounded-[var(--radius-sm)]"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-wide text-[var(--color-text-tertiary)] sm:text-[var(--text-xs)]">
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
        </header>

        <main
          className={cn(
            "flex-1 overflow-y-auto px-3 py-4 sm:px-4 sm:py-5",
            className,
          )}
        >
          {children}
        </main>

        {footer ? (
          <div className="sticky bottom-0 z-10 bg-[var(--color-surface)]">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
