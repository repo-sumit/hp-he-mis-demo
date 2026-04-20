"use client";

import Link from "next/link";
import { PageShell } from "../_components/page-shell";
import { BottomTabBar } from "../_components/bottom-tab-bar";
import { useLocale } from "../_components/locale-provider";

type Faq = { q: string; a: string };

const FAQ_KEYS: Array<{ qKey: string; aKey: string }> = [
  { qKey: "help.faqs.q1", aKey: "help.faqs.a1" },
  { qKey: "help.faqs.q2", aKey: "help.faqs.a2" },
  { qKey: "help.faqs.q3", aKey: "help.faqs.a3" },
  { qKey: "help.faqs.q4", aKey: "help.faqs.a4" },
];

export default function HelpPage() {
  const { t } = useLocale();

  const faqs: Faq[] = FAQ_KEYS.map(({ qKey, aKey }) => ({
    q: t(qKey),
    a: t(aKey),
  }));

  return (
    <PageShell
      eyebrow={t("nav.help")}
      title={t("app.name")}
      backHref="/dashboard"
      footer={<BottomTabBar />}
    >
      <section>
        <h2 className="text-[var(--text-xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
          {t("help.title")}
        </h2>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("help.subtitle")}
        </p>
      </section>

      <section className="mt-5">
        <h3 className="mb-2 text-[var(--text-sm)] font-[var(--weight-semibold)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
          {t("help.faqTitle")}
        </h3>
        <ul className="space-y-2">
          {faqs.map((faq, idx) => (
            <li
              key={idx}
              className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
            >
              <details>
                <summary className="cursor-pointer list-none text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {faq.q}
                </summary>
                <p className="mt-2 text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                  {faq.a}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-background-brand-subtle)] p-4">
        <h3 className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
          {t("help.contactTitle")}
        </h3>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          {t("help.contactBody")}
        </p>
        <dl className="mt-3 space-y-2 text-[var(--text-sm)]">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-text-tertiary)]">
              {t("help.helplineLabel")}
            </dt>
            <dd className="font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              <a href={`tel:${t("help.helplineNumber").replace(/\s|-/g, "")}`}>
                {t("help.helplineNumber")}
              </a>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-text-tertiary)]">
              {t("help.emailLabel")}
            </dt>
            <dd className="break-all font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              <a href={`mailto:${t("help.emailAddress")}`}>
                {t("help.emailAddress")}
              </a>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[var(--color-text-tertiary)]">
              {t("help.officeLabel")}
            </dt>
            <dd className="text-right text-[var(--color-text-primary)]">
              {t("help.officeAddress")}
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 pb-4 text-center">
        <Link
          href="/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-4 text-[var(--text-sm)] font-[var(--weight-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
        >
          {t("common.backToHome")}
        </Link>
      </section>
    </PageShell>
  );
}
