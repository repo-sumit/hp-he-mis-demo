"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface CertificateEntry {
  number: string;
  authority: string;
  issueDate: string;
  willUploadLater: boolean;
}

export interface SubjectMark {
  name: string;
  obtained: string;
  total: string;
}

export const DEFAULT_SUBJECT_ROWS = 5;

export function emptySubjectMarks(n: number = DEFAULT_SUBJECT_ROWS): SubjectMark[] {
  return Array.from({ length: n }, () => ({ name: "", obtained: "", total: "100" }));
}

/**
 * Compute best-of-five from the subject table. Takes up to 5 rows with valid
 * obtained/total, picks the five best per-subject percentages, and returns
 * their average (0-100, rounded to 2 decimals). Returns null when fewer than
 * five valid rows are present.
 */
export function computeBestOfFive(rows: SubjectMark[]): number | null {
  const percentages: number[] = [];
  for (const row of rows) {
    const obtained = Number(row.obtained);
    const total = Number(row.total);
    if (!row.name.trim()) continue;
    if (!Number.isFinite(obtained) || !Number.isFinite(total) || total <= 0) continue;
    if (obtained < 0 || obtained > total) continue;
    percentages.push((obtained / total) * 100);
  }
  if (percentages.length < 5) return null;
  percentages.sort((a, b) => b - a);
  const top5 = percentages.slice(0, 5);
  const avg = top5.reduce((acc, n) => acc + n, 0) / 5;
  return Math.round(avg * 100) / 100;
}

/** Derive result status from a computed percentage — ≥35 ⇒ pass, else fail. */
export function deriveResultStatus(pct: number | null): "" | "pass" | "fail" {
  if (pct == null) return "";
  return pct >= 35 ? "pass" : "fail";
}

export interface ProfileDraft {
  // Step 1 — personal
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: "" | "female" | "male" | "other";
  mobile: string;
  email: string;
  aadhaar: string;
  apaar: string;
  category: "" | "general" | "ews" | "obc" | "sc" | "st";
  isSingleGirlChild: boolean;
  isPwd: boolean;

  // Step 2 — address
  permanentAddress: string;
  district: string;
  state: string;
  pincode: string;
  correspondenceSame: boolean;
  correspondenceAddress: string;
  correspondenceDistrict: string;
  correspondenceState: string;
  correspondencePincode: string;

  // Step 3 — academic
  board: "" | "hpbose" | "cbse" | "icse" | "nios" | "other";
  yearOfPassing: string;
  rollNumber: string;
  stream: "" | "arts" | "pcm" | "pcb" | "commerce";
  /** Legacy free-text list (kept for backwards-compat with older drafts). */
  subjects: string;
  /** New structured rows — subject name + marks obtained + total. */
  subjectMarks: SubjectMark[];
  /** Derived from subjectMarks — top 5 average, 0-100, string to preserve existing consumers. */
  bofPercentage: string;
  /** Derived from bofPercentage — ≥35 ⇒ pass, <35 ⇒ fail. */
  resultStatus: "" | "pass" | "compartment" | "fail";
  gapYears: string;

  // Step 4 — claims
  claims: string[];
  certificates: Record<string, CertificateEntry>;

  // Step 5 — bank
  accountHolder: string;
  accountNumber: string;
  ifsc: string;
  bankName: string;
}

const initialDraft: ProfileDraft = {
  fullName: "",
  fatherName: "",
  motherName: "",
  dob: "",
  gender: "",
  mobile: "",
  email: "",
  aadhaar: "",
  apaar: "",
  category: "",
  isSingleGirlChild: false,
  isPwd: false,
  permanentAddress: "",
  district: "",
  state: "Himachal Pradesh",
  pincode: "",
  correspondenceSame: true,
  correspondenceAddress: "",
  correspondenceDistrict: "",
  correspondenceState: "Himachal Pradesh",
  correspondencePincode: "",
  board: "",
  yearOfPassing: "",
  rollNumber: "",
  stream: "",
  subjects: "",
  subjectMarks: emptySubjectMarks(),
  bofPercentage: "",
  resultStatus: "",
  gapYears: "0",
  claims: [],
  certificates: {},
  accountHolder: "",
  accountNumber: "",
  ifsc: "",
  bankName: "",
};

type AutosaveState = "idle" | "saving" | "saved";

interface ProfileContextValue {
  draft: ProfileDraft;
  update: <K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) => void;
  updateCertificate: (code: string, patch: Partial<CertificateEntry>) => void;
  lastSavedAt: number | null;
  autosaveState: AutosaveState;
}

const STORAGE_KEY = "hp-mis:profile-draft";
const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<ProfileDraft>(initialDraft);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [autosaveState, setAutosaveState] = useState<AutosaveState>("idle");
  const hydrated = useRef(false);
  const writeTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ProfileDraft>;
        setDraft((prev) => ({
          ...prev,
          ...parsed,
          subjectMarks:
            Array.isArray(parsed.subjectMarks) && parsed.subjectMarks.length > 0
              ? parsed.subjectMarks
              : prev.subjectMarks,
        }));
        setLastSavedAt(Date.now());
        setAutosaveState("saved");
      }
    } catch {
      /* corrupted draft — start fresh */
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    setAutosaveState("saving");
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setLastSavedAt(Date.now());
      setAutosaveState("saved");
    }, 400);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [draft]);

  const update = useCallback<ProfileContextValue["update"]>((key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }, []);

  const updateCertificate = useCallback<ProfileContextValue["updateCertificate"]>(
    (code, patch) => {
      setDraft((prev) => {
        const current: CertificateEntry = prev.certificates[code] ?? {
          number: "",
          authority: "",
          issueDate: "",
          willUploadLater: false,
        };
        return {
          ...prev,
          certificates: { ...prev.certificates, [code]: { ...current, ...patch } },
        };
      });
    },
    [],
  );

  const value = useMemo<ProfileContextValue>(
    () => ({ draft, update, updateCertificate, lastSavedAt, autosaveState }),
    [draft, update, updateCertificate, lastSavedAt, autosaveState],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used inside <ProfileProvider>");
  return ctx;
}
