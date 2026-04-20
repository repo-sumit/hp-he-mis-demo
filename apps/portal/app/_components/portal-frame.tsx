"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@hp-mis/i18n";
import { cn } from "@hp-mis/ui";

export type PortalNavKey =
  | "overview"
  | "applications"
  | "colleges"
  | "courses"
  | "seats"
  | "merit"
  | "allocation"
  | "reports"
  | "users"
  | "settings";

const NAV_ITEMS: ReadonlyArray<{ key: PortalNavKey; href: string; icon: string }> = [
  { key: "overview", href: "/", icon: "📊" },
  { key: "applications", href: "/applications", icon: "📝" },
  { key: "colleges", href: "/colleges", icon: "🏛️" },
  { key: "courses", href: "/courses", icon: "📚" },
  { key: "seats", href: "/seats", icon: "🎫" },
  { key: "merit", href: "/merit", icon: "🏅" },
  { key: "allocation", href: "/allocation", icon: "🎯" },
  { key: "reports", href: "/reports", icon: "📈" },
  { key: "users", href: "/users", icon: "👥" },
  { key: "settings", href: "/settings", icon: "⚙️" },
];

interface Props {
  /** Highlights the matching sidebar item. */
  active: PortalNavKey;
  /** Top-bar eyebrow text (small, above the title). */
  eyebrow?: string;
  /** Top-bar title (h1). */
  title: string;
  /** Optional right-aligned node in the top bar (e.g. reviewer identity). */
  headerRight?: ReactNode;
  /** Page content. Main gets standard padding; pages can override via `contentClassName`. */
  children: ReactNode;
  /** Swap content padding when a page wants an edge-to-edge layout. */
  contentClassName?: string;
}

/**
 * Shared admin shell — left sidebar, top bar, main content. Desktop-first;
 * collapses to a single column under 1024px and hides the sidebar below 768px
 * (admin traffic is desktop but tablet reviewers exist).
 */
export function PortalFrame({
  active,
  eyebrow,
  title,
  headerRight,
  children,
  contentClassName,
}: Props) {
  return (
    <div className="flex min-h-dvh flex-col md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Admin portal
          </p>
          <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("en", "app.name")}
          </p>
        </div>
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = item.key === active;
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)]",
                      isActive
                        ? "bg-[var(--color-background-brand-subtle)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-subtle)]",
                    )}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{t("en", `portal.sidebar.${item.key}`)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-[var(--color-border)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Demo build · V1 shell
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 md:px-6">
          <div className="min-w-0">
            <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {eyebrow ?? "Cycle 2026-27 · Application window"}
            </p>
            <h1 className="truncate text-[var(--text-xl)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {title}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {headerRight ?? <span>State admin · demo@hp.gov.in</span>}
          </div>
        </header>

        <main className={cn("flex-1 px-4 py-5 md:px-6 md:py-6", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
