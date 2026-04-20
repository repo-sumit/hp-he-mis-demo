"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";

type Values = { identifier: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [values, setValues] = useState<Values>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});

  function update<K extends keyof Values>(key: K) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.identifier) next.identifier = t("error.required");
    if (!values.password) next.password = t("error.required");
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length === 0) {
      router.push("/dashboard");
    }
  }

  return (
    <PageShell backHref="/" eyebrow={t("app.name")} title={t("screen.login.title")}>
      <section>
        <p className="text-[11px] font-[var(--weight-semibold)] uppercase tracking-[var(--tracking-wide)] text-[var(--color-text-tertiary)]">
          {t("screen.login.eyebrow")}
        </p>
        <h2 className="mt-2 text-[var(--text-2xl)] font-[var(--weight-bold)] leading-[var(--leading-tight)] tracking-[var(--tracking-tight)] text-[var(--color-text-primary)] sm:text-[var(--text-3xl)]">
          {t("screen.login.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)] sm:text-[var(--text-base)]">
          {t("screen.login.subtitle")}
        </p>
      </section>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4">
        <Field
          name="identifier"
          type="text"
          autoComplete="username"
          label={t("field.emailOrMobile.label")}
          helper={t("field.emailOrMobile.helper")}
          placeholder={t("field.emailOrMobile.placeholder")}
          value={values.identifier}
          onChange={update("identifier")}
          error={errors.identifier}
        />
        <Field
          name="password"
          type="password"
          autoComplete="current-password"
          label={t("field.password.label")}
          placeholder={t("field.password.placeholder")}
          value={values.password}
          onChange={update("password")}
          error={errors.password}
          adornment={
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-[var(--text-xs)] font-[var(--weight-medium)] text-[var(--color-text-link)]"
              >
                {t("screen.login.forgotPassword")}
              </Link>
            </div>
          }
        />

        <div className="pt-2">
          <PrimaryButton type="submit">{t("cta.login")}</PrimaryButton>
        </div>
      </form>

      <div
        className="my-6 flex items-center gap-3 text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]"
        role="separator"
      >
        <span className="h-px flex-1 bg-[var(--color-border)]" />
        <span>{t("screen.login.orDivider")}</span>
        <span className="h-px flex-1 bg-[var(--color-border)]" />
      </div>

      <div className="space-y-2">
        <PrimaryButton
          type="button"
          variant="secondary"
          onClick={() => router.push("/dashboard")}
        >
          {t("cta.loginWithOtp")}
        </PrimaryButton>
        <p className="text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          {t("screen.login.otpHelper")}
        </p>
      </div>

      <p className="mt-8 text-center text-[var(--text-sm)] text-[var(--color-text-secondary)]">
        {t("screen.login.newUser")}{" "}
        <Link
          href="/register"
          className="font-[var(--weight-semibold)] text-[var(--color-text-link)]"
        >
          {t("screen.login.registerLink")}
        </Link>
      </p>
    </PageShell>
  );
}
