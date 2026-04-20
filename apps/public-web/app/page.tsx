import { t } from "@hp-mis/i18n";
import { Button, Card, CardBody, CardTitle } from "@hp-mis/ui";

const highlights = [
  {
    title: "One identity across every college",
    body: "Register once and apply to every HP government degree and Sanskrit college — no duplicate forms.",
  },
  {
    title: "Combination-level preferences",
    body: "Rank BA combinations (History + Political Science, Economics + English…) the way colleges actually fill seats.",
  },
  {
    title: "Bilingual throughout",
    body: "Every field label, error message, and notification is available in English and Hindi.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[var(--color-background-brand-subtle)] to-[var(--color-background)]">
      <header className="border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Government of Himachal Pradesh
            </p>
            <p className="text-[var(--text-lg)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t("en", "app.name")}
            </p>
          </div>
          <nav className="flex items-center gap-3 text-[var(--text-sm)]">
            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              Important dates
            </a>
            <a href="#" className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              FAQs
            </a>
            <a
              href="http://localhost:3002"
              className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
            >
              {t("en", "landing.forAdmins")}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[var(--text-sm)] font-[var(--weight-medium)] uppercase tracking-wide text-[var(--color-text-brand)]">
              Admissions · Cycle 2026-27
            </p>
            <h1 className="mt-3 text-[var(--text-display)] font-[var(--weight-bold)] leading-[1.1] text-[var(--color-text-primary)]">
              {t("en", "landing.heading")}
            </h1>
            <p className="mt-4 max-w-xl text-[var(--text-lg)] text-[var(--color-text-secondary)]">
              {t("en", "landing.subheading")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button>{t("en", "landing.studentApp")}</Button>
              <Button variant="secondary">{t("en", "landing.openPortal")}</Button>
            </div>
            <p className="mt-4 text-[var(--text-sm)] text-[var(--color-text-tertiary)]">
              Students apply inside SwiftChat · Admin teams use the web portal
            </p>
          </div>

          <Card className="border-[var(--color-border-strong)] !p-6">
            <CardTitle>What changes this year</CardTitle>
            <CardBody>
              <ul className="mt-2 space-y-3 text-[var(--color-text-primary)]">
                <li>• State-wide merit instead of per-college lists</li>
                <li>• Combination-level seat matrix (BA, BSc, BCom…)</li>
                <li>• Three scrutiny outcomes — Accept, Conditional Accept, Reject</li>
                <li>• 42-head fee break-up visible before payment</li>
              </ul>
            </CardBody>
          </Card>
        </section>

        <section className="mt-20 grid gap-4 sm:grid-cols-3">
          {highlights.map((item) => (
            <Card key={item.title}>
              <CardTitle>{item.title}</CardTitle>
              <CardBody>{item.body}</CardBody>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        HP Higher Education Admission Platform · Demo build (V1 shell)
      </footer>
    </div>
  );
}
