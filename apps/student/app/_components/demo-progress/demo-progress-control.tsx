"use client";

import { useCallback, useMemo, useState } from "react";
import { Badge, Button, Modal, useToast } from "@hp-mis/ui";
import type { StatusStep } from "../status-tracker";
import {
  DEMO_ORDER,
  useDemoProgress,
  type DemoStage,
} from "./demo-progress-provider";

interface Props {
  /** Current effective StatusStep shown by the tracker (real or forced). */
  currentStep: StatusStep;
}

const STAGE_LABEL: Record<DemoStage, string> = {
  submitted: "Submitted",
  underScrutiny: "Under scrutiny",
  meritPublished: "Merit published",
  allotted: "Allotted",
  admissionConfirmed: "Admission confirmed",
};

const STEP_LABEL: Record<StatusStep, string> = {
  registered: "Registered",
  profileComplete: "Profile complete",
  submitted: "Submitted",
  underScrutiny: "Under scrutiny",
  meritPublished: "Merit published",
  allotted: "Allotted",
  admissionConfirmed: "Admission confirmed",
};

type TransitionKey = DemoStage;

interface TransitionCopy {
  kind: "toast" | "modal";
  /** Shown before the transition completes (modal body + cta). */
  title: string;
  description?: string;
  cta?: string;
  /** Toast-only tone for non-modal transitions. */
  tone?: "info" | "success" | "error";
  /** Follow-up toast fired after a modal confirm. */
  followUpToast?: { message: string; tone: "info" | "success" | "error" };
}

const TRANSITIONS: Record<TransitionKey, TransitionCopy> = {
  submitted: {
    kind: "toast",
    title: "Application submitted for this cycle.",
    tone: "success",
  },
  underScrutiny: {
    kind: "toast",
    title: "Application moved to the college scrutiny queue.",
    tone: "info",
  },
  meritPublished: {
    kind: "modal",
    title: "Scrutiny completed",
    description:
      "Your documents and eligibility checks have cleared. The state can now publish the merit list for your course.",
    cta: "Publish merit",
    followUpToast: {
      message: "Merit list published for your course.",
      tone: "success",
    },
  },
  allotted: {
    kind: "modal",
    title: "Seat available in your first preference",
    description:
      "Minor discrepancy found in the uploaded category certificate — the college marked it as resolved. Review and proceed with allotment.",
    cta: "Proceed with allotment",
    followUpToast: {
      message: "Seat allotted in your first-preference college.",
      tone: "success",
    },
  },
  admissionConfirmed: {
    kind: "modal",
    title: "Admission fee acknowledgement pending",
    description:
      "The college has received your admission fee. Mark the payment as acknowledged to finalise your admission.",
    cta: "Mark fee received",
    followUpToast: {
      message: "Admission confirmed. Welcome aboard.",
      tone: "success",
    },
  },
};

/**
 * Operator control center for demo progression.
 *
 * Lives beside the student status tracker on the dashboard. Visually
 * muted (dashed border, "Demo" tag) so it reads as an operator aid
 * rather than something a student would interact with.
 *
 * Capabilities:
 *   - Real flow ⇄ Demo override toggle (left segmented control)
 *   - Current + Next stage display
 *   - Advance to the next stage (toast for soft transitions, modal for
 *     bigger ones like merit publication / allotment / admission)
 *   - Jump directly to any stage via a select control
 *   - Reset back to the real flow with one click (no destructive
 *     confirmation — demo state is fully recoverable on next advance)
 *
 * The override is a pure UI overlay — real providers are never written
 * to from this component.
 */
export function DemoProgressControl({ currentStep }: Props) {
  const { stage, nextStageAfter, setStage, reset } = useDemoProgress();
  const { toast } = useToast();
  const [pendingStage, setPendingStage] = useState<DemoStage | null>(null);

  const nextStage = useMemo(
    () => nextStageAfter(currentStep),
    [nextStageAfter, currentStep],
  );
  const isComplete = currentStep === "admissionConfirmed";
  const isOverriding = stage !== null;

  const commit = useCallback(
    (target: DemoStage) => {
      setStage(target);
      const copy = TRANSITIONS[target];
      if (copy.followUpToast) {
        toast(copy.followUpToast.message, { tone: copy.followUpToast.tone });
      }
    },
    [setStage, toast],
  );

  const handleAdvance = useCallback(() => {
    if (!nextStage) return;
    const copy = TRANSITIONS[nextStage];
    if (copy.kind === "modal") {
      setPendingStage(nextStage);
      return;
    }
    setStage(nextStage);
    toast(copy.title, { tone: copy.tone ?? "info" });
  }, [nextStage, setStage, toast]);

  const handleJump = useCallback(
    (target: DemoStage) => {
      const copy = TRANSITIONS[target];
      // Jumps skip the modal confirmation — the operator already
      // selected the destination intentionally. We still surface the
      // follow-up toast so the dashboard feels reactive.
      setStage(target);
      if (copy.followUpToast) {
        toast(copy.followUpToast.message, { tone: copy.followUpToast.tone });
      } else {
        toast(`Jumped to ${STAGE_LABEL[target]}`, { tone: "info" });
      }
    },
    [setStage, toast],
  );

  const handleEnableDemo = useCallback(() => {
    // First-time enable — start at the natural next stage from the
    // student's real progress so the demo picks up where the real
    // flow left off.
    const target = nextStage ?? "submitted";
    setStage(target);
    toast(`Demo override enabled — ${STAGE_LABEL[target]}`, { tone: "info" });
  }, [nextStage, setStage, toast]);

  const handleReset = useCallback(() => {
    reset();
    toast("Reset to real flow.", { tone: "success" });
  }, [reset, toast]);

  const handleModalConfirm = useCallback(() => {
    if (!pendingStage) return;
    commit(pendingStage);
    setPendingStage(null);
  }, [pendingStage, commit]);

  const handleModalClose = useCallback(() => {
    setPendingStage(null);
  }, []);

  const pendingCopy = pendingStage ? TRANSITIONS[pendingStage] : null;

  return (
    <>
      <section
        aria-label="Demo progression controls"
        className="mt-4 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-4"
      >
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-5 items-center rounded-[var(--radius-sm)] bg-[var(--color-background-muted)] px-2 text-[var(--text-2xs)] font-[var(--weight-bold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-secondary)]"
            >
              Demo
            </span>
            <h4 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-primary)]">
              Operator control
            </h4>
          </div>
          {isOverriding ? (
            <Badge tone="warning">Override active</Badge>
          ) : (
            <Badge tone="neutral">Real flow</Badge>
          )}
        </header>

        {/* Real flow ⇄ Demo override segmented toggle */}
        <div
          role="group"
          aria-label="Render mode"
          className="mt-3 inline-flex rounded-[var(--radius-pill)] bg-[var(--color-background-muted)] p-0.5"
        >
          <button
            type="button"
            onClick={isOverriding ? handleReset : undefined}
            aria-pressed={!isOverriding}
            className={
              !isOverriding
                ? "inline-flex h-7 items-center rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-3 text-[var(--text-2xs)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] shadow-[var(--shadow-sm)]"
                : "inline-flex h-7 items-center rounded-[var(--radius-pill)] px-3 text-[var(--text-2xs)] font-[var(--weight-medium)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }
          >
            Real flow
          </button>
          <button
            type="button"
            onClick={!isOverriding ? handleEnableDemo : undefined}
            aria-pressed={isOverriding}
            className={
              isOverriding
                ? "inline-flex h-7 items-center rounded-[var(--radius-pill)] bg-[var(--color-surface)] px-3 text-[var(--text-2xs)] font-[var(--weight-semibold)] text-[var(--color-text-brand)] shadow-[var(--shadow-sm)]"
                : "inline-flex h-7 items-center rounded-[var(--radius-pill)] px-3 text-[var(--text-2xs)] font-[var(--weight-medium)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }
          >
            Demo override
          </button>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-3 text-[var(--text-xs)]">
          <div>
            <dt className="font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              Current
            </dt>
            <dd className="mt-1 font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {STEP_LABEL[currentStep]}
            </dd>
          </div>
          <div>
            <dt className="font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
              Next
            </dt>
            <dd className="mt-1 font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {nextStage ? STAGE_LABEL[nextStage] : "Journey complete"}
            </dd>
          </div>
        </dl>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {isComplete ? (
            <Button variant="secondary" size="sm" disabled>
              <span aria-hidden="true">✓</span> Journey complete
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleAdvance}
              disabled={!isOverriding && !nextStage}
            >
              {isOverriding ? "Advance" : "Start"} →{" "}
              {nextStage ? STAGE_LABEL[nextStage] : "next stage"}
            </Button>
          )}

          {/* Jump-to-stage select. Only enabled while overriding so the
              real flow's natural progression is preserved when the operator
              is not actively curating. */}
          <label className="inline-flex items-center gap-1.5 text-[var(--text-2xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
            <span className="sr-only md:not-sr-only">Jump to</span>
            <select
              aria-label="Jump to stage"
              disabled={!isOverriding}
              value={stage ?? ""}
              onChange={(event) => {
                const next = event.target.value as DemoStage | "";
                if (next) handleJump(next);
              }}
              className="h-[var(--button-height-sm)] rounded-[var(--radius-pill)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 text-[var(--text-xs)] font-[var(--weight-medium)] normal-case tracking-normal text-[var(--color-text-primary)] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              <option value="" disabled>
                Pick a stage
              </option>
              {DEMO_ORDER.map((value) => (
                <option key={value} value={value}>
                  {STAGE_LABEL[value]}
                </option>
              ))}
            </select>
          </label>

          {isOverriding ? (
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-[var(--button-height-sm)] items-center rounded-[var(--radius-pill)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-secondary)] transition-colors duration-150 ease-out hover:text-[var(--color-text-brand)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              ↺ Reset
            </button>
          ) : null}
        </div>

        <p className="mt-3 text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
          Override is read-only — real providers are untouched. Progression is
          saved locally for this browser only.
        </p>
      </section>

      <Modal
        open={pendingStage !== null && pendingCopy?.kind === "modal"}
        onClose={handleModalClose}
        tone="default"
        size="sm"
        title={pendingCopy?.title}
        caption={
          pendingStage ? `Next: ${STAGE_LABEL[pendingStage]}` : undefined
        }
        footer={
          <>
            <Button variant="secondary" onClick={handleModalClose}>
              Not now
            </Button>
            <Button variant="primary" onClick={handleModalConfirm}>
              {pendingCopy?.cta ?? "Continue"}
            </Button>
          </>
        }
      >
        {pendingCopy?.description ? (
          <p className="text-center">{pendingCopy.description}</p>
        ) : null}
      </Modal>
    </>
  );
}
