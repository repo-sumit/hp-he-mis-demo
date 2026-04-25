"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Checkbox } from "@hp-mis/ui";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

type Values = { email: string; mobile: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Values | "declaration", string>>;

/**
 * localStorage keys that get reset when a brand-new user registers.
 * Clearing them ensures the dashboard starts the journey at "Continue
 * profile" — without this the dashboard inherits demo state (forced
 * stage, prior submitted applications, allocations) from an earlier
 * session and incorrectly shows the new user as already at "submitted".
 */
const RESET_KEYS = [
  "hp-mis:applications",
  "hp-mis:student-demo-stage",
  "hp-mis:allocation",
  "hp-mis:merit",
  "hp-mis:scrutiny",
] as const;

export default function RegisterPage() {
  const { t } = useLocale();
  const [values, setValues] = useState<Values>({
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [accepted, setAccepted] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof Values>(key: K) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.email) next.email = t("error.required");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) next.email = t("error.invalidEmail");
    if (!values.mobile) next.mobile = t("error.required");
    else if (!/^[6-9]\d{9}$/.test(values.mobile.replace(/\s+/g, "")))
      next.mobile = t("error.invalidMobile");
    if (!values.password) next.password = t("error.required");
    else if (values.password.length < 6) next.password = t("error.passwordTooShort");
    if (!values.confirmPassword) next.confirmPassword = t("error.required");
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = t("error.passwordsDontMatch");
    if (!accepted) next.declaration = t("error.mustAcceptDeclaration");
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    // Reset persisted student state so the brand-new user starts at
    // "Continue profile" instead of inheriting an old demo session's
    // submitted / allotted state. We then seed a fresh profile draft
    // carrying just the email + mobile entered here so the journey has
    // a real starting point. A full-page navigation (vs router.push)
    // re-hydrates every provider from the cleared storage in one step.
    try {
      for (const key of RESET_KEYS) {
        window.localStorage.removeItem(key);
      }
      window.localStorage.setItem(
        "hp-mis:profile-draft",
        JSON.stringify({
          email: values.email.trim(),
          mobile: values.mobile.replace(/\s+/g, ""),
          claims: [],
        }),
      );
    } catch {
      /* ignore quota / private-mode errors — defaults take over */
    }
    window.location.href = "/dashboard";
  }

  return (
    <PageShell backHref="/" eyebrow={t("app.name")} title={t("screen.register.title")}>
     <div className="mx-auto w-full max-w-xl">
      <section>
        <p className="text-[var(--text-xxs)] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("screen.register.eyebrow")}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {t("screen.register.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)] sm:text-[var(--text-base)]">
          {t("screen.register.subtitle")}
        </p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          label={t("field.email.label")}
          helper={t("field.email.helper")}
          placeholder={t("field.email.placeholder")}
          value={values.email}
          onChange={update("email")}
          error={errors.email}
        />
        <Field
          name="mobile"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          label={t("field.mobile.label")}
          helper={t("field.mobile.helper")}
          placeholder={t("field.mobile.placeholder")}
          value={values.mobile}
          onChange={update("mobile")}
          error={errors.mobile}
        />
        <Field
          name="password"
          type="password"
          autoComplete="new-password"
          label={t("field.password.label")}
          helper={t("field.password.helper")}
          placeholder={t("field.password.placeholder")}
          value={values.password}
          onChange={update("password")}
          error={errors.password}
        />
        <Field
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          label={t("field.confirmPassword.label")}
          helper={t("field.confirmPassword.helper")}
          placeholder={t("field.confirmPassword.placeholder")}
          value={values.confirmPassword}
          onChange={update("confirmPassword")}
          error={errors.confirmPassword}
        />

        <div className="mt-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-4">
          <Checkbox
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            aria-describedby="declaration-error"
            label={t("screen.register.declaration")}
          />
        </div>
        {errors.declaration ? (
          <p
            id="declaration-error"
            className="text-[var(--text-xs)] text-[var(--color-text-danger)]"
          >
            ⚠ {errors.declaration}
          </p>
        ) : null}

        <div className="pt-2">
          <PrimaryButton type="submit">{t("cta.register")}</PrimaryButton>
        </div>

        <p className="pt-2 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("screen.register.haveAccount")}{" "}
          <Link
            href="/login"
            className="font-[var(--weight-semibold)] text-[var(--color-text-link)]"
          >
            {t("screen.register.loginLink")}
          </Link>
        </p>
      </form>
     </div>
    </PageShell>
  );
}
