import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarDays, GripVertical, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { CompanyLogo, RecBadge, StatusBadge } from "@/components/app/badges";
import { AnalysisSections, Verdict } from "@/components/app/Analysis";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";
import { STATUSES, TODAY, fmtDate, recommendationFor, type Application, type AppStatus } from "@/lib/data";
import { cn } from "@/lib/utils";

type S = { focus?: string | undefined; app?: string | undefined };

export const Route = createFileRoute("/applications")({
  validateSearch: (s: Record<string, unknown>): S => ({
    focus: typeof s["focus"] === "string" ? (s["focus"] as string) : undefined,
    app: typeof s["app"] === "string" ? (s["app"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Applications — ApplyPilot" },
      { name: "description", content: "Track applications from saved to offer on a simple board." },
      { property: "og:title", content: "Applications — ApplyPilot" },
      { property: "og:description", content: "Track applications from saved to offer on a simple board." },
    ],
  }),
  component: Applications,
});

function Applications() {
  const s = useStore();
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/applications" });
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<AppStatus | null>(null);
  const openApp = s.applications.find((a) => a.id === search.app) ?? null;

  const drop = (status: AppStatus) => {
    if (dragId) {
      const a = s.applications.find((x) => x.id === dragId);
      if (a && a.status !== status) {
        s.setStatus(dragId, status);
        toast.success(`Moved to ${status}`);
      }
    }
    setDragId(null);
    setOver(null);
  };

  return (
    <AppShell title="Applications" subtitle="Drag cards between stages, or change status from the card.">
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STATUSES.map((col) => {
          const items = s.applications.filter((a) => a.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(col);
              }}
              onDragLeave={() => setOver((o) => (o === col ? null : o))}
              onDrop={() => drop(col)}
              className={cn(
                "flex min-w-[200px] flex-1 flex-col rounded-xl border bg-secondary/60 p-2 transition-colors",
                over === col && "border-teal bg-accent",
                search.focus === col && "ring-2 ring-teal",
              )}
            >
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <StatusBadge status={col} />
                <span className="text-xs font-bold text-muted-foreground">{items.length}</span>
              </div>
              <div className="flex min-h-24 flex-col gap-2">
                {items.map((a) => (
                  <AppCard key={a.id} app={a} dragging={dragId === a.id} onDragStart={() => setDragId(a.id)} onDragEnd={() => { setDragId(null); setOver(null); }} onOpen={() => navigate({ search: (p) => ({ ...p, app: a.id }) })} />
                ))}
                {!items.length && <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">Drop here</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Sheet open={!!openApp} onOpenChange={(o) => !o && navigate({ search: (p) => ({ ...p, app: undefined }) })}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">{openApp && <AppDetail app={openApp} />}</SheetContent>
      </Sheet>
    </AppShell>
  );
}

function AppCard({ app, dragging, onDragStart, onDragEnd, onOpen }: { app: Application; dragging: boolean; onDragStart: () => void; onDragEnd: () => void; onOpen: () => void }) {
  const s = useStore();
  const job = s.jobs.find((j) => j.id === app.jobId);
  if (!job) return null;
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onOpen}
      className={cn("cursor-pointer rounded-lg border bg-card p-3 shadow-card transition hover:border-teal/50", dragging && "opacity-40")}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 size-4 shrink-0 cursor-grab text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-muted-foreground">{job.company}</p>
          <p className="truncate text-sm font-semibold">{job.title}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <RecBadge rec={recommendationFor(job, s.profile)} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3" />
          {app.status === "Saved" ? `Due ${fmtDate(job.deadline)}` : fmtDate(app.date)}
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">Next: <span className="text-foreground">{app.nextAction}</span></p>
      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
        <Select value={app.status} onValueChange={(v) => s.setStatus(app.id, v as AppStatus)}>
          <SelectTrigger className="h-7 text-xs" aria-label="Change status"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
        </Select>
      </div>
    </div>
  );
}

function AppDetail({ app }: { app: Application }) {
  const s = useStore();
  const job = s.jobs.find((j) => j.id === app.jobId)!;
  const [notes, setNotes] = useState(app.notes);
  const [next, setNext] = useState(app.nextAction);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDue, setTaskDue] = useState(TODAY);
  const tasks = s.tasks.filter((t) => t.jobId === job.id);

  return (
    <div className="space-y-6">
      <SheetHeader className="text-left">
        <div className="flex items-center gap-3">
          <CompanyLogo name={job.company} />
          <div>
            <SheetTitle>{job.title}</SheetTitle>
            <p className="text-sm text-muted-foreground">{job.company} · {job.location}</p>
          </div>
        </div>
      </SheetHeader>

      <div className="flex items-center gap-3">
        <Label className="shrink-0">Current status</Label>
        <Select value={app.status} onValueChange={(v) => s.setStatus(app.id, v as AppStatus)}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{STATUSES.map((st) => <SelectItem key={st} value={st}>{st}</SelectItem>)}</SelectContent>
        </Select>
        <Link to="/jobs" search={{ job: job.id }} className="ml-auto text-xs font-medium text-teal hover:underline">View in Review Jobs</Link>
      </div>

      <section>
        <h3 className="mb-2 text-sm font-semibold">Timeline</h3>
        <ol className="space-y-2 border-l-2 border-teal/30 pl-4">
          {app.timeline.map((t, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-teal" />
              <span className="text-muted-foreground">{fmtDate(t.date)}</span> — {t.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Next steps</h3>
        <div className="flex gap-2">
          <Input value={next} maxLength={140} onChange={(e) => setNext(e.target.value)} />
          <Button variant="outline" onClick={() => { s.setNextAction(app.id, next.trim()); toast.success("Next step updated"); }}>Save</Button>
        </div>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Notes</h3>
        <Textarea rows={3} maxLength={2000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Recruiter names, interview impressions…" />
        <Button size="sm" disabled={notes === app.notes} onClick={() => { s.setNotes(app.id, notes); toast.success("Notes saved"); }}>Save notes</Button>
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold">Related tasks</h3>
        {tasks.map((t) => (
          <label key={t.id} className="flex items-center gap-2 text-sm">
            <Checkbox checked={t.done} onCheckedChange={() => s.toggleTask(t.id)} />
            <span className={cn("flex-1", t.done && "text-muted-foreground line-through")}>{t.title}</span>
            <span className="text-xs text-muted-foreground">{fmtDate(t.due)}</span>
          </label>
        ))}
        {!tasks.length && <p className="text-xs text-muted-foreground">No tasks yet.</p>}
        <form
          className="flex gap-2 pt-1"
          onSubmit={(e) => {
            e.preventDefault();
            if (!taskTitle.trim()) return;
            s.addTask({ title: taskTitle.trim().slice(0, 140), due: taskDue, jobId: job.id });
            setTaskTitle("");
            toast.success("Task added");
          }}
        >
          <Input placeholder="Add a next-step task" value={taskTitle} maxLength={140} onChange={(e) => setTaskTitle(e.target.value)} />
          <Input type="date" className="w-36" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} aria-label="Due date" />
          <Button type="submit" size="icon" aria-label="Add task" disabled={!taskTitle.trim()}><Plus /></Button>
        </form>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Original job analysis</h3>
        <Verdict job={job} profile={s.profile} />
        <AnalysisSections job={job} profile={s.profile} />
      </section>
    </div>
  );
}
