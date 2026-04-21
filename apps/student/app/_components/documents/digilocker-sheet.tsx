"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";

export interface DigiLockerDoc {
  /** Document code in the app (e.g. "marksheet_12", "aadhaar"). */
  code: string;
  /** Title shown in DigiLocker (e.g. "Class 12 Marksheet"). */
  title: string;
  /** Issuing authority (e.g. "Central Board of Secondary Education"). */
  issuer: string;
}

/** Canonical list of "issued documents" for the mock DigiLocker browser. */
export const DIGILOCKER_CATALOG: readonly DigiLockerDoc[] = [
  { code: "apaar", title: "APAAR ID", issuer: "Academic Bank of Credits" },
  { code: "aadhaar", title: "Aadhaar Card", issuer: "Unique Identification Authority of India (UIDAI)" },
  { code: "marksheet_10", title: "Class X Marksheet", issuer: "Central Board of Secondary Education" },
  { code: "migration_10", title: "Class X Migration Certificate", issuer: "Central Board of Secondary Education" },
  { code: "marksheet_12", title: "Class XII Marksheet", issuer: "Central Board of Secondary Education" },
  { code: "migration_cert", title: "Class XII Migration Certificate", issuer: "Central Board of Secondary Education" },
  { code: "character_cert", title: "Character Certificate", issuer: "Directorate of Higher Education, HP" },
  { code: "domicile_cert", title: "Himachali Bona Fide Certificate", issuer: "Revenue Department, HP" },
  { code: "caste_cert", title: "Caste Certificate", issuer: "Revenue Department, HP" },
  { code: "ews_cert", title: "EWS Certificate", issuer: "Revenue Department, HP" },
  { code: "pwd_cert", title: "Disability Certificate", issuer: "Department of Empowerment of Persons with Disabilities" },
];

interface Props {
  open: boolean;
  /** Document code the user is trying to upload — matching catalog entries
   *  bubble to the top of the list. */
  preferredCode?: string;
  onClose: () => void;
  onSelect: (doc: DigiLockerDoc) => void;
}

/**
 * Mock DigiLocker issued-documents browser. Opens as a bottom sheet on mobile,
 * centered modal on wider viewports. Pure front-end — selecting a document
 * hands back the metadata; the parent decides how to persist it.
 */
export function DigiLockerSheet({ open, preferredCode, onClose, onSelect }: Props) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? DIGILOCKER_CATALOG.filter(
          (d) => d.title.toLowerCase().includes(q) || d.issuer.toLowerCase().includes(q),
        )
      : [...DIGILOCKER_CATALOG];
    if (preferredCode) {
      filtered.sort((a, b) => {
        if (a.code === preferredCode) return -1;
        if (b.code === preferredCode) return 1;
        return 0;
      });
    }
    return filtered;
  }, [query, preferredCode]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 flex flex-col transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        type="button"
        aria-label={t("cta.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("document.digilocker.title")}
        className={cn(
          "relative mx-auto mt-auto flex max-h-[90dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] transition-transform duration-200 sm:mb-auto sm:mt-16 sm:rounded-[var(--radius-xl)]",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <header
          className="flex items-start gap-3 px-5 pb-5 pt-6 text-white"
          style={{ background: "linear-gradient(135deg, #4527a0 0%, #5e3ec0 100%)" }}
        >
          <Image
            src="/digilocker.png"
            alt="DigiLocker"
            width={40}
            height={40}
            className="h-10 w-10 flex-none rounded-[var(--radius-sm)] bg-white/10 p-1"
          />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-white/70">
              DigiLocker
            </p>
            <h3 className="mt-0.5 text-[var(--text-lg)] font-[var(--weight-bold)]">
              {t("document.digilocker.title")}
            </h3>
            <p className="mt-1 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-white/85">
              {t("document.digilocker.subtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cta.close")}
            className="flex h-9 w-9 flex-none items-center justify-center rounded-[var(--radius-pill)] border border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            ✕
          </button>
        </header>

        <div className="border-b border-[var(--color-border-subtle)] bg-[var(--color-surface)] px-5 py-3">
          <label className="flex items-center gap-2 rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-sm)]">
            <span aria-hidden="true" className="text-[var(--color-text-tertiary)]">
              🔍
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("document.digilocker.searchPlaceholder")}
              className="w-full bg-transparent outline-none placeholder:text-[var(--color-text-tertiary)]"
            />
          </label>
          <p className="mt-2 text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            {t("document.digilocker.issuedCount", { n: DIGILOCKER_CATALOG.length })}
          </p>
        </div>

        <ul className="flex-1 divide-y divide-[var(--color-border-subtle)] overflow-y-auto">
          {docs.map((doc) => (
            <li key={doc.code}>
              <button
                type="button"
                onClick={() => {
                  onSelect(doc);
                }}
                className="flex w-full items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-[var(--color-background-brand-softer)]"
              >
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-background-brand-subtle)] text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-text-brand)]"
                >
                  📄
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {doc.title}
                  </span>
                  <span className="block text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                    {doc.issuer}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="flex-none self-center text-[var(--color-text-tertiary)]"
                >
                  →
                </span>
              </button>
            </li>
          ))}
          {docs.length === 0 ? (
            <li className="px-5 py-6 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {t("document.digilocker.noMatches")}
            </li>
          ) : null}
        </ul>

        <footer className="border-t border-[var(--color-border-subtle)] bg-[var(--color-background-subtle)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("document.digilocker.disclaimer")}
        </footer>
      </div>
    </div>
  );
}
