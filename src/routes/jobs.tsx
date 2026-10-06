import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Maximize2, Minimize2, Search, Bookmark, Send, Columns3, X, ExternalLink, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { AnalysisSections, Verdict } from "@/components/app/Analysis";
import { CheckBadge, CompanyLogo, RecBadge, StatusBadge } from "@/components/app/badges";
import { AddJobDialog } from "@/components/app/AddJobDialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DECISIONS, decisionFor, isInProcess, useStore } from "@/lib/store";
import {
  CHECKS,
  RECOMMENDATIONS,
  eligibilityOf,
  fmtDate,
  fmtSalary,
  priorityCount,
  priorityFor,
  rankScore,
  recommendationFor,
} from "@/lib/data";
import { cn } from "@/lib/utils";

type S = { rec?: string | undefined; job?: string | undefined };

export const Route = createFileRoute("/jobs")({
  validateSearch: (s: Record<string, unknown>): S => ({
    rec: typeof s["rec"] === "string" ? (s["rec"] as string) : undefined,
    job: typeof s["job"] === "string" ? (s["job"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Review Jobs — ApplyPilot" },
      { name: "description", content: "Review ranked jobs with eligibility, fit, quality, and personal priority analysis." },
      { property: "og:title", content: "Review Jobs — ApplyPilot" },
      { property: "og:description", content: "Review ranked jobs with eligibility, fit, quality, and personal priority analysis." },
    ],
  }),
  component: ReviewJobs,
});

function LabeledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="min-w-[150px] space-y-1">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 bg-card"><SelectValue>{value === "all" ? `All ${label.toLowerCase()}s` : value}</SelectValue></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All {label.toLowerCase()}s</SelectItem>
          {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function ReviewJobs() {
  const s = useStore();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs" });
  const [q, setQ] = useState("");
  const [elig, setElig] = useState("all");
  const [loc, setLoc] = useState("all");
  const [role, setRole] = useState("all");
  const [dec, setDec] = useState("all");
  const [expanded, setExpanded] = useState(false);
  const rec = search.rec ?? "all";

  const list = useMemo(() => {
    return [...s.jobs]
      .filter((j) => {
        const t = `${j.company} ${j.title} ${j.location}`.toLowerCase();
        return (
          (!q || t.includes(q.toLowerCase())) &&
          (rec === "all" || recommendationFor(j, s.profile) === rec) &&
          (elig === "all" || eligibilityOf(j) === elig) &&
          (loc === "all" || j.location === loc) &&
          (role === "all" || j.title === role) &&
          (dec === "all" || decisionFor(s, j.id) === dec)
        );
      })
      .sort((a, b) => rankScore(b, s.profile) - rankScore(a, s.profile));
  }, [s.jobs, s.profile, s.applications, s.passedJobIds, q, rec, elig, loc, role, dec]);

  const selectedId = search.job && list.some((j) => j.id === search.job) ? search.job : list[0]?.id;
  const job = s.jobs.find((j) => j.id === selectedId) ?? null;
  const app = job ? s.applications.find((a) => a.jobId === job.id) : undefined;
  const passed = job ? decisionFor(s, job.id) === "Passed" : false;
  const tracked = job ? isInProcess(s, job.id) : false;
  let applicationUrl: string | null = null;
  try {
    const url = new URL(job?.url ?? "");
    if (["https:", "http:"].includes(url.protocol) && !url.username && !url.password) applicationUrl = url.href;
  } catch {}
  const select = (id: string) => navigate({ search: (p) => ({ ...p, job: id }), replace: true });

  const locations = [...new Set(s.jobs.map((j) => j.location))];
  const roles = [...new Set(s.jobs.map((j) => j.title))];

  const track = (status: "Saved" | "Applied") => {
    if (!job) return;
    s.trackJob(job.id, status);
    toast.success(`${job.company} marked as ${status}`, { action: { label: "View", onClick: () => navigate({ to: "/applications" }) } });
  };

  const detail = job && (
    <div className="rounded-xl border bg-card shadow-card">
      <div className="flex items-start gap-3 border-b p-5">
        <CompanyLogo name={job.company} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold">{job.title}</h2>
          <p className="text-sm text-muted-foreground">
            {job.company} · {job.location} · {fmtSalary(job.salaryMin, job.salaryMax)} · Deadline {fmtDate(job.deadline)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {passed ? (
              <Button size="sm" variant="outline" onClick={() => {
                s.undoPass(job.id);
                toast.success(`${job.company} pass undone`);
              }}><Undo2 /> Undo Pass</Button>
            ) : (
              <Button size="sm" variant="outline" disabled={tracked} aria-describedby={tracked ? "pass-unavailable" : undefined} onClick={() => {
                s.passJob(job.id);
                toast.success(`${job.company} recorded as passed`);
              }}><X /> Pass</Button>
            )}
            <Button size="sm" variant="outline" onClick={() => track("Saved")}><Bookmark /> Save for Later</Button>
            {applicationUrl ? (
              <Button size="sm" asChild><a href={applicationUrl} target="_blank" rel="noopener noreferrer"><ExternalLink /> Apply Now</a></Button>
            ) : (
              <Button size="sm" disabled aria-describedby="application-url-unavailable"><ExternalLink /> Apply Now</Button>
            )}
            <Button size="sm" variant="outline" disabled={app?.status === "Applied"} onClick={() => track("Applied")}><Send /> Mark Applied</Button>
          </div>
          {!applicationUrl && <p id="application-url-unavailable" className="mt-2 text-xs text-muted-foreground">Apply Now unavailable: no valid application URL for this job.</p>}
          {tracked && <p id="pass-unavailable" className="mt-2 text-xs text-muted-foreground">Pass unavailable: this job is already in your application tracker.</p>}
          {(app || passed) && <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground">Your decision: {decisionFor(s, job.id)}</span>
            {app && <>
              <StatusBadge status={app.status} />
              <Button size="sm" variant="link" className="h-auto p-0" asChild><Link to="/applications" search={{ app: app.id }}>Open application</Link></Button>
            </>}
          </div>
          }
        </div>
        <Button variant="ghost" size="icon" aria-label={expanded ? "Return to split view" : "Expand details"} onClick={() => setExpanded(!expanded)}>
          {expanded ? <Minimize2 /> : <Maximize2 />}
        </Button>
      </div>
      <div className="space-y-3 p-5">
        <Verdict job={job} profile={s.profile} />
        <AnalysisSections job={job} profile={s.profile} wide={expanded} />
      </div>
    </div>
  );

  return (
    <AppShell
      title="Review Jobs"
      subtitle="Ranked by eligibility, background fit, and your preferences."
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/compare"><Columns3 /> Compare ({s.compareIds.length})</Link>
          </Button>
          <AddJobDialog onAdded={select} />
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-3 shadow-card">
        <div className="min-w-[200px] flex-1 space-y-1">
          <span className="text-xs font-semibold text-muted-foreground">Search</span>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company, title, location" className="h-9 pl-8" />
          </div>
        </div>
        <LabeledSelect label="Recommendation" value={rec} onChange={(v) => navigate({ search: (p) => ({ ...p, rec: v === "all" ? undefined : v }) })} options={RECOMMENDATIONS} />
        <LabeledSelect label="Eligibility" value={elig} onChange={setElig} options={CHECKS} />
        <LabeledSelect label="Location" value={loc} onChange={setLoc} options={locations} />
        <LabeledSelect label="Role" value={role} onChange={setRole} options={roles} />
        <LabeledSelect label="My Decision" value={dec} onChange={setDec} options={DECISIONS} />
      </div>

      {expanded ? (
        <div>
          <Button variant="link" className="mb-2 px-0" onClick={() => setExpanded(false)}>← Back to split view</Button>
          {detail}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(320px,400px)_1fr]">
          <div className="space-y-2 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
            <p className="px-1 text-xs text-muted-foreground">{list.length} jobs · check up to 3 to compare</p>
            {list.map((j) => {
              const r = recommendationFor(j, s.profile);
              const pc = priorityCount(priorityFor(j, s.profile));
              const checked = s.compareIds.includes(j.id);
              return (
                <div
                  key={j.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => select(j.id)}
                  onKeyDown={(e) => e.key === "Enter" && select(j.id)}
                  className={cn(
                    "cursor-pointer rounded-xl border bg-card p-3 transition hover:border-teal/50",
                    j.id === selectedId && "border-teal ring-1 ring-teal",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <CompanyLogo name={j.company} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{j.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{j.company} · {j.location}</p>
                        </div>
                        <RecBadge rec={r} />
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <CheckBadge status={eligibilityOf(j)} label={`Eligibility: ${eligibilityOf(j)}`} />
                        <span>Fit <strong className="text-foreground">{j.fit.score}</strong></span>
                        <span>Priority <strong className="text-foreground">{pc}/4</strong></span>
                      </div>
                    </div>
                  </div>
                  <label className="mt-2 flex items-center gap-2 border-t pt-2 text-xs text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={checked}
                      disabled={!checked && s.compareIds.length >= 3}
                      onCheckedChange={() => s.toggleCompare(j.id)}
                    />
                    Compare
                  </label>
                </div>
              );
            })}
            {!list.length && <p className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">No jobs match these filters.</p>}
          </div>
          <div>{detail}</div>
        </div>
      )}
    </AppShell>
  );
}
