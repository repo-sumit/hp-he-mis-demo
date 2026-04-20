"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../../../_components/page-shell";
import { Field } from "../../../_components/field";
import { PrimaryButton } from "../../../_components/primary-button";
import { useLocale } from "../../../_components/locale-provider";
import { ProfileProgress } from "../../../_components/profile/profile-progress";
import { AutosaveHint } from "../../../_components/profile/autosave-hint";
import {
  useProfile,
  computeBestOfFive,
  deriveResultStatus,
  type SubjectMark,
} from "../../../_components/profile/profile-provider";
import { IssueBanner } from "../../../_components/scrutiny-bridge/issue-banner";
import { Select } from "../../../_components/form/select";
import { RadioCards } from "../../../_components/form/radio-cards";

type Errors = Record<string, string>;

export default function Step3Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const [errors, setErrors] = useState<Errors>({});

  const bof = useMemo(() => computeBestOfFive(draft.subjectMarks), [draft.subjectMarks]);
  const derivedResult = deriveResultStatus(bof);

  // Keep derived fields synced whenever the table changes.
  const bofString = bof == null ? "" : bof.toFixed(2);
  useEffect(() => {
    if (draft.bofPercentage !== bofString) update("bofPercentage", bofString);
    if (draft.resultStatus !== derivedResult) update("resultStatus", derivedResult);
  }, [bofString, derivedResult, draft.bofPercentage, draft.resultStatus, update]);

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.board) e.board = t("error.required");
    if (!draft.yearOfPassing) e.yearOfPassing = t("error.required");
    else if (!/^\d{4}$/.test(draft.yearOfPassing)) e.yearOfPassing = t("error.invalidYear");
    if (!draft.rollNumber.trim()) e.rollNumber = t("error.required");
    if (!draft.stream) e.stream = t("error.required");

    const validRows = draft.subjectMarks.filter((r) => {
      const o = Number(r.obtained);
      const tt = Number(r.total);
      return (
        r.name.trim() &&
        Number.isFinite(o) &&
        Number.isFinite(tt) &&
        tt > 0 &&
        o >= 0 &&
        o <= tt
      );
    });
    if (validRows.length < 5) e.subjectMarks = t("profile.step3.subjectsMinFive");

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

  function updateRow(index: number, patch: Partial<SubjectMark>) {
    const next = draft.subjectMarks.map((row, i) =>
      i === index ? { ...row, ...patch } : row,
    );
    update("subjectMarks", next);
  }

  return (
    <PageShell
      backHref="/profile/step/2"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
      <ProfileProgress step={3} />
      <AutosaveHint className="mb-4" />

      <IssueBanner scope="academic" />

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

        <section className="space-y-3">
          <div>
            <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t("profile.step3.subjectsSection")}
            </h3>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t("profile.step3.subjectsHint")}
            </p>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="grid grid-cols-[1.4fr_0.9fr_0.9fr] gap-2 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-3 py-2 text-[10px] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)] sm:text-[var(--text-xs)]">
              <span>{t("profile.step3.table.subject")}</span>
              <span>{t("profile.step3.table.obtained")}</span>
              <span>{t("profile.step3.table.total")}</span>
            </div>
            <ul>
              {draft.subjectMarks.map((row, index) => (
                <li
                  key={index}
                  className="grid grid-cols-[1.4fr_0.9fr_0.9fr] gap-2 border-b border-[var(--color-border)] px-3 py-2 last:border-b-0"
                >
                  <input
                    aria-label={t("profile.step3.table.subject")}
                    className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                    value={row.name}
                    onChange={(event) => updateRow(index, { name: event.target.value })}
                    placeholder={t("profile.step3.table.subjectPlaceholder")}
                  />
                  <input
                    aria-label={t("profile.step3.table.obtained")}
                    inputMode="numeric"
                    className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                    value={row.obtained}
                    onChange={(event) =>
                      updateRow(index, { obtained: event.target.value.replace(/[^\d.]/g, "") })
                    }
                  />
                  <input
                    aria-label={t("profile.step3.table.total")}
                    inputMode="numeric"
                    className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                    value={row.total}
                    onChange={(event) =>
                      updateRow(index, { total: event.target.value.replace(/[^\d.]/g, "") })
                    }
                  />
                </li>
              ))}
            </ul>
          </div>

          {errors.subjectMarks ? (
            <p className="text-[var(--text-xs)] text-[var(--color-text-danger)]">
              ⚠ {errors.subjectMarks}
            </p>
          ) : null}

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-3">
            <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              {t("field.bofPercentage.label")}
            </p>
            <p className="mt-1 text-[var(--text-2xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              {bof != null ? `${bof.toFixed(2)}%` : "—"}
            </p>
            <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
              {t("profile.step3.bofAutoHint")}
            </p>
          </div>

          {derivedResult ? (
            <div
              className={
                derivedResult === "pass"
                  ? "rounded-[var(--radius-md)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-status-success-fg)]"
                  : "rounded-[var(--radius-md)] border border-[var(--color-text-danger)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-status-danger-fg)]"
              }
            >
              {derivedResult === "pass"
                ? t("profile.step3.resultPass")
                : t("profile.step3.resultFail")}
            </div>
          ) : null}
        </section>

        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step3.gapSection")}
          </h3>
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

        <div className="sticky bottom-0 -mx-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:-mx-4 sm:px-4">
          <PrimaryButton type="submit">{t("cta.saveAndContinue")}</PrimaryButton>
        </div>
      </form>
    </PageShell>
  );
}
