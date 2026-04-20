"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { StatusTracker } from "../_components/status-tracker";
import { NextActionCard } from "../_components/next-action-card";
import { NotificationItem } from "../_components/notification-item";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";

const QUICK_LINKS = [
  { key: "documents", icon: "📄", href: "/documents" },
  { key: "eligibility", icon: "✓", href: "/dashboard" },
  { key: "notifications", icon: "🔔", href: "/dashboard" },
  { key: "helpdesk", icon: "💬", href: "/help" },
] as const;

const NOTIFICATIONS = [
  { key: "welcome", time: "2 min ago", unread: true },
  { key: "dates", time: "1 hr ago", unread: true },
  { key: "language", time: "Today", unread: false },
] as const;

export default function DashboardPage() {
  const { t } = useLocale();

  return (
    <PageShell
      eyebrow={t("screen.home.cycleTag")}
      title={t("app.name")}
      footer={<BottomTabBar />}
    >
      <section>
        <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("nav.home")}
        </p>
        <h2 className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("screen.dashboard.greeting", { name: "Asha" })}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("screen.dashboard.subGreeting")}
        </p>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.statusTitle")}
        </h3>
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <StatusTracker currentStep="profileComplete" />
        </div>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.nextActionTitle")}
        </h3>
        <NextActionCard
          title={t("screen.dashboard.nextActionTitle")}
          body={t("screen.dashboard.nextActionBody", { n: 3 })}
          cta={t("screen.dashboard.nextActionCta")}
          href="/profile/step/1"
          deadline={t("screen.home.datesLine")}
        />
      </section>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("screen.dashboard.notificationsTitle")}
          </h3>
          <Link
            href="/dashboard"
            className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("screen.dashboard.viewAllNotifications")}
          </Link>
        </div>
        <ul className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4">
          {NOTIFICATIONS.map((item) => (
            <NotificationItem
              key={item.key}
              title={t(`screen.dashboard.mockNotifications.${item.key}`)}
              time={item.time}
              unread={item.unread}
            />
          ))}
        </ul>
      </section>

      <section className="mt-5 pb-4">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("screen.dashboard.quickLinksTitle")}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.key}
              href={link.href}
              className="flex items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:bg-[var(--color-background-subtle)]"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
              >
                {link.icon}
              </span>
              <span className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                {t(`quickLink.${link.key}`)}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
