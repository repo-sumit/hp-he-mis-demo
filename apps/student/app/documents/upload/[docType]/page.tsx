"use client";

import Image from "next/image";
import { use, useRef, useState } from "react";
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
import {
  DigiLockerSheet,
  type DigiLockerDoc,
} from "../../../_components/documents/digilocker-sheet";
import { useApplications } from "../../../_components/apply/applications-provider";
import { useScrutinyBridge } from "../../../_components/scrutiny-bridge/scrutiny-bridge-provider";

type Params = { docType: string };

type Source = "digilocker" | "file";

interface PickedFile {
  source: Source;
  fileName: string;
  mimeType: string;
  sizeKb: number;
  /** Issuer label when picked from DigiLocker. */
  issuer?: string;
}

const ACCEPTED_MIME = "application/pdf,image/png,image/jpeg";

export default function UploadPage({ params }: { params: Promise<Params> }) {
  const { docType } = use(params);
  const router = useRouter();
  const { t } = useLocale();
  const { getEntry, markUploaded } = useDocuments();
  const { applications, submittedCourseIds } = useApplications();
  const bridge = useScrutinyBridge();

  const rule = getRule(docType);
  if (!rule) notFound();

  const entry = getEntry(docType);
  const [picked, setPicked] = useState<PickedFile | null>(null);
  const [digiLockerOpen, setDigiLockerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const name = t(`document.name.${rule.code}`);
  const alreadyUploaded = entry.status !== "not_uploaded" && !picked;

  function handleFilePick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-picking the same file next time
    if (!file) return;
    if (!ACCEPTED_MIME.split(",").includes(file.type)) {
      // Browsers enforce accept= but some still let any file through — guard.
      alert(t("document.upload.invalidType"));
      return;
    }
    setPicked({
      source: "file",
      fileName: file.name,
      mimeType: file.type,
      sizeKb: Math.max(1, Math.round(file.size / 1024)),
    });
  }

  function handleDigiLockerSelect(doc: DigiLockerDoc) {
    setDigiLockerOpen(false);
    setPicked({
      source: "digilocker",
      fileName: `${doc.code}_digilocker.pdf`,
      mimeType: "application/pdf",
      sizeKb: 220,
      issuer: doc.issuer,
    });
  }

  function handleConfirm() {
    if (!picked) return;
    markUploaded(rule!.code, {
      fileName: picked.fileName,
      mimeType: picked.mimeType,
      sizeKb: picked.sizeKb,
    });
    for (const cid of submittedCourseIds()) {
      const appNumber = applications[cid]?.applicationNumber;
      if (appNumber) bridge.markDocResubmitted(appNumber, rule!.code);
    }
    // Step 4 is now the single home for all document uploads — after a
    // successful confirm we always return the student there so they can
    // pick the next document in the checklist.
    router.push("/profile/step/4");
  }

  return (
    <PageShell
      eyebrow={t("document.checklist.title")}
      title={t("document.upload.title", { name })}
      backHref="/profile/step/4"
      width="comfortable"
    >
      <section className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              {t("document.checklist.title")}
            </p>
            <h2 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {name}
            </h2>
            <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
              {t(`document.description.${rule.code}`)}
            </p>
          </div>
          {alreadyUploaded ? <DocumentStatusBadge status={entry.status} /> : null}
        </div>
        <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("document.meta.formats", { list: rule.acceptedFormats.join(" · ") })}
          {" · "}
          {t("document.meta.maxSize", { mb: rule.maxSizeMb })}
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setDigiLockerOpen(true)}
            className={cn(
              "flex h-full items-center gap-3 rounded-[var(--radius-md)] border px-4 py-4 text-left transition-colors",
              picked?.source === "digilocker"
                ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)]"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]",
            )}
          >
            <Image
              src="/digilocker.png"
              alt="DigiLocker"
              width={40}
              height={40}
              className="h-10 w-10 flex-none rounded-[var(--radius-sm)]"
            />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {t("document.upload.sources.digilockerTitle")}
                <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-success-bg)] px-2 py-0.5 text-[10px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-status-success-fg)]">
                  {t("common.recommended")}
                </span>
              </span>
              <span className="mt-0.5 block text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {t("document.upload.sources.digilockerHint")}
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "flex h-full items-center gap-3 rounded-[var(--radius-md)] border px-4 py-4 text-left transition-colors",
              picked?.source === "file"
                ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-softer)]"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]",
            )}
          >
            <span
              aria-hidden="true"
              className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-background-subtle)] text-lg"
            >
              📄
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {t("document.upload.sources.fileTitle")}
              </span>
              <span className="mt-0.5 block text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {t("document.upload.sources.fileHint")}
              </span>
            </span>
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIME}
          className="hidden"
          onChange={handleFilePick}
        />
      </section>

      <section className="mt-5">
        <div
          className={cn(
            "rounded-[var(--radius-lg)] border border-dashed p-4 text-[var(--text-sm)]",
            picked
              ? "border-[var(--color-interactive-brand)] bg-[var(--color-background-brand-softer)] text-[var(--color-text-primary)]"
              : "border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] text-[var(--color-text-tertiary)]",
          )}
        >
          {picked ? (
            <div>
              <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                {picked.source === "digilocker"
                  ? t("document.upload.preview.digilockerTitle")
                  : t("document.upload.preview.selectedTitle")}
              </p>
              <p className="mt-1 break-all text-[var(--text-sm)] text-[var(--color-text-primary)]">
                📎 {picked.fileName}
              </p>
              <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                {picked.mimeType} · {Math.round(picked.sizeKb)} KB
                {picked.issuer ? ` · ${picked.issuer}` : ""}
              </p>
              <p className="mt-2 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                {picked.source === "digilocker"
                  ? t("document.upload.preview.digilockerHint")
                  : t("document.upload.preview.selectedHint")}
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

      <div className="sticky bottom-0 -mx-3 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:-mx-4 sm:px-4">
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
            href="/profile/step/4"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("profile.step4.backToClaims")}
          </Link>
        </p>
      </div>

      <DigiLockerSheet
        open={digiLockerOpen}
        preferredCode={rule.code}
        onClose={() => setDigiLockerOpen(false)}
        onSelect={handleDigiLockerSelect}
      />
    </PageShell>
  );
}
