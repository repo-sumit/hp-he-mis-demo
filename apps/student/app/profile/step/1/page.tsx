"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { Field } from "../../../_components/field";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { IssueBanner } from "../../../_components/scrutiny-bridge/issue-banner";
import { useProfile } from "../../../_components/profile/profile-provider";
import { useReviewReturn } from "../../../_components/profile/use-review-return";
import { RadioCards } from "../../../_components/form/radio-cards";

type Errors = Record<string, string>;

export default function Step1Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();
  const [errors, setErrors] = useState<Errors>({});

  // When the user came from review to fix a specific field, scroll the
  // field into view and focus it so the edit feels contextual instead of a
  // full-page reset.
  useEffect(() => {
    if (!focus) return;
    const id = `field-${focus}`;
    const node = document.getElementById(id);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    if (node instanceof HTMLInputElement || node instanceof HTMLSelectElement) {
      node.focus({ preventScroll: true });
    }
  }, [focus]);

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.fullName.trim()) e.fullName = t("error.required");
    if (!draft.dob) e.dob = t("error.required");
    if (!draft.gender) e.gender = t("error.required");
    if (!draft.mobile) e.mobile = t("error.required");
    else if (!/^[6-9]\d{9}$/.test(draft.mobile.replace(/\s+/g, "")))
      e.mobile = t("error.invalidMobile");
    if (draft.aadhaar && !/^\d{12}$/.test(draft.aadhaar.replace(/\s+/g, "")))
      e.aadhaar = t("error.invalidAadhaar");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/2");
  }

  const genderOptions = [
    { value: "female", label: t("field.gender.female") },
    { value: "male", label: t("field.gender.male") },
    { value: "other", label: t("field.gender.other") },
  ];

  return (
    <PageShell backHref="/dashboard" eyebrow={t("profile.header.title")} title={t("app.name")}>
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={1} />
      <AutosaveHint className="mb-4" />

      <IssueBanner scope="personal" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step1.personalSection")}
          </h3>
          <Field
            name="fullName"
            label={t("field.fullName.label")}
            helper={t("field.fullName.helper")}
            placeholder={t("field.fullName.placeholder")}
            value={draft.fullName}
            onChange={(event) => update("fullName", event.target.value)}
            error={errors.fullName}
            autoComplete="name"
          />
          <Field
            name="fatherName"
            label={t("field.fatherName.label")}
            placeholder={t("field.fatherName.placeholder")}
            value={draft.fatherName}
            onChange={(event) => update("fatherName", event.target.value)}
            error={errors.fatherName}
          />
          <Field
            name="motherName"
            label={t("field.motherName.label")}
            placeholder={t("field.motherName.placeholder")}
            value={draft.motherName}
            onChange={(event) => update("motherName", event.target.value)}
            error={errors.motherName}
          />
          <Field
            name="dob"
            type="date"
            label={t("field.dob.label")}
            helper={t("field.dob.helper")}
            value={draft.dob}
            onChange={(event) => update("dob", event.target.value)}
            error={errors.dob}
          />
          <RadioCards
            name="gender"
            label={t("field.gender.label")}
            options={genderOptions}
            value={draft.gender}
            onChange={(v) => {
              const next = v as typeof draft.gender;
              update("gender", next);
              if (next !== "female" && draft.isSingleGirlChild) {
                update("isSingleGirlChild", false);
              }
            }}
            error={errors.gender}
            columns={2}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step1.contactSection")}
          </h3>
          <Field
            name="mobile"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            label={t("field.mobile.label")}
            helper={t("field.mobile.helper")}
            placeholder={t("field.mobile.placeholder")}
            value={draft.mobile}
            onChange={(event) => update("mobile", event.target.value)}
            error={errors.mobile}
          />
          {draft.email ? (
            <Field
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              readOnly
              label={t("field.email.label")}
              helper={t("field.email.fromAccount")}
              value={draft.email}
              onChange={(event) => update("email", event.target.value)}
            />
          ) : null}
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step1.identitySection")} · {t("common.optional")}
          </h3>
          <Field
            name="aadhaar"
            inputMode="numeric"
            label={t("field.aadhaar.label")}
            helper={t("field.aadhaar.helper")}
            placeholder={t("field.aadhaar.placeholder")}
            value={draft.aadhaar}
            onChange={(event) => update("aadhaar", event.target.value)}
            error={errors.aadhaar}
          />
          <Field
            name="apaar"
            label={t("field.apaar.label")}
            helper={t("field.apaar.helper")}
            placeholder={t("field.apaar.placeholder")}
            value={draft.apaar}
            onChange={(event) => update("apaar", event.target.value)}
            error={errors.apaar}
            adornment={
              <a
                href="#"
                className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
              >
                {t("field.apaar.whatIsThis")}
              </a>
            }
          />
        </section>

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
