"use client";

import Link from "next/link";
import { Badge, Card, CardBody, CardTitle } from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import { useSession } from "../../_components/data/session-provider";
import { MOCK_APPLICATIONS } from "../../_components/data/mock-applications";

/**
 * College-scoped landing for College Admin and College Operator roles.
 * Shows only this college's slice of the queue. The scrutiny workbench,
 * discrepancy flow, and queue all exist already under /applications — this
 * page is the role-appropriate "home".
 */
export default function CollegeDashboardPage() {
  const { session } = useSession();
  const collegeId = session.collegeId ?? "gc_sanjauli";
  const collegeName = session.collegeName ?? "Your college";

  const collegeApps = MOCK_APPLICATIONS.filter((app) => app.collegeId === collegeId);
  const pending = collegeApps.filter(
    (a) => a.baseStatus === "submitted" || a.baseStatus === "under_scrutiny",
  ).length;
  const discrepancies = collegeApps.filter(
    (a) => a.baseStatus === "discrepancy_raised",
  ).length;
  const verified = collegeApps.filter((a) => a.baseStatus === "verified").length;

  return (
    <PortalFrame
      active="college_dashboard"
      eyebrow={`Cycle 2026-27 · ${collegeName}`}
      title="My college"
      banner={{
        title: collegeName,
        eyebrow: "College dashboard",
        actions: (
          <Badge tone={pending > 0 ? "warning" : "success"} dot>
            {pending > 0 ? `${pending} pending scrutiny` : "Queue clear"}
          </Badge>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "My applications today", value: collegeApps.length },
          { label: "Pending scrutiny", value: pending, tone: "brand" },
          { label: "Discrepancy raised", value: discrepancies, tone: "warning" },
          { label: "Verified", value: verified, tone: "success" },
        ]}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Next up</CardTitle>
          <CardBody>
            {pending === 0 ? (
              <>
                No applications waiting on your college right now. Keep an eye on this
                page — new submissions land here as students finish the apply flow.
              </>
            ) : (
              <>
                You have <strong>{pending}</strong>{" "}
                {pending === 1 ? "application" : "applications"} waiting for scrutiny.
                Open the queue to start reviewing.
              </>
            )}
            <div className="mt-4">
              <Link
                href="/applications"
                className="inline-flex h-[var(--button-height)] items-center justify-center gap-2 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] px-6 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] shadow-[var(--shadow-sm)] transition-[background-color,box-shadow] hover:bg-[var(--color-interactive-primary-hover)] hover:shadow-[var(--shadow-md)]"
              >
                Open queue <span aria-hidden="true">→</span>
              </Link>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Your role</CardTitle>
          <CardBody className="mt-3 space-y-2">
            <div className="flex items-center gap-2">
              <Badge tone="brand">{roleLabel(session.role)}</Badge>
            </div>
            <p>
              Signed in as <strong>{session.name}</strong>. Your queue and actions are
              scoped to {collegeName}.
            </p>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}

function roleLabel(role: string): string {
  if (role === "college_admin") return "College Admin · Principal";
  return role;
}
