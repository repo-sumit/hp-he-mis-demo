"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useCallback, useState } from "react";
import { Button, Modal, Textarea, useToast } from "@hp-mis/ui";
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
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pending, setPending] = useState<null | "verify" | "conditional" | "reject">(null);
  const { toast } = useToast();

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

  /**
   * Run a terminal scrutiny action (verify / conditional / reject) end-to-end:
   *   1. Show a short loading state on the clicked button.
   *   2. Persist the outcome through the scrutiny provider (existing path).
   *   3. Fire a success toast naming the applicant so the audit trail
   *      reads as a real action, not a silent state change.
   *   4. Redirect back to the queue so the operator's eye is on the next
   *      application immediately — matches the "verify, next, verify"
   *      review cadence the workbench is built for.
   *
   * The 600ms delay is intentional: it gives the click visible weight
   * without slowing the operator down. localStorage writes themselves
   * are synchronous; the spinner is purely UX.
   */
  const commitOutcome = useCallback(
    (kind: "verify" | "conditional" | "reject") => {
      setPending(kind);
      const status =
        kind === "verify" ? "verified" : kind === "conditional" ? "conditional" : "rejected";
      const note = actionNote || undefined;
      window.setTimeout(() => {
        setStatus(applicationId, status, note);
        setActionNote("");
        const message =
          kind === "verify"
            ? `${app.studentName} has been approved.`
            : kind === "conditional"
              ? `${app.studentName} marked as conditional accept.`
              : `${app.studentName} has been rejected.`;
        const tone = kind === "reject" ? "info" : "success";
        toast(message, { tone });
        router.push("/applications");
      }, 600);
    },
    [app.studentName, applicationId, actionNote, setStatus, toast, router],
  );

  function confirmReject() {
    setShowRejectConfirm(false);
    commitOutcome("reject");
  }

  return (
    <PortalFrame
      active="applications"
      eyebrow="Scrutiny workbench"
      title={app.studentName}
      breadcrumbs={[
        { label: "Applications", href: "/applications" },
        { label: app.studentName, href: `/applications/${applicationId}` },
        { label: "Scrutiny" },
      ]}
      breadcrumbsBackHref={`/applications/${applicationId}`}
      headerRight={
        <Link
          href={`/applications/${applicationId}`}
          className="inline-flex h-[var(--button-height-sm)] items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:text-[var(--color-text-brand)]"
        >
          <span aria-hidden="true">←</span> Application detail
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
          <Textarea
            variant="outline"
            value={actionNote}
            onChange={(event) => setActionNote(event.target.value)}
            rows={3}
            placeholder="e.g. BoF matches marksheet; SC certificate verified against district roster."
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
          className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)] hover:text-[var(--color-text-brand)]"
        >
          Back
        </Link>
        <Button
          variant="warning"
          onClick={() => router.push(`/applications/${applicationId}/discrepancy`)}
          disabled={pending !== null}
        >
          <span aria-hidden="true">⚠</span>
          Raise discrepancy
        </Button>
        <Button
          variant="danger"
          onClick={() => setShowRejectConfirm(true)}
          loading={pending === "reject"}
          loadingLabel="Rejecting…"
          disabled={pending !== null && pending !== "reject"}
        >
          <span aria-hidden="true">✕</span>
          Reject
        </Button>
        <Button
          variant="secondary"
          onClick={() => commitOutcome("conditional")}
          loading={pending === "conditional"}
          loadingLabel="Saving…"
          disabled={pending !== null && pending !== "conditional"}
          className="border-[var(--color-status-warning-fg)] text-[var(--color-status-warning-fg)] hover:border-[var(--color-status-warning-fg)] hover:bg-[var(--color-status-warning-bg)] hover:text-[var(--color-status-warning-fg)]"
        >
          <span aria-hidden="true">~</span>
          Conditional accept
        </Button>
        <Button
          variant="success"
          onClick={() => commitOutcome("verify")}
          loading={pending === "verify"}
          loadingLabel="Verifying…"
          disabled={pending !== null && pending !== "verify"}
        >
          <span aria-hidden="true">✓</span>
          Verify application
        </Button>
      </ActionFooter>

      <Modal
        open={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        tone="danger"
        size="sm"
        title="Reject application?"
        caption="This action cannot be undone*"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowRejectConfirm(false)}
            >
              No
            </Button>
            <Button variant="danger" onClick={confirmReject}>
              Yes, reject
            </Button>
          </>
        }
      >
        <p className="text-center">
          Application <strong className="font-mono text-[var(--color-text-primary)]">{app.id}</strong>{" "}
          from <strong className="text-[var(--color-text-primary)]">{app.studentName}</strong>{" "}
          will move to <strong className="text-[var(--color-text-primary)]">Rejected</strong>.
          {actionNote
            ? " Your outcome note will be attached to the audit trail."
            : ""}
        </p>
      </Modal>
    </PortalFrame>
  );
}
