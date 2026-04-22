"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Input, Select, cn } from "@hp-mis/ui";
import { PageShell } from "../_components/page-shell";
import { useLocale } from "../_components/locale-provider";
import { useProfile } from "../_components/profile/profile-provider";
import { EligibilityResultCard } from "../_components/discover/eligibility-result-card";
import { SummaryHeader } from "../_components/discover/summary-header";
import { CombinationsExplainer } from "../_components/discover/combinations-explainer";
import {
  EMPTY_FILTERS,
  FilterSheet,
  filtersAreEmpty,
  type Filters,
} from "../_components/discover/filter-sheet";
import { evaluateAll, hasEnoughProfile, type EligibilityResult } from "../_components/discover/evaluate";
import { getCollege, getCourse, mockDistanceKm } from "../_components/discover/mock-data";
import { HP_DISTRICTS } from "@hp-mis/fixtures";

type SortOption = "bestMatch" | "mostSeats";

const DISTANCE_BANDS: Record<string, number> = {
  within25: 25,
  within50: 50,
  within100: 100,
};

function applyFilters(
  results: EligibilityResult[],
  filters: Filters,
  studentDistrictName: string,
): EligibilityResult[] {
  const bandLimit = DISTANCE_BANDS[filters.distance];
  return results.filter((r) => {
    const college = getCollege(r.collegeId);
    if (!college) return false;
    if (filters.states.length > 0 && !filters.states.includes(r.state)) return false;
    if (filters.districts.length > 0 && !filters.districts.includes(college.district)) return false;
    if (filters.collegeIds.length > 0 && !filters.collegeIds.includes(r.collegeId)) return false;
    if (filters.courseIds.length > 0 && !filters.courseIds.includes(r.courseId)) return false;
    if (bandLimit != null) {
      if (mockDistanceKm(r.collegeId, studentDistrictName) > bandLimit) return false;
    }
    return true;
  });
}

function applySearch(results: EligibilityResult[], query: string): EligibilityResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return results;
  return results.filter((r) => {
    const college = getCollege(r.collegeId);
    const course = getCourse(r.courseId);
    const blob =
      `${college?.name ?? ""} ${college?.district ?? ""} ${course?.code ?? ""} ${course?.id ?? ""}`.toLowerCase();
    return blob.includes(q);
  });
}

function rankOf(state: EligibilityResult["state"]): number {
  if (state === "eligible") return 0;
  if (state === "conditional") return 1;
  return 2;
}

function sortResults(results: EligibilityResult[], sort: SortOption): EligibilityResult[] {
  const copy = [...results];
  if (sort === "mostSeats") {
    copy.sort((a, b) => b.offering.vacantSeats - a.offering.vacantSeats);
  } else {
    copy.sort((a, b) => {
      const byState = rankOf(a.state) - rankOf(b.state);
      if (byState !== 0) return byState;
      return b.offering.vacantSeats - a.offering.vacantSeats;
    });
  }
  return copy;
}

export default function DiscoverPage() {
  const { t } = useLocale();
  const { draft } = useProfile();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("bestMatch");
  const [sheetOpen, setSheetOpen] = useState(false);

  const ready = hasEnoughProfile(draft);

  const allResults = useMemo<EligibilityResult[]>(() => (ready ? evaluateAll(draft) : []), [
    draft,
    ready,
  ]);

  const studentDistrictName = useMemo(() => {
    const d = HP_DISTRICTS.find((d) => d.id === draft.district);
    return d?.name ?? "";
  }, [draft.district]);

  const filtered = useMemo(
    () =>
      sortResults(
        applySearch(applyFilters(allResults, filters, studentDistrictName), search),
        sort,
      ),
    [allResults, filters, search, sort, studentDistrictName],
  );

  const counts = useMemo(() => {
    let eligible = 0;
    let conditional = 0;
    let notEligible = 0;
    for (const r of allResults) {
      if (r.state === "eligible") eligible++;
      else if (r.state === "conditional") conditional++;
      else notEligible++;
    }
    return { total: allResults.length, eligible, conditional, notEligible };
  }, [allResults]);

  const activeFilterCount =
    filters.states.length +
    filters.districts.length +
    filters.collegeIds.length +
    filters.courseIds.length +
    (filters.distance !== "any" ? 1 : 0);

  if (!ready) {
    return (
      <PageShell
        eyebrow={t("discover.title")}
        title={t("app.name")}
        backHref="/dashboard"
        width="comfortable"
      >
        <section className="rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-8 text-center">
          <p aria-hidden="true" className="text-4xl">
            🧭
          </p>
          <h2 className="mt-3 text-[var(--text-xl)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("discover.empty.profileTitle")}
          </h2>
          <p className="mt-2 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {t("discover.empty.profileBody")}
          </p>
          <Link
            href="/profile/step/3"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-primary)] px-5 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-interactive-primary-hover)]"
          >
            {t("discover.empty.profileCta")}
          </Link>
        </section>
      </PageShell>
    );
  }


  return (
    <PageShell
      eyebrow={t("discover.title")}
      title={t("app.name")}
      backHref="/dashboard"
      width="wide"
    >
      <section>
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("discover.title")}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {t("discover.subtitle")}
        </h2>
      </section>

      <section className="mt-5">
        <SummaryHeader
          total={counts.total}
          eligible={counts.eligible}
          conditional={counts.conditional}
          notEligible={counts.notEligible}
        />
      </section>

      <section className="mt-5 space-y-2">
        <label className="sr-only" htmlFor="discover-search">
          {t("discover.searchPlaceholder")}
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]"
          >
            🔍
          </span>
          <Input
            id="discover-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("discover.searchPlaceholder")}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border px-3 text-[var(--text-sm)] font-[var(--weight-medium)]",
              activeFilterCount > 0
                ? "border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] text-[var(--color-text-brand)]"
                : "border-[var(--color-border-strong)] bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]",
            )}
          >
            <span aria-hidden="true">⚙</span>
            {t("cta.filter")}
            {activeFilterCount > 0 ? (
              <span
                aria-hidden="true"
                className="ml-1 rounded-[var(--radius-pill)] bg-[var(--color-interactive-primary)] px-1.5 text-[var(--text-xs)] text-[var(--color-text-on-brand)]"
              >
                {activeFilterCount}
              </span>
            ) : null}
          </button>
          <Select
            aria-label={t("discover.sort.label")}
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="min-w-[10rem]"
          >
            <option value="bestMatch">{t("discover.sort.bestMatch")}</option>
            <option value="mostSeats">{t("discover.sort.mostSeats")}</option>
          </Select>
        </div>
      </section>

      {filtered.some((r) => r.course.combinationBased) ? (
        <CombinationsExplainer className="mt-4" />
      ) : null}

      {filtered.length === 0 ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-5 text-center">
          <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("discover.empty.noMatches")}
          </p>
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY_FILTERS);
              setSearch("");
            }}
            className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
          >
            {t("discover.empty.noMatchesCta")}
          </button>
        </section>
      ) : null}

      {(() => {
        const eligible = filtered.filter((r) => r.state === "eligible");
        const conditional = filtered.filter((r) => r.state === "conditional");
        const notEligible = filtered.filter((r) => r.state === "not_eligible");
        return (
          <>
            {eligible.length > 0 ? (
              <Section
                title={t("discover.sections.eligible")}
                hint={t("discover.sections.eligibleHint")}
                tone="success"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {eligible.map((r) => (
                    <EligibilityResultCard key={r.id} result={r} />
                  ))}
                </div>
              </Section>
            ) : null}

            {conditional.length > 0 ? (
              <Section
                title={t("discover.sections.conditional")}
                hint={t("discover.sections.conditionalHint")}
                tone="warning"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {conditional.map((r) => (
                    <EligibilityResultCard key={r.id} result={r} />
                  ))}
                </div>
              </Section>
            ) : null}

            {notEligible.length > 0 ? (
              <Section
                title={t("discover.sections.notEligible")}
                hint={t("discover.sections.notEligibleHint")}
                tone="danger"
              >
                <div className="grid gap-3 md:grid-cols-2">
                  {notEligible.map((r) => (
                    <EligibilityResultCard key={r.id} result={r} />
                  ))}
                </div>
              </Section>
            ) : null}
          </>
        );
      })()}

      <FilterSheet
        open={sheetOpen}
        value={filters}
        onChange={setFilters}
        onClose={() => setSheetOpen(false)}
        onApply={() => setSheetOpen(false)}
        onClear={() => {
          setFilters(EMPTY_FILTERS);
          if (filtersAreEmpty(filters)) setSheetOpen(false);
        }}
      />
    </PageShell>
  );
}

function Section({
  title,
  hint,
  tone,
  children,
}: {
  title: string;
  hint: string;
  tone: "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const toneClass = {
    success: "text-[var(--color-status-success-fg)]",
    warning: "text-[var(--color-status-warning-fg)]",
    danger: "text-[var(--color-text-danger)]",
  }[tone];

  return (
    <section className="mt-6 space-y-3">
      <div>
        <h3
          className={cn(
            "text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide",
            toneClass,
          )}
        >
          {title}
        </h3>
        <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-secondary)]">{hint}</p>
      </div>
      {children}
    </section>
  );
}
