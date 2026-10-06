import { createFileRoute, Link } from "@tanstack/react-router";
import { X } from "lucide-react";
import { AppShell, Card } from "@/components/app/AppShell";
import { CheckBadge, CompanyLogo, LevelBadge, RecBadge } from "@/components/app/badges";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { eligibilityOf, priorityCount, priorityFor, recommendationFor, type Job, type Level } from "@/lib/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Jobs — ApplyPilot" },
      { name: "description", content: "Compare two or three jobs side by side across eligibility, fit, quality, and priority." },
      { property: "og:title", content: "Compare Jobs — ApplyPilot" },
      { property: "og:description", content: "Compare two or three jobs side by side." },
    ],
  }),
  component: Compare,
});

const lvl: Record<Level, number> = { High: 3, Medium: 2, Low: 1, Unknown: 0 };

function Compare() {
  const s = useStore();
  const jobs = s.compareIds.map((id) => s.jobs.find((j) => j.id === id)).filter(Boolean) as Job[];

  const qualityScore = (j: Job) => Object.values(j.quality).reduce((a, l) => a + lvl[l], 0);
  const best = (fn: (j: Job) => number) => {
    if (jobs.length < 2) return null;
    const vals = jobs.map(fn);
    const max = Math.max(...vals);
    return vals.filter((v) => v === max).length === vals.length ? null : max;
  };

  const rows: { label: string; score?: (j: Job) => number; render: (j: Job) => React.ReactNode }[] = [
    {
      label: "Eligibility",
      score: (j) => ({ Pass: 2, Unknown: 1, Fail: 0 })[eligibilityOf(j)],
      render: (j) => (
        <div className="space-y-1">
          <CheckBadge status={eligibilityOf(j)} />
          <p className="text-xs text-muted-foreground">
            {Object.values(j.eligibility).filter((e) => e.status !== "Pass").map((e) => e.note).join("; ") || "All requirements met"}
          </p>
        </div>
      ),
    },
    {
      label: "Background Fit",
      score: (j) => j.fit.score,
      render: (j) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-full rounded-full bg-teal" style={{ width: `${j.fit.score}%` }} /></div>
            <span className="text-sm font-bold">{j.fit.score}</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Gap: {j.fit.gap}</p>
        </div>
      ),
    },
    {
      label: "Opportunity Quality",
      score: qualityScore,
      render: (j) => (
        <div className="grid grid-cols-2 gap-1 text-xs">
          {(
            [
              ["Clarity", j.quality.roleClarity],
              ["Learning", j.quality.learning],
              ["Pay", j.quality.compensation],
              ["Company", j.quality.attractiveness],
            ] as const
          ).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between gap-1"><span className="text-muted-foreground">{k}</span><LevelBadge level={v} /></div>
          ))}
        </div>
      ),
    },
    {
      label: "Personal Priority",
      score: (j) => priorityCount(priorityFor(j, s.profile)),
      render: (j) => {
        const p = priorityFor(j, s.profile);
        return (
          <div className="space-y-1">
            <p className="text-sm font-bold">{priorityCount(p)} / 4 matched</p>
            <p className="text-xs text-muted-foreground">
              {[p.location && "Location", p.role && "Role", p.salary && "Salary", p.companyType && "Company type"].filter(Boolean).join(", ") || "No matches"}
            </p>
          </div>
        );
      },
    },
    { label: "Main Strength", render: (j) => <p className="text-sm">{j.fit.strongest}</p> },
    { label: "Main Concern", render: (j) => <p className="text-sm">{j.concern}</p> },
    {
      label: "Final Recommendation",
      score: (j) => ({ "Apply Now": 3, "Needs Review": 2, Backup: 1, Pass: 0 })[recommendationFor(j, s.profile)],
      render: (j) => <RecBadge rec={recommendationFor(j, s.profile)} className="text-sm" />,
    },
  ];

  return (
    <AppShell title="Compare" subtitle="Pick 2–3 jobs. The strongest value in each row is highlighted.">
      <Card className="mb-4 p-4">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Jobs to compare ({jobs.length}/3)</p>
        <div className="flex flex-wrap gap-2">
          {s.jobs.map((j) => {
            const on = s.compareIds.includes(j.id);
            return (
              <label key={j.id} className={cn("flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm", on && "border-teal bg-accent")}>
                <Checkbox checked={on} disabled={!on && jobs.length >= 3} onCheckedChange={() => s.toggleCompare(j.id)} />
                {j.company} · {j.title}
              </label>
            );
          })}
        </div>
      </Card>

      {jobs.length < 2 ? (
        <Card className="p-10 text-center">
          <p className="font-semibold">Select at least two jobs to compare.</p>
          <Button variant="link" asChild><Link to="/jobs">Go to Review Jobs</Link></Button>
        </Card>
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[640px] table-fixed">
            <thead>
              <tr className="border-b">
                <th className="w-44 p-4" />
                {jobs.map((j) => (
                  <th key={j.id} className="p-4 text-left align-top">
                    <div className="flex items-start gap-2">
                      <CompanyLogo name={j.company} size="sm" />
                      <div className="min-w-0 flex-1">
                        <Link to="/jobs" search={{ job: j.id }} className="block font-semibold hover:underline">{j.title}</Link>
                        <p className="text-xs font-normal text-muted-foreground">{j.company} · {j.location}</p>
                      </div>
                      <button aria-label="Remove" onClick={() => s.toggleCompare(j.id)} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const b = r.score ? best(r.score) : null;
                return (
                  <tr key={r.label} className="border-b last:border-0">
                    <th className="p-4 text-left align-top text-sm font-semibold text-muted-foreground">{r.label}</th>
                    {jobs.map((j) => (
                      <td key={j.id} className={cn("p-4 align-top", b != null && r.score!(j) === b && "bg-success-soft/60")}>
                        {r.render(j)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </AppShell>
  );
}
