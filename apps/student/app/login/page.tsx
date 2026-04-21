"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { PageShell } from "../_components/page-shell";
import { Field } from "../_components/field";
import { PrimaryButton } from "../_components/primary-button";
import { useLocale } from "../_components/locale-provider";
import { useProfile } from "../_components/profile/profile-provider";

type Values = { identifier: string; password: string };
type Errors = Partial<Record<keyof Values, string>>;

type OtpStage = "enterId" | "enterOtp" | "success";
type OtpErrors = { identifier?: string; otp?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

// Demo-only "registered" identifiers. Any real email/phone shape is accepted
// in the mock flow, but these ensure the happy path recognises the Asha-style
// demo login without needing a real backend.
const REGISTERED_IDENTIFIERS = new Set([
  "asha.sharma@example.com",
  "demo.student@example.com",
  "9876543210",
]);

function classifyIdentifier(input: string): "email" | "mobile" | null {
  const trimmed = input.trim();
  if (EMAIL_RE.test(trimmed)) return "email";
  if (MOBILE_RE.test(trimmed.replace(/\s+/g, ""))) return "mobile";
  return null;
}

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const { update: updateProfile } = useProfile();
  const [values, setValues] = useState<Values>({ identifier: "", password: "" });
  const [errors, setErrors] = useState<Errors>({});

  /**
   * Login is an authoritative identity moment — sync whichever identifier
   * the student logged in with into the profile draft so the review / edit
   * screens never show "email not provided" for a session that clearly
   * logged in via email. Mobile-only logins sync mobile; email logins sync
   * email. Previous draft fields for the other channel are left as-is.
   */
  function syncIdentifierToProfile(identifier: string) {
    const channel = classifyIdentifier(identifier);
    if (channel === "email") updateProfile("email", identifier.trim());
    else if (channel === "mobile") {
      updateProfile("mobile", identifier.replace(/\s+/g, ""));
    }
  }

  // OTP sub-flow state. Lives on this page so the user never leaves the login
  // context. On success the user is sent to the dashboard just like the
  // password flow.
  const [otpStage, setOtpStage] = useState<OtpStage>("enterId");
  const [otpIdentifier, setOtpIdentifier] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpErrors, setOtpErrors] = useState<OtpErrors>({});
  const otpChannel = useMemo(() => classifyIdentifier(otpIdentifier), [otpIdentifier]);

  function update<K extends keyof Values>(key: K) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }));
    };
  }

  function validate(): Errors {
    const next: Errors = {};
    if (!values.identifier) {
      next.identifier = t("error.required");
    } else if (!classifyIdentifier(values.identifier)) {
      next.identifier = t("error.invalidEmailOrMobile");
    }
    if (!values.password) next.password = t("error.required");
    return next;
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    syncIdentifierToProfile(values.identifier);
    router.push("/dashboard");
  }

  function handleSendOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const channel = classifyIdentifier(otpIdentifier);
    if (!channel) {
      setOtpErrors({ identifier: t("error.invalidEmailOrMobile") });
      return;
    }
    const normalised = otpIdentifier.trim().toLowerCase();
    const numeric = otpIdentifier.replace(/\s+/g, "");
    if (
      !REGISTERED_IDENTIFIERS.has(normalised) &&
      !REGISTERED_IDENTIFIERS.has(numeric)
    ) {
      setOtpErrors({ identifier: t("screen.login.otp.notFound") });
      return;
    }
    setOtpErrors({});
    setOtpStage("enterOtp");
  }

  function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otpValue)) {
      setOtpErrors({ otp: t("screen.login.otp.invalid") });
      return;
    }
    setOtpErrors({});
    syncIdentifierToProfile(otpIdentifier);
    setOtpStage("success");
    // Small delay so the success card is visible, then route to dashboard.
    window.setTimeout(() => router.push("/dashboard"), 900);
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

      <section
        aria-labelledby="otp-heading"
        className="rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] bg-[var(--color-surface)] p-5"
      >
        <h3
          id="otp-heading"
          className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]"
        >
          {t("cta.loginWithOtp")}
        </h3>
        <p className="mt-1 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
          {t("screen.login.otp.intro")}
        </p>

        {otpStage === "enterId" ? (
          <form onSubmit={handleSendOtp} noValidate className="mt-4 space-y-4">
            <Field
              name="otpIdentifier"
              type="text"
              inputMode="email"
              autoComplete="username"
              label={t("screen.login.otp.identifierLabel")}
              helper={t("screen.login.otp.identifierHelper")}
              placeholder={t("screen.login.otp.identifierPlaceholder")}
              value={otpIdentifier}
              onChange={(event) => setOtpIdentifier(event.target.value)}
              error={otpErrors.identifier}
            />
            <PrimaryButton type="submit" variant="secondary">
              {t("screen.login.otp.sendCta")}
            </PrimaryButton>
          </form>
        ) : null}

        {otpStage === "enterOtp" ? (
          <form onSubmit={handleVerifyOtp} noValidate className="mt-4 space-y-4">
            <p className="rounded-[var(--radius-md)] bg-[var(--color-background-brand-softer)] px-3 py-2 text-[var(--text-xs)] text-[var(--color-text-brand)]">
              {t(
                otpChannel === "email"
                  ? "screen.login.otp.sentToEmail"
                  : "screen.login.otp.sentToMobile",
                { identifier: otpIdentifier },
              )}
            </p>
            <Field
              name="otpValue"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              label={t("screen.login.otp.codeLabel")}
              helper={t("screen.login.otp.codeHelper")}
              placeholder="123456"
              value={otpValue}
              onChange={(event) =>
                setOtpValue(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              error={otpErrors.otp}
            />
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setOtpStage("enterId");
                  setOtpValue("");
                  setOtpErrors({});
                }}
                className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
              >
                {t("screen.login.otp.change")}
              </button>
              <PrimaryButton type="submit" className="!flex-1">
                {t("screen.login.otp.verifyCta")}
              </PrimaryButton>
            </div>
          </form>
        ) : null}

        {otpStage === "success" ? (
          <div
            role="status"
            className="mt-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-interactive-success)] bg-[var(--color-status-success-bg)] p-4 text-[var(--text-sm)] text-[var(--color-status-success-fg)]"
          >
            <span aria-hidden="true" className="text-lg leading-none">
              ✓
            </span>
            <div>
              <p className="font-[var(--weight-semibold)]">
                {t("screen.login.otp.successTitle")}
              </p>
              <p className="mt-0.5 text-[var(--text-xs)]">
                {t("screen.login.otp.successBody")}
              </p>
            </div>
          </div>
        ) : null}
      </section>

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
