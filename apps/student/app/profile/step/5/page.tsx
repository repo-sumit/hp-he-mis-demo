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
import { SectionSummary } from "../../../_components/profile/section-summary";

type Errors = Record<string, string>;

export default function Step5Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.accountHolder.trim()) e.accountHolder = t("error.required");
    if (!draft.accountNumber) e.accountNumber = t("error.required");
    else {
      const cleaned = draft.accountNumber.replace(/\s+/g, "");
      if (!/^\d+$/.test(cleaned)) e.accountNumber = t("error.invalidAccountNumeric");
      else if (cleaned.length < 9) e.accountNumber = t("error.invalidAccount");
    }
    if (!draft.ifsc) e.ifsc = t("error.required");
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(draft.ifsc.toUpperCase()))
      e.ifsc = t("error.invalidIfsc");
    if (!draft.bankName.trim()) e.bankName = t("error.required");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) router.push("/documents");
  }

  const personalRows = [
    { label: t("field.fullName.label"), value: draft.fullName },
    { label: t("field.dob.label"), value: draft.dob },
    {
      label: t("field.category.label"),
      value: draft.category ? t(`field.category.options.${draft.category}`) : "",
    },
  ];
  const addressRows = [
    { label: t("field.district.label"), value: draft.district },
    { label: t("field.pincode.label"), value: draft.pincode },
  ];
  const academicRows = [
    {
      label: t("field.board.label"),
      value: draft.board ? t(`field.board.options.${draft.board}`) : "",
    },
    {
      label: t("field.stream.label"),
      value: draft.stream ? t(`field.stream.options.${draft.stream}`) : "",
    },
    { label: t("field.bofPercentage.label"), value: draft.bofPercentage },
  ];
  const claimsValue = draft.claims
    .map((code) => t(`field.claims.options.${code}`))
    .join(", ");
  const claimRows = [{ label: t("field.claims.label"), value: claimsValue }];

  return (
    <PageShell
      backHref="/profile/step/4"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
      <ProfileProgress step={5} />
      <AutosaveHint className="mb-4" />

      <section className="mb-5 flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4">
        <span
          aria-hidden="true"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--color-text-inverse)]"
        >
          ✓
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-success-fg)]">
            {t("profile.step5.savedTitle")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
            {t("profile.step5.savedBody")}
          </p>
        </div>
      </section>

      <section className="mb-5 rounded-[var(--radius-lg)] border border-[var(--color-status-warning-fg)] bg-[var(--color-status-warning-bg)] p-4">
        <p className="flex items-center gap-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]">
          <span aria-hidden="true">⚠️</span>
          {t("profile.step5.warningTitle")}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-primary)]">
          {t("profile.step5.warningBody")}
        </p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <Field
            name="accountHolder"
            label={t("field.bank.accountHolder.label")}
            helper={t("field.bank.accountHolder.helper")}
            value={draft.accountHolder}
            onChange={(event) => update("accountHolder", event.target.value)}
            error={errors.accountHolder}
          />
          <Field
            name="accountNumber"
            inputMode="numeric"
            pattern="[0-9]*"
            label={t("field.bank.accountNumber.label")}
            placeholder={t("field.bank.accountNumber.placeholder")}
            value={draft.accountNumber}
            onChange={(event) =>
              update("accountNumber", event.target.value.replace(/\D/g, ""))
            }
            error={errors.accountNumber}
          />
          <Field
            name="ifsc"
            label={t("field.bank.ifsc.label")}
            helper={t("field.bank.ifsc.helper")}
            placeholder={t("field.bank.ifsc.placeholder")}
            value={draft.ifsc}
            onChange={(event) => update("ifsc", event.target.value.toUpperCase())}
            error={errors.ifsc}
          />
          <Field
            name="bankName"
            label={t("field.bank.bankName.label")}
            placeholder={t("field.bank.bankName.placeholder")}
            value={draft.bankName}
            onChange={(event) => update("bankName", event.target.value)}
            error={errors.bankName}
          />
        </section>

        <section className="space-y-3">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step5.reviewSection")}
          </h3>
          <SectionSummary
            title={t("profile.summary.step1Title")}
            editHref="/profile/step/1"
            rows={personalRows}
          />
          <SectionSummary
            title={t("profile.summary.step2Title")}
            editHref="/profile/step/2"
            rows={addressRows}
          />
          <SectionSummary
            title={t("profile.summary.step3Title")}
            editHref="/profile/step/3"
            rows={academicRows}
          />
          <SectionSummary
            title={t("profile.summary.step4Title")}
            editHref="/profile/step/4"
            rows={claimRows}
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
