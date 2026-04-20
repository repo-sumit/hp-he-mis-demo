"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useState } from "react";
import { PortalFrame } from "../../../_components/portal-frame";
import { ApplicationSummaryHeader } from "../../../_components/admin/application-summary-header";
import { ReviewSectionCard } from "../../../_components/admin/review-section-card";
import { FieldReviewRow } from "../../../_components/admin/field-review-row";
import { DocumentReviewCard } from "../../../_components/admin/document-review-card";
import { ReviewerIdentityBlock } from "../../../_components/admin/reviewer-identity-block";
import { ActionFooter } from "../../../_components/admin/action-footer";
import { useScrutiny, type FieldOutcome } from "../../../_components/data/scrutiny-provider";

type Params = { applicationId: string };

type FieldDef = {
  key: string;
  label: string;
  value: string;
};

export default function ScrutinyWorkbenchPage({ params }: { params: Promise<Params> }) {
  const { applicationId } = use(params);
  const router = useRouter();
  const {
    effective,
    effectiveStatus,
    effectiveDocStatus,
    discrepancyCount,
    overlay,
    setFieldOutcome,
    setDocOutcome,
    setStatus,
  } = useScrutiny();

  const [actionNote, setActionNote] = useState("");

  const app = effective(applicationId);
  if (!app) notFound();

  const status = effectiveStatus(applicationId);
  const discCount = discrepancyCount(applicationId);
  const ov = overlay(applicationId);

  const personalFields: FieldDef[] = [
    { key: "personal.fullName", label: "Full name", value: app.studentName },
    { key: "personal.dob", label: "Date of birth", value: app.studentDob },
    { key: "personal.mobile", label: "Mobile", value: app.studentMobile },
    { key: "personal.email", label: "Email", value: app.studentEmail },
    { key: "personal.aadhaar", label: "Aadhaar", value: app.studentAadhaar ?? "" },
  ];

  const academicFields: FieldDef[] = [
    { key: "academic.board", label: "Board", value: app.studentBoard },
    {
      key: "academic.yearOfPassing",
      label: "Year of passing",
      value: String(app.studentYearOfPassing),
    },
    { key: "academic.rollNumber", label: "Roll number", value: app.studentRollNumber },
    { key: "academic.stream", label: "Stream", value: app.studentStream.toUpperCase() },
    {
      key: "academic.bof",
      label: "Best-of-five",
      value: `${app.studentBofPercentage}%`,
    },
    {
      key: "academic.result",
      label: "Result status",
      value: app.studentResultStatus,
    },
  ];

  const claimsFields: FieldDef[] = [
    {
      key: "claims.category",
      label: "Category",
      value: app.studentCategory.toUpperCase(),
    },
    {
      key: "claims.claims",
      label: "Claims",
      value: app.studentClaims.map((c) => c.toUpperCase()).join(", "),
    },
    {
      key: "claims.singleGirlChild",
      label: "Single Girl Child",
      value: app.isSingleGirlChild ? "Yes" : "No",
    },
    {
      key: "claims.pwd",
      label: "PwD",
      value: app.isPwd ? "Yes" : "No",
    },
    {
      key: "claims.domicile",
      label: "Domicile state",
      value: app.studentDomicileState,
    },
  ];

  const fieldOutcome = (key: string): FieldOutcome | undefined => ov.fieldOutcomes[key];

  function setField(key: string, outcome: FieldOutcome) {
    setFieldOutcome(applicationId, key, outcome);
  }

  return (
    <PortalFrame
      active="applications"
      eyebrow="Scrutiny workbench"
      title={app.studentName}
      headerRight={
        <Link
          href={`/applications/${applicationId}`}
          className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          ← Application detail
        </Link>
      }
    >
      <ApplicationSummaryHeader app={app} status={status} discrepancyCount={discCount} />

      <div className="mt-5">
        <ReviewerIdentityBlock hint="All verify / reject actions you take here are attached to your name in the audit log." />
      </div>

      {/* Documents lead the workbench — they're the thing operators spend 80%
          of scrutiny time on, and they unblock the admission decision. The
          three field groups follow beneath in a compact 2-column grid. */}
      <div className="mt-5">
        <ReviewSectionCard
          title="Documents"
          description="Verify, reject, or raise a specific-doc discrepancy. The student sees the bilingual reason on their dashboard."
        >
          <div className="space-y-3">
            {app.documents.map((doc) => (
              <DocumentReviewCard
                key={doc.code}
                doc={doc}
                currentStatus={effectiveDocStatus(applicationId, doc.code)}
                onVerify={() => setDocOutcome(applicationId, doc.code, "verified")}
                onReject={() =>
                  setDocOutcome(
                    applicationId,
                    doc.code,
                    "rejected",
                    "Rejected during scrutiny.",
                  )
                }
                onRaiseDiscrepancy={() =>
                  router.push(
                    `/applications/${applicationId}/discrepancy?scope=document&doc=${doc.code}`,
                  )
                }
              />
            ))}
          </div>
        </ReviewSectionCard>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <ReviewSectionCard
          title="Personal fields"
          description="Verify each row as you go — Y / N / C shortcuts land next sprint."
        >
          <div className="space-y-2">
            {personalFields.map((f) => (
              <FieldReviewRow
                key={f.key}
                label={f.label}
                value={f.value}
                outcome={fieldOutcome(f.key)}
                onSetOutcome={(o) => setField(f.key, o)}
              />
            ))}
          </div>
        </ReviewSectionCard>

        <ReviewSectionCard title="Academic fields">
          <div className="space-y-2">
            {academicFields.map((f) => (
              <FieldReviewRow
                key={f.key}
                label={f.label}
                value={f.value}
                outcome={fieldOutcome(f.key)}
                onSetOutcome={(o) => setField(f.key, o)}
              />
            ))}
          </div>
        </ReviewSectionCard>

        <ReviewSectionCard title="Reservation and claims" className="lg:col-span-2">
          <div className="grid gap-2 md:grid-cols-2">
            {claimsFields.map((f) => (
              <FieldReviewRow
                key={f.key}
                label={f.label}
                value={f.value}
                outcome={fieldOutcome(f.key)}
                onSetOutcome={(o) => setField(f.key, o)}
              />
            ))}
          </div>
        </ReviewSectionCard>
      </div>

      <div className="mt-5">
        <ReviewSectionCard
          title="Outcome note"
          description="Optional — gets attached to the audit trail alongside the action you pick below."
        >
          <textarea
            value={actionNote}
            onChange={(event) => setActionNote(event.target.value)}
            rows={3}
            placeholder="e.g. BoF matches marksheet; SC certificate verified against district roster."
            className="min-h-[84px] w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
          />
        </ReviewSectionCard>
      </div>

      {/* Four outcomes per project context §2.3: Accept (Verify), Conditional
          Accept, Reject, Raise discrepancy. They sit left → right from cautious
          to decisive so the operator's eye flows naturally when making the call. */}
      <ActionFooter
        meta={
          <span>
            Status:{" "}
            <strong className="text-[var(--color-text-primary)]">
              {status.replace(/_/g, " ")}
            </strong>
            {discCount > 0 ? ` · ${discCount} open discrepancy` : ""}
          </span>
        }
      >
        <Link
          href={`/applications/${applicationId}`}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          Back
        </Link>
        <button
          type="button"
          onClick={() =>
            router.push(`/applications/${applicationId}/discrepancy`)
          }
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] px-3 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]"
        >
          <span aria-hidden="true">⚠</span>
          Raise discrepancy
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus(applicationId, "rejected", actionNote || undefined);
            setActionNote("");
          }}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] px-3 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-danger-fg)]"
        >
          <span aria-hidden="true">✕</span>
          Reject
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus(applicationId, "conditional", actionNote || undefined);
            setActionNote("");
          }}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[var(--radius-md)] border border-[var(--color-status-warning-fg)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)] hover:bg-[var(--color-status-warning-bg)]"
        >
          <span aria-hidden="true">~</span>
          Conditional accept
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus(applicationId, "verified", actionNote || undefined);
            setActionNote("");
          }}
          className="inline-flex h-10 items-center justify-center gap-1 rounded-[var(--radius-md)] bg-[var(--color-interactive-success)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)]"
        >
          <span aria-hidden="true">✓</span>
          Verify application
        </button>
      </ActionFooter>
    </PortalFrame>
  );
}
