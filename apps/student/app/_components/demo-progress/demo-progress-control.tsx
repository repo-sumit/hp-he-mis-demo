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
 * Operator-only demo progression panel. Lives beside the status tracker
 * on the student dashboard. Marked visually (dashed border, "Demo" tag)
 * so it reads as an operator aid rather than a student affordance.
 *
 * Single forward-only button:
 *   - computes the next DemoStage after the current tracker step
 *   - fires a toast for the lightweight "submitted" transitions
 *   - opens a Modal for merit / allotment / admission confirmation
 *   - persists the override so a browser refresh keeps the demo state
 *
 * A "Reset demo" link drops back to the real flow when the override is
 * active. When the journey reaches "Admission confirmed" the advance
 * button flips to a disabled "Journey complete" state.
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
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-5 items-center rounded-[var(--radius-sm)] bg-[var(--color-background-muted)] px-2 text-[var(--text-2xs)] font-[var(--weight-bold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-secondary)]"
            >
              Demo
            </span>
            <h4 className="text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-primary)]">
              Operator progression
            </h4>
          </div>
          {isOverriding ? (
            <Badge tone="warning">Override active</Badge>
          ) : null}
        </header>

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

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {isComplete ? (
            <Button variant="secondary" size="sm" disabled>
              <span aria-hidden="true">✓</span> Journey complete
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleAdvance}>
              Advance to {nextStage ? STAGE_LABEL[nextStage] : "next stage"}
              <span aria-hidden="true">→</span>
            </Button>
          )}
          {isOverriding ? (
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-[var(--button-height-sm)] items-center rounded-[var(--radius-pill)] px-3 text-[var(--text-xs)] font-[var(--weight-semibold)] text-[var(--color-text-secondary)] transition-colors duration-150 ease-out hover:text-[var(--color-text-brand)] focus-visible:outline-none focus-visible:shadow-[var(--focus-ring)]"
            >
              Reset demo
            </button>
          ) : null}
          <span className="text-[var(--text-2xs)] text-[var(--color-text-tertiary)]">
            Progression is saved locally for this browser only.
          </span>
        </div>
      </section>

      <Modal
        open={pendingStage !== null && pendingCopy?.kind === "modal"}
        onClose={handleModalClose}
        tone="default"
        size="sm"
        title={pendingCopy?.title}
        caption={
          pendingStage
            ? `Next: ${STAGE_LABEL[pendingStage]}`
            : undefined
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
