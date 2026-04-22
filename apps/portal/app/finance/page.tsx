"use client";

import { Badge, Card, CardBody, CardTitle } from "@hp-mis/ui";
import { PortalFrame } from "../_components/portal-frame";
import { SummaryStrip } from "../_components/admin/summary-strip";

/**
 * Finance role landing. The full fee-structure editor, transaction ledger,
 * and refund queue land in a later sprint — this shell gives the role a
 * believable home during the V1 demo.
 */
export default function FinanceDashboardPage() {
  return (
    <PortalFrame
      active="finance"
      eyebrow="Finance · Cycle 2026-27"
      title="Finance overview"
      banner={{
        title: "Finance · Cycle 2026-27",
        eyebrow: "Finance",
        actions: <Badge tone="info">Demo shell</Badge>,
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Receipts today", value: "—" },
          { label: "Reconciled", value: "—", tone: "success" },
          { label: "Refunds pending", value: "—", tone: "warning" },
          { label: "Fee heads configured", value: "42" },
        ]}
      />

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>What finance owns</CardTitle>
          <CardBody>
            Fee structure per course/college (42 heads per §2.2), transaction
            reconciliation, and refund approvals for duplicate payments and
            withdrawals. Finance does not touch student or application data — it
            operates on payments only.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Coming soon</CardTitle>
          <CardBody className="mt-3">
            <ul className="flex flex-wrap gap-2 text-[var(--text-sm)]">
              <li><Badge tone="neutral">Fee structure editor</Badge></li>
              <li><Badge tone="neutral">Transaction ledger</Badge></li>
              <li><Badge tone="neutral">Refund approval queue</Badge></li>
              <li><Badge tone="neutral">Finance reports</Badge></li>
            </ul>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
