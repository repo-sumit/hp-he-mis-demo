"use client";

import { PageShell } from "../_components/page-shell";
import { PrimaryLink } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

const STEPS = [
  { key: "register", icon: "📝" },
  { key: "profile", icon: "👤" },
  { key: "pick", icon: "🎓" },
  { key: "track", icon: "📬" },
] as const;

/**
 * Pre-login "How it works" explainer. Mobile-first ordered list so the four
 * steps feel like a single short scroll.
 */
export default function HowItWorksPage() {
  const { t } = useLocale();

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.howItWorks.title")}
      width="comfortable"
    >
      <section>
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("preLogin.cards.howItWorks.title")}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {t("preLogin.howItWorks.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)] sm:text-[var(--text-base)]">
          {t("preLogin.howItWorks.subtitle")}
        </p>
      </section>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2">
        {STEPS.map((step, idx) => (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5"
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-background-brand-subtle)] text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--color-text-brand)]"
            >
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                <span aria-hidden="true" className="mr-1.5">
                  {step.icon}
                </span>
                {t(`preLogin.howItWorks.steps.${step.key}Title`)}
              </p>
              <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {t(`preLogin.howItWorks.steps.${step.key}Body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex">
        <PrimaryLink href="/register">{t("preLogin.howItWorks.readyCta")}</PrimaryLink>
      </div>
    </PageShell>
  );
}
