"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useClaimsUpdater } from "../../../_components/profile/use-claims-updater";
import { useReviewReturn } from "../../../_components/profile/use-review-return";
import { CheckboxGroup } from "../../../_components/form/checkbox-group";
import { RadioCards } from "../../../_components/form/radio-cards";
import { Toggle } from "../../../_components/form/toggle";
import { CertificateSubForm } from "../../../_components/profile/certificate-subform";
import { IssueBanner } from "../../../_components/scrutiny-bridge/issue-banner";

type Errors = Record<string, string>;

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
  const { draft, update } = useProfile();
  const setClaims = useClaimsUpdater();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`field-${focus}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focus]);

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.category) e.category = t("error.required");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/5");
  }

  const categoryOptions = [
    { value: "general", label: t("field.category.options.general") },
    { value: "ews", label: t("field.category.options.ews") },
    { value: "obc", label: t("field.category.options.obc") },
    { value: "sc", label: t("field.category.options.sc") },
    { value: "st", label: t("field.category.options.st") },
  ];

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
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={4} />
      <AutosaveHint className="mb-4" />

      <IssueBanner scope="reservation" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step4.categorySection")}
          </h3>
          <RadioCards
            name="category"
            label={t("field.category.label")}
            helper={t("field.category.helper")}
            options={categoryOptions}
            value={draft.category}
            onChange={(v) => update("category", v as typeof draft.category)}
            error={errors.category}
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

        {Object.keys(errors).length > 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
            ⚠ {t("error.fixBeforeContinue")}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <PrimaryButton type="submit">{t(saveLabelKey)}</PrimaryButton>
        </div>
      </form>
     </div>
    </PageShell>
  );
}
