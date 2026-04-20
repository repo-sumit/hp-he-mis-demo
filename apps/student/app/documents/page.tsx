"use client";

import { useMemo } from "react";
import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { useLocale } from "../_components/locale-provider";
import { useProfile } from "../_components/profile/profile-provider";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { DocumentChecklistItem } from "../_components/documents/document-checklist-item";
import { EmptyState } from "../_components/documents/empty-state";
import { buildChecklist, type ChecklistItem } from "../_components/documents/document-rules";
import {
  useDocuments,
  type DocumentEntry,
} from "../_components/documents/documents-provider";
import { useApplications } from "../_components/apply/applications-provider";
import { useScrutinyBridge } from "../_components/scrutiny-bridge/scrutiny-bridge-provider";
import { resolveEffectiveDoc } from "../_components/scrutiny-bridge/effective-doc";

type Bucket = "action" | "pending" | "done";

function bucketFor(status: DocumentEntry["status"]): Bucket {
  if (status === "rejected" || status === "re_upload_required") return "action";
  if (status === "verified" || status === "uploaded" || status === "under_review") return "done";
  return "pending";
}

export default function DocumentsPage() {
  const { t } = useLocale();
  const { draft } = useProfile();
  const { getEntry, documents } = useDocuments();
  const { submittedCourseIds, applications } = useApplications();
  const bridge = useScrutinyBridge();

  // The student can only have discrepancies on a submitted application. If
  // there are several, merge all doc-scoped discrepancies into one lookup.
  const docDiscrepancyByCode = useMemo(() => {
    const map: Record<string, ReturnType<typeof bridge.byDocCode>[number][]> = {};
    for (const cid of submittedCourseIds()) {
      const app = applications[cid];
      if (!app?.applicationNumber) continue;
      for (const disc of bridge.byApplication(app.applicationNumber)) {
        if (disc.scope !== "document" || !disc.targetRef) continue;
        (map[disc.targetRef] = map[disc.targetRef] ?? []).push(disc);
      }
    }
    return map;
  }, [bridge, applications, submittedCourseIds]);

  const checklist: ChecklistItem[] = useMemo(() => buildChecklist(draft), [draft]);

  const effectiveEntries = useMemo(() => {
    const map: Record<string, DocumentEntry> = {};
    for (const item of checklist) {
      const base = getEntry(item.rule.code);
      const discs = docDiscrepancyByCode[item.rule.code] ?? [];
      const effective = resolveEffectiveDoc(base, discs);
      map[item.rule.code] = {
        ...base,
        status: effective.status,
        rejectionReason: effective.rejectionReason,
      };
    }
    return map;
  }, [checklist, getEntry, docDiscrepancyByCode]);

  const grouped = useMemo(() => {
    const action: ChecklistItem[] = [];
    const pending: ChecklistItem[] = [];
    const done: ChecklistItem[] = [];
    for (const item of checklist) {
      const entry = effectiveEntries[item.rule.code] ?? getEntry(item.rule.code);
      const target = bucketFor(entry.status);
      if (target === "action") action.push(item);
      else if (target === "pending") pending.push(item);
      else done.push(item);
    }
    return { action, pending, done };
  }, [checklist, effectiveEntries, getEntry]);

  const total = checklist.length;
  const uploaded = checklist.filter((i) => {
    const s = (effectiveEntries[i.rule.code] ?? getEntry(i.rule.code)).status;
    return s !== "not_uploaded";
  }).length;
  const verified = checklist.filter(
    (i) => (effectiveEntries[i.rule.code] ?? getEntry(i.rule.code)).status === "verified",
  ).length;

  const profileIncomplete = !draft.fullName || !draft.category;
  // Avoid "unused locals" warning when documents map isn't read directly.
  void documents;

  return (
    <PageShell
      eyebrow={t("document.checklist.title")}
      title={t("app.name")}
      backHref="/dashboard"
      footer={<BottomTabBar />}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("document.checklist.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("document.checklist.subtitle")}
        </p>
      </section>

      <section className="mt-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("document.checklist.summary", { done: uploaded, total, verified })}
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-[var(--radius-pill)] bg-[var(--color-background-muted)]">
          <div
            style={{ width: total ? `${Math.round((uploaded / total) * 100)}%` : "0%" }}
            className="h-full bg-[var(--color-interactive-brand)] transition-[width] duration-300"
          />
        </div>
      </section>

      {profileIncomplete ? (
        <EmptyState
          className="mt-4"
          icon="👤"
          body={t("document.checklist.profileHint")}
          action={
            <Link
              href="/profile/step/1"
              className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)]"
            >
              {t("screen.dashboard.nextActionCta")}
            </Link>
          }
        />
      ) : null}

      {grouped.action.length > 0 ? (
        <section className="mt-6 space-y-3">
          <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-danger)]">
            {t("document.checklist.sections.actionNeeded")}
          </h3>
          {grouped.action.map((item) => (
            <DocumentChecklistItem
              key={item.rule.code}
              item={item}
              entry={effectiveEntries[item.rule.code] ?? getEntry(item.rule.code)}
            />
          ))}
        </section>
      ) : null}

      <section className="mt-6 space-y-3">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("document.checklist.sections.pending")}
        </h3>
        {grouped.pending.length > 0 ? (
          grouped.pending.map((item) => (
            <DocumentChecklistItem
              key={item.rule.code}
              item={item}
              entry={effectiveEntries[item.rule.code] ?? getEntry(item.rule.code)}
            />
          ))
        ) : (
          <EmptyState
            icon="🎉"
            tone="success"
            body={t("document.checklist.emptyPending")}
          />
        )}
      </section>

      <section className="mt-6 space-y-3 pb-4">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("document.checklist.sections.done")}
        </h3>
        {grouped.done.length > 0 ? (
          grouped.done.map((item) => (
            <DocumentChecklistItem
              key={item.rule.code}
              item={item}
              entry={effectiveEntries[item.rule.code] ?? getEntry(item.rule.code)}
            />
          ))
        ) : (
          <EmptyState icon="📄" body={t("document.checklist.emptyDone")} />
        )}
      </section>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-brand-subtle)] p-4">
        <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("discover.title")}
        </p>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("discover.subtitle")}
        </p>
        <Link
          href="/discover"
          className="mt-3 inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
        >
          {t("cta.exploreCourses")}
        </Link>
      </section>
    </PageShell>
  );
}
