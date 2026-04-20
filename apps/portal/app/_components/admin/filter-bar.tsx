"use client";

import { cn } from "@hp-mis/ui";
import type { AppBaseStatus } from "../data/mock-applications";

export interface QueueFilters {
  status: AppBaseStatus | "all";
  districtId: string | "all";
  collegeType: string | "all";
  collegeId: string | "all";
  courseId: string | "all";
  category: string | "all";
  discrepancyPending: boolean;
}

export const EMPTY_FILTERS: QueueFilters = {
  status: "all",
  districtId: "all",
  collegeType: "all",
  collegeId: "all",
  courseId: "all",
  category: "all",
  discrepancyPending: false,
};

interface Option {
  value: string;
  label: string;
}

interface Props {
  filters: QueueFilters;
  onChange: (next: QueueFilters) => void;
  search: string;
  onSearchChange: (next: string) => void;
  districtOptions?: Option[];
  typeOptions?: Option[];
  collegeOptions: Option[];
  courseOptions: Option[];
  categoryOptions: Option[];
  /** Hide the district + type filters (e.g. for single-college scopes). */
  hideScopeFilters?: boolean;
  className?: string;
}

const STATUS_OPTIONS: Option[] = [
  { value: "all", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_scrutiny", label: "Under scrutiny" },
  { value: "discrepancy_raised", label: "Discrepancy raised" },
  { value: "verified", label: "Verified" },
  { value: "conditional", label: "Conditional" },
  { value: "rejected", label: "Rejected" },
];

export function FilterBar({
  filters,
  onChange,
  search,
  onSearchChange,
  districtOptions = [],
  typeOptions = [],
  collegeOptions,
  courseOptions,
  categoryOptions,
  hideScopeFilters,
  className,
}: Props) {
  const update = <K extends keyof QueueFilters>(key: K, value: QueueFilters[K]) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <section
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search applications</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          >
            🔍
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search by application #, student, email, roll number…"
            className="h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] pl-9 pr-3 text-[var(--text-sm)] text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
          />
        </label>
        <label className="flex items-center gap-2 whitespace-nowrap rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-primary)]">
          <input
            type="checkbox"
            checked={filters.discrepancyPending}
            onChange={(event) => update("discrepancyPending", event.target.checked)}
            className="h-4 w-4 accent-[var(--color-interactive-brand)]"
          />
          Only discrepancy pending
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <SelectBox
          label="Status"
          value={filters.status}
          onChange={(v) => update("status", v as QueueFilters["status"])}
          options={STATUS_OPTIONS}
        />
        {!hideScopeFilters ? (
          <SelectBox
            label="District"
            value={filters.districtId}
            onChange={(v) => update("districtId", v)}
            options={[{ value: "all", label: "All districts" }, ...districtOptions]}
          />
        ) : null}
        {!hideScopeFilters ? (
          <SelectBox
            label="College type"
            value={filters.collegeType}
            onChange={(v) => update("collegeType", v)}
            options={[{ value: "all", label: "All types" }, ...typeOptions]}
          />
        ) : null}
        <SelectBox
          label="College"
          value={filters.collegeId}
          onChange={(v) => update("collegeId", v)}
          options={[{ value: "all", label: "All colleges" }, ...collegeOptions]}
        />
        <SelectBox
          label="Course"
          value={filters.courseId}
          onChange={(v) => update("courseId", v)}
          options={[{ value: "all", label: "All courses" }, ...courseOptions]}
        />
        <SelectBox
          label="Category"
          value={filters.category}
          onChange={(v) => update("category", v)}
          options={[{ value: "all", label: "All categories" }, ...categoryOptions]}
        />
      </div>
    </section>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
}) {
  return (
    <label className="flex flex-col gap-1 text-[var(--text-xs)] text-[var(--color-text-secondary)]">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-2 text-[var(--text-sm)] text-[var(--color-text-primary)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-border-focus)]/30"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
