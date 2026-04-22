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
import { useReviewReturn } from "../../../_components/profile/use-review-return";
import { FieldGroup, Select } from "@hp-mis/ui";
import { RadioCards } from "../../../_components/form/radio-cards";

type Errors = Record<string, string>;

export default function Step3Page() {
  const router = useRouter();
  const { t } = useLocale();
  const { draft, update } = useProfile();
  const { inReviewEdit, returnHref, saveLabelKey, focus } = useReviewReturn();
  const [errors, setErrors] = useState<Errors>({});

  useEffect(() => {
    if (!focus) return;
    const node = document.getElementById(`field-${focus}`);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "center" });
    if (
      node instanceof HTMLInputElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLTextAreaElement
    ) {
      node.focus({ preventScroll: true });
    }
  }, [focus]);

  const bof = useMemo(() => computeBestOfFive(draft.subjectMarks), [draft.subjectMarks]);
  const derivedResult = deriveResultStatus(bof);

  // Year-of-passing options: previous 10 years up to the current year, newest
  // first. Using the local clock keeps the list current without a build step.
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () =>
      Array.from({ length: 11 }, (_, idx) => {
        const y = (currentYear - idx).toString();
        return { value: y, label: y };
      }),
    [currentYear],
  );

  // Gap years are derived from the chosen year of passing. A student passing
  // this year has 0 gap; one who passed earlier has the difference. Clamped to
  // 0 so a future year still shows 0 in the summary.
  const yearNumber = Number(draft.yearOfPassing);
  const derivedGap = Number.isFinite(yearNumber) && yearNumber > 0
    ? String(Math.max(0, currentYear - yearNumber))
    : "";

  // Keep derived fields synced whenever the table or year changes.
  const bofString = bof == null ? "" : bof.toFixed(2);
  useEffect(() => {
    if (draft.bofPercentage !== bofString) update("bofPercentage", bofString);
    if (draft.resultStatus !== derivedResult) update("resultStatus", derivedResult);
    if (derivedGap && draft.gapYears !== derivedGap) update("gapYears", derivedGap);
  }, [
    bofString,
    derivedResult,
    derivedGap,
    draft.bofPercentage,
    draft.resultStatus,
    draft.gapYears,
    update,
  ]);

  function validate(): Errors {
    const e: Errors = {};
    if (!draft.board) e.board = t("error.required");
    if (!draft.yearOfPassing) e.yearOfPassing = t("error.required");
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
    if (Object.keys(next).length > 0) return;
    router.push(inReviewEdit && returnHref ? returnHref : "/profile/step/4");
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

  function addRow() {
    update("subjectMarks", [
      ...draft.subjectMarks,
      { name: "", obtained: "", total: "100" },
    ]);
  }

  function removeRow(index: number) {
    // Keep a minimum of five rows so the table always scaffolds the
    // best-of-five calculation; above that, any extra row can be removed.
    if (draft.subjectMarks.length <= 5) return;
    update(
      "subjectMarks",
      draft.subjectMarks.filter((_, i) => i !== index),
    );
  }

  return (
    <PageShell
      backHref="/profile/step/2"
      eyebrow={t("profile.header.title")}
      title={t("app.name")}
    >
     <div className="mx-auto w-full max-w-xl">
      <ProfileProgress step={3} />
      <AutosaveHint className="mb-4" />

      <IssueBanner scope="academic" />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("profile.step3.boardSection")}
          </h3>
          <FieldGroup
            label={t("field.board.label")}
            helper={t("field.board.helper")}
            error={errors.board}
          >
            <Select
              name="board"
              placeholder={t("field.board.label")}
              value={draft.board}
              onChange={(event) =>
                update("board", event.target.value as typeof draft.board)
              }
            >
              {boardOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup
            label={t("field.yearOfPassing.label")}
            helper={t("field.yearOfPassing.helper")}
            error={errors.yearOfPassing}
          >
            <Select
              name="yearOfPassing"
              placeholder={t("field.yearOfPassing.placeholder")}
              value={draft.yearOfPassing}
              onChange={(event) => update("yearOfPassing", event.target.value)}
            >
              {yearOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <Field
            name="rollNumber"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            label={t("field.rollNumber.label")}
            helper={t("field.rollNumber.helper")}
            placeholder={t("field.rollNumber.placeholder")}
            value={draft.rollNumber}
            onChange={(event) =>
              update("rollNumber", event.target.value.replace(/\D/g, ""))
            }
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

          {(() => {
            // Minimum rows stays at five so the scaffold always matches the
            // best-of-five calculation. Students can add as many more as
            // they need; the extra ones gain a small remove button.
            const canRemove = draft.subjectMarks.length > 5;
            // Header + rows share the same grid template and horizontal
            // padding. `pl-3` on header cells aligns the label text with
            // the first character inside each row's input (input has its
            // own `px-2`, which stacks with the `px-1` row padding).
            const gridCols = canRemove
              ? "grid-cols-[1.4fr_0.9fr_0.9fr_auto]"
              : "grid-cols-[1.4fr_0.9fr_0.9fr]";
            return (
              <div className="overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
                <div
                  className={`grid ${gridCols} gap-2 border-b border-[var(--color-border)] bg-[var(--color-background-subtle)] px-3 py-2 text-[10px] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)] sm:text-[var(--text-xs)]`}
                >
                  <span className="pl-2">{t("profile.step3.table.subject")}</span>
                  <span className="pl-2">{t("profile.step3.table.obtained")}</span>
                  <span className="pl-2">{t("profile.step3.table.total")}</span>
                  {canRemove ? <span className="sr-only">{t("cta.remove")}</span> : null}
                </div>
                <ul>
                  {draft.subjectMarks.map((row, index) => (
                    <li
                      key={index}
                      className={`grid ${gridCols} items-center gap-2 border-b border-[var(--color-border)] px-3 py-2 last:border-b-0`}
                    >
                      <input
                        aria-label={t("profile.step3.table.subject")}
                        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                        value={row.name}
                        onChange={(event) => updateRow(index, { name: event.target.value })}
                        placeholder={t("profile.step3.table.subjectPlaceholder")}
                      />
                      <input
                        aria-label={t("profile.step3.table.obtained")}
                        inputMode="numeric"
                        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                        value={row.obtained}
                        onChange={(event) =>
                          updateRow(index, { obtained: event.target.value.replace(/[^\d.]/g, "") })
                        }
                      />
                      <input
                        aria-label={t("profile.step3.table.total")}
                        inputMode="numeric"
                        className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none focus:border-[var(--color-border-focus)]"
                        value={row.total}
                        onChange={(event) =>
                          updateRow(index, { total: event.target.value.replace(/[^\d.]/g, "") })
                        }
                      />
                      {canRemove ? (
                        <button
                          type="button"
                          onClick={() => removeRow(index)}
                          aria-label={t("cta.remove")}
                          title={t("cta.remove")}
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-text-danger)] hover:text-[var(--color-text-danger)]"
                        >
                          <span aria-hidden="true">✕</span>
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })()}

          <button
            type="button"
            onClick={addRow}
            className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] transition-colors hover:border-[var(--color-border-brand)] hover:bg-[var(--color-background-brand-softer)]"
          >
            <span aria-hidden="true">＋</span>
            {t("profile.step3.addSubject")}
          </button>

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
        </section>

        {Object.keys(errors).length > 0 ? (
          <p className="rounded-[var(--radius-md)] bg-[var(--color-status-danger-bg)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-status-danger-fg)]">
            ⚠ {t("error.fixBeforeContinue")}
          </p>
        ) : null}

        <div className="sticky bottom-0 -mx-3 border-t border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 sm:-mx-4 sm:px-4">
          <PrimaryButton type="submit">{t(saveLabelKey)}</PrimaryButton>
        </div>
      </form>
     </div>
    </PageShell>
  );
}
