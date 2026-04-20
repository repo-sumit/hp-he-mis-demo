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
 * Pre-login explainer — ported from the retired public-web landing's
 * "How it works" section. Mobile-first ordered list so the four steps feel
 * like a single short scroll.
 */
export default function HowItWorksPage() {
  const { t } = useLocale();

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.howItWorks.title")}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("preLogin.howItWorks.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("preLogin.howItWorks.subtitle")}
        </p>
      </section>

      <ol className="mt-5 space-y-3">
        {STEPS.map((step, idx) => (
          <li
            key={step.key}
            className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]"
            >
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                <span aria-hidden="true" className="mr-1">
                  {step.icon}
                </span>
                {t(`preLogin.howItWorks.steps.${step.key}Title`)}
              </p>
              <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                {t(`preLogin.howItWorks.steps.${step.key}Body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-col gap-2">
        <PrimaryLink href="/register">{t("preLogin.howItWorks.readyCta")}</PrimaryLink>
      </div>
    </PageShell>
  );
}
