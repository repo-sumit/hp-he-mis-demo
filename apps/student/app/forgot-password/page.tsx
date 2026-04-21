"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [identifier, setIdentifier] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | undefined>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!identifier) {
      setError(t("error.required"));
      return;
    }
    setError(undefined);
    setSubmitted(true);
  }

  return (
    <PageShell backHref="/login" eyebrow={t("app.name")} title={t("screen.forgot.title")}>
     <div className="mx-auto w-full max-w-xl">
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("screen.forgot.subtitle")}
      </p>

      {submitted ? (
        <div className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border-brand)] bg-[var(--color-background-brand-subtle)] p-4">
          <p className="text-[var(--text-sm)] text-[var(--color-text-primary)]">
            <span aria-hidden="true" className="mr-1">
              ✓
            </span>
            {t("screen.forgot.confirmation")}
          </p>
          <div className="mt-4">
            <Link
              href="/login"
              className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
            >
              {t("cta.backToLogin")}
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          <Field
            name="identifier"
            type="text"
            autoComplete="username"
            label={t("field.emailOrMobile.label")}
            helper={t("field.emailOrMobile.helper")}
            placeholder={t("field.emailOrMobile.placeholder")}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            error={error}
          />
          <div className="pt-2">
            <PrimaryButton type="submit">{t("cta.sendResetLink")}</PrimaryButton>
          </div>
          <p className="text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            <Link
              href="/login"
              className="font-[var(--weight-semibold)] text-[var(--color-text-link)]"
            >
              {t("cta.backToLogin")}
            </Link>
          </p>
        </form>
      )}
     </div>
    </PageShell>
  );
}
