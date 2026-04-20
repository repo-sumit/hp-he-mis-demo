"use client";

import { Card, CardBody, CardTitle } from "@hp-mis/ui";
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
          <CardBody>
            <ul className="space-y-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">
              <li>• Fee structure editor</li>
              <li>• Transaction ledger</li>
              <li>• Refund approval queue</li>
              <li>• Finance reports</li>
            </ul>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
