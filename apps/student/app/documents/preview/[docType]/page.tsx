"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryLink } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { getRule } from "../../../_components/documents/document-rules";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { PreviewCard } from "../../../_components/documents/preview-card";

type Params = { docType: string };

export default function PreviewPage({ params }: { params: Promise<Params> }) {
  const { docType } = use(params);
  const { t } = useLocale();
  const { getEntry } = useDocuments();

  const rule = getRule(docType);
  if (!rule) notFound();

  const entry = getEntry(docType);
  const name = t(`document.name.${rule.code}`);

  return (
    <PageShell
      eyebrow={t("document.checklist.title")}
      title={t("document.preview.title")}
      backHref="/profile/step/4"
    >
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("document.preview.subtitle")}
      </p>

      <div className="mt-4">
        <PreviewCard entry={entry} name={name} />
      </div>

      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        <p>
          {t("document.meta.formats", { list: rule.acceptedFormats.join(" · ") })}{" "}
          · {t("document.meta.maxSize", { mb: rule.maxSizeMb })}
        </p>
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryLink href={`/documents/upload/${rule.code}`} variant="secondary">
          {t("cta.replaceDocument")}
        </PrimaryLink>
        <p className="mt-2 text-center text-[var(--text-xs)]">
          <Link
            href="/profile/step/4"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("profile.step4.backToClaims")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
