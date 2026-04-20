"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";
import { PortalFrame } from "../../../_components/portal-frame";
import { ApplicationSummaryHeader } from "../../../_components/admin/application-summary-header";
import { ReviewSectionCard } from "../../../_components/admin/review-section-card";
import { ReviewerIdentityBlock } from "../../../_components/admin/reviewer-identity-block";
import { ActionFooter } from "../../../_components/admin/action-footer";
import { StudentMessagePreview } from "../../../_components/admin/student-message-preview";
import { docNameFor } from "../../../_components/admin/document-review-card";
import {
  DISCREPANCY_TEMPLATES,
  fillTemplate,
  templatesForScope,
} from "../../../_components/admin/discrepancy-templates";
import {
  useScrutiny,
  type DiscrepancyScope,
} from "../../../_components/data/scrutiny-provider";

type Params = { applicationId: string };

const SCOPE_OPTIONS: Array<{ value: DiscrepancyScope; label: string; hint: string }> = [
  {
    value: "personal",
    label: "Personal details",
    hint: "Name, DOB, contact, Aadhaar mismatches.",
  },
  {
    value: "academic",
    label: "Academic details",
    hint: "Board, stream, marks, result status.",
  },
  {
    value: "reservation",
    label: "Reservation claim",
    hint: "Category, SGC, PwD, or certificate gaps.",
  },
  {
    value: "document",
    label: "A specific document",
    hint: "Blurry scan, wrong document, seal missing…",
  },
];

const DEFAULT_DEADLINE = "Friday, 26 June 2026, 5:00 PM";

export default function DiscrepancyPage({ params }: { params: Promise<Params> }) {
  const { applicationId } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { effective, effectiveStatus, discrepancyCount, addDiscrepancy } = useScrutiny();

  const app = effective(applicationId);
  if (!app) notFound();

  const status = effectiveStatus(applicationId);
  const discCount = discrepancyCount(applicationId);

  const initialScope = (searchParams.get("scope") as DiscrepancyScope | null) ?? "document";
  const initialDocCode = searchParams.get("doc") ?? app.documents[0]?.code ?? "";

  const [scope, setScope] = useState<DiscrepancyScope>(initialScope);
  const [docCode, setDocCode] = useState<string>(initialDocCode);
  const [templateId, setTemplateId] = useState<string>(
    DISCREPANCY_TEMPLATES[0]?.id ?? "",
  );
  const [customReasonEn, setCustomReasonEn] = useState("");
  const [customReasonHi, setCustomReasonHi] = useState("");
  const [deadline, setDeadline] = useState(DEFAULT_DEADLINE);
  const [error, setError] = useState<string | undefined>();

  const docName = docCode ? docNameFor(docCode) : "";

  const availableTemplates = useMemo(() => templatesForScope(scope), [scope]);

  // Keep templateId synced with the active scope.
  useMemo(() => {
    const current = availableTemplates.find((t) => t.id === templateId);
    if (!current && availableTemplates.length > 0) {
      const first = availableTemplates[0];
      if (first) setTemplateId(first.id);
    }
  }, [availableTemplates, templateId]);

  const selected = availableTemplates.find((t) => t.id === templateId);
  const useCustom = !selected;

  const reasonEn = useCustom
    ? customReasonEn
    : fillTemplate(selected!.en, { docName: docName || "this document" });
  const reasonHi = useCustom
    ? customReasonHi
    : fillTemplate(selected!.hi, { docName: docName || "यह दस्तावेज़" });

  function handleSubmit() {
    if (!reasonEn.trim() || !reasonHi.trim()) {
      setError("Please pick a template or enter both English and Hindi reasons.");
      return;
    }
    if (!deadline.trim()) {
      setError("Please set a deadline before raising this discrepancy.");
      return;
    }
    setError(undefined);
    addDiscrepancy(applicationId, {
      scope,
      targetRef: scope === "document" ? docCode : undefined,
      reasonEn,
      reasonHi,
      deadline,
    });
    router.push(`/applications/${applicationId}`);
  }

  return (
    <PortalFrame
      active="applications"
      eyebrow="Raise discrepancy"
      title={app.studentName}
      headerRight={
        <Link
          href={`/applications/${applicationId}/scrutiny`}
          className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          ← Back to scrutiny
        </Link>
      }
    >
      <ApplicationSummaryHeader app={app} status={status} discrepancyCount={discCount} />

      <div className="mt-5">
        <ReviewerIdentityBlock hint="This discrepancy gets signed with your name and sent to the student with both English and Hindi copies." />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <ReviewSectionCard
            title="Which area is the problem in?"
            description="Pick the closest match — the student's action card will open the right screen for them."
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {SCOPE_OPTIONS.map((opt) => {
                const active = opt.value === scope;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setScope(opt.value)}
                    aria-pressed={active}
                    className={`flex min-h-[60px] items-start gap-3 rounded-[var(--radius-md)] border px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)]"
                        : "border-[var(--color-border-strong)] bg-[var(--color-surface)] hover:bg-[var(--color-background-subtle)]"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-1 flex h-4 w-4 flex-none items-center justify-center rounded-full border-2 ${
                        active
                          ? "border-[var(--color-interactive-brand)] bg-[var(--color-interactive-brand)] text-[var(--color-text-inverse)]"
                          : "border-[var(--color-border-strong)]"
                      }`}
                    >
                      {active ? "•" : ""}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {opt.label}
                      </span>
                      <span className="block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                        {opt.hint}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </ReviewSectionCard>

          {scope === "document" ? (
            <ReviewSectionCard title="Which document?">
              <label className="flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                Document
                <select
                  value={docCode}
                  onChange={(event) => setDocCode(event.target.value)}
                  className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
                >
                  {app.documents.map((doc) => (
                    <option key={doc.code} value={doc.code}>
                      {docNameFor(doc.code)} — {doc.fileName}
                    </option>
                  ))}
                </select>
              </label>
            </ReviewSectionCard>
          ) : null}

          <ReviewSectionCard
            title="Reason"
            description="Start from a template so the student sees a clear Hindi + English message, or write a custom reason."
          >
            <label className="flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              Template
              <select
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
              >
                {availableTemplates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.labelEn}
                  </option>
                ))}
                <option value="__custom__">Custom reason</option>
              </select>
            </label>

            {templateId === "__custom__" ? (
              <div className="mt-3 space-y-3">
                <label className="flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  English
                  <textarea
                    value={customReasonEn}
                    onChange={(event) => setCustomReasonEn(event.target.value)}
                    rows={2}
                    className="min-h-[72px] w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
                  />
                </label>
                <label className="flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                  हिन्दी
                  <textarea
                    value={customReasonHi}
                    onChange={(event) => setCustomReasonHi(event.target.value)}
                    rows={2}
                    lang="hi"
                    className="min-h-[72px] w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-sm)] leading-[var(--leading-devanagari)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
                  />
                </label>
              </div>
            ) : null}

            <label className="mt-4 flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              Deadline (shown to the student exactly as written)
              <input
                type="text"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
              />
            </label>
          </ReviewSectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <StudentMessagePreview reasonEn={reasonEn} reasonHi={reasonHi} deadline={deadline} />
          {error ? (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
              ⚠ {error}
            </p>
          ) : null}
        </div>
      </div>

      <ActionFooter
        meta={
          <span>
            Raises this discrepancy and sets the application to{" "}
            <strong>Discrepancy raised</strong>.
          </span>
        }
      >
        <Link
          href={`/applications/${applicationId}`}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]"
        >
          Raise discrepancy →
        </button>
      </ActionFooter>
    </PortalFrame>
  );
}
