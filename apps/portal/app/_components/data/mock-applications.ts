/**
 * Mock scrutiny fixtures. Shapes align with the §8.2 Application entity so
 * the layer is compatible with the real mock API when it lands. Everything is
 * static — per-reviewer state (verifications, discrepancies, status overrides)
 * lives on top in ScrutinyProvider.
 *
 * College names are stitched in from the HPU-167 fixture at module init, so
 * the portal always shows the canonical institution name (no drift between
 * the seed dataset and these sample applications).
 */

import { getCollegeById } from "@hp-mis/fixtures";

export type AppBaseStatus =
  | "submitted"
  | "under_scrutiny"
  | "discrepancy_raised"
  | "verified"
  | "rejected"
  | "conditional";

export type DocScrutinyStatus =
  | "not_uploaded"
  | "uploaded"
  | "under_review"
  | "verified"
  | "rejected";

export interface AppDocument {
  code: string;
  fileName: string;
  mimeType: string;
  sizeKb: number;
  uploadedAt: number;
  baseStatus: DocScrutinyStatus;
  /** Pre-seeded reviewer rejection reason (rendered on the scrutiny card). */
  rejectionReason?: string;
}

export interface AppPreference {
  rank: number;
  collegeId: string;
  collegeName: string;
  /** Present only when the course is combination-based (BA). */
  subjectA?: string;
  subjectB?: string;
  bucketA?: string;
  bucketB?: string;
  totalSeats: number;
  vacantSeats: number;
}

export interface AppHistoryEntry {
  at: number;
  actor: string;
  action: string;
  target?: string;
  note?: string;
}

export interface MockApplication {
  id: string; // HP-ADM-2026-NNNNNN
  studentName: string;
  studentEmail: string;
  studentMobile: string;
  studentDob: string;
  studentGender: "female" | "male" | "other";
  studentAadhaar?: string;
  studentApaar?: string;
  studentCategory: "general" | "ews" | "obc" | "sc" | "st";
  studentDomicileState: string;
  studentDistrict: string;
  studentPincode: string;
  studentPermanentAddress: string;
  studentBoard: "HPBOSE" | "CBSE" | "ICSE" | "NIOS" | "other";
  studentYearOfPassing: number;
  studentRollNumber: string;
  studentStream: "arts" | "pcm" | "pcb" | "commerce";
  studentSubjects: string;
  studentBofPercentage: number;
  studentResultStatus: "pass" | "compartment" | "fail";
  studentClaims: string[];
  isSingleGirlChild: boolean;
  isPwd: boolean;
  courseId: string;
  courseCode: string;
  collegeId: string;
  collegeName: string;
  submittedAt: number;
  applicationFee: number;
  baseStatus: AppBaseStatus;
  preferences: AppPreference[];
  documents: AppDocument[];
  history: AppHistoryEntry[];
  /** Reviewer who picked up the application, when applicable. */
  assignedReviewer?: string;
}

const NOW = Date.UTC(2026, 5, 17, 10, 0, 0); // Wed, 17 Jun 2026, 10:00 IST-ish (demo clock)
const HOUR = 1000 * 60 * 60;
const DAY = HOUR * 24;

function appId(n: number): string {
  return `HP-ADM-2026-${String(n).padStart(6, "0")}`;
}

export const REVIEWER_ID = "op-priya";
export const REVIEWER_NAME = "Priya Negi";
export const REVIEWER_ROLE = "College Operator";
export const REVIEWER_COLLEGE_ID = "gc_sanjauli";
export const REVIEWER_COLLEGE =
  getCollegeById(REVIEWER_COLLEGE_ID)?.shortName ?? "GC Sanjauli";

/**
 * Eleven seeded applications. Application #1 is Asha Sharma — the demo-day
 * hero — and carries a freshly submitted BA with two preferences. The rest
 * are a cross-section of courses, colleges, and statuses so the queue view,
 * filters, and scrutiny actions all have something to chew on.
 */
const SEED_APPLICATIONS: readonly MockApplication[] = [
  {
    id: appId(147),
    studentName: "Asha Sharma",
    studentEmail: "asha.sharma@example.com",
    studentMobile: "9876543210",
    studentDob: "2007-08-12",
    studentGender: "female",
    studentAadhaar: "123456789012",
    studentApaar: "APAAR001234",
    studentCategory: "sc",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Solan",
    studentPincode: "173212",
    studentPermanentAddress: "H.No. 42, Ward 3, Kandaghat, Solan",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "HPB-2025-014723",
    studentStream: "arts",
    studentSubjects: "English, Hindi, History, Political Science, Economics",
    studentBofPercentage: 62.4,
    studentResultStatus: "pass",
    studentClaims: ["sc"],
    isSingleGirlChild: true,
    isPwd: false,
    courseId: "ba",
    courseCode: "BA",
    collegeId: "gc_sanjauli",
    collegeName: "Government College Sanjauli",
    submittedAt: NOW - 2 * HOUR,
    applicationFee: 50,
    baseStatus: "submitted",
    preferences: [
      {
        rank: 1,
        collegeId: "gc_sanjauli",
        collegeName: "Government College Sanjauli",
        subjectA: "History",
        subjectB: "Political Science",
        bucketA: "B1",
        bucketB: "B2",
        totalSeats: 60,
        vacantSeats: 52,
      },
      {
        rank: 2,
        collegeId: "gc_sanjauli",
        collegeName: "Government College Sanjauli",
        subjectA: "Hindi",
        subjectB: "Economics",
        bucketA: "B3",
        bucketB: "B4",
        totalSeats: 40,
        vacantSeats: 30,
      },
    ],
    documents: [
      {
        code: "marksheet_12",
        fileName: "asha_12_marksheet.pdf",
        mimeType: "application/pdf",
        sizeKb: 410,
        uploadedAt: NOW - 2 * HOUR - 20 * 60 * 1000,
        baseStatus: "uploaded",
      },
      {
        code: "photo",
        fileName: "asha_passport.jpg",
        mimeType: "image/jpeg",
        sizeKb: 128,
        uploadedAt: NOW - 2 * HOUR - 40 * 60 * 1000,
        baseStatus: "uploaded",
      },
      {
        code: "signature",
        fileName: "asha_sig.jpg",
        mimeType: "image/jpeg",
        sizeKb: 58,
        uploadedAt: NOW - 2 * HOUR - 35 * 60 * 1000,
        baseStatus: "uploaded",
      },
      {
        code: "character_cert",
        fileName: "asha_character.pdf",
        mimeType: "application/pdf",
        sizeKb: 290,
        uploadedAt: NOW - 2 * HOUR - 30 * 60 * 1000,
        baseStatus: "uploaded",
      },
      {
        code: "caste_cert",
        fileName: "asha_sc_cert.pdf",
        mimeType: "application/pdf",
        sizeKb: 340,
        uploadedAt: NOW - 2 * HOUR - 25 * 60 * 1000,
        baseStatus: "uploaded",
      },
      {
        code: "domicile_cert",
        fileName: "asha_domicile.pdf",
        mimeType: "application/pdf",
        sizeKb: 320,
        uploadedAt: NOW - 2 * HOUR - 22 * 60 * 1000,
        baseStatus: "uploaded",
      },
    ],
    history: [
      {
        at: NOW - 2 * HOUR,
        actor: "Asha Sharma",
        action: "Application submitted",
      },
      {
        at: NOW - 2 * HOUR + 5 * 60 * 1000,
        actor: "System",
        action: "Application received for scrutiny",
      },
    ],
  },
  {
    id: appId(148),
    studentName: "Rohit Thakur",
    studentEmail: "rohit.thakur@example.com",
    studentMobile: "9823412200",
    studentDob: "2006-02-04",
    studentGender: "male",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Kangra",
    studentPincode: "176001",
    studentPermanentAddress: "H.No. 18, Civil Lines, Dharamshala, Kangra",
    studentBoard: "CBSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "CBSE-25-188910",
    studentStream: "pcm",
    studentSubjects: "English, Physics, Chemistry, Maths, Computer Science",
    studentBofPercentage: 78.2,
    studentResultStatus: "pass",
    studentClaims: ["pwd"],
    isSingleGirlChild: false,
    isPwd: true,
    courseId: "bsc_nonmed",
    courseCode: "BSc Non-Med",
    collegeId: "rkmv_shimla",
    collegeName: "RKMV College Shimla",
    submittedAt: NOW - DAY - 4 * HOUR,
    applicationFee: 50,
    baseStatus: "under_scrutiny",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "rkmv_shimla",
        collegeName: "RKMV College Shimla",
        totalSeats: 120,
        vacantSeats: 110,
      },
      {
        rank: 2,
        collegeId: "vallabh_mandi",
        collegeName: "Vallabh Government College Mandi",
        totalSeats: 90,
        vacantSeats: 80,
      },
    ],
    documents: [
      {
        code: "marksheet_12",
        fileName: "rohit_cbse_marksheet.pdf",
        mimeType: "application/pdf",
        sizeKb: 460,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "photo",
        fileName: "rohit_photo.jpg",
        mimeType: "image/jpeg",
        sizeKb: 132,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "signature",
        fileName: "rohit_sig.jpg",
        mimeType: "image/jpeg",
        sizeKb: 62,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "character_cert",
        fileName: "rohit_character.pdf",
        mimeType: "application/pdf",
        sizeKb: 280,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "pwd_cert",
        fileName: "rohit_pwd_cert.pdf",
        mimeType: "application/pdf",
        sizeKb: 510,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "under_review",
      },
      {
        code: "domicile_cert",
        fileName: "rohit_domicile.pdf",
        mimeType: "application/pdf",
        sizeKb: 305,
        uploadedAt: NOW - DAY - 5 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "migration_cert",
        fileName: "rohit_migration.pdf",
        mimeType: "application/pdf",
        sizeKb: 240,
        uploadedAt: NOW - DAY - 4 * HOUR,
        baseStatus: "uploaded",
      },
    ],
    history: [
      { at: NOW - DAY - 4 * HOUR, actor: "Rohit Thakur", action: "Application submitted" },
      { at: NOW - DAY - 3 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
      {
        at: NOW - DAY - 2 * HOUR,
        actor: REVIEWER_NAME,
        action: "Verified document",
        target: "Class 12 marksheet",
      },
      {
        at: NOW - 12 * HOUR,
        actor: REVIEWER_NAME,
        action: "Marked document for review",
        target: "Disability certificate",
        note: "Checking percentage threshold",
      },
    ],
  },
  {
    id: appId(149),
    studentName: "Priya Verma",
    studentEmail: "priya.verma@example.com",
    studentMobile: "9812200501",
    studentDob: "2007-11-30",
    studentGender: "female",
    studentCategory: "obc",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Mandi",
    studentPincode: "175001",
    studentPermanentAddress: "VPO Karsog, Tehsil Karsog, Mandi",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "HPB-2025-021114",
    studentStream: "arts",
    studentSubjects: "English, Hindi, Sociology, Political Science, Economics",
    studentBofPercentage: 55.0,
    studentResultStatus: "pass",
    studentClaims: ["obc"],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "ba",
    courseCode: "BA",
    collegeId: "vallabh_mandi",
    collegeName: "Vallabh Government College Mandi",
    submittedAt: NOW - 2 * DAY,
    applicationFee: 50,
    baseStatus: "discrepancy_raised",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "vallabh_mandi",
        collegeName: "Vallabh Government College Mandi",
        subjectA: "Hindi",
        subjectB: "Economics",
        bucketA: "B3",
        bucketB: "B4",
        totalSeats: 60,
        vacantSeats: 52,
      },
    ],
    documents: [
      {
        code: "marksheet_12",
        fileName: "priya_marksheet.pdf",
        mimeType: "application/pdf",
        sizeKb: 420,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "photo",
        fileName: "priya_photo.jpg",
        mimeType: "image/jpeg",
        sizeKb: 118,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "signature",
        fileName: "priya_sig.jpg",
        mimeType: "image/jpeg",
        sizeKb: 55,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "character_cert",
        fileName: "priya_character.pdf",
        mimeType: "application/pdf",
        sizeKb: 262,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "verified",
      },
      {
        code: "caste_cert",
        fileName: "priya_obc_cert.pdf",
        mimeType: "application/pdf",
        sizeKb: 370,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "rejected",
        rejectionReason: "OBC certificate has expired. Upload the latest one.",
      },
      {
        code: "domicile_cert",
        fileName: "priya_domicile.pdf",
        mimeType: "application/pdf",
        sizeKb: 300,
        uploadedAt: NOW - 2 * DAY - 2 * HOUR,
        baseStatus: "verified",
      },
    ],
    history: [
      { at: NOW - 2 * DAY, actor: "Priya Verma", action: "Application submitted" },
      { at: NOW - 2 * DAY + HOUR, actor: REVIEWER_NAME, action: "Opened application" },
      {
        at: NOW - DAY - 6 * HOUR,
        actor: REVIEWER_NAME,
        action: "Raised discrepancy",
        target: "OBC certificate",
        note: "Certificate expired — requesting fresh copy",
      },
    ],
  },
  {
    id: appId(150),
    studentName: "Sanjay Kumar",
    studentEmail: "sanjay.k@example.com",
    studentMobile: "9842112345",
    studentDob: "2007-05-18",
    studentGender: "male",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Shimla",
    studentPincode: "171002",
    studentPermanentAddress: "Ward 6, Sanjauli, Shimla",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "HPB-2025-018002",
    studentStream: "commerce",
    studentSubjects: "English, Hindi, Accountancy, Business Studies, Economics",
    studentBofPercentage: 71.6,
    studentResultStatus: "pass",
    studentClaims: [],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bcom",
    courseCode: "BCom",
    collegeId: "gc_sanjauli",
    collegeName: "Government College Sanjauli",
    submittedAt: NOW - 5 * HOUR,
    applicationFee: 50,
    baseStatus: "submitted",
    preferences: [
      {
        rank: 1,
        collegeId: "gc_sanjauli",
        collegeName: "Government College Sanjauli",
        totalSeats: 120,
        vacantSeats: 90,
      },
      {
        rank: 2,
        collegeId: "gc_solan",
        collegeName: "Government College Solan",
        totalSeats: 120,
        vacantSeats: 100,
      },
    ],
    documents: baseDocs(NOW - 5 * HOUR, ["marksheet_12", "photo", "signature", "character_cert", "domicile_cert"]),
    history: [
      { at: NOW - 5 * HOUR, actor: "Sanjay Kumar", action: "Application submitted" },
    ],
  },
  {
    id: appId(151),
    studentName: "Meera Devi",
    studentEmail: "meera.devi@example.com",
    studentMobile: "9418002244",
    studentDob: "2006-09-08",
    studentGender: "female",
    studentCategory: "st",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Kinnaur",
    studentPincode: "172107",
    studentPermanentAddress: "VPO Reckong Peo, Kinnaur",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2024,
    studentRollNumber: "HPB-2024-009912",
    studentStream: "arts",
    studentSubjects: "English, Hindi, History, Sociology, Economics",
    studentBofPercentage: 68.8,
    studentResultStatus: "pass",
    studentClaims: ["st"],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "ba",
    courseCode: "BA",
    collegeId: "gc_dharamshala",
    collegeName: "Government College Dharamshala",
    submittedAt: NOW - 3 * DAY,
    applicationFee: 50,
    baseStatus: "verified",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "gc_dharamshala",
        collegeName: "Government College Dharamshala",
        subjectA: "English",
        subjectB: "Economics",
        bucketA: "B3",
        bucketB: "B4",
        totalSeats: 60,
        vacantSeats: 50,
      },
      {
        rank: 2,
        collegeId: "gc_dharamshala",
        collegeName: "Government College Dharamshala",
        subjectA: "History",
        subjectB: "Political Science",
        bucketA: "B1",
        bucketB: "B2",
        totalSeats: 60,
        vacantSeats: 55,
      },
    ],
    documents: allVerified(
      NOW - 3 * DAY,
      ["marksheet_12", "photo", "signature", "character_cert", "caste_cert", "domicile_cert"],
    ),
    history: [
      { at: NOW - 3 * DAY, actor: "Meera Devi", action: "Application submitted" },
      { at: NOW - 3 * DAY + 2 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
      { at: NOW - 2 * DAY, actor: REVIEWER_NAME, action: "Verified all documents" },
      { at: NOW - 2 * DAY + HOUR, actor: REVIEWER_NAME, action: "Marked application verified" },
    ],
  },
  {
    id: appId(152),
    studentName: "Karan Bhardwaj",
    studentEmail: "karan.b@example.com",
    studentMobile: "9459001020",
    studentDob: "2007-01-15",
    studentGender: "male",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Hamirpur",
    studentPincode: "177001",
    studentPermanentAddress: "H.No. 22, Barsar, Hamirpur",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "HPB-2025-030041",
    studentStream: "arts",
    studentSubjects: "English, Hindi, History, Geography, Political Science",
    studentBofPercentage: 34.5,
    studentResultStatus: "compartment",
    studentClaims: [],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bsc_nonmed",
    courseCode: "BSc Non-Med",
    collegeId: "rkmv_shimla",
    collegeName: "RKMV College Shimla",
    submittedAt: NOW - DAY,
    applicationFee: 50,
    baseStatus: "rejected",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "rkmv_shimla",
        collegeName: "RKMV College Shimla",
        totalSeats: 120,
        vacantSeats: 108,
      },
    ],
    documents: baseDocs(NOW - DAY, ["marksheet_12", "photo", "signature", "character_cert", "domicile_cert"]),
    history: [
      { at: NOW - DAY, actor: "Karan Bhardwaj", action: "Application submitted" },
      { at: NOW - 20 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
      {
        at: NOW - 18 * HOUR,
        actor: REVIEWER_NAME,
        action: "Rejected application",
        note: "Student is in compartment and chose BSc Non-Medical which needs PCM stream — ineligible at submission.",
      },
    ],
  },
  {
    id: appId(153),
    studentName: "Neha Chauhan",
    studentEmail: "neha.c@example.com",
    studentMobile: "9816541122",
    studentDob: "2007-07-21",
    studentGender: "female",
    studentCategory: "ews",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Solan",
    studentPincode: "173205",
    studentPermanentAddress: "Ward 4, Nalagarh, Solan",
    studentBoard: "CBSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "CBSE-25-200144",
    studentStream: "commerce",
    studentSubjects: "English, Hindi, Accountancy, Business Studies, Maths",
    studentBofPercentage: 74.0,
    studentResultStatus: "pass",
    studentClaims: ["ews"],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bcom",
    courseCode: "BCom",
    collegeId: "gc_solan",
    collegeName: "Government College Solan",
    submittedAt: NOW - 18 * HOUR,
    applicationFee: 50,
    baseStatus: "under_scrutiny",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "gc_solan",
        collegeName: "Government College Solan",
        totalSeats: 120,
        vacantSeats: 100,
      },
      {
        rank: 2,
        collegeId: "gc_sanjauli",
        collegeName: "Government College Sanjauli",
        totalSeats: 120,
        vacantSeats: 90,
      },
    ],
    documents: baseDocs(NOW - 18 * HOUR, [
      "marksheet_12",
      "photo",
      "signature",
      "character_cert",
      "ews_cert",
      "domicile_cert",
      "migration_cert",
    ]),
    history: [
      { at: NOW - 18 * HOUR, actor: "Neha Chauhan", action: "Application submitted" },
      { at: NOW - 14 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
    ],
  },
  {
    id: appId(154),
    studentName: "Vivek Kaushik",
    studentEmail: "vivek.k@example.com",
    studentMobile: "9417200339",
    studentDob: "2006-03-03",
    studentGender: "male",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Shimla",
    studentPincode: "171004",
    studentPermanentAddress: "Kasumpti, Shimla",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2024,
    studentRollNumber: "HPB-2024-044219",
    studentStream: "pcm",
    studentSubjects: "English, Physics, Chemistry, Maths, Computer Science",
    studentBofPercentage: 69.8,
    studentResultStatus: "pass",
    studentClaims: [],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bca",
    courseCode: "BCA",
    collegeId: "gc_sanjauli",
    collegeName: "Government College Sanjauli",
    submittedAt: NOW - 6 * HOUR,
    applicationFee: 300,
    baseStatus: "submitted",
    preferences: [
      {
        rank: 1,
        collegeId: "gc_sanjauli",
        collegeName: "Government College Sanjauli",
        totalSeats: 60,
        vacantSeats: 50,
      },
    ],
    documents: baseDocs(NOW - 6 * HOUR, ["marksheet_12", "photo", "signature", "character_cert", "domicile_cert", "gap_affidavit"]),
    history: [
      { at: NOW - 6 * HOUR, actor: "Vivek Kaushik", action: "Application submitted" },
    ],
  },
  {
    id: appId(155),
    studentName: "Anjali Thakur",
    studentEmail: "anjali.t@example.com",
    studentMobile: "9816002211",
    studentDob: "2007-02-27",
    studentGender: "female",
    studentCategory: "sc",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Kangra",
    studentPincode: "176215",
    studentPermanentAddress: "VPO Palampur, Kangra",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "HPB-2025-052307",
    studentStream: "arts",
    studentSubjects: "English, Hindi, History, Political Science, Sociology",
    studentBofPercentage: 58.2,
    studentResultStatus: "pass",
    studentClaims: ["sc"],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "ba",
    courseCode: "BA",
    collegeId: "gc_palampur",
    collegeName: "Government College Palampur",
    submittedAt: NOW - 36 * HOUR,
    applicationFee: 50,
    baseStatus: "under_scrutiny",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "gc_palampur",
        collegeName: "Government College Palampur",
        subjectA: "History",
        subjectB: "Economics",
        bucketA: "B1",
        bucketB: "B4",
        totalSeats: 60,
        vacantSeats: 55,
      },
      {
        rank: 2,
        collegeId: "gc_palampur",
        collegeName: "Government College Palampur",
        subjectA: "Political Science",
        subjectB: "English",
        bucketA: "B2",
        bucketB: "B3",
        totalSeats: 60,
        vacantSeats: 50,
      },
    ],
    documents: baseDocs(NOW - 36 * HOUR, [
      "marksheet_12",
      "photo",
      "signature",
      "character_cert",
      "caste_cert",
      "domicile_cert",
    ]),
    history: [
      { at: NOW - 36 * HOUR, actor: "Anjali Thakur", action: "Application submitted" },
      { at: NOW - 30 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
    ],
  },
  {
    id: appId(156),
    studentName: "Harish Gupta",
    studentEmail: "harish.g@example.com",
    studentMobile: "9418334400",
    studentDob: "2006-12-10",
    studentGender: "male",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Kangra",
    studentPincode: "176125",
    studentPermanentAddress: "Nurpur, Kangra",
    studentBoard: "HPBOSE",
    studentYearOfPassing: 2024,
    studentRollNumber: "HPB-2024-066102",
    studentStream: "commerce",
    studentSubjects: "English, Hindi, Accountancy, Business Studies, Economics",
    studentBofPercentage: 66.4,
    studentResultStatus: "pass",
    studentClaims: [],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bba",
    courseCode: "BBA",
    collegeId: "gc_dharamshala",
    collegeName: "Government College Dharamshala",
    submittedAt: NOW - 4 * DAY,
    applicationFee: 300,
    baseStatus: "verified",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "gc_dharamshala",
        collegeName: "Government College Dharamshala",
        totalSeats: 60,
        vacantSeats: 42,
      },
    ],
    documents: allVerified(NOW - 4 * DAY, [
      "marksheet_12",
      "photo",
      "signature",
      "character_cert",
      "domicile_cert",
      "gap_affidavit",
    ]),
    history: [
      { at: NOW - 4 * DAY, actor: "Harish Gupta", action: "Application submitted" },
      { at: NOW - 3 * DAY, actor: REVIEWER_NAME, action: "Verified all documents" },
      { at: NOW - 3 * DAY + HOUR, actor: REVIEWER_NAME, action: "Marked application verified" },
    ],
  },
  {
    id: appId(157),
    studentName: "Isha Parmar",
    studentEmail: "isha.p@example.com",
    studentMobile: "9816700199",
    studentDob: "2007-04-02",
    studentGender: "female",
    studentCategory: "general",
    studentDomicileState: "Himachal Pradesh",
    studentDistrict: "Shimla",
    studentPincode: "171003",
    studentPermanentAddress: "Chhota Shimla, Shimla",
    studentBoard: "ICSE",
    studentYearOfPassing: 2025,
    studentRollNumber: "ICSE-25-080221",
    studentStream: "pcb",
    studentSubjects: "English, Physics, Chemistry, Biology, Computer Science",
    studentBofPercentage: 81.2,
    studentResultStatus: "pass",
    studentClaims: [],
    isSingleGirlChild: false,
    isPwd: false,
    courseId: "bsc_med",
    courseCode: "BSc Med",
    collegeId: "rkmv_shimla",
    collegeName: "RKMV College Shimla",
    submittedAt: NOW - 50 * HOUR,
    applicationFee: 50,
    baseStatus: "conditional",
    assignedReviewer: REVIEWER_NAME,
    preferences: [
      {
        rank: 1,
        collegeId: "rkmv_shimla",
        collegeName: "RKMV College Shimla",
        totalSeats: 60,
        vacantSeats: 48,
      },
    ],
    documents: baseDocs(NOW - 50 * HOUR, [
      "marksheet_12",
      "photo",
      "signature",
      "character_cert",
      "domicile_cert",
      "migration_cert",
    ]),
    history: [
      { at: NOW - 50 * HOUR, actor: "Isha Parmar", action: "Application submitted" },
      { at: NOW - 42 * HOUR, actor: REVIEWER_NAME, action: "Opened application" },
      {
        at: NOW - 20 * HOUR,
        actor: REVIEWER_NAME,
        action: "Marked conditional",
        note: "Migration certificate pending — admission contingent on upload before close of window.",
      },
    ],
  },
];

// ---------- helpers used above ----------

function baseDocs(at: number, codes: string[]): AppDocument[] {
  return codes.map((code, idx) => ({
    code,
    fileName: `doc_${code}.pdf`,
    mimeType: code === "photo" || code === "signature" ? "image/jpeg" : "application/pdf",
    sizeKb: 200 + idx * 30,
    uploadedAt: at - 10 * 60 * 1000,
    baseStatus: "uploaded" as DocScrutinyStatus,
  }));
}

function allVerified(at: number, codes: string[]): AppDocument[] {
  return baseDocs(at, codes).map((d) => ({ ...d, baseStatus: "verified" as DocScrutinyStatus }));
}

/** Canonical display name for a college id, sourced from the HPU-167 seed. */
function resolveCollegeName(id: string, fallback: string): string {
  return getCollegeById(id)?.shortName ?? fallback;
}

export const MOCK_APPLICATIONS: readonly MockApplication[] = SEED_APPLICATIONS.map(
  (app) => ({
    ...app,
    collegeName: resolveCollegeName(app.collegeId, app.collegeName),
    preferences: app.preferences.map((p) => ({
      ...p,
      collegeName: resolveCollegeName(p.collegeId, p.collegeName),
    })),
  }),
);

const APPS_BY_ID = Object.fromEntries(MOCK_APPLICATIONS.map((a) => [a.id, a]));

export function getApplication(id: string): MockApplication | undefined {
  return APPS_BY_ID[id];
}

export function uniqueCollegeIds(): string[] {
  return Array.from(new Set(MOCK_APPLICATIONS.map((a) => a.collegeId))).sort();
}

export function uniqueCourseIds(): string[] {
  return Array.from(new Set(MOCK_APPLICATIONS.map((a) => a.courseId))).sort();
}

export function collegeLabel(id: string): string {
  return MOCK_APPLICATIONS.find((a) => a.collegeId === id)?.collegeName ?? id;
}

export function courseLabel(id: string): string {
  return MOCK_APPLICATIONS.find((a) => a.courseId === id)?.courseCode ?? id;
}
