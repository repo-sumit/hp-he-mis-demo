"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useClaimsUpdater } from "../../../_components/profile/use-claims-updater";
import { useReviewReturn } from "../../../_components/profile/use-review-return";
import { CheckboxGroup } from "../../../_components/form/checkbox-group";
import { Toggle } from "../../../_components/form/toggle";
import { useDocuments } from "../../../_components/documents/documents-provider";
import { DocumentStatusBadge } from "../../../_components/documents/document-status-badge";
import { IssueBanner } from "../../../_components/scrutiny-bridge/issue-banner";

const CLAIM_CODES = [
  "sc",
  "st",
  "obc",
  "ews",
  "pwd",
  "sports",
  "cultural",
  "exServiceman",
] as const;

/**
 * Claim code → document code that holds its certificate. Multiple claims
 * can share the same doc (sc / st / obc all upload a single caste
 * certificate), which is why we de-duplicate at render time.
 */
const CLAIM_TO_DOC: Record<string, string> = {
  sc: "caste_cert",
  st: "caste_cert",
  obc: "caste_cert",
  ews: "ews_cert",
  pwd: "pwd_cert",
};

export default function Step4Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const setClaims = useClaimsUpdater();
  const { getEntry } = useDocuments();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`field-${focus}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Claims are saved live via setClaims; the page just advances.
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/5");
  }

  const claimOptions = CLAIM_CODES.map((code) => ({
    value: code,
    label: t(`field.claims.options.${code}`),
  }));

  // De-duplicated list of certificate documents needed across the selected
  // claims — preserves the claim order the student picked them in, so SC
  // (which maps to caste_cert) sits above EWS, etc.
  const docsToUpload: string[] = [];
  const seenDocs = new Set<string>();
  for (const claim of draft.claims) {
    const doc = CLAIM_TO_DOC[claim];
    if (!doc || seenDocs.has(doc)) continue;
    seenDocs.add(doc);
    docsToUpload.push(doc);
  }

  return (
    <PageShell
      backHref="/profile/step/3"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={4} />
      <AutosaveHint className="mb-4" />

      <IssueBanner scope="reservation" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step4.claimsSection")}
          </h3>
          <CheckboxGroup
            label={t("field.claims.label")}
            helper={t("field.claims.helper")}
            options={claimOptions}
            value={draft.claims}
            onChange={setClaims}
          />
          {draft.gender === "female" ? (
            <Toggle
              label={t("field.singleGirlChild.label")}
              helper={t("field.singleGirlChild.helper")}
              value={draft.isSingleGirlChild}
              onChange={(v) => update("isSingleGirlChild", v)}
            />
          ) : null}
        </section>

        {docsToUpload.length > 0 ? (
          <section className="space-y-3">
            <div>
              <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                {t("profile.step4.certificatesSection")}
              </h3>
              <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
                {t("profile.step4.uploadHint")}
              </p>
            </div>
            <ul className="space-y-2">
              {docsToUpload.map((code) => {
                const entry = getEntry(code);
                const uploaded = entry.status !== "not_uploaded";
                return (
                  <li
                    key={code}
                    className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                        {t(`document.name.${code}`)}
                      </p>
                      <p className="mt-0.5 text-[var(--text-xs)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                        {t(`document.description.${code}`)}
                      </p>
                      {uploaded ? (
                        <div className="mt-2">
                          <DocumentStatusBadge status={entry.status} />
                        </div>
                      ) : null}
                    </div>
                    <Link
                      // `?from=claims` tells the upload page to return here
                      // after a successful confirm, so the student can move
                      // straight to the next certificate without detouring
                      // through the document preview screen.
                      href={`/documents/upload/${code}?from=claims`}
                      className="inline-flex h-10 flex-none items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--color-interactive-brand-hover)]"
                    >
                      {uploaded
                        ? t("cta.replaceDocument")
                        : t("profile.step4.uploadCta")}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : (
          <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] px-3 py-4 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("profile.step4.subtitle")}
          </p>
        )}

        <div className="sticky bottom-0 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <PrimaryButton type="submit">{t(saveLabelKey)}</PrimaryButton>
        </div>
      </form>
     </div>
    </PageShell>
  );
}
