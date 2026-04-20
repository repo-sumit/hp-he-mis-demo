"use client";

import Link from "next/link";
import { useState } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

/**
 * Pre-login merit lookup stub. Active only after the state publishes the
 * merit list for the cycle; until then it renders a clearly-labelled
 * "not open yet" state with the expected publication date.
 */
const MERIT_PUBLISHED = false;

export default function MeritLookupPage() {
  const { t } = useLocale();
  const [query, setQuery] = useState("");

  return (
    <PageShell
      backHref="/"
      eyebrow={t("screen.home.cycleTag")}
      title={t("preLogin.cards.meritLookup.title")}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] leading-tight text-[var(--color-text-primary)]">
          {t("preLogin.meritLookup.title")}
        </h2>
        <p className="mt-2 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("preLogin.meritLookup.subtitle")}
        </p>
      </section>

      <section className="mt-5 space-y-3">
        <Field
          name="meritQuery"
          label={t("preLogin.meritLookup.inputLabel")}
          placeholder={t("preLogin.meritLookup.inputPlaceholder")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          disabled={!MERIT_PUBLISHED}
        />
        <PrimaryButton
          type="button"
          disabled={!MERIT_PUBLISHED || !query.trim()}
          onClick={() => {
            /* merit engine lands in a later sprint — this page is a shell */
          }}
        >
          {t("preLogin.meritLookup.lookupCta")}
        </PrimaryButton>
      </section>

      {!MERIT_PUBLISHED ? (
        <section className="mt-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-background-subtle)] p-4">
          <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            <span aria-hidden="true" className="mr-1">📅</span>
            {t("preLogin.meritLookup.notPublishedTitle")}
          </p>
          <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            {t("preLogin.meritLookup.notPublishedBody")}
          </p>
        </section>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="/dates"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)]"
        >
          {t("preLogin.cards.dates.title")}
        </Link>
        <Link
          href="/"
          className="text-center text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
        >
          {t("preLogin.meritLookup.backHint")}
        </Link>
      </div>
    </PageShell>
  );
}
