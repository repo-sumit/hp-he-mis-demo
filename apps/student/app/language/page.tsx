"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Locale } from "@hp-mis/i18n";
import { cn } from "@hp-mis/ui";
import { PageShell } from "../_components/page-shell";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

type Choice = { value: Locale; title: string; subtitle: string; glyph: string };

export default function LanguagePage() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocale();
  const [selected, setSelected] = useState<Locale>(locale);

  const choices: Choice[] = [
    {
      value: "en",
      title: t("screen.language.englishCardTitle"),
      subtitle: t("screen.language.englishCardSubtitle"),
      glyph: "A",
    },
    {
      value: "hi",
      title: t("screen.language.hindiCardTitle"),
      subtitle: t("screen.language.hindiCardSubtitle"),
      glyph: "अ",
    },
  ];

  function handleContinue() {
    setLocale(selected);
    router.push("/");
  }

  return (
    <PageShell
      backHref="/"
      eyebrow={t("app.name")}
      title={t("screen.language.title")}
      hideLocaleToggle
    >
      <div className="flex min-h-full flex-col">
        <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("screen.language.subtitle")}
        </p>

        <div role="radiogroup" aria-label={t("screen.language.title")} className="mt-5 space-y-3">
          {choices.map((choice) => {
            const active = selected === choice.value;
            return (
              <button
                key={choice.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(choice.value)}
                className={cn(
                  "flex w-full items-center gap-4 rounded-[var(--radius-lg)] border p-4 text-left transition-colors",
                  active
                    ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
                    : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background-subtle)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-12 w-12 flex-none items-center justify-center rounded-[var(--radius-md)] text-[var(--text-2xl)] font-[var(--weight-bold)]",
                    active
                      ? "bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)]"
                      : "bg-[var(--color-background-subtle)] text-[var(--color-text-primary)]",
                  )}
                >
                  {choice.glyph}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    lang={choice.value}
                    className="text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
                  >
                    {choice.title}
                  </p>
                  <p
                    lang={choice.value}
                    className="text-[var(--text-sm)] text-[var(--color-text-secondary)]"
                  >
                    {choice.subtitle}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 flex-none items-center justify-center rounded-full border-2",
                    active
                      ? "border-[var(--color-interactive-primary)] bg-[var(--color-interactive-primary)] text-[var(--color-text-on-brand)]"
                      : "border-[var(--color-border-strong)]",
                  )}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <PrimaryButton type="button" onClick={handleContinue}>
            {t("cta.continue")}
          </PrimaryButton>
        </div>
      </div>
    </PageShell>
  );
}
