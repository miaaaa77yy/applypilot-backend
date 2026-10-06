import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AnalysisSections, Verdict } from "./Analysis";
import { useStore } from "@/lib/store";
import type { Job } from "@/lib/data";

const SKILLS = ["SQL", "Python", "Tableau", "Excel", "A/B testing", "Looker", "Stakeholder communication", "R"];

function simulate(f: { company: string; title: string; location: string; salary: string; desc: string; url: string }): Job {
  const text = f.desc.toLowerCase();
  const skills = SKILLS.filter((s) => text.includes(s.toLowerCase()));
  const nums = f.salary.match(/\d[\d,]*/g)?.map((n) => Number(n.replace(/,/g, ""))).map((n) => (n < 1000 ? n * 1000 : n)) ?? [];
  const noSponsor = /no (visa )?sponsorship|not sponsor/.test(text);
  const sponsor = /sponsor/.test(text) && !noSponsor;
  return {
    id: `custom-${Date.now()}`,
    company: f.company.trim(),
    title: f.title.trim(),
    location: f.location.trim() || "Unknown",
    salaryMin: nums[0] ?? null,
    salaryMax: nums[1] ?? nums[0] ?? null,
    companyType: "Startup",
    deadline: null,
    url: f.url || undefined,
    eligibility: {
      workAuth: noSponsor
        ? { status: "Fail", note: "Posting states no sponsorship" }
        : sponsor
          ? { status: "Pass", note: "Sponsorship mentioned" }
          : { status: "Unknown", note: "Sponsorship not mentioned" },
      citizenship: { status: /citizen/.test(text) ? "Fail" : "Pass", note: /citizen/.test(text) ? "Citizenship mentioned" : "No citizenship requirement found" },
      experience: { status: "Unknown", note: "Experience requirement unclear" },
      education: { status: "Pass", note: "Your degree meets typical requirements" },
    },
    fit: {
      score: Math.min(90, 68 + skills.length * 5),
      skills: skills.length ? skills : ["SQL", "Excel"],
      experience: "Analytics internship and graduate coursework",
      strongest: skills[0] ? `${skills[0]} experience` : "General analytics foundation",
      gap: "Domain-specific experience not confirmed",
    },
    quality: {
      roleClarity: f.desc.length > 200 ? "Medium" : "Unknown",
      learning: "Unknown",
      compensation: nums.length ? (nums[nums.length - 1] >= 100000 ? "High" : "Medium") : "Unknown",
      attractiveness: "Unknown",
    },
    explanation: "Simulated analysis based on the details you entered. Some items are Unknown because the posting didn’t say.",
    whyFits: skills.length ? `Posting mentions skills you have: ${skills.slice(0, 3).join(", ")}.` : "Analyst role aligned with your background.",
    concern: "Several details are missing — verify with the recruiter.",
  };
}

export function AddJobDialog({ onAdded }: { onAdded: (id: string) => void }) {
  const { addJob, profile } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ desc: "", url: "", company: "", title: "", location: "", salary: "" });
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [job, setJob] = useState<Job | null>(null);
  const valid = f.company.trim() && f.title.trim();

  const reset = () => {
    setF({ desc: "", url: "", company: "", title: "", location: "", salary: "" });
    setPhase("form");
    setJob(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button><Plus /> Add Job</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{phase === "result" ? "Analysis ready" : "Add a job"}</DialogTitle>
        </DialogHeader>

        {phase === "form" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="desc">Job description</Label>
              <Textarea id="desc" rows={5} maxLength={8000} placeholder="Paste the full job description…" value={f.desc} onChange={(e) => setF({ ...f, desc: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="url">Job URL</Label>
              <Input id="url" type="url" maxLength={500} placeholder="https://…" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["company", "title", "location", "salary"] as const).map((k) => (
                <div key={k} className="space-y-1.5">
                  <Label htmlFor={k}>{{ company: "Company *", title: "Job title *", location: "Location", salary: "Salary (e.g. 90,000–110,000)" }[k]}</Label>
                  <Input id={k} maxLength={100} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === "loading" && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Loader2 className="size-8 animate-spin text-teal" />
            <p className="font-medium">Analyzing job…</p>
            <p className="text-sm text-muted-foreground">Checking eligibility, fit, quality, and your priorities</p>
          </div>
        )}

        {phase === "result" && job && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">{job.company} · {job.title} · {job.location}</p>
            <Verdict job={job} profile={profile} />
            <AnalysisSections job={job} profile={profile} />
          </div>
        )}

        <DialogFooter>
          {phase === "form" && (
            <Button
              disabled={!valid}
              onClick={() => {
                setPhase("loading");
                setTimeout(() => {
                  setJob(simulate(f));
                  setPhase("result");
                }, 1400);
              }}
            >
              Analyze Job
            </Button>
          )}
          {phase === "result" && job && (
            <Button
              onClick={() => {
                addJob(job);
                onAdded(job.id);
                toast.success(`${job.title} at ${job.company} added to Review Jobs`);
                setOpen(false);
                reset();
              }}
            >
              Add to Review Jobs
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
