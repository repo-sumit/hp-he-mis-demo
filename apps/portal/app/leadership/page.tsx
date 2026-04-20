"use client";

import { Card, CardBody, CardTitle } from "@hp-mis/ui";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";
import { MOCK_APPLICATIONS } from "../_components/data/mock-applications";

/**
 * Leadership (DHE Secretary) read-only dashboard. No write actions, no
 * configuration — just aggregate glances. Numbers are computed from the
 * mock dataset so the demo feels live.
 */
export default function LeadershipDashboardPage() {
  const total = MOCK_APPLICATIONS.length;
  const verified = MOCK_APPLICATIONS.filter((a) => a.baseStatus === "verified").length;
  const discrepancies = MOCK_APPLICATIONS.filter(
    (a) => a.baseStatus === "discrepancy_raised",
  ).length;
  const rejected = MOCK_APPLICATIONS.filter((a) => a.baseStatus === "rejected").length;
  const girlChild = MOCK_APPLICATIONS.filter((a) => a.isSingleGirlChild).length;
  const scStObc = MOCK_APPLICATIONS.filter((a) =>
    ["sc", "st", "obc"].includes(a.studentCategory),
  ).length;

  return (
    <PortalFrame
      active="leadership"
      eyebrow="Department of Higher Education · Cycle 2026-27"
      title="Leadership dashboard"
    >
      <div className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] px-4 py-3 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
        Read-only view · No write actions available from this role.
      </div>

      <SummaryStrip
        tiles={[
          { label: "Applications to date", value: total },
          { label: "Verified", value: verified, tone: "success" },
          { label: "Discrepancy raised", value: discrepancies, tone: "warning" },
          { label: "Rejected", value: rejected, tone: "danger" },
        ]}
      />

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardTitle>Reservation mix</CardTitle>
          <CardBody>
            <ul className="space-y-1 text-[var(--text-sm)]">
              <li>SC / ST / OBC applications: {scStObc}</li>
              <li>Single Girl Child claims: {girlChild}</li>
            </ul>
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Trends (coming soon)</CardTitle>
          <CardBody>
            Daily application volume trend chart and district heatmap land with
            the HPU-167 dataset integration. Today this tile is a placeholder.
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
