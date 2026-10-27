// ILLUSTRATIVE SAMPLE DATA — demo only. Values are synthetic and deterministic,
// shaped to look realistic; they are NOT official Formula 1 results.

export const SEASONS = [2021, 2022, 2023, 2024] as const;
export type Season = (typeof SEASONS)[number];

export const TEAMS = [
  { id: "rbr", name: "Red Bull Racing", color: "var(--team-rbr)", drivers: ["Max Verstappen", "Sergio Pérez"], strength: 1 },
  { id: "mer", name: "Mercedes", color: "var(--team-mer)", drivers: ["Lewis Hamilton", "George Russell"], strength: 0.82 },
  { id: "fer", name: "Ferrari", color: "var(--team-fer)", drivers: ["Charles Leclerc", "Carlos Sainz"], strength: 0.8 },
  { id: "mcl", name: "McLaren", color: "var(--team-mcl)", drivers: ["Lando Norris", "Oscar Piastri"], strength: 0.72 },
  { id: "amr", name: "Aston Martin", color: "var(--team-amr)", drivers: ["Fernando Alonso", "Lance Stroll"], strength: 0.5 },
  { id: "alp", name: "Alpine", color: "var(--team-alp)", drivers: ["Esteban Ocon", "Pierre Gasly"], strength: 0.38 },
] as const;
export type TeamId = (typeof TEAMS)[number]["id"];

export const NATIONALITY: Record<string, string> = {
  "Max Verstappen": "Netherlands", "Sergio Pérez": "Mexico", "Lewis Hamilton": "United Kingdom",
  "George Russell": "United Kingdom", "Charles Leclerc": "Monaco", "Carlos Sainz": "Spain",
  "Lando Norris": "United Kingdom", "Oscar Piastri": "Australia", "Fernando Alonso": "Spain",
  "Lance Stroll": "Canada", "Esteban Ocon": "France", "Pierre Gasly": "France",
};

export const RACES = [
  { name: "Bahrain", country: "Bahrain", type: "Permanent" },
  { name: "Saudi Arabia", country: "Saudi Arabia", type: "Street" },
  { name: "Australia", country: "Australia", type: "Street" },
  { name: "Imola", country: "Italy", type: "Permanent" },
  { name: "Miami", country: "United States", type: "Street" },
  { name: "Monaco", country: "Monaco", type: "Street" },
  { name: "Spain", country: "Spain", type: "Permanent" },
  { name: "Canada", country: "Canada", type: "Street" },
  { name: "Austria", country: "Austria", type: "Permanent" },
  { name: "Silverstone", country: "United Kingdom", type: "High-speed" },
  { name: "Hungary", country: "Hungary", type: "Permanent" },
  { name: "Spa", country: "Belgium", type: "High-speed" },
  { name: "Zandvoort", country: "Netherlands", type: "Permanent" },
  { name: "Monza", country: "Italy", type: "High-speed" },
  { name: "Singapore", country: "Singapore", type: "Street" },
  { name: "Suzuka", country: "Japan", type: "High-speed" },
  { name: "Austin", country: "United States", type: "Permanent" },
  { name: "Mexico City", country: "Mexico", type: "Permanent" },
  { name: "Interlagos", country: "Brazil", type: "Permanent" },
  { name: "Las Vegas", country: "United States", type: "Street" },
  { name: "Abu Dhabi", country: "UAE", type: "Permanent" },
] as const;

const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
export const DNF_CATEGORIES = ["Engine", "Brakes", "Collision", "Mechanical", "Other"] as const;
export const COMPOUNDS = ["Soft", "Medium", "Hard", "Intermediate"] as const;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type ResultRow = {
  season: number; round: number; race: string; country: string; circuitType: string;
  driver: string; team: string; teamId: TeamId; nationality: string; grid: number;
  position: number | null; points: number; status: string; startCompound: string;
};

function seasonBias(teamId: TeamId, season: number) {
  // Shapes eras: RBR dominance 2022-23, McLaren rise 2024, Mercedes stronger 2021.
  const m: Record<string, number[]> = {
    rbr: [0.95, 1.05, 1.15, 0.92], mer: [1.15, 0.85, 0.85, 0.9], fer: [0.75, 0.95, 0.85, 0.95],
    mcl: [0.75, 0.65, 0.9, 1.15], amr: [0.6, 0.6, 1.0, 0.75], alp: [0.95, 1.0, 0.9, 0.85],
  };
  return m[teamId]?.[SEASONS.indexOf(season as Season)] ?? 1;
}

function build(): ResultRow[] {
  const rows: ResultRow[] = [];
  for (const season of SEASONS) {
    const r = rng(season * 7);
    RACES.forEach((race, i) => {
      const entries = TEAMS.flatMap((t) =>
        t.drivers.map((d, di) => {
          const pace = t.strength * seasonBias(t.id, season) * (di === 0 ? 1 : 0.9) + r() * 0.45;
          return { d, t, pace };
        }),
      ).sort((a, b) => b.pace - a.pace);
      const filler = 8; // midfield cars from other teams occupy some places
      let pos = 0;
      entries.forEach((e, idx) => {
        const dnfRoll = r();
        const grid = idx + 1 + Math.floor(r() * 3);
        let status = "Finished";
        let position: number | null = null;
        if (dnfRoll < 0.07) {
          const c = r();
          status = c < 0.22 ? "Engine" : c < 0.34 ? "Brakes" : c < 0.66 ? "Collision" : c < 0.88 ? "Mechanical" : "Other";
        } else {
          pos += 1;
          position = pos + (idx > 6 ? Math.floor(r() * filler * 0.5) : 0);
        }
        const c2 = r();
        const startCompound = race.type === "Street" && c2 < 0.12 ? "Intermediate" : c2 < 0.45 ? "Medium" : c2 < 0.8 ? "Soft" : "Hard";
        rows.push({
          season, round: i + 1, race: race.name, country: race.country, circuitType: race.type,
          driver: e.d, team: e.t.name, teamId: e.t.id, nationality: NATIONALITY[e.d] ?? "Unknown", grid,
          position, points: position && position <= 10 ? (POINTS[position - 1] ?? 0) : 0, status, startCompound,
        });
      });
    });
  }
  return rows;
}

export const RESULTS: ResultRow[] = build();

export type Filters = { season: number | "all"; team: TeamId | "all" };

export function filterRows(f: Filters, rows = RESULTS) {
  return rows.filter((r) => (f.season === "all" || r.season === f.season) && (f.team === "all" || r.teamId === f.team));
}

export function kpis(rows: ResultRow[]) {
  const races = new Set(rows.map((r) => `${r.season}-${r.round}`)).size;
  const dnfs = rows.filter((r) => r.status !== "Finished").length;
  const wins = rows.filter((r) => r.position === 1);
  const winCount: Record<string, number> = {};
  wins.forEach((w) => (winCount[w.driver] = (winCount[w.driver] ?? 0) + 1));
  const top = Object.entries(winCount).sort((a, b) => b[1] - a[1])[0];
  return {
    races, entries: rows.length,
    points: rows.reduce((s, r) => s + r.points, 0),
    dnfRate: rows.length ? (dnfs / rows.length) * 100 : 0,
    topWinner: top ? { name: top[0], wins: top[1] } : null,
    podiums: rows.filter((r) => r.position && r.position <= 3).length,
  };
}

export function driverStandings(rows: ResultRow[]) {
  const m = new Map<string, { driver: string; team: string; teamId: TeamId; points: number; wins: number; podiums: number; dnfs: number; starts: number }>();
  rows.forEach((r) => {
    const e = m.get(r.driver) ?? { driver: r.driver, team: r.team, teamId: r.teamId, points: 0, wins: 0, podiums: 0, dnfs: 0, starts: 0 };
    e.points += r.points; e.starts += 1;
    if (r.position === 1) e.wins += 1;
    if (r.position && r.position <= 3) e.podiums += 1;
    if (r.status !== "Finished") e.dnfs += 1;
    m.set(r.driver, e);
  });
  return [...m.values()].sort((a, b) => b.points - a.points);
}

export function constructorTrajectory(season: number, teamIds: TeamId[]) {
  const rows = RESULTS.filter((r) => r.season === season);
  const totals: Record<string, number> = {};
  return RACES.map((race, i) => {
    const pt: Record<string, number | string> = { race: race.name };
    teamIds.forEach((t) => {
      totals[t] = (totals[t] ?? 0) + rows.filter((r) => r.round === i + 1 && r.teamId === t).reduce((s, r) => s + r.points, 0);
      pt[t] = totals[t];
    });
    return pt;
  });
}

export function tyreByCircuit(rows: ResultRow[]) {
  const types = ["Street", "Permanent", "High-speed"];
  return types.map((type) => {
    const sub = rows.filter((r) => r.circuitType === type);
    const o: Record<string, number | string> = { type };
    COMPOUNDS.forEach((c) => {
      const s = sub.filter((r) => r.startCompound === c);
      const pod = s.filter((r) => r.position && r.position <= 3).length;
      o[c] = s.length ? Math.round((pod / s.length) * 1000) / 10 : 0;
    });
    return o;
  });
}

export function tyreUsage(rows: ResultRow[]) {
  return COMPOUNDS.map((c) => {
    const s = rows.filter((r) => r.startCompound === c);
    return {
      compound: c,
      Podium: s.filter((r) => r.position && r.position <= 3).length,
      Points: s.filter((r) => r.position && r.position > 3 && r.points > 0).length,
      "No points": s.filter((r) => r.points === 0 && r.status === "Finished").length,
      DNF: s.filter((r) => r.status !== "Finished").length,
    };
  });
}

export function dnfByDriver(rows: ResultRow[]) {
  const m = new Map<string, Record<string, number | string>>();
  rows.filter((r) => r.status !== "Finished").forEach((r) => {
    const e = m.get(r.driver) ?? { driver: r.driver.split(" ").pop() ?? r.driver, total: 0, ...Object.fromEntries(DNF_CATEGORIES.map((c) => [c, 0])) };
    e[r.status] = ((e[r.status] as number) ?? 0) + 1; e["total"] = (e["total"] as number) + 1;
    m.set(r.driver, e);
  });
  return [...m.values()].sort((a, b) => (b["total"] as number) - (a["total"] as number));
}

// Illustrative all-time Grand Prix hosting counts (demo values).
export const HOST_COUNTRIES = [
  { country: "Italy", gps: 104 }, { country: "Germany", gps: 79 }, { country: "United Kingdom", gps: 78 },
  { country: "Monaco", gps: 70 }, { country: "Belgium", gps: 68 }, { country: "France", gps: 62 },
  { country: "Spain", gps: 58 }, { country: "Canada", gps: 53 }, { country: "Brazil", gps: 51 },
  { country: "United States", gps: 49 },
];

// Illustrative talent-pool distribution of drivers by nationality (demo values, all-time).
export const TALENT_POOL = [
  { nation: "United Kingdom", drivers: 166 }, { nation: "United States", drivers: 160 },
  { nation: "Italy", drivers: 99 }, { nation: "France", drivers: 74 }, { nation: "Germany", drivers: 55 },
  { nation: "Brazil", drivers: 32 }, { nation: "Other", drivers: 190 },
];

export function podiumsByTeam(rows: ResultRow[]) {
  return TEAMS.map((t) => {
    const s = rows.filter((r) => r.teamId === t.id);
    return {
      team: t.name, teamId: t.id,
      P1: s.filter((r) => r.position === 1).length,
      P2: s.filter((r) => r.position === 2).length,
      P3: s.filter((r) => r.position === 3).length,
    };
  }).filter((t) => t.P1 + t.P2 + t.P3 > 0);
}

export function toCSV(rows: ResultRow[]) {
  const head = ["season", "round", "race", "country", "circuit_type", "driver", "team", "nationality", "grid", "position", "points", "status", "start_compound"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    "# ILLUSTRATIVE SAMPLE DATA - demo only, not official F1 results",
    head.join(","),
    ...rows.map((r) => [r.season, r.round, r.race, r.country, r.circuitType, r.driver, r.team, r.nationality, r.grid, r.position ?? "DNF", r.points, r.status, r.startCompound].map(esc).join(",")),
  ].join("\n");
}

export function downloadCSV(rows: ResultRow[], filename: string) {
  const blob = new Blob([toCSV(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
