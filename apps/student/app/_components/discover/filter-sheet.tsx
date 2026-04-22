"use client";

import { useEffect } from "react";
import { cn } from "@hp-mis/ui";
import { useLocale } from "../locale-provider";
import type { EligibilityState } from "./evaluate";
import { COURSES, uniqueDistricts } from "./mock-data";

export type DistanceBand = "any" | "within25" | "within50" | "within100";

export interface Filters {
  states: EligibilityState[];
  districts: string[];
  collegeIds: string[];
  courseIds: string[];
  distance: DistanceBand;
}

export const EMPTY_FILTERS: Filters = {
  states: [],
  districts: [],
  collegeIds: [],
  courseIds: [],
  distance: "any",
};

export function filtersAreEmpty(f: Filters): boolean {
  return (
    f.states.length === 0 &&
    f.districts.length === 0 &&
    f.collegeIds.length === 0 &&
    f.courseIds.length === 0 &&
    f.distance === "any"
  );
}

const DISTANCE_OPTIONS: { value: DistanceBand; key: string }[] = [
  { value: "within25", key: "discover.filter.distance.within25" },
  { value: "within50", key: "discover.filter.distance.within50" },
  { value: "within100", key: "discover.filter.distance.within100" },
];

interface Props {
  open: boolean;
  value: Filters;
  onChange: (next: Filters) => void;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
}

const STATE_OPTIONS: { value: EligibilityState; key: string }[] = [
  { value: "eligible", key: "discover.state.eligible" },
  { value: "conditional", key: "discover.state.conditional" },
  { value: "not_eligible", key: "discover.state.notEligible" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

/**
 * Bottom-sheet filter UI used on /discover. Four sections: eligibility state,
 * district, college, course. "Apply" just closes the sheet — changes are
 * passed through `onChange` live so the underlying list updates immediately.
 */
export function FilterSheet({ open, value, onChange, onClose, onApply, onClear }: Props) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    // Lock background scroll while the sheet is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const districts = uniqueDistricts();

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 flex flex-col transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      )}
    >
      <button
        type="button"
        aria-label={t("cta.close")}
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("discover.filter.title")}
        className={cn(
          "relative mt-auto flex max-h-[85dvh] w-full max-w-[var(--mobile-max)] flex-col self-center rounded-t-[var(--radius-xl)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] transition-transform duration-200",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
          <h2 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("discover.filter.title")}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("cta.close")}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <Section title={t("discover.filter.state")}>
            {STATE_OPTIONS.map((opt) => (
              <ChipOption
                key={opt.value}
                active={value.states.includes(opt.value)}
                label={t(opt.key)}
                onToggle={() => onChange({ ...value, states: toggle(value.states, opt.value) })}
              />
            ))}
          </Section>

          <Section title={t("discover.filter.distanceTitle")}>
            <p className="mb-2 w-full text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
              {t("discover.filter.distanceHint")}
            </p>
            <ChipOption
              active={value.distance === "any"}
              label={t("discover.filter.distance.any")}
              onToggle={() => onChange({ ...value, distance: "any" })}
            />
            {DISTANCE_OPTIONS.map((opt) => (
              <ChipOption
                key={opt.value}
                active={value.distance === opt.value}
                label={t(opt.key)}
                onToggle={() => onChange({ ...value, distance: opt.value })}
              />
            ))}
          </Section>

          <Section title={t("discover.filter.district")}>
            {districts.map((d) => (
              <ChipOption
                key={d}
                active={value.districts.includes(d)}
                label={d}
                onToggle={() => onChange({ ...value, districts: toggle(value.districts, d) })}
              />
            ))}
          </Section>

          <Section title={t("discover.filter.course")}>
            {COURSES.map((c) => (
              <ChipOption
                key={c.id}
                active={value.courseIds.includes(c.id)}
                label={`${c.code} · ${t(c.nameKey)}`}
                onToggle={() => onChange({ ...value, courseIds: toggle(value.courseIds, c.id) })}
              />
            ))}
          </Section>
        </div>

        <footer className="flex items-center gap-2 border-t border-[var(--color-border)] px-4 py-3">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
          >
            {t("cta.clearAll")}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="inline-flex h-11 flex-[2] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            {t("cta.apply")}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="mb-2 text-[var(--text-xs)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
        {title}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </section>
  );
}

function ChipOption({
  active,
  label,
  onToggle,
}: {
  active: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={cn(
        "rounded-[var(--radius-pill)] border px-3 py-1.5 text-[var(--text-sm)]",
        active
          ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
          : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
      )}
    >
      {label}
    </button>
  );
}
