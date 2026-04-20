"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { Field } from "../../../_components/field";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { useProfile } from "../../../_components/profile/profile-provider";
import { RadioCards } from "../../../_components/form/radio-cards";
import { Toggle } from "../../../_components/form/toggle";

type Errors = Record<string, string>;

export default function Step1Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.fullName.trim()) e.fullName = t("error.required");
    if (!draft.dob) e.dob = t("error.required");
    if (!draft.gender) e.gender = t("error.required");
    if (!draft.mobile) e.mobile = t("error.required");
    else if (!/^[6-9]\d{9}$/.test(draft.mobile.replace(/\s+/g, "")))
      e.mobile = t("error.invalidMobile");
    if (!draft.email) e.email = t("error.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email))
      e.email = t("error.invalidEmail");
    if (draft.aadhaar && !/^\d{12}$/.test(draft.aadhaar.replace(/\s+/g, "")))
      e.aadhaar = t("error.invalidAadhaar");
    if (!draft.category) e.category = t("error.required");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) router.push("/profile/step/2");
  }

  const genderOptions = [
    { value: "female", label: t("field.gender.female") },
    { value: "male", label: t("field.gender.male") },
    { value: "other", label: t("field.gender.other") },
  ];

  const categoryOptions = [
    { value: "general", label: t("field.category.options.general") },
    { value: "ews", label: t("field.category.options.ews") },
    { value: "obc", label: t("field.category.options.obc") },
    { value: "sc", label: t("field.category.options.sc") },
    { value: "st", label: t("field.category.options.st") },
  ];

  return (
    <PageShell backHref="/dashboard" eyebrow={t("profile.header.title")} title={t("app.name")}>
      <ProfileProgress step={1} />
      <AutosaveHint className="mb-4" />

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
            onChange={(v) => update("gender", v as typeof draft.gender)}
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
          <Field
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            label={t("field.email.label")}
            helper={t("field.email.helper")}
            placeholder={t("field.email.placeholder")}
            value={draft.email}
            onChange={(event) => update("email", event.target.value)}
            error={errors.email}
          />
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

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step1.reservationSection")}
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
          <Toggle
            label={t("field.singleGirlChild.label")}
            helper={t("field.singleGirlChild.helper")}
            value={draft.isSingleGirlChild}
            onChange={(v) => update("isSingleGirlChild", v)}
          />
          <Toggle
            label={t("field.pwd.label")}
            helper={t("field.pwd.helper")}
            value={draft.isPwd}
            onChange={(v) => update("isPwd", v)}
          />
        </section>

        {Object.keys(errors).length > 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
            ⚠ {t("error.fixBeforeContinue")}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-4 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <PrimaryButton type="submit">{t("cta.saveAndContinue")}</PrimaryButton>
        </div>
      </form>
    </PageShell>
  );
}
