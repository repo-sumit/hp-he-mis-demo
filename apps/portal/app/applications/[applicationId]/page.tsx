"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { PortalFrame } from "../../_components/portal-frame";
import { ApplicationSummaryHeader } from "../../_components/admin/application-summary-header";
import { TabNav, type TabItem } from "../../_components/admin/tab-nav";
import {
  KeyValue,
  ReviewSectionCard,
} from "../../_components/admin/review-section-card";
import { DocumentReviewCard } from "../../_components/admin/document-review-card";
import { ActionFooter } from "../../_components/admin/action-footer";
import { formatTimestamp } from "../../_components/admin/format";
import { useScrutiny } from "../../_components/data/scrutiny-provider";

type Params = { applicationId: string };

type TabKey = "applicant" | "academic" | "claims" | "documents" | "preferences" | "history";

export default function ApplicationDetailPage({ params }: { params: Promise<Params> }) {
  const { applicationId } = use(params);
  const { effective, effectiveStatus, effectiveDocStatus, discrepancyCount, overlay, logOpened } =
    useScrutiny();

  const [activeTab, setActiveTab] = useState<TabKey>("applicant");

  const app = effective(applicationId);
  if (!app) notFound();

  const status = effectiveStatus(applicationId);
  const discCount = discrepancyCount(applicationId);
  const overlayData = overlay(applicationId);

  useEffect(() => {
    logOpened(applicationId);
  }, [applicationId, logOpened]);

  const tabs: TabItem[] = useMemo(
    () => [
      { key: "applicant", label: "Applicant" },
      { key: "academic", label: "Academic" },
      { key: "claims", label: "Claims" },
      {
        key: "documents",
        label: "Documents",
        badge: app.documents.length,
      },
      {
        key: "preferences",
        label: "Preferences",
        badge: app.preferences.length,
      },
      { key: "history", label: "History" },
    ],
    [app.documents.length, app.preferences.length],
  );

  return (
    <PortalFrame
      active="applications"
      eyebrow="Application detail"
      title={app.studentName}
      headerRight={
        <Link
          href="/applications"
          className="inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          ← Back to queue
        </Link>
      }
    >
      <ApplicationSummaryHeader
        app={app}
        status={status}
        discrepancyCount={discCount}
      />

      <div className="mt-5">
        <TabNav
          tabs={tabs}
          active={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
        />
      </div>

      <div className="mt-4 space-y-4 pb-4">
        {activeTab === "applicant" ? (
          <ReviewSectionCard title="Personal details">
            <dl className="divide-y divide-[var(--color-border)]">
              <KeyValue label="Full name" value={app.studentName} />
              <KeyValue label="Date of birth" value={app.studentDob} />
              <KeyValue label="Gender" value={app.studentGender} />
              <KeyValue label="Mobile" value={app.studentMobile} />
              <KeyValue label="Email" value={app.studentEmail} />
              <KeyValue label="Aadhaar" value={app.studentAadhaar ?? ""} />
              <KeyValue label="APAAR ID" value={app.studentApaar ?? ""} />
              <KeyValue label="Permanent address" value={app.studentPermanentAddress} />
              <KeyValue label="District" value={app.studentDistrict} />
              <KeyValue label="PIN code" value={app.studentPincode} />
              <KeyValue label="Domicile state" value={app.studentDomicileState} />
            </dl>
          </ReviewSectionCard>
        ) : null}

        {activeTab === "academic" ? (
          <ReviewSectionCard title="Class 12 record">
            <dl className="divide-y divide-[var(--color-border)]">
              <KeyValue label="Board" value={app.studentBoard} />
              <KeyValue label="Year of passing" value={String(app.studentYearOfPassing)} />
              <KeyValue label="Roll number" value={app.studentRollNumber} />
              <KeyValue label="Stream" value={app.studentStream.toUpperCase()} />
              <KeyValue label="Subjects" value={app.studentSubjects} />
              <KeyValue label="Best-of-five" value={`${app.studentBofPercentage}%`} />
              <KeyValue label="Result status" value={app.studentResultStatus} />
            </dl>
          </ReviewSectionCard>
        ) : null}

        {activeTab === "claims" ? (
          <ReviewSectionCard title="Reservation and special claims">
            <dl className="divide-y divide-[var(--color-border)]">
              <KeyValue
                label="Category"
                value={app.studentCategory.toUpperCase()}
              />
              <KeyValue
                label="Claims"
                value={app.studentClaims.map((c) => c.toUpperCase()).join(", ")}
              />
              <KeyValue
                label="Single Girl Child"
                value={app.isSingleGirlChild ? "Yes" : "No"}
              />
              <KeyValue label="PwD" value={app.isPwd ? "Yes" : "No"} />
            </dl>
          </ReviewSectionCard>
        ) : null}

        {activeTab === "documents" ? (
          <div className="space-y-3">
            {app.documents.map((doc) => (
              <DocumentReviewCard
                key={doc.code}
                doc={doc}
                currentStatus={effectiveDocStatus(applicationId, doc.code)}
              />
            ))}
          </div>
        ) : null}

        {activeTab === "preferences" ? (
          <ReviewSectionCard
            title="Ranked preferences"
            description="Order of allocation — the engine tries #1 first and falls through if a seat isn't available."
          >
            <ol className="space-y-2">
              {app.preferences.map((pref) => {
                const heading = pref.subjectA
                  ? `${pref.subjectA} + ${pref.subjectB}`
                  : pref.collegeName;
                return (
                  <li
                    key={pref.rank}
                    className="flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                  >
                    <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]">
                      {pref.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {heading}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                        {pref.subjectA ? pref.collegeName : ""}
                        {pref.subjectA && pref.bucketA
                          ? ` · Buckets ${pref.bucketA} · ${pref.bucketB ?? ""}`
                          : ""}
                      </p>
                      <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                        {pref.totalSeats} seats · {pref.vacantSeats} vacant
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </ReviewSectionCard>
        ) : null}

        {activeTab === "history" ? (
          <ReviewSectionCard
            title="Audit trail"
            description="Every state change — submission, review actions, discrepancies, overrides."
          >
            <ol className="space-y-3">
              {app.history.map((entry, idx) => (
                <li key={`${entry.at}-${idx}`} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-1 h-2 w-2 flex-none rounded-full bg-[var(--color-interactive-brand)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]">
                      {entry.action}
                      {entry.target ? (
                        <span className="text-[var(--color-text-tertiary)]">
                          {" "}
                          · {entry.target}
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                      {entry.actor} · {formatTimestamp(entry.at)}
                    </p>
                    {entry.note ? (
                      <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                        {entry.note}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
              {overlayData.discrepancies.length > 0 ? (
                <li className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-status-warning-bg)] p-3 text-[var(--text-xs)] text-[var(--color-status-warning-fg)]">
                  {overlayData.discrepancies.length} open discrepancy
                  {overlayData.discrepancies.length === 1 ? "" : " items"} raised in this
                  session. Track on the scrutiny workbench.
                </li>
              ) : null}
            </ol>
          </ReviewSectionCard>
        ) : null}
      </div>

      <ActionFooter
        meta={
          <span>
            {discCount > 0 ? `${discCount} open discrepancy · ` : ""}
            Last activity {formatTimestamp(app.history[app.history.length - 1]?.at ?? app.submittedAt)}
          </span>
        }
      >
        <Link
          href="/applications"
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          Back to queue
        </Link>
        <Link
          href={`/applications/${applicationId}/discrepancy`}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] px-3 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]"
        >
          Raise discrepancy
        </Link>
        <Link
          href={`/applications/${applicationId}/scrutiny`}
          className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
        >
          Open scrutiny workbench →
        </Link>
      </ActionFooter>
    </PortalFrame>
  );
}
