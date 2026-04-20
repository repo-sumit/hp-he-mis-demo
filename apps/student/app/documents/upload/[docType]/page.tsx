"use client";

import { use, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { cn } from "@hp-mis/ui";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { getRule } from "../../../_components/documents/document-rules";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { DocumentStatusBadge } from "../../../_components/documents/document-status-badge";
import { UploadGuidanceCard } from "../../../_components/documents/upload-guidance-card";

type Params = { docType: string };

type Source = "camera" | "gallery" | "file";

interface PickedFile {
  source: Source;
  fileName: string;
  mimeType: string;
  sizeKb: number;
}

function mockPick(source: Source, code: string): PickedFile {
  if (source === "file") {
    return {
      source,
      fileName: `${code}_scan.pdf`,
      mimeType: "application/pdf",
      sizeKb: 380,
    };
  }
  return {
    source,
    fileName: `${code}_${source}.jpg`,
    mimeType: "image/jpeg",
    sizeKb: source === "camera" ? 310 : 240,
  };
}

export default function UploadPage({ params }: { params: Promise<Params> }) {
  const { docType } = use(params);
  const router = useRouter();
  const { t } = useLocale();
  const { getEntry, markUploaded } = useDocuments();

  const rule = getRule(docType);
  if (!rule) notFound();

  const entry = getEntry(docType);
  const [picked, setPicked] = useState<PickedFile | null>(null);

  const name = t(`document.name.${rule.code}`);
  const alreadyUploaded = entry.status !== "not_uploaded" && !picked;

  const sources: { key: Source; icon: string }[] = [
    { key: "camera", icon: "📷" },
    { key: "gallery", icon: "🖼" },
    { key: "file", icon: "📄" },
  ];

  function handleConfirm() {
    if (!picked) return;
    markUploaded(rule!.code, {
      fileName: picked.fileName,
      mimeType: picked.mimeType,
      sizeKb: picked.sizeKb,
    });
    router.push(`/documents/preview/${rule!.code}`);
  }

  return (
    <PageShell
      eyebrow={t("document.checklist.title")}
      title={t("document.upload.title", { name })}
      backHref="/documents"
    >
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t("document.checklist.title")}
            </p>
            <h2 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {name}
            </h2>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t(`document.description.${rule.code}`)}
            </p>
          </div>
          <DocumentStatusBadge status={entry.status} />
        </div>
        <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("document.meta.formats", { list: rule.acceptedFormats.join(" · ") })}{" "}
          · {t("document.meta.maxSize", { mb: rule.maxSizeMb })}
        </p>
      </section>

      {alreadyUploaded ? (
        <p className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-warning-fg)]">
          ⚠ {t("document.upload.alreadyUploaded")}
        </p>
      ) : null}

      <section className="mt-5">
        <p className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("document.upload.chooseSource")}
        </p>
        <div className="grid grid-cols-1 gap-2">
          {sources.map(({ key, icon }) => {
            const active = picked?.source === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPicked(mockPick(key, rule.code))}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] border px-3 py-3 text-left transition-colors",
                  active
                    ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
                    : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background-subtle)]",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-subtle)] text-lg"
                >
                  {icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                    {t(
                      key === "camera"
                        ? "document.upload.sources.cameraTitle"
                        : key === "gallery"
                          ? "document.upload.sources.galleryTitle"
                          : "document.upload.sources.fileTitle",
                    )}
                  </span>
                  <span className="block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {t(
                      key === "camera"
                        ? "document.upload.sources.cameraHint"
                        : key === "gallery"
                          ? "document.upload.sources.galleryHint"
                          : "document.upload.sources.fileHint",
                    )}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex h-6 w-6 flex-none items-center justify-center rounded-full border-2",
                    active
                      ? "border-[var(--color-interactive-brand)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]"
                      : "border-[var(--color-border-strong)]",
                  )}
                >
                  {active ? "✓" : ""}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <div
          className={cn(
            "rounded-[var(--radius-lg)] border border-dashed p-4 text-[var(--text-sm)]",
            picked
              ? "border-[var(--color-interactive-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-primary)]"
              : "border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] text-[var(--color-text-tertiary)]",
          )}
        >
          {picked ? (
            <div>
              <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {t("document.upload.preview.selectedTitle")}
              </p>
              <p className="mt-1 break-all text-[var(--text-sm)] text-[var(--color-text-primary)]">
                📎 {picked.fileName}
              </p>
              <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                {picked.mimeType} · {Math.round(picked.sizeKb)} KB
              </p>
              <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                {t("document.upload.preview.selectedHint")}
              </p>
              <button
                type="button"
                onClick={() => setPicked(null)}
                className="mt-3 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
              >
                {t("cta.retakePhoto")}
              </button>
            </div>
          ) : (
            <p className="text-center">{t("document.upload.preview.empty")}</p>
          )}
        </div>
      </section>

      <section className="mt-5">
        <UploadGuidanceCard maxSizeMb={rule.maxSizeMb} />
      </section>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryButton type="button" onClick={handleConfirm} disabled={!picked}>
          {t("cta.confirmUpload")}
        </PrimaryButton>
        <p className="mt-2 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {picked
            ? t("document.upload.preview.confirmHint")
            : alreadyUploaded
              ? t("document.upload.replaceCtaHint")
              : null}
        </p>
        <p className="mt-2 text-center text-[var(--text-xs)]">
          <Link
            href="/documents"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("cta.backToChecklist")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
