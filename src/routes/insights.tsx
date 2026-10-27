import { createFileRoute, Link } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Panel } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Story & Insights · F1 Race Intelligence" },
      { name: "description", content: "Three stakeholder scenarios showing how a strategist, broadcast analyst and regulation analyst use the dashboard." },
      { property: "og:title", content: "F1 Race Intelligence — Story & Insights" },
      { property: "og:description", content: "Stakeholder-driven data stories built on illustrative F1 sample data." },
    ],
  }),
  component: Insights,
});

const STORIES = [
  {
    id: "rajan", name: "Rajan", role: "Team Strategist",
    question: "Which start compound gives us the best podium odds at street circuits?",
    path: ["Set Team filter to your constructor", "Open “Tyre strategy · podium rate by circuit”", "Compare Street vs High-speed bars", "Cross-check DNFs in the outcome chart"],
    findings: [
      "In the sample, Soft starts convert to podiums most often at Permanent circuits where track position is easier to defend.",
      "Intermediate starts are rare and only appear at Street tracks — a high-variance, opportunistic call.",
      "Hard-compound starts show fewer DNFs, suggesting a lower-risk option for cars starting outside the top 10.",
    ],
    action: "Default to Medium at street circuits; reserve Soft for front-row starts.",
  },
  {
    id: "divya", name: "Divya", role: "Broadcast Analyst",
    question: "What is the championship narrative I should tell viewers this weekend?",
    path: ["Pick a season", "Read the Constructors trajectory lines", "Switch the comparison team", "Use the leaderboard for driver storylines"],
    findings: [
      "In the 2023 sample, Red Bull Racing’s line separates from Mercedes early and the gap widens steadily — a “dominance” arc.",
      "Switching to 2024 shows McLaren closing the gap in the second half — a ready-made comeback story.",
      "The podium chart highlights which teams share the spotlight, useful for balanced coverage.",
    ],
    action: "Lead with the gap trend graphic, then cut to the mid-tier rise.",
  },
  {
    id: "arvind", name: "Arvind", role: "Technical Regulation Analyst",
    question: "Are reliability failures concentrated in a category that rules could address?",
    path: ["Select All seasons", "Open “Reliability · DNFs by failure category”", "Filter by team to isolate patterns", "Export CSV for deeper review"],
    findings: [
      "Collisions and mechanical failures make up the majority of sample retirements; engine failures are a smaller share.",
      "DNF rates are fairly evenly spread across teams, pointing to sporting (contact) rather than technical causes.",
      "Brake failures are rare but cluster at heavy-braking street circuits in the sample.",
    ],
    action: "Prioritise review of first-lap incident rules over power-unit reliability limits.",
  },
];

function Insights() {
  return (
    <div className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Data storytelling</p>
        <h1 className="mt-1 text-3xl font-black uppercase tracking-tight md:text-4xl">Story & Insights</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Three fictional stakeholders, three questions. Findings describe patterns in the illustrative sample data and are not claims about real F1 results.
        </p>
      </div>
      <Tabs defaultValue="rajan">
        <TabsList className="h-auto flex-wrap">
          {STORIES.map((s) => (
            <TabsTrigger key={s.id} value={s.id} className="px-4 py-2">
              {s.name} <span className="ml-1.5 hidden text-xs text-muted-foreground sm:inline">· {s.role}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {STORIES.map((s) => (
          <TabsContent key={s.id} value={s.id} className="mt-4">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <Panel title={`${s.name} — ${s.role}`} subtitle="Key question">
                  <blockquote className="border-l-2 border-primary pl-4 text-xl font-semibold">“{s.question}”</blockquote>
                  <h3 className="mt-6 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Findings (sample data)</h3>
                  <ul className="mt-2 space-y-3">
                    {s.findings.map((f, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="font-mono font-bold text-primary">0{i + 1}</span>{f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6 rounded-lg border border-primary/40 bg-primary/10 p-4 text-sm">
                    <span className="font-bold uppercase tracking-wider text-primary">Recommended action · </span>{s.action}
                  </div>
                </Panel>
              </div>
              <Panel title="Analysis path" subtitle="Reproduce this on the dashboard">
                <ol className="space-y-3">
                  {s.path.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary font-mono text-xs">{i + 1}</span>{p}
                    </li>
                  ))}
                </ol>
                <Button asChild className="mt-6 w-full">
                  <Link to="/">Open dashboard <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </Panel>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
