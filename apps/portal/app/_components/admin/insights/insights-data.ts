/**
 * Dummy insight data for the State Admin command center. Numbers mirror
 * the "Higher Education Command Center" reference (docs/State_User
 * Dashabord.pdf) so the demo communicates the same strategic picture
 * without pulling from a real data source.
 */

import type { InsightAlert } from "./alerts-panel";
import type { LineChartPoint } from "./line-chart";

// ---------- Section 1 · Executive KPIs (PDF page 1) ----------

export const STATE_KPI = {
  totalColleges: 190,
  govtColleges: 142,
  privateColleges: 48,
  totalStudents: "2.15 L",
  totalStudentsYoY: "+4.2%",
  grossEnrolmentRatio: "36.8%",
  grossEnrolmentDelta: "+1.2%",
  facultyVacancyPct: "18.7%",
  facultyVacantPosts: 1470,
  fundUtilizationPct: "82%",
  fundUtilizedCr: 920,
  fundBudgetCr: 1120,
} as const;

// ---------- Section 2 · Core Insights ----------

export type DistrictDensity = "high" | "medium" | "low" | "critical";

export interface DistrictEnrollmentRow {
  districtId: string;
  districtName: string;
  students: number;
  density: DistrictDensity;
  note?: string;
}

/** District-wise enrollment — matches the density bubbles on the PDF map. */
export const DISTRICT_ENROLLMENT: readonly DistrictEnrollmentRow[] = [
  { districtId: "kangra", districtName: "Kangra", students: 42800, density: "high" },
  { districtId: "shimla", districtName: "Shimla", students: 31200, density: "high" },
  { districtId: "mandi", districtName: "Mandi", students: 24600, density: "high" },
  { districtId: "hamirpur", districtName: "Hamirpur", students: 14900, density: "medium" },
  { districtId: "una", districtName: "Una", students: 13400, density: "medium" },
  { districtId: "bilaspur", districtName: "Bilaspur", students: 11800, density: "medium" },
  { districtId: "solan", districtName: "Solan", students: 11200, density: "medium" },
  { districtId: "kullu", districtName: "Kullu", students: 9600, density: "low" },
  { districtId: "sirmaur", districtName: "Sirmaur", students: 8300, density: "critical", note: "Faculty shortage >22%" },
  { districtId: "chamba", districtName: "Chamba", students: 6200, density: "critical", note: "Faculty shortage >22%" },
  { districtId: "kinnaur", districtName: "Kinnaur", students: 3100, density: "low" },
  { districtId: "lahaul", districtName: "Lahaul & Spiti", students: 1200, density: "critical", note: "-9% YoY in Science" },
];

/** Enrollment analysis — 5 year trend (PDF page 1 mini-chart + page 2 detailed). */
export const ENROLLMENT_TREND: readonly LineChartPoint[] = [
  { label: "2020", value: 1.84 },
  { label: "2021", value: 1.92 },
  { label: "2022", value: 1.98 },
  { label: "2023", value: 2.06 },
  { label: "2024", value: 2.15 },
];

export const ENROLLMENT_TREND_FEMALE: readonly LineChartPoint[] = [
  { label: "2020", value: 0.92 },
  { label: "2021", value: 0.98 },
  { label: "2022", value: 1.02 },
  { label: "2023", value: 1.07 },
  { label: "2024", value: 1.12 },
];

export const ENROLLMENT_TREND_MALE: readonly LineChartPoint[] = [
  { label: "2020", value: 0.92 },
  { label: "2021", value: 0.94 },
  { label: "2022", value: 0.96 },
  { label: "2023", value: 0.99 },
  { label: "2024", value: 1.03 },
];

/** Gender distribution — drives the donut + GPI. Total = 2.15 L. */
export const GENDER_DISTRIBUTION = {
  male: 103_000, // 48%
  female: 112_000, // 52%
  gpi: "1.08",
} as const;

/** Rural vs urban — drives the progress bars under the lifecycle block. */
export const RURAL_URBAN = {
  rural: 68,
  urban: 32,
  note: "Significant increase in rural female enrollment noted in 2024-25.",
} as const;

// ---------- Section 3 · Alerts (PDF page 1 + page 6) ----------

export const ALERT_SUMMARY = {
  critical: 12,
  warnings: 28,
  pendingReviews: 15,
  resolvedThisWeek: 42,
} as const;

export const COMMAND_CENTER_ALERTS: readonly InsightAlert[] = [
  {
    id: "alert-vacancies",
    title: "High vacancies detected",
    description:
      "Chamba & Sirmaur districts are reporting over 22% faculty shortage. Recruitment panels need to be convened.",
    timeAgo: "2h ago",
    severity: "critical",
    tags: ["Chamba", "Sirmaur", "Faculty"],
    cta: { label: "Review deployment", href: "#" },
  },
  {
    id: "alert-enrollment",
    title: "Enrollment drop alert",
    description:
      "Lahaul & Spiti is reporting -9% YoY enrollment in the Science stream. Policy review recommended.",
    timeAgo: "1d ago",
    severity: "warning",
    tags: ["Lahaul & Spiti", "Enrolment"],
    cta: { label: "View district", href: "#" },
  },
  {
    id: "alert-uc",
    title: "UC submission due",
    description:
      "12 colleges have not submitted Utilization Certificates for the current RUSA grant. Risk of fund lapse.",
    timeAgo: "2d ago",
    severity: "warning",
    tags: ["RUSA 2.0", "Finance"],
    cta: { label: "Send reminder", href: "#" },
  },
  {
    id: "alert-dropout",
    title: "High dropout risk — 1st year",
    description:
      "Unusual spike in absenteeism recorded for 1st-year BA students in Kangra district colleges.",
    timeAgo: "1d ago",
    severity: "warning",
    tags: ["Kangra", "Student"],
    cta: { label: "Open cohort", href: "#" },
  },
];

// ---------- Section 4 · Student Lifecycle snapshot (PDF page 2) ----------

export const LIFECYCLE = {
  totalEnrollment: "2.15 L",
  totalEnrollmentDelta: "+4.2%",
  dropoutRate: "8.4%",
  dropoutTarget: "5%",
  completionRate: "78%",
  transitionRate: "92%",
} as const;

export interface RiskCohort {
  district: string;
  course: string;
  riskRate: string;
  severity: "critical" | "warning";
}

export const HIGH_RISK_COHORTS: readonly RiskCohort[] = [
  { district: "Lahaul & Spiti", course: "B.Sc. (Medical)", riskRate: "12.5%", severity: "critical" },
  { district: "Kinnaur", course: "B.Com (General)", riskRate: "10.2%", severity: "warning" },
  { district: "Chamba", course: "B.A. (Arts)", riskRate: "9.8%", severity: "warning" },
];

// ---------- Section 5 · Faculty & HR snapshot (PDF page 3) ----------

export const FACULTY = {
  sanctioned: 7850,
  filled: 6380,
  vacant: 1470,
  retiring24Months: 540,
  occupancyPct: "81.3%",
  vacancyPct: "18.7%",
  newPosts: 120,
} as const;

export interface SubjectVacancy {
  subject: string;
  filled: number;
  vacant: number;
}

export const SUBJECT_VACANCY: readonly SubjectVacancy[] = [
  { subject: "Physics", filled: 320, vacant: 85 },
  { subject: "Maths", filled: 310, vacant: 66 },
  { subject: "Commerce", filled: 450, vacant: 92 },
  { subject: "English", filled: 520, vacant: 90 },
  { subject: "Chemistry", filled: 290, vacant: 40 },
  { subject: "Pol. Sci", filled: 420, vacant: 45 },
];

export interface CriticalShortage {
  college: string;
  district: string;
  vacantPosts: number;
  vacancyPct: string;
  severity: "critical" | "warning";
}

export const CRITICAL_SHORTAGES: readonly CriticalShortage[] = [
  { college: "GC Pangi", district: "Chamba", vacantPosts: 18, vacancyPct: "42%", severity: "critical" },
  { college: "GC Shillai", district: "Sirmaur", vacantPosts: 14, vacancyPct: "38%", severity: "critical" },
  { college: "GC Sangla", district: "Kinnaur", vacantPosts: 11, vacancyPct: "32%", severity: "warning" },
];

// ---------- Section 6 · Financial snapshot (PDF page 4) ----------

export const FINANCE = {
  totalBudgetCr: 1120,
  utilizationPct: "82%",
  utilizationTarget: "80%",
  pendingUCs: 34,
  availableBalanceCr: 201,
  fundSources: [
    { label: "State Plan", share: 65 },
    { label: "Central (GoI)", share: 25 },
    { label: "RUSA", share: 10 },
  ],
} as const;

export interface SchemeBudget {
  scheme: string;
  allocatedCr: number;
  utilizedCr: number;
}

export const SCHEME_BUDGET: readonly SchemeBudget[] = [
  { scheme: "Salaries", allocatedCr: 640, utilizedCr: 590 },
  { scheme: "Infrastructure", allocatedCr: 220, utilizedCr: 170 },
  { scheme: "RUSA", allocatedCr: 120, utilizedCr: 78 },
  { scheme: "Research", allocatedCr: 40, utilizedCr: 24 },
  { scheme: "Student Welfare", allocatedCr: 60, utilizedCr: 38 },
];

// ---------- Section 7 · Infrastructure snapshot (PDF page 5) ----------

export const INFRA = {
  classroomRatio: "58:1",
  classroomRatioTarget: "45:1",
  smartClassroomsInstalled: 820,
  smartClassroomsTarget: 1100,
  ictEnabledPct: "78%",
  labUtilizationPct: "63%",
  wifiCampusPct: 62,
  computerLabsPct: 85,
  powerBackupPct: 45,
} as const;

export interface CAPEXRow {
  asset: string;
  quantity: string;
  estCostCr: string;
  priority: "High" | "Medium";
  status: string;
}

export const CAPEX_REQUIREMENTS: readonly CAPEXRow[] = [
  { asset: "New classrooms", quantity: "140 units", estCostCr: "₹28.5 Cr", priority: "High", status: "DPR approved" },
  { asset: "Science labs", quantity: "65 units", estCostCr: "₹12.2 Cr", priority: "High", status: "Tender stage" },
  { asset: "Smart boards", quantity: "210 units", estCostCr: "₹4.2 Cr", priority: "Medium", status: "Procurement" },
];
