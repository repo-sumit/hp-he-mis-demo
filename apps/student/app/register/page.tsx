"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

type Values = { email: string; mobile: string; password: string; confirmPassword: string };
type Errors = Partial<Record<keyof Values | "declaration", string>>;

export default function RegisterPage() {
  const router = useRouter();
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
    if (Object.keys(next).length === 0) {
      // No backend yet — move to dashboard shell for the demo.
      router.push("/dashboard");
    }
  }

  return (
    <PageShell backHref="/" eyebrow={t("app.name")} title={t("screen.register.title")}>
      <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("screen.register.subtitle")}
      </p>

      <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
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

        <label className="mt-2 flex cursor-pointer items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-subtle)] p-3">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-1 h-5 w-5 flex-none accent-[var(--color-interactive-brand)]"
            aria-describedby="declaration-error"
          />
          <span className="text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-primary)]">
            {t("screen.register.declaration")}
          </span>
        </label>
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
    </PageShell>
  );
}
