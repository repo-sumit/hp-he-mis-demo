/**
 * Shared TypeScript types for HP MIS.
 * Mirrors the entity model defined in docs/project-context.md §8 — kept
 * deliberately lean for V1 and pragmatic (no ORM coupling).
 *
 * These are the shapes the three apps + mock API agree on; extend carefully.
 */

export type Language = "en" | "hi";
export type Bilingual = { en: string; hi: string };

export type CourseCode = "BA" | "BSc-Med" | "BSc-NonMed" | "BCom" | "BCA" | "BBA" | "BVoc";
export type Stream = "None" | "PCM" | "PCB" | "Arts" | "Commerce";

// ---- System configuration ----

export interface College {
  id: string;
  aisheCode: string;
  name: Bilingual;
  type: "government_degree" | "sanskrit";
  district: string;
  principalName?: string;
  logoUrl?: string;
  prospectusPdfUrl?: string;
  isActive: boolean;
}

export interface Course {
  id: string;
  code: CourseCode;
  name: Bilingual;
  level: "UG";
  durationYears: number;
  streamRequired: Stream;
  baseEligibilityNote?: Bilingual;
}

export interface SubjectCombination {
  id: string;
  collegeId: string;
  courseId: string;
  subjectA: string;
  subjectB: string;
  bucketA: string;
  bucketB: string;
  displayName: Bilingual;
  isActive: boolean;
}

export interface CourseOffering {
  id: string;
  collegeId: string;
  courseId: string;
  cycleId: string;
  applicationFee: number;
  isActive: boolean;
}

export interface ReservationCategory {
  id: string;
  code: string;
  name: Bilingual;
  percentage: number;
  interSePriority: number;
  isSupernumerary: boolean;
}

export interface AdmissionCycle {
  id: string;
  name: string;
  academicYear: string;
  isCurrent: boolean;
}

export type PhaseState = "pending" | "active" | "closed";
export interface Phase {
  id: string;
  cycleId: string;
  name: string;
  startAt: string;
  endAt: string;
  state: PhaseState;
}

// ---- Student journey ----

export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_scrutiny"
  | "conditional_edit_open"
  | "verified"
  | "rejected"
  | "in_merit"
  | "excluded_from_merit"
  | "allotted"
  | "admission_confirmed"
  | "withdrawn";

export type DocumentStatus =
  | "not_uploaded"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected"
  | "re_uploaded";

export type AllotmentResponse =
  | "pending"
  | "freeze"
  | "float"
  | "decline"
  | "auto_cancelled";

export interface Student {
  id: string;
  email: string;
  mobile: string;
  emailVerified: boolean;
  mobileVerified: boolean;
  preferredLanguage: Language;
  fullName: string;
  fatherName?: string;
  motherName?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
  district?: string;
  pincode?: string;
  board?: "HPBOSE" | "CBSE" | "ICSE" | "NIOS" | "other";
  yearOfPassing?: number;
  stream?: Stream;
  percentageComputed?: number;
  bestOfFiveDeclared?: number;
  resultStatus?: "pass" | "compartment" | "fail";
  categoryPrimary?: string;
  domicileState?: string;
  isPwd?: boolean;
  isSingleGirlChild?: boolean;
}

export interface Application {
  id: string;
  studentId: string;
  cycleId: string;
  courseId: string;
  submittedAt?: string;
  status: ApplicationStatus;
  applicationFeePaid: boolean;
}

export interface Preference {
  id: string;
  applicationId: string;
  rankOrder: number;
  combinationId: string;
  offeringId: string;
  categoryAppliedUnder: string;
  isAllotted: boolean;
}

// ---- Identity ----

export type RoleCode =
  | "student"
  | "state_admin"
  | "college_admin"
  | "operator"
  | "convenor"
  | "finance"
  | "dhe_secretary";

export interface User {
  id: string;
  email: string;
  name: string;
  role: RoleCode;
  assignedCollegeId?: string;
  isActive: boolean;
}
