"use client";

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
import { CertificateSubForm } from "../../../_components/profile/certificate-subform";
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

export default function Step4Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft } = useProfile();
  const setClaims = useClaimsUpdater();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`field-${focus}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/5");
  }

  const claimOptions = CLAIM_CODES.map((code) => ({
    value: code,
    label: t(`field.claims.options.${code}`),
  }));

  return (
    <PageShell
      backHref="/profile/step/3"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
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
        </section>

        {draft.claims.length > 0 ? (
          <section className="space-y-4">
            <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t("profile.step4.certificatesSection")}
            </h3>
            {draft.claims.map((code) => (
              <CertificateSubForm
                key={code}
                code={code}
                label={t(`field.claims.options.${code}`)}
              />
            ))}
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
    </PageShell>
  );
}
