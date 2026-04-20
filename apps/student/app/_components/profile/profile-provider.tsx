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

  // Step 3 — academic
  board: "" | "hpbose" | "cbse" | "icse" | "nios" | "other";
  yearOfPassing: string;
  rollNumber: string;
  stream: "" | "arts" | "pcm" | "pcb" | "commerce";
  subjects: string;
  bofPercentage: string;
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
  board: "",
  yearOfPassing: "",
  rollNumber: "",
  stream: "",
  subjects: "",
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
        setDraft((prev) => ({ ...prev, ...parsed }));
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
