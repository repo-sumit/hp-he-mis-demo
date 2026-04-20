"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryLink, PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";
import { RadioCards } from "../_components/form/radio-cards";
import { Select } from "../_components/form/select";
import { evaluateAll, type EligibilityResult } from "../_components/discover/evaluate";
import type { ProfileDraft } from "../_components/profile/profile-provider";

type StreamChoice = "arts" | "pcm" | "pcb" | "commerce";
type BoardChoice = "hpbose" | "cbse" | "icse" | "nios" | "other";

const STREAM_OPTIONS: Array<{ value: StreamChoice; labelKey: string }> = [
  { value: "arts", labelKey: "field.stream.options.arts" },
  { value: "pcm", labelKey: "field.stream.options.pcm" },
  { value: "pcb", labelKey: "field.stream.options.pcb" },
  { value: "commerce", labelKey: "field.stream.options.commerce" },
];

const BOARD_OPTIONS: Array<{ value: BoardChoice; labelKey: string }> = [
  { value: "hpbose", labelKey: "field.board.options.hpbose" },
  { value: "cbse", labelKey: "field.board.options.cbse" },
  { value: "icse", labelKey: "field.board.options.icse" },
  { value: "nios", labelKey: "field.board.options.nios" },
  { value: "other", labelKey: "field.board.options.other" },
];

/**
 * Lightweight profile sketch fed into the shared evaluator. We only set the
 * fields the evaluator actually inspects; everything else stays at its
 * ProfileDraft default-friendly empty state.
 */
function buildDraft(stream: StreamChoice, bof: string, board: BoardChoice): ProfileDraft {
  return {
    fullName: "",
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "",
    mobile: "",
    email: "",
    aadhaar: "",
    apaar: "",
    category: "",
    isSingleGirlChild: false,
    isPwd: false,
    permanentAddress: "",
    district: "",
    state: "Himachal Pradesh",
    pincode: "",
    correspondenceSame: true,
    correspondenceAddress: "",
    board,
    yearOfPassing: "2025",
    rollNumber: "",
    stream,
    subjects: "",
    bofPercentage: bof,
    resultStatus: "pass",
    gapYears: "0",
    claims: [],
    certificates: {},
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",
  };
}

/**
 * Pre-login eligibility self-test. Three questions (stream / marks / board)
 * feed into the same evaluator the full discover screen uses, so the preview
 * counts here match what the student will actually see after registering.
 */
export default function EligibilityCheckPage() {
  const { t } = useLocale();
  const [stream, setStream] = useState<StreamChoice | "">("");
  const [bof, setBof] = useState("");
  const [board, setBoard] = useState<BoardChoice | "">("");
  const [showing, setShowing] = useState(false);

  const ready = Boolean(stream && bof && board);

  const results: EligibilityResult[] = useMemo(() => {
    if (!showing || !ready) return [];
    return evaluateAll(buildDraft(stream as StreamChoice, bof, board as BoardChoice));
  }, [showing, ready, stream, bof, board]);

  const counts = useMemo(() => {
    const tally = { eligible: 0, conditional: 0, notEligible: 0 };
    for (const r of results) {
      if (r.state === "eligible") tally.eligible++;
      else if (r.state === "conditional") tally.conditional++;
      else tally.notEligible++;
    }
    return tally;
  }, [results]);

  const streamOptions = STREAM_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  const boardOptions = BOARD_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
  }));

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.eligibilityCheck.title")}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("preLogin.eligibilityCheck.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("preLogin.eligibilityCheck.subtitle")}
        </p>
      </section>

      <section className="mt-5 space-y-4">
        <RadioCards
          name="stream"
          label={t("preLogin.eligibilityCheck.question1")}
          options={streamOptions}
          value={stream}
          onChange={(v) => {
            setStream(v as StreamChoice);
            setShowing(false);
          }}
        />

        <Field
          name="bof"
          type="number"
          inputMode="decimal"
          label={t("preLogin.eligibilityCheck.question2")}
          placeholder={t("preLogin.eligibilityCheck.percentagePlaceholder")}
          value={bof}
          onChange={(event) => {
            setBof(event.target.value);
            setShowing(false);
          }}
        />

        <Select
          name="board"
          label={t("preLogin.eligibilityCheck.question3")}
          placeholder={t("field.board.label")}
          options={boardOptions}
          value={board}
          onChange={(event) => {
            setBoard(event.target.value as BoardChoice);
            setShowing(false);
          }}
        />
      </section>

      {showing ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <p className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            {t("preLogin.eligibilityCheck.resultsHeading")}
          </p>

          {results.length === 0 ? (
            <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
              {t("preLogin.eligibilityCheck.resultsEmpty")}
            </p>
          ) : (
            <ul className="mt-2 flex flex-wrap gap-2">
              <li className="rounded-[var(--radius-pill)] bg-[var(--color-status-success-bg)] px-3 py-1 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-success-fg)]">
                ✓ {t("preLogin.eligibilityCheck.resultsEligible", { n: counts.eligible })}
              </li>
              <li className="rounded-[var(--radius-pill)] bg-[var(--color-status-warning-bg)] px-3 py-1 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-warning-fg)]">
                ! {t("preLogin.eligibilityCheck.resultsConditional", { n: counts.conditional })}
              </li>
              <li className="rounded-[var(--radius-pill)] bg-[var(--color-status-danger-bg)] px-3 py-1 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-status-danger-fg)]">
                ✕ {t("preLogin.eligibilityCheck.resultsNotEligible", { n: counts.notEligible })}
              </li>
            </ul>
          )}

          <p className="mt-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
            {t("preLogin.eligibilityCheck.disclaimer")}
          </p>
        </section>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        <PrimaryButton
          type="button"
          onClick={() => setShowing(true)}
          disabled={!ready}
        >
          {t("preLogin.eligibilityCheck.checkCta")}
        </PrimaryButton>
        {showing ? (
          <PrimaryLink href="/register" variant="secondary">
            {t("preLogin.eligibilityCheck.nextCta")}
          </PrimaryLink>
        ) : null}
        <Link
          href="/"
          className="text-center text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("common.backToHome")}
        </Link>
      </div>
    </PageShell>
  );
}
