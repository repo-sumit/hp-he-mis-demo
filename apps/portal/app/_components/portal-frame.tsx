"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { t } from "@hp-mis/i18n";
import { cn, Breadcrumbs, Footer, SectionBanner, type Crumb } from "@hp-mis/ui";
import { useSession, type PortalRole } from "./data/session-provider";
import { RoleSwitcher } from "./admin/role-switcher";

export type PortalNavKey =
  | "overview"
  | "applications"
  | "convenor_queue"
  | "college_dashboard"
  | "cycle"
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
  roles: PortalRole[];
  href?: string;
  hrefByRole?: Partial<Record<PortalRole, string>>;
  labelKey: string;
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
    key: "cycle",
    icon: "🗓",
    roles: ["state_admin"],
    href: "/state/cycle",
    labelKey: "portal.sidebar.cycle",
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
    roles: ["college_admin"],
    href: "/college/seats",
    labelKey: "portal.sidebar.seats",
  },
  {
    key: "merit",
    icon: "🏅",
    roles: ["state_admin"],
    href: "/merit",
    labelKey: "portal.sidebar.merit",
  },
  {
    key: "allocation",
    icon: "🎯",
    roles: ["state_admin"],
    href: "/allocation",
    labelKey: "portal.sidebar.allocation",
  },
  {
    key: "reports",
    icon: "📈",
    roles: ["state_admin", "college_admin"],
    href: "/reports",
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
  active: PortalNavKey;
  eyebrow?: string;
  title: string;
  headerRight?: ReactNode;
  /** Optional breadcrumb trail — rendered between header and banner. */
  breadcrumbs?: readonly Crumb[];
  /** Optional back-arrow chip for the breadcrumb trail (blue square, matches Figma). */
  breadcrumbsBackHref?: string;
  /** Optional saturated-blue page sub-header. Use for detail screens. */
  banner?: {
    title: ReactNode;
    eyebrow?: ReactNode;
    actions?: ReactNode;
  };
  children: ReactNode;
  contentClassName?: string;
}

/**
 * Shared admin shell — left sidebar on light-blue wash, white top bar,
 * optional breadcrumbs + saturated-blue SectionBanner slot. Role logic is
 * unchanged from V1: items are filtered by session role, and the Overview
 * link's href flips per role.
 */
export function PortalFrame({
  active,
  eyebrow,
  title,
  headerRight,
  breadcrumbs,
  breadcrumbsBackHref,
  banner,
  children,
  contentClassName,
}: Props) {
  const { session } = useSession();
  const role = session.role;

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="flex min-h-dvh flex-col md:grid md:grid-cols-[var(--sidebar-width)_1fr]">
      <aside className="hidden flex-col bg-[var(--color-sidebar-bg)] text-[var(--color-sidebar-fg)] md:flex">
        <div className="flex flex-col items-center gap-2 border-b border-[var(--color-sidebar-border)] px-5 py-5 text-center">
          <Image
            src="/hpu-logo.png"
            alt="HPU"
            width={72}
            height={72}
            priority
            className="h-14 w-14 flex-none rounded-[var(--radius-pill)] bg-white p-1 shadow-[var(--shadow-sm)]"
          />
          <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-sidebar-fg-muted)]">
            {t("en", "app.name")}
          </p>
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-sidebar-fg)]">
            Cycle 2026-27
          </p>
        </div>
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const isActive = item.key === active;
              const href =
                item.hrefByRole?.[role] ??
                item.href ??
                "/";
              const base =
                "group flex items-center gap-3 rounded-[var(--radius-pill)] px-4 py-2.5 text-[var(--text-sm)]";
              if (item.disabled) {
                return (
                  <li key={item.key}>
                    <div
                      aria-disabled="true"
                      title="Coming soon"
                      className={cn(
                        base,
                        "cursor-not-allowed text-[var(--color-sidebar-fg-muted)] opacity-80",
                      )}
                    >
                      <span aria-hidden="true">{item.icon}</span>
                      <span className="flex-1 truncate">{t("en", item.labelKey)}</span>
                      <span className="rounded-[var(--radius-pill)] bg-[var(--hp-primary-700)] px-2 py-0.5 text-[10px] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-inverse)]">
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
                      base,
                      "transition-[background-color,color,box-shadow]",
                      isActive
                        ? "bg-[var(--color-sidebar-active-bg)] font-[var(--weight-semibold)] text-[var(--color-sidebar-active-fg)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--color-sidebar-fg)] hover:bg-[var(--color-sidebar-hover-bg)]",
                    )}
                  >
                    <span aria-hidden="true">{item.icon}</span>
                    <span className="truncate">{t("en", item.labelKey)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-[var(--color-sidebar-border)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-sidebar-fg-muted)]">
          Demo build · HPU V1
        </div>
      </aside>

      <div className="flex min-w-0 flex-col bg-[var(--color-background)]">
        <header className="sticky top-0 z-20 flex h-[var(--header-height)] items-center justify-between gap-4 border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-4 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Image
              src="/hpu-logo.png"
              alt="HPU"
              width={32}
              height={32}
              priority
              className="h-8 w-8 flex-none rounded-[var(--radius-pill)] bg-white p-0.5 shadow-[var(--shadow-sm)] md:hidden"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-[var(--weight-medium)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
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
          {breadcrumbs ? (
            <Breadcrumbs
              items={breadcrumbs}
              backHref={breadcrumbsBackHref}
              className="mb-4"
            />
          ) : null}
          {banner ? (
            <SectionBanner
              title={banner.title}
              eyebrow={banner.eyebrow}
              actions={banner.actions}
              className="mb-5"
            />
          ) : null}
          {children}
        </main>

        <Footer
          columns={[
            {
              heading: "Support",
              links: [
                { label: "Helpdesk", href: "mailto:helpdesk@hpu.admission.gov.in" },
                { label: "Contact DHE", href: "mailto:dhe@hp.gov.in" },
                { label: "Report an issue", href: "mailto:helpdesk@hpu.admission.gov.in" },
              ],
            },
            {
              heading: "Resources",
              links: [
                { label: "Scrutiny SOP", href: "#" },
                { label: "Cycle calendar", href: "#" },
                { label: "Audit log", href: "#" },
              ],
            },
            {
              heading: "Legal",
              links: [
                { label: "Privacy", href: "#" },
                { label: "Terms of use", href: "#" },
                { label: "Accessibility", href: "#" },
              ],
            },
          ]}
          brand={
            <>
              <p className="font-[var(--weight-semibold)] text-[var(--color-text-secondary)]">
                HPU Admission · Admin portal
              </p>
              <p className="mt-1">
                Department of Higher Education, Government of Himachal Pradesh. Cycle
                2026-27.
              </p>
            </>
          }
          note="© 2026 Government of Himachal Pradesh. All rights reserved. For official admission use only."
        />
      </div>
    </div>
  );
}
