"use client";

import { PageShell } from "../../../_components/page-shell";
import { PrimaryLink } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";

interface Props {
  titleKey: string;
  subtitleKey: string;
}

/**
 * Shared "we'll plug in the interactive tool next sprint" scaffold for the
 * Best-of-Five calculator and CBSE CGPA converter entry points.
 */
export function ToolPlaceholder({ titleKey, subtitleKey }: Props) {
  const { t } = useLocale();
  return (
    <PageShell
      backHref="/profile/step/3"
      eyebrow={t("profile.header.title")}
      title={t(titleKey)}
    >
      <section className="space-y-3">
        <h2 className="text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t(titleKey)}
        </h2>
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t(subtitleKey)}
        </p>
        <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          <p>
            <span aria-hidden="true" className="mr-1">🧮</span>
            {t("calculator.placeholder")}
          </p>
        </div>
      </section>
      <div className="mt-8">
        <PrimaryLink href="/profile/step/3" variant="secondary">
          {t("cta.backToProfile")}
        </PrimaryLink>
      </div>
    </PageShell>
  );
}
