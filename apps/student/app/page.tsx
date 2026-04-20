"use client";

import Link from "next/link";
import { cn } from "@hp-mis/ui";
import { PageShell } from "./_components/page-shell";
import { PrimaryLink } from "./_components/primary-button";
import { useLocale } from "./_components/locale-provider";

type Quick = { key: "checkEligibility" | "importantDates"; icon: string; href: string };

const QUICK: Quick[] = [
  { key: "checkEligibility", icon: "✓", href: "/dashboard" },
  { key: "importantDates", icon: "🗓", href: "/dashboard" },
];

export default function HomePage() {
  const { t } = useLocale();

  return (
    <PageShell eyebrow={t("screen.home.cycleTag")} title={t("app.name")}>
      <section className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-interactive-brand)] p-5 text-[var(--color-text-inverse)] shadow-[var(--shadow-md)]">
        <p className="text-[var(--text-xs)] uppercase tracking-wide opacity-80">
          {t("screen.home.cycleTag")}
        </p>
        <h2 className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-tight">
          {t("screen.home.heading")}
        </h2>
        <p className="mt-3 text-[var(--text-sm)] opacity-90">{t("screen.home.body")}</p>
        <div
          className="mt-4 rounded-[var(--radius-md)] bg-white/10 px-3 py-2 text-[var(--text-xs)] font-[var(--weight-medium)]"
          aria-live="polite"
        >
          {t("screen.home.datesLine")}
        </div>
      </section>

      <section className="mt-5 space-y-3">
        <PrimaryLink href="/register">{t("cta.register")}</PrimaryLink>
        <PrimaryLink href="/login" variant="secondary">
          {t("cta.login")}
        </PrimaryLink>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3">
        {QUICK.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              "flex flex-col items-start gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 text-left hover:bg-[var(--color-background-subtle)]",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
            >
              {item.icon}
            </span>
            <span className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t(`cta.${item.key}`)}
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          <span aria-hidden="true" className="mr-1">ℹ️</span>
          {t("screen.home.assistedMode")}
        </p>
      </section>

      <section className="mt-6 flex items-center justify-between text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        <span>{t("screen.home.trustLine")}</span>
        <Link href="/language" className="font-[var(--weight-medium)] text-[var(--color-text-link)]">
          {t("nav.changeLanguage")}
        </Link>
      </section>
    </PageShell>
  );
}
