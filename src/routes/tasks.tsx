import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus } from "lucide-react";
import { AppShell, Card } from "@/components/app/AppShell";
import { Pill } from "@/components/app/badges";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStore } from "@/lib/store";
import { TODAY, daysUntil, fmtDate } from "@/lib/data";

export const Route = createFileRoute("/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — ApplyPilot" },
      { name: "description", content: "Track follow-ups and prep tasks for your applications." },
      { property: "og:title", content: "Tasks — ApplyPilot" },
      { property: "og:description", content: "Track follow-ups and prep tasks for your applications." },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  const s = useStore();
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(TODAY);
  const [jobId, setJobId] = useState("none");
  const sorted = [...s.tasks].sort((a, b) => Number(a.done) - Number(b.done) || a.due.localeCompare(b.due));

  return (
    <AppShell title="Tasks" subtitle="Follow-ups and prep work for your search.">
      <Card className="mb-4 p-4">
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!title.trim() || !due) return;
            s.addTask({ title: title.trim().slice(0, 140), due, jobId: jobId === "none" ? null : jobId });
            setTitle("");
          }}
        >
          <Input className="min-w-[220px] flex-1" placeholder="New task…" value={title} maxLength={140} onChange={(e) => setTitle(e.target.value)} aria-label="Task name" />
          <Select value={jobId} onValueChange={setJobId}>
            <SelectTrigger className="w-56" aria-label="Related job"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">General</SelectItem>
              {s.jobs.map((j) => <SelectItem key={j.id} value={j.id}>{j.company} · {j.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" className="w-40" value={due} onChange={(e) => setDue(e.target.value)} aria-label="Due date" />
          <Button type="submit" disabled={!title.trim()}><Plus /> Add task</Button>
        </form>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th className="w-10 p-3" />
              <th className="p-3">Task</th>
              <th className="p-3">Related job</th>
              <th className="p-3">Due</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((t) => {
              const j = s.jobs.find((x) => x.id === t.jobId);
              const overdue = !t.done && daysUntil(t.due) < 0;
              return (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="p-3"><Checkbox checked={t.done} onCheckedChange={() => s.toggleTask(t.id)} aria-label={`Complete ${t.title}`} /></td>
                  <td className={`p-3 font-medium ${t.done ? "text-muted-foreground line-through" : ""}`}>{t.title}</td>
                  <td className="p-3 text-muted-foreground">{j ? `${j.company} · ${j.title}` : "General"}</td>
                  <td className="p-3">{fmtDate(t.due)}</td>
                  <td className="p-3">
                    <Pill tone={t.done ? "success" : overdue ? "danger" : "warning"}>{t.done ? "Done" : overdue ? "Overdue" : "Open"}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </AppShell>
  );
}
