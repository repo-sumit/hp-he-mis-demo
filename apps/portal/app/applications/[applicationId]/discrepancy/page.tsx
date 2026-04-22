"use client";

import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useState } from "react";
import { Badge, Button, Input, SegmentedOptions, Select, Textarea, type SegmentedOption } from "@hp-mis/ui";
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

const SCOPE_OPTIONS: readonly SegmentedOption<DiscrepancyScope>[] = [
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

const FIELD_LABEL_CLASS =
  "text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]";

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
      breadcrumbs={[
        { label: "Applications", href: "/applications" },
        { label: app.studentName, href: `/applications/${applicationId}` },
        { label: "Discrepancy" },
      ]}
      breadcrumbsBackHref={`/applications/${applicationId}/scrutiny`}
      headerRight={
        <Link
          href={`/applications/${applicationId}/scrutiny`}
          className="inline-flex h-[var(--button-height-sm)] items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:text-[var(--color-text-brand)]"
        >
          <span aria-hidden="true">←</span> Back to scrutiny
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
            <SegmentedOptions
              value={scope}
              onChange={setScope}
              options={SCOPE_OPTIONS}
              layout="stack"
              columns={2}
              ariaLabel="Discrepancy scope"
            />
          </ReviewSectionCard>

          {scope === "document" ? (
            <ReviewSectionCard title="Which document?">
              <label className="flex flex-col gap-2">
                <span className={FIELD_LABEL_CLASS}>Document</span>
                <Select
                  variant="filled"
                  value={docCode}
                  onChange={(event) => setDocCode(event.target.value)}
                >
                  {app.documents.map((doc) => (
                    <option key={doc.code} value={doc.code}>
                      {docNameFor(doc.code)} — {doc.fileName}
                    </option>
                  ))}
                </Select>
              </label>
            </ReviewSectionCard>
          ) : null}

          <ReviewSectionCard
            title="Reason"
            description="Start from a template so the student sees a clear Hindi + English message, or write a custom reason."
          >
            <label className="flex flex-col gap-2">
              <span className={FIELD_LABEL_CLASS}>Template</span>
              <Select
                variant="filled"
                value={templateId}
                onChange={(event) => setTemplateId(event.target.value)}
              >
                {availableTemplates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.labelEn}
                  </option>
                ))}
                <option value="__custom__">Custom reason</option>
              </Select>
            </label>

            {templateId === "__custom__" ? (
              <div className="mt-3 space-y-3">
                <label className="flex flex-col gap-2">
                  <span className={FIELD_LABEL_CLASS}>English</span>
                  <Textarea
                    variant="filled"
                    value={customReasonEn}
                    onChange={(event) => setCustomReasonEn(event.target.value)}
                    rows={2}
                    className="min-h-[var(--textarea-min-height-compact)]"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className={FIELD_LABEL_CLASS}>हिन्दी</span>
                  <Textarea
                    variant="filled"
                    value={customReasonHi}
                    onChange={(event) => setCustomReasonHi(event.target.value)}
                    rows={2}
                    lang="hi"
                    className="min-h-[var(--textarea-min-height-compact)] leading-[var(--leading-devanagari)]"
                  />
                </label>
              </div>
            ) : null}

            <label className="mt-4 flex flex-col gap-2">
              <span className={FIELD_LABEL_CLASS}>
                Deadline (shown to the student exactly as written)
              </span>
              <Input
                variant="filled"
                type="text"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </label>
          </ReviewSectionCard>
        </div>

        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <StudentMessagePreview reasonEn={reasonEn} reasonHi={reasonHi} deadline={deadline} />
          {error ? (
            <Badge tone="danger" className="w-full justify-start whitespace-normal rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-xs)]">
              <span aria-hidden="true">⚠</span>
              {error}
            </Badge>
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
          className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:text-[var(--color-text-brand)]"
        >
          Cancel
        </Link>
        <Button variant="warning" onClick={handleSubmit}>
          Raise discrepancy <span aria-hidden="true">→</span>
        </Button>
      </ActionFooter>
    </PortalFrame>
  );
}
