"use client";

import Link from "next/link";
import { PageShell } from "./_components/page-shell";
import { useLocale } from "./_components/locale-provider";

export default function HomePage() {
  const { t } = useLocale();

  return (
    <PageShell eyebrow={t("screen.home.cycleTag")} title={t("app.name")} width="wide">
      <section className="overflow-hidden rounded-[var(--radius-xl)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-lg)]">
        <div
          className="px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-14"
          style={{ background: "var(--gradient-brand-hero)" }}
        >
          <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
            <div>
              <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-white/70">
                {t("screen.home.cycleTag")}
              </p>
              <h2 className="mt-3 text-[var(--text-3xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] sm:text-[var(--text-4xl)] lg:text-[var(--text-display)]">
                {t("screen.home.heading")}
              </h2>
              <p className="mt-4 max-w-prose text-[var(--text-base)] leading-[var(--leading-relaxed)] text-white/85 sm:text-[var(--text-lg)]">
                {t("screen.home.body")}
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/register"
                  className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] px-6 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-md)] transition-all hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-lg)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 active:bg-[var(--color-interactive-primary-active)]"
                >
                  {t("cta.register")}
                </Link>
                <Link
                  href="/login"
                  className="inline-flex h-12 min-w-[10rem] items-center justify-center rounded-[var(--radius-md)] border border-white/50 bg-transparent px-6 text-[var(--text-sm)] font-[var(--weight-semibold)] text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
                >
                  {t("cta.login")}
                </Link>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-white/20 bg-white/10 p-4 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-white/90 backdrop-blur">
              <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-white/70">
                {t("screen.home.cycleBannerLabel")}
              </p>
              <p className="mt-2 text-[var(--text-base)] font-[var(--weight-semibold)] text-white">
                {t("screen.home.datesLine")}
              </p>
              <p className="mt-3 text-[var(--text-sm)] text-white/80">
                {t("screen.home.assistedMode")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {t("preLogin.learnBeforeApplying.title")}
            </p>
            <h3 className="mt-1 text-[var(--text-xl)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] sm:text-[var(--text-2xl)]">
              {t("preLogin.learnBeforeApplying.heading")}
            </h3>
          </div>
          <p className="max-w-md text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("preLogin.learnBeforeApplying.subtitle")}
          </p>
        </div>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(
            [
              { href: "/dates", key: "dates", icon: "🗓" },
              { href: "/how-it-works", key: "howItWorks", icon: "🧭" },
              { href: "/merit-lookup", key: "meritLookup", icon: "🏅" },
            ] as const
          ).map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className="group flex h-full items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]"
              >
                <span
                  aria-hidden="true"
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] text-lg text-[var(--color-text-brand)]"
                >
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {t(`preLogin.cards.${item.key}.title`)}
                  </span>
                  <span className="mt-1 block text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                    {t(`preLogin.cards.${item.key}.body`)}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-1 flex-none text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 border-t border-[var(--color-border-subtle)] pt-6 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        <span>{t("screen.home.trustLine")}</span>
      </section>
    </PageShell>
  );
}
