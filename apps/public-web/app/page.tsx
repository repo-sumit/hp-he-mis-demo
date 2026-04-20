import { t } from "@hp-mis/i18n";
import { Card, CardBody, CardTitle } from "@hp-mis/ui";

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Register once",
    body: "Email + mobile, OTP verification. Your identity works across every HP government college.",
  },
  {
    step: "2",
    title: "Build your profile",
    body: "Five guided steps — personal, address, Class 12, claims, bank. We save as you go.",
  },
  {
    step: "3",
    title: "Pick eligible courses",
    body: "See only what you qualify for. BA is combination-based; BSc/BCom are college-based.",
  },
  {
    step: "4",
    title: "Apply, track, confirm",
    body: "Rank preferences, pay the application fee, and track scrutiny right from your phone.",
  },
];

const IMPORTANT_DATES = [
  { label: "Registration opens", date: "Sunday, 15 June 2026" },
  { label: "Applications close", date: "Wednesday, 24 June 2026, 5:00 PM" },
  { label: "Merit list publishes", date: "Friday, 26 June 2026" },
  { label: "First allotment round", date: "Monday, 29 June 2026" },
];

const WHO_SHOULD_APPLY = [
  {
    title: "HPBOSE / CBSE / ICSE / NIOS pass-outs",
    body: "Any recognised board. Compartment students must clear before admission.",
  },
  {
    title: "Class 12 of 2024 or 2025",
    body: "Gap year applicants are welcome — upload a notarised affidavit at the documents step.",
  },
  {
    title: "HP domicile for state quota",
    body: "Students from outside HP can still apply under the all-India seats (25% in most colleges).",
  },
  {
    title: "SC / ST / OBC / EWS / PwD claims",
    body: "Hold a valid certificate issued by the Tehsildar or SDM. Single Girl Child qualifies for a supernumerary seat.",
  },
];

const HIGHLIGHTS = [
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
  // Resolve sibling app URLs from env so the landing page isn't hard-pinned
  // to localhost ports. Defaults match the dev setup in package.json scripts.
  const studentAppUrl = process.env.NEXT_PUBLIC_STUDENT_APP_URL ?? "http://localhost:3001";
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL ?? "http://localhost:3002";

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
            <a
              href="#how-it-works"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              How it works
            </a>
            <a
              href="#important-dates"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Important dates
            </a>
            <a
              href="#who-should-apply"
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              Who should apply
            </a>
            <a
              href={portalUrl}
              className="rounded-[var(--radius-md)] border border-[var(--color-border-strong)] px-3 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
            >
              {t("en", "landing.forAdmins")}
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-16">
        {/* Hero — primary CTA routes students into SwiftChat; secondary goes
            into the admin portal for college/state users. */}
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
              <a
                href={studentAppUrl}
                className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-interactive-brand)] px-6 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-[var(--color-interactive-brand-hover)]"
              >
                <span aria-hidden="true" className="mr-1">💬</span>
                {t("en", "landing.studentApp")}
              </a>
              <a
                href="#important-dates"
                className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-6 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)] hover:bg-[var(--color-background-subtle)]"
              >
                See important dates
              </a>
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

        {/* How it works — four numbered steps, keep copy tight. */}
        <section id="how-it-works" className="mt-20 scroll-mt-20">
          <div className="max-w-2xl">
            <p className="text-[var(--text-sm)] font-[var(--weight-medium)] uppercase tracking-wide text-[var(--color-text-brand)]">
              How it works
            </p>
            <h2 className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              Four steps from profile to seat
            </h2>
            <p className="mt-2 text-[var(--text-base)] text-[var(--color-text-secondary)]">
              The whole flow fits in your phone. No paper, no visits to the college before allotment.
            </p>
          </div>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {HOW_IT_WORKS.map((step) => (
              <li
                key={step.step}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-brand)] text-[var(--text-sm)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]"
                >
                  {step.step}
                </span>
                <h3 className="mt-3 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Important dates — dated rows in a single card so the whole cycle
            is visible without a table. */}
        <section id="important-dates" className="mt-16 scroll-mt-20">
          <div className="max-w-2xl">
            <p className="text-[var(--text-sm)] font-[var(--weight-medium)] uppercase tracking-wide text-[var(--color-text-brand)]">
              Important dates
            </p>
            <h2 className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              Cycle 2026-27 at a glance
            </h2>
            <p className="mt-2 text-[var(--text-base)] text-[var(--color-text-secondary)]">
              Dates are indicative and get confirmed once the Department of Higher Education publishes the official circular.
            </p>
          </div>
          <ul className="mt-8 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            {IMPORTANT_DATES.map((item) => (
              <li
                key={item.label}
                className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                  {item.label}
                </p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                  {item.date}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Who should apply — eligibility criteria. */}
        <section id="who-should-apply" className="mt-16 scroll-mt-20">
          <div className="max-w-2xl">
            <p className="text-[var(--text-sm)] font-[var(--weight-medium)] uppercase tracking-wide text-[var(--color-text-brand)]">
              Who should apply
            </p>
            <h2 className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
              If any of this sounds like you, you can apply
            </h2>
            <p className="mt-2 text-[var(--text-base)] text-[var(--color-text-secondary)]">
              You don't need to know anything about the portal upfront — the profile builder walks you through every rule.
            </p>
          </div>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {WHO_SHOULD_APPLY.map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-interactive-success)] text-[var(--text-xs)] font-[var(--weight-bold)] text-[var(--color-text-inverse)]"
                >
                  ✓
                </span>
                <div>
                  <h3 className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16 grid gap-4 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <Card key={item.title}>
              <CardTitle>{item.title}</CardTitle>
              <CardBody>{item.body}</CardBody>
            </Card>
          ))}
        </section>

        {/* Closing CTA — single clear action so the page doesn't just trail
            off after the highlights row. */}
        <section className="mt-16 rounded-[var(--radius-xl)] bg-[var(--color-interactive-brand)] px-8 py-10 text-center text-[var(--color-text-inverse)]">
          <h2 className="text-[var(--text-3xl)] font-[var(--weight-bold)]">
            Ready to apply for 2026-27?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[var(--text-base)] opacity-90">
            Takes about 20 minutes end-to-end. Save any time, come back on any device.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={studentAppUrl}
              className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface)] px-6 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-brand)] hover:bg-[var(--color-background-subtle)]"
            >
              <span aria-hidden="true" className="mr-1">💬</span>
              {t("en", "landing.studentApp")}
            </a>
            <a
              href="#important-dates"
              className="inline-flex h-[var(--button-height)] items-center justify-center rounded-[var(--radius-md)] border border-white/30 px-6 text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-inverse)] hover:bg-white/10"
            >
              See the dates first
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--color-border)] py-6 text-center text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
        HP Higher Education Admission Platform · Demo build (V1 shell)
      </footer>
    </div>
  );
}
