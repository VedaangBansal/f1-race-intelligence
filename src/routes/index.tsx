import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Download, Flag, Gauge, Medal, RotateCcw, Search, Trophy, Wrench } from "lucide-react";
import { Panel } from "@/components/site-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  COMPOUNDS, DNF_CATEGORIES, HOST_COUNTRIES, SEASONS, TALENT_POOL, TEAMS, type Filters, type TeamId,
  constructorTrajectory, dnfByDriver, downloadCSV, driverStandings, filterRows, kpis, podiumsByTeam,
  tyreByCircuit, tyreUsage,
} from "@/lib/f1-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard · F1 Race Intelligence" },
      { name: "description", content: "Interactive Formula 1 analytics: standings, constructor trajectories, tyre strategy, reliability and podiums (sample data)." },
      { property: "og:title", content: "F1 Race Intelligence — Dashboard" },
      { property: "og:description", content: "Interactive Formula 1 telemetry-style dashboard using illustrative sample data." },
    ],
  }),
  component: Dashboard,
});

const teamColor = (id: string) => TEAMS.find((t) => t.id === id)?.color ?? "var(--chart-5)";
const TYRE_COLORS: Record<string, string> = { Soft: "var(--tyre-soft)", Medium: "var(--tyre-medium)", Hard: "var(--tyre-hard)", Intermediate: "var(--tyre-inter)" };
const DNF_COLORS = ["var(--chart-1)", "var(--chart-3)", "var(--chart-2)", "var(--chart-4)", "var(--chart-5)"];
const PIE_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--team-alp)", "var(--team-mcl)", "var(--chart-5)"];

const axis = { stroke: "var(--muted-foreground)", fontSize: 11, tickLine: false, axisLine: false } as const;
const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 },
  labelStyle: { color: "var(--foreground)", fontWeight: 700 },
  itemStyle: { color: "var(--foreground)" },
  cursor: { fill: "color-mix(in oklab, var(--primary) 10%, transparent)" },
};

function Dashboard() {
  const [filters, setFilters] = useState<Filters>({ season: 2023, team: "all" });
  const [midTeam, setMidTeam] = useState<TeamId>("mcl");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"points" | "wins" | "podiums" | "dnfs">("points");

  const rows = useMemo(() => filterRows(filters), [filters]);
  const k = useMemo(() => kpis(rows), [rows]);
  const standings = useMemo(() => driverStandings(rows), [rows]);
  const trajSeason = filters.season === "all" ? 2024 : filters.season;
  const traj = useMemo(() => constructorTrajectory(trajSeason, ["rbr", "mer", midTeam]), [trajSeason, midTeam]);
  const tyreCircuit = useMemo(() => tyreByCircuit(rows), [rows]);
  const tyreOutcome = useMemo(() => tyreUsage(rows), [rows]);
  const dnf = useMemo(() => dnfByDriver(rows), [rows]);
  const podiums = useMemo(() => podiumsByTeam(rows), [rows]);

  const tableRows = useMemo(
    () => standings
      .filter((s) => `${s.driver} ${s.team}`.toLowerCase().includes(query.toLowerCase()))
      .sort((a, b) => b[sort] - a[sort]),
    [standings, query, sort],
  );

  const label = `${filters.season === "all" ? "2021–2024" : filters.season}${filters.team === "all" ? "" : ` · ${TEAMS.find((t) => t.id === filters.team)?.name}`}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Race control · {label}</p>
          <h1 className="mt-1 text-3xl font-black uppercase tracking-tight md:text-4xl">Championship Telemetry</h1>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">
            Explore performance, strategy and reliability patterns across a synthetic 4-season sample (2021–2024, 21 rounds, 6 teams).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(filters.season)} onValueChange={(v) => setFilters((f) => ({ ...f, season: v === "all" ? "all" : Number(v) }))}>
            <SelectTrigger className="w-36" aria-label="Season"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All seasons</SelectItem>
              {SEASONS.map((s) => <SelectItem key={s} value={String(s)}>{s} season</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.team} onValueChange={(v) => setFilters((f) => ({ ...f, team: v as Filters["team"] }))}>
            <SelectTrigger className="w-44" aria-label="Team"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All teams</SelectItem>
              {TEAMS.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="Reset filters" onClick={() => setFilters({ season: 2023, team: "all" })}>
            <RotateCcw className="h-4 w-4" />
          </Button>
          <Button onClick={() => downloadCSV(rows, `f1-sample-${String(filters.season)}-${filters.team}.csv`)}>
            <Download className="h-4 w-4" /> CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icon={Flag} label="Races" value={k.races} hint={`${k.entries} driver entries`} />
        <Kpi icon={Gauge} label="Points scored" value={k.points.toLocaleString()} hint="Top-10 scoring" />
        <Kpi icon={Medal} label="Podiums" value={k.podiums} hint="P1–P3 finishes" />
        <Kpi icon={Wrench} label="DNF rate" value={`${k.dnfRate.toFixed(1)}%`} hint="Retirements / entries" />
        <Kpi icon={Trophy} label="Most wins" value={k.topWinner ? (k.topWinner.name.split(" ").pop() ?? "") : "—"} hint={k.topWinner ? `${k.topWinner.wins} victories` : "No wins in filter"} accent />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Panel title="Driver points leaderboard" subtitle="Cumulative points in current filter">
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={standings.slice(0, 10)} layout="vertical" margin={{ left: 10, right: 16 }}>
                <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis type="number" {...axis} />
                <YAxis type="category" dataKey="driver" width={110} {...axis} tickFormatter={(d: string) => d.split(" ").slice(-1)[0] ?? d} />
                <Tooltip {...tip} formatter={(v: number) => [`${v} pts`, "Points"]} />
                <Bar dataKey="points" radius={[0, 4, 4, 0]}>
                  {standings.slice(0, 10).map((s) => <Cell key={s.driver} fill={teamColor(s.teamId)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Panel>
        </div>
        <div className="lg:col-span-3">
          <Panel
            title={`Constructors trajectory · ${trajSeason}`}
            subtitle={`Red Bull Racing vs Mercedes vs a comparison team${filters.season === "all" ? " (showing 2024 when all seasons selected)" : ""}`}
            action={
              <Select value={midTeam} onValueChange={(v) => setMidTeam(v as TeamId)}>
                <SelectTrigger className="h-8 w-40 text-xs" aria-label="Comparison team"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEAMS.filter((t) => t.id !== "rbr" && t.id !== "mer").map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            }
          >
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={traj} margin={{ right: 12 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="race" {...axis} interval={2} />
                <YAxis {...axis} width={40} />
                <Tooltip {...tip} cursor={{ stroke: "var(--primary)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {(["rbr", "mer", midTeam] as TeamId[]).map((id) => (
                  <Line key={id} type="monotone" dataKey={id} name={TEAMS.find((t) => t.id === id)!.name} stroke={teamColor(id)} strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Panel>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Tyre strategy · podium rate by circuit" subtitle="% of starts on each compound that ended on the podium">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tyreCircuit}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="type" {...axis} />
              <YAxis {...axis} unit="%" width={44} />
              <Tooltip {...tip} formatter={(v: number) => `${v}%`} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {COMPOUNDS.map((c) => <Bar key={c} dataKey={c} fill={TYRE_COLORS[c]} radius={[3, 3, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Tyre strategy · race outcome" subtitle="Start compound vs final result (entry counts)">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tyreOutcome}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="compound" {...axis} />
              <YAxis {...axis} width={36} />
              <Tooltip {...tip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Podium" stackId="a" fill="var(--chart-1)" />
              <Bar dataKey="Points" stackId="a" fill="var(--chart-2)" />
              <Bar dataKey="No points" stackId="a" fill="var(--chart-5)" />
              <Bar dataKey="DNF" stackId="a" fill="var(--chart-3)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel title="Reliability · DNFs by failure category" subtitle="Stacked retirements per driver">
        {dnf.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No retirements in this filter — a perfectly reliable run.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dnf}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="driver" {...axis} interval={0} angle={-30} textAnchor="end" height={50} />
              <YAxis {...axis} allowDecimals={false} width={30} />
              <Tooltip {...tip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {DNF_CATEGORIES.map((c, i) => <Bar key={c} dataKey={c} stackId="d" fill={DNF_COLORS[i]} />)}
            </BarChart>
          </ResponsiveContainer>
        )}
      </Panel>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Countries hosting most GPs" subtitle="Illustrative all-time counts">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={HOST_COUNTRIES}>
              <defs>
                <linearGradient id="hostFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis dataKey="country" {...axis} interval={0} angle={-35} textAnchor="end" height={60} />
              <YAxis {...axis} width={32} />
              <Tooltip {...tip} formatter={(v: number) => [`${v} Grands Prix`, "Hosted"]} />
              <Area type="monotone" dataKey="gps" stroke="var(--primary)" strokeWidth={2} fill="url(#hostFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Driver talent pool" subtitle="Illustrative nationality distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={TALENT_POOL} dataKey="drivers" nameKey="nation" innerRadius={60} outerRadius={100} paddingAngle={2} stroke="var(--card)">
                {TALENT_POOL.map((t, i) => <Cell key={t.nation} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip {...tip} formatter={(v: number) => [`${v} drivers`, "Count"]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Panel>
        <Panel title="Podiums by team" subtitle="P1 / P2 / P3 split">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={podiums} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid horizontal={false} stroke="var(--border)" strokeDasharray="3 3" />
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="team" width={90} {...axis} tickFormatter={(t: string) => t.replace(" Racing", "")} />
              <Tooltip {...tip} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="P1" stackId="p" fill="var(--chart-3)" />
              <Bar dataKey="P2" stackId="p" fill="var(--tyre-hard)" />
              <Bar dataKey="P3" stackId="p" fill="var(--team-mcl)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <Panel
        title="Driver data table"
        subtitle={`${tableRows.length} drivers · podiums, wins and reliability`}
        action={
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search driver or team…" className="h-9 w-56 pl-8" aria-label="Search drivers" />
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as typeof sort)}>
              <SelectTrigger className="h-9 w-36" aria-label="Sort by"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Sort: Points</SelectItem>
                <SelectItem value="wins">Sort: Wins</SelectItem>
                <SelectItem value="podiums">Sort: Podiums</SelectItem>
                <SelectItem value="dnfs">Sort: DNFs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-2">#</th><th className="py-2">Driver</th><th>Team</th>
                <th className="text-right">Starts</th><th className="text-right">Wins</th><th className="text-right">Podiums</th>
                <th className="text-right">DNFs</th><th className="pr-1 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((s, i) => (
                <tr key={s.driver} className="border-b border-border/50 transition-colors hover:bg-accent/50">
                  <td className="py-2.5 pr-2 font-mono text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>
                  <td className="font-semibold">
                    <span className="mr-2 inline-block h-3 w-1 rounded align-middle" style={{ background: teamColor(s.teamId) }} />
                    {s.driver}
                  </td>
                  <td className="text-muted-foreground">{s.team}</td>
                  <td className="text-right font-mono">{s.starts}</td>
                  <td className="text-right font-mono">{s.wins}</td>
                  <td className="text-right font-mono">{s.podiums}</td>
                  <td className="text-right font-mono">{s.dnfs}</td>
                  <td className="pr-1 text-right font-mono font-bold text-primary">{s.points}</td>
                </tr>
              ))}
              {tableRows.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">No drivers match “{query}”.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, hint, accent }: { icon: typeof Flag; label: string; value: string | number; hint: string; accent?: boolean }) {
  return (
    <div className={`telemetry-grid relative overflow-hidden rounded-xl border bg-card p-4 ${accent ? "shadow-[var(--shadow-glow)]" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="mt-2 truncate text-2xl font-black md:text-3xl">{value}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}
