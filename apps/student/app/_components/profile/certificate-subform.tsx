"use client";

import { Field } from "../field";
import { useLocale } from "../locale-provider";
import { useProfile, type CertificateEntry } from "./profile-provider";

interface Props {
  /** Claim code (e.g. "sc", "pwd") — drives the key in the certificates map. */
  code: string;
  /** Bilingual display name shown as the fieldset legend. */
  label: string;
}

/**
 * Reusable certificate detail sub-form. Supports the "I don't have this
 * right now, will upload later" pattern from §14.4 — the fields stay
 * mounted but disabled so autosave keeps whatever was typed.
 */
export function CertificateSubForm({ code, label }: Props) {
  const { t } = useLocale();
  const { draft, updateCertificate } = useProfile();
  const entry: CertificateEntry = draft.certificates[code] ?? {
    number: "",
    authority: "",
    issueDate: "",
    willUploadLater: false,
  };

  return (
    <fieldset className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
      <legend className="px-1 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
        {label}
        {entry.willUploadLater ? (
          <span className="ml-2 rounded-[var(--radius-pill)] bg-[var(--color-status-warning-bg)] px-2 py-0.5 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-status-warning-fg)]">
            {t("certificate.uploadLaterBadge")}
          </span>
        ) : null}
      </legend>

      <div
        aria-disabled={entry.willUploadLater || undefined}
        className={entry.willUploadLater ? "pointer-events-none mt-2 space-y-3 opacity-50" : "mt-2 space-y-3"}
      >
        <Field
          name={`${code}-number`}
          label={t("certificate.number")}
          value={entry.number}
          onChange={(event) => updateCertificate(code, { number: event.target.value })}
          disabled={entry.willUploadLater}
        />
        <Field
          name={`${code}-authority`}
          label={t("certificate.authority")}
          value={entry.authority}
          onChange={(event) => updateCertificate(code, { authority: event.target.value })}
          disabled={entry.willUploadLater}
        />
        <Field
          name={`${code}-issueDate`}
          type="date"
          label={t("certificate.issueDate")}
          value={entry.issueDate}
          onChange={(event) => updateCertificate(code, { issueDate: event.target.value })}
          disabled={entry.willUploadLater}
        />
      </div>

      <label className="mt-3 flex cursor-pointer items-center gap-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">
        <input
          type="checkbox"
          checked={entry.willUploadLater}
          onChange={(event) =>
            updateCertificate(code, { willUploadLater: event.target.checked })
          }
          className="h-5 w-5 flex-none accent-[var(--color-interactive-primary)]"
        />
        <span>{t("certificate.willUploadLater")}</span>
      </label>
    </fieldset>
  );
}
