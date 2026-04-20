import { t } from "@hp-mis/i18n";
import { Card, CardBody, CardTitle } from "@hp-mis/ui";

const navItems = [
  { key: "overview", href: "/", icon: "📊" },
  { key: "applications", href: "/applications", icon: "📝" },
  { key: "colleges", href: "/colleges", icon: "🏛️" },
  { key: "courses", href: "/courses", icon: "📚" },
  { key: "seats", href: "/seats", icon: "🎫" },
  { key: "merit", href: "/merit", icon: "🏅" },
  { key: "allocation", href: "/allocation", icon: "🎯" },
  { key: "reports", href: "/reports", icon: "📈" },
  { key: "users", href: "/users", icon: "👥" },
  { key: "settings", href: "/settings", icon: "⚙️" },
] as const;

const kpis = [
  { label: "Active cycle", value: "2026-27" },
  { label: "Applications today", value: "—" },
  { label: "Scrutiny in queue", value: "—" },
  { label: "Seats configured", value: "—" },
];

export function PortalShell() {
  return (
    <div className="grid min-h-dvh grid-cols-[240px_1fr]">
      <aside className="flex flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="border-b border-[var(--color-border)] px-5 py-4">
          <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
            Admin portal
          </p>
          <p className="text-[var(--text-base)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
            {t("en", "app.name")}
          </p>
        </div>
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-1">
            {navItems.map((item, idx) => (
              <li key={item.key}>
                <a
                  href={item.href}
                  aria-current={idx === 0 ? "page" : undefined}
                  className={
                    idx === 0
                      ? "flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-background-brand-subtle)] px-3 py-2 text-[var(--text-sm)] font-[var(--weight-semibold)] text-[var(--color-text-brand)]"
                      : "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text-secondary)] hover:bg-[var(--color-background-subtle)]"
                  }
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{t("en", `portal.sidebar.${item.key}`)}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-[var(--color-border)] px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-tertiary)]">
          Demo build · V1 shell
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-3">
          <div>
            <p className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
              Cycle 2026-27 · Application window
            </p>
            <h1 className="text-[var(--text-xl)] font-[var(--weight-semibold)] text-[var(--color-text-primary)]">
              {t("en", "portal.dashboardTitle")}
            </h1>
          </div>
          <div className="flex items-center gap-3 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
            <span>State admin · demo@hp.gov.in</span>
          </div>
        </header>

        <main className="flex-1 space-y-6 px-6 py-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi) => (
              <Card key={kpi.label}>
                <div className="text-[var(--text-xs)] uppercase tracking-wide text-[var(--color-text-tertiary)]">
                  {kpi.label}
                </div>
                <div className="mt-2 text-[var(--text-3xl)] font-[var(--weight-bold)] text-[var(--color-text-primary)]">
                  {kpi.value}
                </div>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardTitle>Activity feed</CardTitle>
              <CardBody>
                Real-time scrutiny, merit, and allocation events will appear here once
                the mock API lands in Sprint 1.
              </CardBody>
            </Card>
            <Card>
              <CardTitle>Cycle phase</CardTitle>
              <CardBody>
                Toggle cycle phases from <strong>State admin → Cycle setup</strong>{" "}
                (coming soon). Currently parked at <em>Application Open — Day 3 of 10</em>.
              </CardBody>
            </Card>
          </section>
        </main>
      </div>
    </div>
  );
}
