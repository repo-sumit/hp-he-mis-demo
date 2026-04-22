"use client";

import {
  Badge,
  Button,
  Card,
  CardBody,
  CardTitle,
  Table,
  TableShell,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from "@hp-mis/ui";
import { PortalFrame } from "../../_components/portal-frame";
import { SummaryStrip } from "../../_components/admin/summary-strip";
import { useSession } from "../../_components/data/session-provider";

type CategoryKey = "gen" | "obc" | "sc" | "st" | "ews" | "pwd" | "sgc";

interface SeatRow {
  /** Stable key — course code + combination index. */
  id: string;
  courseCode: string;
  courseName: string;
  /** BA combinations or BSc streams. Optional on BCom / BCA where there is one track. */
  track?: string;
  sanctioned: number;
  seats: Record<CategoryKey, number>;
}

const CATEGORY_ORDER: readonly CategoryKey[] = [
  "gen",
  "obc",
  "sc",
  "st",
  "ews",
  "pwd",
  "sgc",
];

const CATEGORY_LABEL: Record<CategoryKey, string> = {
  gen: "GEN",
  obc: "OBC",
  sc: "SC",
  st: "ST",
  ews: "EWS",
  pwd: "PwD",
  sgc: "SGC",
};

const CATEGORY_HELPER: Record<CategoryKey, string> = {
  gen: "General",
  obc: "Other Backward Classes",
  sc: "Scheduled Caste",
  st: "Scheduled Tribe",
  ews: "Economically Weaker Section",
  pwd: "Persons with Disability (horizontal 5%)",
  sgc: "Single Girl Child (supernumerary)",
};

/**
 * Seat matrix — mock data for a typical Government Degree College. Numbers
 * reflect the standard 400-seat UG shape used across HP Government colleges
 * (BA at 240, BCom at 100, BSc Medical + Non-Medical at 60 combined). In V1
 * production these flow off `Course × Combination × Category` seat records.
 */
const SEAT_ROWS: readonly SeatRow[] = [
  {
    id: "BA-history-eco",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "History + Economics",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BA-polsc-public",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "Political Science + Public Admin",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BA-sociology-philosophy",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "Sociology + Philosophy",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BA-hindi-english",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "Hindi + English",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BA-sanskrit-music",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "Sanskrit + Music",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BA-geography-history",
    courseCode: "BA",
    courseName: "Bachelor of Arts",
    track: "Geography + History",
    sanctioned: 40,
    seats: { gen: 18, obc: 11, sc: 10, st: 2, ews: 4, pwd: 2, sgc: 1 },
  },
  {
    id: "BCom",
    courseCode: "BCom",
    courseName: "Bachelor of Commerce",
    sanctioned: 100,
    seats: { gen: 45, obc: 27, sc: 25, st: 4, ews: 10, pwd: 5, sgc: 2 },
  },
  {
    id: "BSc-Med",
    courseCode: "BSc",
    courseName: "Bachelor of Science",
    track: "Medical (PCB)",
    sanctioned: 30,
    seats: { gen: 13, obc: 8, sc: 7, st: 1, ews: 3, pwd: 2, sgc: 1 },
  },
  {
    id: "BSc-NonMed",
    courseCode: "BSc",
    courseName: "Bachelor of Science",
    track: "Non-Medical (PCM)",
    sanctioned: 30,
    seats: { gen: 13, obc: 8, sc: 7, st: 1, ews: 3, pwd: 2, sgc: 1 },
  },
];

const COLLEGE_META = {
  name: "Government Degree College, Sanjauli",
  aisheCode: "C-41067",
  district: "Shimla",
  principal: "Dr. Meera Kapoor",
  approvedBy: "DHE, Govt. of Himachal Pradesh",
  effectiveFrom: "10 June 2026",
  cycle: "2026-27",
} as const;

function total(row: SeatRow): number {
  return CATEGORY_ORDER.reduce((acc, k) => acc + row.seats[k], 0);
}

export default function SeatMatrixPage() {
  const { session, hydrated } = useSession();

  if (hydrated && session.role !== "college_admin") {
    return (
      <PortalFrame active="seats" eyebrow="Seat matrix" title="Seat matrix">
        <Card>
          <CardTitle>Role required</CardTitle>
          <CardBody>
            Seat matrix is scoped to your college — switch to College Admin or College
            Operator to view it.
          </CardBody>
        </Card>
      </PortalFrame>
    );
  }

  const collegeName = session.collegeName ?? COLLEGE_META.name;

  const totals = SEAT_ROWS.reduce(
    (acc, row) => {
      acc.sanctioned += row.sanctioned;
      for (const k of CATEGORY_ORDER) acc.byCategory[k] += row.seats[k];
      return acc;
    },
    {
      sanctioned: 0,
      byCategory: { gen: 0, obc: 0, sc: 0, st: 0, ews: 0, pwd: 0, sgc: 0 } as Record<
        CategoryKey,
        number
      >,
    },
  );

  const baTotal = SEAT_ROWS.filter((r) => r.courseCode === "BA").reduce(
    (acc, r) => acc + r.sanctioned,
    0,
  );
  const bcomTotal = SEAT_ROWS.filter((r) => r.courseCode === "BCom").reduce(
    (acc, r) => acc + r.sanctioned,
    0,
  );
  const bscTotal = SEAT_ROWS.filter((r) => r.courseCode === "BSc").reduce(
    (acc, r) => acc + r.sanctioned,
    0,
  );

  return (
    <PortalFrame
      active="seats"
      eyebrow={`Seat matrix · Cycle ${COLLEGE_META.cycle}`}
      title={collegeName}
      banner={{
        title: collegeName,
        eyebrow: `Seat matrix · Cycle ${COLLEGE_META.cycle}`,
        actions: (
          <>
            <Badge tone="info">Approved by DHE</Badge>
            <Button variant="secondary" size="sm" disabled>
              Request revision
            </Button>
          </>
        ),
      }}
    >
      <SummaryStrip
        tiles={[
          { label: "Sanctioned seats", value: totals.sanctioned, tone: "brand" },
          { label: "BA combinations", value: baTotal },
          { label: "BCom", value: bcomTotal },
          { label: "BSc (PCM + PCB)", value: bscTotal },
        ]}
      />

      <section className="mt-6">
        <Card padded={false}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--color-border-subtle)] px-5 py-4">
            <div>
              <CardTitle>Seat matrix</CardTitle>
              <CardBody className="mt-1">
                Course × track × category breakdown. Totals include horizontal PwD
                (5%) and supernumerary Single Girl Child seats.
              </CardBody>
            </div>
            <Badge tone="neutral">Effective {COLLEGE_META.effectiveFrom}</Badge>
          </div>
          <TableShell className="rounded-none border-0 shadow-none">
            <Table className="min-w-[960px]">
              <THead>
                <TR>
                  <TH className="min-w-[220px]">Course · Track</TH>
                  <TH className="text-right">Sanctioned</TH>
                  {CATEGORY_ORDER.map((k) => (
                    <TH key={k} className="text-right" title={CATEGORY_HELPER[k]}>
                      {CATEGORY_LABEL[k]}
                    </TH>
                  ))}
                  <TH className="text-right">Total allocated</TH>
                </TR>
              </THead>
              <TBody>
                {SEAT_ROWS.map((row) => {
                  const rowTotal = total(row);
                  const mismatch = rowTotal !== row.sanctioned;
                  return (
                    <TR key={row.id}>
                      <TD className="align-top">
                        <p className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                          {row.courseCode}
                        </p>
                        {row.track ? (
                          <p className="text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                            {row.track}
                          </p>
                        ) : (
                          <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
                            {row.courseName}
                          </p>
                        )}
                      </TD>
                      <TD className="text-right align-top tabular-nums font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {row.sanctioned}
                      </TD>
                      {CATEGORY_ORDER.map((k) => (
                        <TD key={k} className="text-right align-top tabular-nums">
                          {row.seats[k]}
                        </TD>
                      ))}
                      <TD className="text-right align-top tabular-nums">
                        {mismatch ? (
                          <Badge tone="warning">{rowTotal}</Badge>
                        ) : (
                          <span className="text-[var(--color-text-secondary)]">
                            {rowTotal}
                          </span>
                        )}
                      </TD>
                    </TR>
                  );
                })}
                <TR className="border-t-2 border-[var(--color-border-strong)] bg-[var(--color-background-brand-softer)]">
                  <TD className="text-[var(--text-xs)] font-[var(--weight-bold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-primary)]">
                    Total · {SEAT_ROWS.length} tracks
                  </TD>
                  <TD className="text-right tabular-nums text-[var(--text-base)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
                    {totals.sanctioned}
                  </TD>
                  {CATEGORY_ORDER.map((k) => (
                    <TD
                      key={k}
                      className="text-right tabular-nums font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
                    >
                      {totals.byCategory[k]}
                    </TD>
                  ))}
                  <TD className="text-right tabular-nums text-[var(--text-base)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
                    {CATEGORY_ORDER.reduce((acc, k) => acc + totals.byCategory[k], 0)}
                  </TD>
                </TR>
              </TBody>
            </Table>
          </TableShell>
        </Card>
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_2fr]">
        <Card>
          <CardTitle>College</CardTitle>
          <CardBody className="mt-3 space-y-1.5">
            <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {collegeName}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              AISHE {COLLEGE_META.aisheCode} · {COLLEGE_META.district} district
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Principal: {COLLEGE_META.principal}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardTitle>Category legend</CardTitle>
          <CardBody className="mt-3">
            <ul className="grid grid-cols-1 gap-2 text-[var(--text-sm)] sm:grid-cols-2">
              {CATEGORY_ORDER.map((k) => (
                <li key={k} className="flex items-start gap-2">
                  <Badge tone="brand" className="uppercase">
                    {CATEGORY_LABEL[k]}
                  </Badge>
                  <span className="text-[var(--color-text-secondary)]">
                    {CATEGORY_HELPER[k]}
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              Seat matrix approved by {COLLEGE_META.approvedBy}. Changes require state
              approval and are routed through the Cycle setup workflow.
            </p>
          </CardBody>
        </Card>
      </section>
    </PortalFrame>
  );
}
