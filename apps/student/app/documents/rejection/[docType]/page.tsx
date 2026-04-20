"use client";

import { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryLink } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { getRule } from "../../../_components/documents/document-rules";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { RejectionCard } from "../../../_components/documents/rejection-card";
import { UploadGuidanceCard } from "../../../_components/documents/upload-guidance-card";
import { useApplications } from "../../../_components/apply/applications-provider";
import { useScrutinyBridge } from "../../../_components/scrutiny-bridge/scrutiny-bridge-provider";

type Params = { docType: string };

export default function RejectionPage({ params }: { params: Promise<Params> }) {
  const { docType } = use(params);
  const { t, locale } = useLocale();
  const { getEntry } = useDocuments();
  const { applications, submittedCourseIds } = useApplications();
  const bridge = useScrutinyBridge();

  const rule = getRule(docType);
  if (!rule) notFound();

  const baseEntry = getEntry(docType);

  // Look for a bridge doc discrepancy against any submitted application for this
  // student. If present, let it drive the rejection copy so the student sees
  // exactly what the college flagged (in the language they prefer).
  const bridgeDoc = submittedCourseIds()
    .map((cid) => applications[cid]?.applicationNumber)
    .filter((n): n is string => Boolean(n))
    .flatMap((appNumber) => bridge.byDocCode(appNumber, docType))[0];

  const entry = bridgeDoc
    ? {
        ...baseEntry,
        status: bridgeDoc.studentActionAt ? baseEntry.status : "rejected",
        rejectionReason:
          (locale === "hi" ? bridgeDoc.reasonHi : bridgeDoc.reasonEn) ??
          baseEntry.rejectionReason,
        reviewedBy: bridgeDoc.createdBy,
        reviewedAt: bridgeDoc.createdAt,
      }
    : baseEntry;

  const name = t(`document.name.${rule.code}`);

  return (
    <PageShell
      eyebrow={t("document.checklist.title")}
      title={t("document.rejection.title")}
      backHref="/documents"
    >
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("document.rejection.subtitle")}
      </p>

      <div className="mt-4">
        <RejectionCard entry={entry} name={name} />
      </div>

      <section className="mt-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          <span aria-hidden="true" className="mr-1">🛠️</span>
          {t("document.rejection.nextStepsTitle")}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("document.rejection.nextStepsBody")}
        </p>
      </section>

      <div className="mt-5">
        <UploadGuidanceCard maxSizeMb={rule.maxSizeMb} />
      </div>

      <div className="sticky bottom-0 -mx-4 mt-5 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
        <PrimaryLink href={`/documents/upload/${rule.code}`}>{t("cta.reUpload")}</PrimaryLink>
        <p className="mt-2 text-center text-[var(--text-xs)]">
          <Link
            href="/help"
            className="font-[var(--weight-medium)] text-[var(--color-text-link)]"
          >
            {t("cta.getHelp")}
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
