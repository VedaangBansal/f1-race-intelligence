import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Panel } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { RESULTS, downloadCSV } from "@/lib/f1-data";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & Methodology · F1 Race Intelligence" },
      { name: "description", content: "Project README, sample-data disclaimer, methodology and tech stack for the F1 Race Intelligence dashboard." },
      { property: "og:title", content: "F1 Race Intelligence — About & Methodology" },
      { property: "og:description", content: "How the F1 Race Intelligence portfolio dashboard was built and how its sample data works." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">README</p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-tight md:text-4xl">About this project</h1>
        <p className="mt-2 text-muted-foreground">
          F1 Race Intelligence is a student portfolio project demonstrating interactive sports analytics, data visualisation and
          stakeholder-focused storytelling in a modern web dashboard.
        </p>
      </div>

      <div className="rounded-xl border border-warning/40 bg-warning/10 p-5">
        <h2 className="font-bold uppercase tracking-wider text-warning">Sample-data disclaimer</h2>
        <p className="mt-2 text-sm">
          Every number in this app is <strong>illustrative, synthetic demo data</strong>. It is generated deterministically in the browser
          to resemble realistic race results and is <strong>not</strong> the original 6,464-record dataset referenced in the brief, nor any
          official Formula 1 data. Driver and team names are used for context only. This project is not affiliated with Formula 1.
        </p>
      </div>

      <Panel title="Methodology">
        <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
          <li><span className="text-foreground">Scope:</span> 4 seasons (2021–2024) × 21 rounds × 12 drivers from 6 teams = {RESULTS.length.toLocaleString()} sample entries.</li>
          <li><span className="text-foreground">Generation:</span> a seeded random generator combines a team strength score, a per-season bias (to model eras) and race-day noise to rank drivers.</li>
          <li><span className="text-foreground">Points:</span> standard 25-18-15-12-10-8-6-4-2-1 for P1–P10; no fastest-lap or sprint points.</li>
          <li><span className="text-foreground">Reliability:</span> ~7% of entries retire, assigned to Engine, Brakes, Collision, Mechanical or Other.</li>
          <li><span className="text-foreground">Tyres:</span> start compound sampled per entry; Intermediates appear only at street circuits to mimic changeable conditions.</li>
          <li><span className="text-foreground">Historical context charts</span> (host countries, talent pool) use hand-entered illustrative values.</li>
          <li><span className="text-foreground">Limitations:</span> no pit-stop timing, weather or lap-level telemetry; insights describe the sample only.</li>
        </ul>
      </Panel>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Features">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>KPI overview with season & team filters</li>
            <li>Driver leaderboard & constructors trajectory</li>
            <li>Tyre strategy by circuit type and outcome</li>
            <li>DNF reliability breakdown by category</li>
            <li>Host-country, talent-pool & podium charts</li>
            <li>Searchable, sortable driver table</li>
            <li>Stakeholder Story & Insights tab</li>
            <li>CSV export of displayed data</li>
          </ul>
        </Panel>
        <Panel title="Tech stack">
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>React 19 + TypeScript</li>
            <li>TanStack Start / Router</li>
            <li>Tailwind CSS v4 + shadcn/ui</li>
            <li>Recharts for interactive charts</li>
            <li>Lucide icons</li>
          </ul>
          <Button className="mt-5" onClick={() => downloadCSV(RESULTS, "f1-race-intelligence-full-sample.csv")}>
            <Download className="h-4 w-4" /> Download full sample CSV
          </Button>
        </Panel>
      </div>
    </div>
  );
}
