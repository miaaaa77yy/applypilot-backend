import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import { Briefcase, Rocket, Send, MessagesSquare, ListChecks, CalendarClock, ArrowRight } from "lucide-react";
import { AppShell, Card } from "@/components/app/AppShell";
import { CompanyLogo, RecBadge, StatusBadge } from "@/components/app/badges";
import { useStore } from "@/lib/store";
import { daysUntil, fmtDate, rankScore, recommendationFor } from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — ApplyPilot" },
      { name: "description", content: "Your job search at a glance: shortlist, applications, interviews and tasks." },
      { property: "og:title", content: "ApplyPilot — Your personalized job shortlist" },
      { property: "og:description", content: "Turn a long list of job postings into a personalized shortlist — then keep track of what happens next." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const s = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (s.hydrated && !s.onboarded) navigate({ to: "/onboarding" });
  }, [s.hydrated, s.onboarded, navigate]);

  const jobById = (id: string | null) => s.jobs.find((j) => j.id === id);
  const applyNow = s.jobs.filter((j) => recommendationFor(j, s.profile) === "Apply Now").length;
  const active = s.applications.filter((a) => ["Applied", "Interview", "Offer"].includes(a.status)).length;
  const interviews = s.applications.filter((a) => a.status === "Interview").length;
  const openTasks = s.tasks.filter((t) => !t.done);

  const top = useMemo(
    () => [...s.jobs].sort((a, b) => rankScore(b, s.profile) - rankScore(a, s.profile)).slice(0, 4),
    [s.jobs, s.profile],
  );
  const deadlines = s.jobs
    .filter((j) => j.deadline && daysUntil(j.deadline) >= 0 && !s.applications.some((a) => a.jobId === j.id && a.status !== "Saved"))
    .sort((a, b) => a.deadline!.localeCompare(b.deadline!))
    .slice(0, 4);
  const activity = s.applications
    .flatMap((a) => a.timeline.map((t) => ({ ...t, app: a })))
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const metrics = [
    { label: "Jobs Reviewed", value: s.jobs.length, icon: Briefcase, to: "/jobs" as const, search: {} },
    { label: "Apply Now", value: applyNow, icon: Rocket, to: "/jobs" as const, search: { rec: "Apply Now" } },
    { label: "Active Applications", value: active, icon: Send, to: "/applications" as const, search: {} },
    { label: "Interviews", value: interviews, icon: MessagesSquare, to: "/applications" as const, search: { focus: "Interview" } },
    { label: "Tasks Due", value: openTasks.length, icon: ListChecks, to: "/tasks" as const, search: {} },
  ];

  return (
    <AppShell title={`Welcome back, ${s.profile.fullName.split(" ")[0]}`} subtitle="Here’s where your search stands today.">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {metrics.map((m) => (
          <Link key={m.label} to={m.to} search={m.search as never} className="group rounded-xl border bg-card p-4 shadow-card transition hover:-translate-y-0.5 hover:border-teal/50">
            <div className="flex items-center justify-between">
              <m.icon className="size-5 text-teal" />
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <p className="mt-3 text-3xl font-bold">{m.value}</p>
            <p className="text-sm text-muted-foreground">{m.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Top Recommended Jobs" to="/jobs" />
          <ul className="divide-y">
            {top.map((j) => (
              <li key={j.id}>
                <Link to="/jobs" search={{ job: j.id }} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted">
                  <CompanyLogo name={j.company} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{j.title}</p>
                    <p className="text-xs text-muted-foreground">{j.company} · {j.location}</p>
                  </div>
                  <RecBadge rec={recommendationFor(j, s.profile)} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-5">
          <SectionHead title="Upcoming Deadlines" to="/jobs" />
          <ul className="space-y-3">
            {deadlines.map((j) => (
              <li key={j.id}>
                <Link to="/jobs" search={{ job: j.id }} className="flex items-center gap-3 hover:opacity-80">
                  <CalendarClock className="size-4 text-warning" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{j.company} · {j.title}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(j.deadline)} · in {daysUntil(j.deadline!)} days</p>
                  </div>
                </Link>
              </li>
            ))}
            {!deadlines.length && <p className="text-sm text-muted-foreground">No upcoming deadlines.</p>}
          </ul>
        </Card>

        <Card className="p-5">
          <SectionHead title="Upcoming Tasks" to="/tasks" />
          <ul className="space-y-3">
            {openTasks.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-start gap-3">
                <input type="checkbox" checked={t.done} onChange={() => s.toggleTask(t.id)} className="mt-1 size-4 accent-[var(--teal)]" aria-label={`Complete ${t.title}`} />
                <div>
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{jobById(t.jobId)?.company ?? "General"} · due {fmtDate(t.due)}</p>
                </div>
              </li>
            ))}
            {!openTasks.length && <p className="text-sm text-muted-foreground">All caught up.</p>}
          </ul>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <SectionHead title="Recent Application Activity" to="/applications" />
          <ul className="divide-y">
            {activity.map((a, i) => {
              const j = jobById(a.app.jobId);
              return (
                <li key={i}>
                  <Link to="/applications" search={{ app: a.app.id }} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted">
                    <span className="w-14 text-xs text-muted-foreground">{fmtDate(a.date)}</span>
                    <p className="flex-1 text-sm"><strong>{j?.company}</strong> {j?.title} — {a.label}</p>
                    <StatusBadge status={a.app.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}

function SectionHead({ title, to }: { title: string; to: "/jobs" | "/tasks" | "/applications" }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-semibold">{title}</h2>
      <Link to={to} className="text-xs font-medium text-teal hover:underline">View all</Link>
    </div>
  );
}
