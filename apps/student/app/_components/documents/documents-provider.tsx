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
import type { DocStatus } from "./document-rules";

export interface DocumentEntry {
  status: DocStatus;
  fileName?: string;
  mimeType?: string;
  sizeKb?: number;
  uploadedAt?: number;
  reviewedAt?: number;
  reviewedBy?: string;
  rejectionReason?: string;
}

type DocumentsMap = Record<string, DocumentEntry>;

interface DocumentsContextValue {
  documents: DocumentsMap;
  getEntry: (code: string) => DocumentEntry;
  markUploaded: (
    code: string,
    file: { fileName: string; mimeType?: string; sizeKb?: number },
  ) => void;
  markUnderReview: (code: string) => void;
  resetToNotUploaded: (code: string) => void;
  /** Jump straight to a specific status — handy for demo/reset. */
  setStatus: (code: string, status: DocStatus) => void;
}

const STORAGE_KEY = "hp-mis:documents";
const DEFAULT_ENTRY: DocumentEntry = { status: "not_uploaded" };

const DocumentsContext = createContext<DocumentsContextValue | null>(null);

function buildSeed(now: number): DocumentsMap {
  // First-time registration starts with nothing uploaded. Rejection only
  // surfaces after the student has submitted an application and the portal
  // flags a discrepancy — that round-trip drives the "Action needed" card.
  // The verified photo here is kept so the checklist shows mixed progress
  // right after a student completes profile and uploads an initial doc.
  return {
    photo: {
      status: "verified",
      fileName: "passport_photo.jpg",
      mimeType: "image/jpeg",
      sizeKb: 128,
      uploadedAt: now - 1000 * 60 * 60 * 36,
      reviewedAt: now - 1000 * 60 * 60 * 8,
      reviewedBy: "Sanjauli Govt College · Scrutiny",
    },
  };
}

export function DocumentsProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<DocumentsMap>({});
  const hydrated = useRef(false);
  const writeTimer = useRef<number | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setDocuments(JSON.parse(raw) as DocumentsMap);
      } else {
        setDocuments(buildSeed(Date.now()));
      }
    } catch {
      setDocuments(buildSeed(Date.now()));
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    writeTimer.current = window.setTimeout(() => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
    }, 200);
    return () => {
      if (writeTimer.current !== null) window.clearTimeout(writeTimer.current);
    };
  }, [documents]);

  const getEntry = useCallback<DocumentsContextValue["getEntry"]>(
    (code) => documents[code] ?? DEFAULT_ENTRY,
    [documents],
  );

  const markUploaded = useCallback<DocumentsContextValue["markUploaded"]>(
    (code, file) => {
      setDocuments((prev) => ({
        ...prev,
        [code]: {
          status: "under_review",
          fileName: file.fileName,
          mimeType: file.mimeType,
          sizeKb: file.sizeKb,
          uploadedAt: Date.now(),
        },
      }));
    },
    [],
  );

  const markUnderReview = useCallback<DocumentsContextValue["markUnderReview"]>((code) => {
    setDocuments((prev) => ({ ...prev, [code]: { ...(prev[code] ?? DEFAULT_ENTRY), status: "under_review" } }));
  }, []);

  const resetToNotUploaded = useCallback<DocumentsContextValue["resetToNotUploaded"]>(
    (code) => {
      setDocuments((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    },
    [],
  );

  const setStatus = useCallback<DocumentsContextValue["setStatus"]>((code, status) => {
    setDocuments((prev) => ({ ...prev, [code]: { ...(prev[code] ?? DEFAULT_ENTRY), status } }));
  }, []);

  const value = useMemo<DocumentsContextValue>(
    () => ({ documents, getEntry, markUploaded, markUnderReview, resetToNotUploaded, setStatus }),
    [documents, getEntry, markUploaded, markUnderReview, resetToNotUploaded, setStatus],
  );

  return <DocumentsContext.Provider value={value}>{children}</DocumentsContext.Provider>;
}

export function useDocuments(): DocumentsContextValue {
  const ctx = useContext(DocumentsContext);
  if (!ctx) throw new Error("useDocuments must be used inside <DocumentsProvider>");
  return ctx;
}
