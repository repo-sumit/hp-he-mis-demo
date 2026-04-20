"use client";

import { useLocale } from "../locale-provider";

export function UploadGuidanceCard({ maxSizeMb }: { maxSizeMb: number }) {
  const { t } = useLocale();
  const tips = ["clear", "lighting", "align", "seal"] as const;

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        <span aria-hidden="true" className="mr-1">💡</span>
        {t("document.upload.tips.title")}
      </p>
      <ul className="mt-2 space-y-1.5 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span aria-hidden="true" className="text-[var(--color-text-brand)]">
              ✓
            </span>
            <span>{t(`document.upload.tips.${tip}`)}</span>
          </li>
        ))}
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-[var(--color-text-brand)]">
            ✓
          </span>
          <span>{t("document.upload.tips.size", { mb: maxSizeMb })}</span>
        </li>
      </ul>
    </section>
  );
}
