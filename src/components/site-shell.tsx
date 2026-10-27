import { Link } from "@tanstack/react-router";
import { AlertTriangle, Gauge } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Dashboard" },
  { to: "/insights", label: "Story & Insights" },
  { to: "/about", label: "About" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <div className="border-b border-warning/30 bg-warning/10 px-4 py-2 text-center text-xs text-warning">
        <AlertTriangle className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" />
        Demo build — all figures are <strong>illustrative sample data</strong>, not official Formula 1 results.
      </div>
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Gauge className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-base font-bold uppercase tracking-wider">F1 Race Intelligence</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Telemetry analytics · demo</span>
            </span>
          </Link>
          <nav className="flex gap-1 rounded-lg border bg-card p-1">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-md px-3 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
                activeProps={{ className: "bg-primary text-primary-foreground hover:text-primary-foreground" }}
                activeOptions={{ exact: true }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="racing-stripe h-1 opacity-60" />
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-8">{children}</main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        F1 Race Intelligence · Student portfolio project · Sample data for demonstration only. Not affiliated with Formula 1.
      </footer>
    </div>
  );
}

export function Panel({ title, subtitle, children, action }: { title: string; subtitle?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-xl border bg-card/80 p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
            <span className="h-3.5 w-1 rounded bg-primary" />
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
