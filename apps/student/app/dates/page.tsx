"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { PrimaryLink } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

const ROWS = [
  "registrationOpens",
  "applicationsClose",
  "meritPublishes",
  "firstAllotment",
] as const;

/**
 * Pre-login dates screen. Absorbs the "Important dates" block from the
 * retired public-web landing. Bilingual via the existing LocaleProvider —
 * both the row label and the date value are translated.
 */
export default function DatesPage() {
  const { t } = useLocale();

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.dates.title")}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("preLogin.dates.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("preLogin.dates.subtitle")}
        </p>
      </section>

      <ul className="mt-5 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        {ROWS.map((key) => (
          <li
            key={key}
            className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t(`preLogin.dates.rows.${key}`)}
            </p>
            <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {t(`preLogin.dates.dateValues.${key}`)}
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        {t("preLogin.dates.footnote")}
      </p>

      <div className="mt-6 flex flex-col gap-2">
        <PrimaryLink href="/register">{t("cta.register")}</PrimaryLink>
        <Link
          href="/"
          className="text-center text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("common.backToHome")}
        </Link>
      </div>
    </PageShell>
  );
}
