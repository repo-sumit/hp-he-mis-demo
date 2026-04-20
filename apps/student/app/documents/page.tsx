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

  const checklist: ChecklistItem[] = useMemo(() => buildChecklist(draft), [draft]);

  const grouped = useMemo(() => {
    const action: ChecklistItem[] = [];
    const pending: ChecklistItem[] = [];
    const done: ChecklistItem[] = [];
    for (const item of checklist) {
      const entry = getEntry(item.rule.code);
      const target = bucketFor(entry.status);
      if (target === "action") action.push(item);
      else if (target === "pending") pending.push(item);
      else done.push(item);
    }
    return { action, pending, done };
  }, [checklist, getEntry]);

  const total = checklist.length;
  const uploaded = checklist.filter((i) => {
    const s = getEntry(i.rule.code).status;
    return s !== "not_uploaded";
  }).length;
  const verified = checklist.filter((i) => getEntry(i.rule.code).status === "verified").length;

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
              entry={getEntry(item.rule.code)}
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
              entry={getEntry(item.rule.code)}
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
              entry={getEntry(item.rule.code)}
            />
          ))
        ) : (
          <EmptyState icon="📄" body={t("document.checklist.emptyDone")} />
        )}
      </section>
    </PageShell>
  );
}
