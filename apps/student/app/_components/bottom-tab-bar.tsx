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

export function BottomTabBar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      aria-label={t("nav.home")}
      className="grid grid-cols-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] pb-[env(safe-area-inset-bottom)]"
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
              "flex min-h-[var(--tap-target-min)] flex-col items-center justify-center gap-0.5 py-2 text-[11px] sm:text-[var(--text-xs)]",
              active
                ? "font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                : "text-[var(--color-text-secondary)]",
            )}
          >
            <span aria-hidden="true" className="text-lg">
              {tab.icon}
            </span>
            <span className="truncate px-1 text-center">{t(`nav.${tab.key}`)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
