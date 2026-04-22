"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Stepper,
  Table,
  TableShell,
  TBody,
  TD,
  TH,
  THead,
  TR,
  type Step,
} from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import { ReviewSectionCard, KeyValue } from "../../_components/admin/review-section-card";
import { useSession } from "../../_components/data/session-provider";

type PhaseState = "closed" | "active" | "upcoming";

interface Phase {
  name: string;
  opensAt: string;
  closesAt: string;
  state: PhaseState;
  note?: string;
}

/**
 * Mock cycle data. In V1 production this lands from the Cycle + Phase
 * entities in the data model (§8); for the demo we stage a believable
 * timeline lifted from the HP cycle calendar described in §2.
 */
const CYCLE = {
  id: "cycle-2026-27",
  name: "Cycle 2026-27",
  academicYear: "2026-27",
  isCurrent: true,
  openedAt: "10 June 2026, 10:00 AM",
  status: "Application open · Day 3 of 10",
  ownedBy: "Dr. Anju Sharma, Director of Higher Education",
  approvedOn: "3 June 2026",
} as const;

const PHASES: readonly Phase[] = [
  {
    name: "Cycle setup",
    opensAt: "1 June 2026",
    closesAt: "9 June 2026, 6:00 PM",
    state: "closed",
    note: "Rules, reservation, seat matrix and fees locked.",
  },
  {
    name: "Application open",
    opensAt: "10 June 2026, 10:00 AM",
    closesAt: "24 June 2026, 5:00 PM",
    state: "active",
    note: "Students can register, build profile and submit preferences.",
  },
  {
    name: "College scrutiny",
    opensAt: "25 June 2026",
    closesAt: "8 July 2026",
    state: "upcoming",
    note: "Colleges verify documents and raise discrepancies.",
  },
  {
    name: "Merit publication",
    opensAt: "11 July 2026",
    closesAt: "11 July 2026",
    state: "upcoming",
    note: "State publishes course-wise merit lists.",
  },
  {
    name: "Seat allotment",
    opensAt: "12 July 2026",
    closesAt: "26 July 2026",
    state: "upcoming",
    note: "Three rounds of seat allotment and student response.",
  },
  {
    name: "Admission confirmed",
    opensAt: "27 July 2026",
    closesAt: "2 August 2026",
    state: "upcoming",
    note: "Fee payment and class reporting.",
  },
];

const RULES_SUMMARY = [
  { label: "Eligibility cut-off", value: "Class 12 pass, minimum 33% aggregate (HPBOSE norm)" },
  { label: "Best-of-five", value: "Student-declared; verified during scrutiny" },
  { label: "BA preferences", value: "Max 6 combinations · BSc max 3" },
  { label: "Domicile", value: "HP domicile priority; 85% state quota" },
  { label: "Fee heads", value: "42 configured (Government Degree Colleges)" },
  { label: "Payment gateway", value: "Simulated · 3 mock outcomes" },
];

const RESERVATION_ROWS = [
  { code: "GEN", name: "General", percent: "Open", priority: 0 },
  { code: "OBC", name: "Other Backward Classes", percent: "27%", priority: 1 },
  { code: "SC", name: "Scheduled Caste", percent: "25%", priority: 2 },
  { code: "ST", name: "Scheduled Tribe", percent: "4%", priority: 3 },
  { code: "EWS", name: "Economically Weaker Section", percent: "10%", priority: 4 },
  { code: "SGC", name: "Single Girl Child", percent: "Supernumerary", priority: 5 },
  { code: "PwD", name: "Persons with Disability", percent: "5% horizontal", priority: 6 },
];

const PHASE_TONE: Record<PhaseState, "success" | "brand" | "neutral"> = {
  closed: "success",
  active: "brand",
  upcoming: "neutral",
};

const PHASE_LABEL: Record<PhaseState, string> = {
  closed: "Closed",
  active: "Active",
  upcoming: "Upcoming",
};

export default function CycleSetupPage() {
  const { session, hydrated } = useSession();

  // Non-state-admin roles get a polite role-gate, matching merit / allocation.
  if (hydrated && session.role !== "state_admin") {
    return (
      <PortalFrame
        active="cycle"
        eyebrow="Cycle setup"
        title="Cycle 2026-27"
      >
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>
            Cycle setup is restricted to State Admin (DHE). Switch roles to continue.
          </CardBody>
        </Card>
      </PortalFrame>
    );
  }

  const steps: readonly Step[] = PHASES.map((phase, idx) => ({
    number: idx + 1,
    label: phase.name,
    state:
      phase.state === "closed"
        ? "done"
        : phase.state === "active"
          ? "active"
          : "idle",
  }));

  const closed = PHASES.filter((p) => p.state === "closed").length;
  const active = PHASES.find((p) => p.state === "active");
  const upcoming = PHASES.filter((p) => p.state === "upcoming").length;

  return (
    <PortalFrame
      active="cycle"
      eyebrow="State admin · Cycle setup"
      title={CYCLE.name}
      banner={{
        title: CYCLE.name,
        eyebrow: `Academic year ${CYCLE.academicYear}`,
        actions: (
          <>
            <Badge tone="success" dot>
              {CYCLE.status}
            </Badge>
            <Button variant="secondary" size="sm" disabled>
              Edit cycle
            </Button>
          </>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Phases closed", value: closed, tone: "success" },
          {
            label: "Active phase",
            value: active?.name ?? "—",
            tone: "brand",
            hint: active ? `Closes ${active.closesAt}` : undefined,
          },
          { label: "Phases upcoming", value: upcoming },
          { label: "Fee heads", value: 42 },
        ]}
      />

      <section className="mt-6">
        <Card padded={false}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Phase timeline</CardTitle>
            <CardBody className="mt-1">
              Six-stage admission pipeline. Stages flip from upcoming → active → closed
              automatically based on the windows below.
            </CardBody>
          </div>
          <div className="px-5 py-5">
            <Stepper steps={steps} />
          </div>
        </Card>
      </section>

      <div className="mt-6 grid gap-5 lg:grid-cols-[2fr_1fr]">
        <Card padded={false}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Phase windows</CardTitle>
            <CardBody className="mt-1">
              Opens / closes times render to the student mini-app exactly as entered.
            </CardBody>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table>
              <THead>
                <TR>
                  <TH>Phase</TH>
                  <TH>Opens</TH>
                  <TH>Closes</TH>
                  <TH>Status</TH>
                </TR>
              </THead>
              <TBody>
                {PHASES.map((phase) => (
                  <TR key={phase.name}>
                    <TD className="align-top">
                      <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {phase.name}
                      </p>
                      {phase.note ? (
                        <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                          {phase.note}
                        </p>
                      ) : null}
                    </TD>
                    <TD className="align-top whitespace-nowrap text-[var(--color-text-secondary)]">
                      {phase.opensAt}
                    </TD>
                    <TD className="align-top whitespace-nowrap text-[var(--color-text-secondary)]">
                      {phase.closesAt}
                    </TD>
                    <TD className="align-top">
                      <Badge tone={PHASE_TONE[phase.state]} dot={phase.state === "active"}>
                        {PHASE_LABEL[phase.state]}
                      </Badge>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        </Card>

        <div className="space-y-5">
          <ReviewSectionCard title="Cycle ownership">
            <dl className="divide-y divide-[var(--color-border-subtle)]">
              <KeyValue label="Owner" value={CYCLE.ownedBy} />
              <KeyValue label="Approved on" value={CYCLE.approvedOn} />
              <KeyValue label="Cycle ID" value={CYCLE.id} />
              <KeyValue label="Opened at" value={CYCLE.openedAt} />
            </dl>
          </ReviewSectionCard>
          <ReviewSectionCard title="Key windows">
            <ul className="space-y-2 text-[var(--text-sm)]">
              <li className="flex items-center justify-between gap-3">
                <span>Application open</span>
                <Badge tone="success" dot>
                  Live
                </Badge>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Last day to submit</span>
                <span className="text-[var(--color-text-secondary)]">
                  24 Jun 2026, 5:00 PM
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Merit publish target</span>
                <span className="text-[var(--color-text-secondary)]">11 Jul 2026</span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span>Classes reporting</span>
                <span className="text-[var(--color-text-secondary)]">27 Jul 2026</span>
              </li>
            </ul>
          </ReviewSectionCard>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ReviewSectionCard
          title="Rules summary"
          description="Cycle-wide rules that flow through eligibility, scrutiny and merit."
        >
          <dl className="divide-y divide-[var(--color-border-subtle)]">
            {RULES_SUMMARY.map((r) => (
              <KeyValue key={r.label} label={r.label} value={r.value} />
            ))}
          </dl>
        </ReviewSectionCard>

        <Card padded={false}>
          <div className="border-b border-[var(--color-border-subtle)] px-5 py-4">
            <CardTitle>Reservation categories</CardTitle>
            <CardBody className="mt-1">
              Inter-se priority drives tie-breaking when a candidate qualifies under
              multiple categories.
            </CardBody>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table>
              <THead>
                <TR>
                  <TH>Code</TH>
                  <TH>Name</TH>
                  <TH className="text-right">Percent</TH>
                  <TH className="text-right">Priority</TH>
                </TR>
              </THead>
              <TBody>
                {RESERVATION_ROWS.map((row) => (
                  <TR key={row.code}>
                    <TD>
                      <Badge tone="brand" className="uppercase">
                        {row.code}
                      </Badge>
                    </TD>
                    <TD className="text-[var(--color-text-primary)]">{row.name}</TD>
                    <TD className="text-right text-[var(--color-text-secondary)]">
                      {row.percent}
                    </TD>
                    <TD className="text-right tabular-nums text-[var(--color-text-secondary)]">
                      {row.priority}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableShell>
        </Card>
      </div>

      <p className="mt-6 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        Editing cycle-level configuration is restricted to the Director of Higher
        Education. Changes are recorded in the audit log against{" "}
        <span className="font-mono">{CYCLE.id}</span>.
      </p>
    </PortalFrame>
  );
}
