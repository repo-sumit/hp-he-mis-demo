"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { Field } from "../../../_components/field";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import { useProfile } from "../../../_components/profile/profile-provider";
import { Select } from "../../../_components/form/select";
import { Textarea } from "../../../_components/form/textarea";
import { RadioCards } from "../../../_components/form/radio-cards";

type Errors = Record<string, string>;

export default function Step3Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const [errors, setErrors] = useState<Errors>({});

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.board) e.board = t("error.required");
    if (!draft.yearOfPassing) e.yearOfPassing = t("error.required");
    else if (!/^\d{4}$/.test(draft.yearOfPassing)) e.yearOfPassing = t("error.invalidYear");
    if (!draft.rollNumber.trim()) e.rollNumber = t("error.required");
    if (!draft.stream) e.stream = t("error.required");
    if (!draft.subjects.trim()) e.subjects = t("error.required");
    if (!draft.bofPercentage) e.bofPercentage = t("error.required");
    else {
      const n = Number(draft.bofPercentage);
      if (Number.isNaN(n) || n < 0 || n > 100) e.bofPercentage = t("error.invalidPercentage");
    }
    if (!draft.resultStatus) e.resultStatus = t("error.required");
    return e;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) router.push("/profile/step/4");
  }

  const boardOptions = (["hpbose", "cbse", "icse", "nios", "other"] as const).map((v) => ({
    value: v,
    label: t(`field.board.options.${v}`),
  }));

  const streamOptions = [
    { value: "arts", label: t("field.stream.options.arts") },
    { value: "pcm", label: t("field.stream.options.pcm"), hint: "Physics · Chemistry · Maths" },
    { value: "pcb", label: t("field.stream.options.pcb"), hint: "Physics · Chemistry · Biology" },
    { value: "commerce", label: t("field.stream.options.commerce") },
  ];

  const resultOptions = [
    { value: "pass", label: t("field.resultStatus.options.pass") },
    { value: "compartment", label: t("field.resultStatus.options.compartment") },
    { value: "fail", label: t("field.resultStatus.options.fail") },
  ];

  return (
    <PageShell
      backHref="/profile/step/2"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
      <ProfileProgress step={3} />
      <AutosaveHint className="mb-4" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step3.boardSection")}
          </h3>
          <Select
            name="board"
            label={t("field.board.label")}
            helper={t("field.board.helper")}
            placeholder={t("field.board.label")}
            options={boardOptions}
            value={draft.board}
            onChange={(event) => update("board", event.target.value as typeof draft.board)}
            error={errors.board}
          />
          <Field
            name="yearOfPassing"
            inputMode="numeric"
            label={t("field.yearOfPassing.label")}
            helper={t("field.yearOfPassing.helper")}
            placeholder={t("field.yearOfPassing.placeholder")}
            value={draft.yearOfPassing}
            onChange={(event) => update("yearOfPassing", event.target.value)}
            error={errors.yearOfPassing}
          />
          <Field
            name="rollNumber"
            label={t("field.rollNumber.label")}
            helper={t("field.rollNumber.helper")}
            placeholder={t("field.rollNumber.placeholder")}
            value={draft.rollNumber}
            onChange={(event) => update("rollNumber", event.target.value)}
            error={errors.rollNumber}
          />
          <RadioCards
            name="stream"
            label={t("field.stream.label")}
            helper={t("field.stream.helper")}
            options={streamOptions}
            value={draft.stream}
            onChange={(v) => update("stream", v as typeof draft.stream)}
            error={errors.stream}
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step3.subjectsSection")}
          </h3>
          <Textarea
            name="subjects"
            rows={3}
            label={t("field.subjects.label")}
            helper={t("field.subjects.helper")}
            placeholder={t("field.subjects.placeholder")}
            value={draft.subjects}
            onChange={(event) => update("subjects", event.target.value)}
            error={errors.subjects}
          />

          <Field
            name="bofPercentage"
            inputMode="decimal"
            label={t("field.bofPercentage.label")}
            helper={t("field.bofPercentage.helper")}
            placeholder={t("field.bofPercentage.placeholder")}
            value={draft.bofPercentage}
            onChange={(event) => update("bofPercentage", event.target.value)}
            error={errors.bofPercentage}
            adornment={
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/profile/tools/bof-calculator"
                  className="inline-flex items-center gap-1 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
                >
                  <span aria-hidden="true">🧮</span>
                  {t("cta.openCalculator")}
                </Link>
                <Link
                  href="/profile/tools/cgpa-converter"
                  className="inline-flex items-center gap-1 text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
                >
                  <span aria-hidden="true">🔁</span>
                  {t("field.cgpa.converterLink")}
                </Link>
              </div>
            }
          />
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step3.resultSection")}
          </h3>
          <RadioCards
            name="resultStatus"
            label={t("field.resultStatus.label")}
            options={resultOptions}
            value={draft.resultStatus}
            onChange={(v) => update("resultStatus", v as typeof draft.resultStatus)}
            error={errors.resultStatus}
          />
          <Field
            name="gapYears"
            inputMode="numeric"
            label={t("field.gapYears.label")}
            helper={t("field.gapYears.helper")}
            placeholder={t("field.gapYears.placeholder")}
            value={draft.gapYears}
            onChange={(event) => update("gapYears", event.target.value)}
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
