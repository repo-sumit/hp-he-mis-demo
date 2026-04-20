"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@hp-mis/i18n";
import { cn } from "@hp-mis/ui";
import { useSession, type PortalRole } from "./data/session-provider";
import { RoleSwitcher } from "./admin/role-switcher";

export type PortalNavKey =
  | "overview"
  | "applications"
  | "convenor_queue"
  | "college_dashboard"
  | "finance"
  | "leadership"
  | "colleges"
  | "courses"
  | "seats"
  | "merit"
  | "allocation"
  | "reports"
  | "users"
  | "settings";

type NavItem = {
  key: PortalNavKey;
  icon: string;
  /** Who sees this item. */
  roles: PortalRole[];
  /** Static href used by all roles; overridden by `hrefByRole` when present. */
  href?: string;
  /** Per-role href override — used by Overview to land each role on their own home. */
  hrefByRole?: Partial<Record<PortalRole, string>>;
  /** i18n key under `portal.sidebar.*`. */
  labelKey: string;
  /** Routes that exist but haven't been built — render as non-clickable "Soon". */
  disabled?: boolean;
};

const ALL_ROLES: PortalRole[] = [
  "state_admin",
  "college_admin",
  "college_operator",
  "convenor",
  "finance",
  "leadership",
];

/**
 * Overview lands each role on their own "home" so a college operator doesn't
 * have to scroll past state-wide KPIs to reach their queue.
 */
const OVERVIEW_HREF_BY_ROLE: Partial<Record<PortalRole, string>> = {
  state_admin: "/",
  college_admin: "/college/dashboard",
  college_operator: "/college/dashboard",
  convenor: "/convenor/queue",
  finance: "/finance",
  leadership: "/leadership",
};

const NAV_ITEMS: readonly NavItem[] = [
  {
    key: "overview",
    icon: "📊",
    roles: ALL_ROLES,
    hrefByRole: OVERVIEW_HREF_BY_ROLE,
    labelKey: "portal.sidebar.overview",
  },
  {
    key: "applications",
    icon: "📝",
    roles: ["state_admin", "college_admin", "college_operator", "leadership"],
    href: "/applications",
    labelKey: "portal.sidebar.applications",
  },
  {
    key: "convenor_queue",
    icon: "🧭",
    roles: ["convenor"],
    href: "/convenor/queue",
    labelKey: "portal.sidebar.convenorQueue",
  },
  {
    key: "college_dashboard",
    icon: "🏫",
    roles: ["college_admin", "college_operator"],
    href: "/college/dashboard",
    labelKey: "portal.sidebar.collegeDashboard",
  },
  {
    key: "finance",
    icon: "💳",
    roles: ["finance"],
    href: "/finance",
    labelKey: "portal.sidebar.finance",
  },
  {
    key: "leadership",
    icon: "🏛",
    roles: ["leadership"],
    href: "/leadership",
    labelKey: "portal.sidebar.leadership",
  },
  // Placeholders — built in later sprints. Role-filtered so each persona only
  // sees the "Soon" items they'll eventually use.
  {
    key: "colleges",
    icon: "🏛️",
    roles: ["state_admin", "leadership"],
    href: "/colleges",
    disabled: true,
    labelKey: "portal.sidebar.colleges",
  },
  {
    key: "courses",
    icon: "📚",
    roles: ["state_admin"],
    href: "/courses",
    disabled: true,
    labelKey: "portal.sidebar.courses",
  },
  {
    key: "seats",
    icon: "🎫",
    roles: ["state_admin", "college_admin"],
    href: "/seats",
    disabled: true,
    labelKey: "portal.sidebar.seats",
  },
  {
    key: "merit",
    icon: "🏅",
    roles: ["state_admin"],
    href: "/merit",
    disabled: true,
    labelKey: "portal.sidebar.merit",
  },
  {
    key: "allocation",
    icon: "🎯",
    roles: ["state_admin"],
    href: "/allocation",
    disabled: true,
    labelKey: "portal.sidebar.allocation",
  },
  {
    key: "reports",
    icon: "📈",
    roles: ["state_admin", "college_admin", "finance", "leadership"],
    href: "/reports",
    disabled: true,
    labelKey: "portal.sidebar.reports",
  },
  {
    key: "users",
    icon: "👥",
    roles: ["state_admin", "college_admin"],
    href: "/users",
    disabled: true,
    labelKey: "portal.sidebar.users",
  },
  {
    key: "settings",
    icon: "⚙️",
    roles: ALL_ROLES,
    href: "/settings",
    disabled: true,
    labelKey: "portal.sidebar.settings",
  },
];

interface Props {
  /** Highlights the matching sidebar item. */
  active: PortalNavKey;
  /** Top-bar eyebrow text (small, above the title). */
  eyebrow?: string;
  /** Top-bar title (h1). */
  title: string;
  /** Optional right-aligned node in the top bar. Defaults to the role switcher. */
  headerRight?: ReactNode;
  /** Page content. Main gets standard padding; pages can override via `contentClassName`. */
  children: ReactNode;
  /** Swap content padding when a page wants an edge-to-edge layout. */
  contentClassName?: string;
}

/**
 * Shared admin shell — left sidebar, top bar, main content. Desktop-first;
 * collapses to a single column under 1024px and hides the sidebar below 768px
 * (admin traffic is desktop but tablet reviewers exist). Sidebar items are
 * filtered by the session's role, and the Overview item's href flips per
 * role so each persona lands on their own dashboard.
 */
export function PortalFrame({
  active,
  eyebrow,
  title,
  headerRight,
  children,
  contentClassName,
}: Props) {
  const { session } = useSession();
  const role = session.role;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-dvh flex-col md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)] md:flex">
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-5 py-4">
          <Image
            src="/hpu-logo.png"
            alt="HPU"
            width={36}
            height={36}
            priority
            className="h-9 w-9 flex-none rounded-[var(--radius-sm)]"
          />
          <div className="min-w-0">
            <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Admin portal
            </p>
            <p className="truncate text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t("en", "app.name")}
            </p>
          </div>
        </div>
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = item.key === active;
              const href =
                item.hrefByRole?.[role] ??
                item.href ??
                "/";
              if (item.disabled) {
                return (
                  <li key={item.key}>
                    <div
                      aria-disabled="true"
                      title="Coming soon"
                      className={cn(
                        "flex cursor-not-allowed items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-tertiary)] opacity-70",
                      )}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span className="flex-1">{t("en", item.labelKey)}</span>
                      <span className="rounded-[var(--radius-pill)] bg-[var(--color-background-muted)] px-2 py-0.5 text-[10px] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                        Soon
                      </span>
                    </div>
                  </li>
                );
              }
              return (
                <li key={item.key}>
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)]",
                      isActive
                        ? "bg-[var(--color-background-brand-subtle)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                        : "text-[var(--color-text-secondary)] hover:bg-[var(--color-background-subtle)]",
                    )}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span>{t("en", item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-[var(--color-border)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Demo build · HPU Admission V1
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/hpu-logo.png"
              alt="HPU"
              width={32}
              height={32}
              priority
              className="h-8 w-8 flex-none rounded-[var(--radius-sm)] md:hidden"
            />
            <div className="min-w-0">
              <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {eyebrow ?? "HPU Admission · Cycle 2026-27"}
              </p>
              <h1 className="truncate text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] md:text-[var(--text-xl)]">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {headerRight ?? <RoleSwitcher />}
          </div>
        </header>

        <main className={cn("flex-1 px-4 py-5 md:px-6 md:py-6", contentClassName)}>
          {children}
        </main>
      </div>
    </div>
  );
}
