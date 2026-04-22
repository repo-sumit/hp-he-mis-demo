"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@hp-mis/ui";
import { useLocale } from "./locale-provider";

const TABS = [
  { key: "home", href: "/dashboard", icon: "🏠" },
  { key: "myApplications", href: "/applications", icon: "📝" },
  { key: "help", href: "/help", icon: "💬" },
] as const;

/**
 * Mobile / tablet tab bar. On desktop the shell shows breadcrumbs in the
 * header and the bar is hidden — repeating icons at 1280 px looked like a
 * phone mockup pinned to the bottom of a browser window.
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      aria-label={t("nav.home")}
      className="mx-auto grid max-w-[var(--content-mobile-tab-bar)] grid-cols-3 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {TABS.map((tab) => {
        const active =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[var(--tap-target-min)] flex-col items-center justify-center gap-1 py-2 text-[var(--text-xxs)] transition-colors",
              active
                ? "font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]",
            )}
          >
            <span aria-hidden="true" className="text-lg leading-none">
              {tab.icon}
            </span>
            <span className="truncate px-1 text-center">{t(`nav.${tab.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
