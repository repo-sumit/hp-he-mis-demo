import { Card, CardBody, CardTitle } from "@hp-mis/ui";
import { PortalFrame } from "./_components/portal-frame";

const KPIS = [
  { label: "Active cycle", value: "2026-27" },
  { label: "Applications today", value: "—" },
  { label: "Scrutiny in queue", value: "—" },
  { label: "Seats configured", value: "—" },
];

export default function DashboardPage() {
  return (
    <PortalFrame active="overview" title="Dashboard">
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label}>
            <div className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {kpi.label}
            </div>
            <div className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              {kpi.value}
            </div>
          </Card>
        ))}
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardTitle>Activity feed</CardTitle>
          <CardBody>
            Real-time scrutiny, merit, and allocation events will appear here once the
            mock API lands. In the meantime, the{" "}
            <a href="/applications" className="font-[var(--weight-semibold)] text-[var(--color-text-link)]">
              Applications queue
            </a>{" "}
            is wired up for scrutiny and discrepancy workflows.
          </CardBody>
        </Card>
        <Card>
          <CardTitle>Cycle phase</CardTitle>
          <CardBody>
            Toggle cycle phases from <strong>State admin → Cycle setup</strong> (coming
            soon). Currently parked at <em>Application Open — Day 3 of 10</em>.
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
