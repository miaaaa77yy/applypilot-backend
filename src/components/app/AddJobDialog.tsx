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

type SalaryResult = { min: number | null; max: number | null; error: string | null };

export function parseSalary(raw: string): SalaryResult {
  const v = raw.trim().replace(/[$,\s]/g, "");
  if (!v) return { min: null, max: null, error: null };
  if (/^-|-\s*-/.test(v)) return { min: null, max: null, error: "Salary can't be negative." };
  const m = v.replace(/[–—]/g, "-").match(/^(\d+)(?:-(\d+))?$/);
  if (!m) return { min: null, max: null, error: "Enter one amount (90000) or a range (90000-110000)." };
  const min = Number(m[1]);
  const max = m[2] != null ? Number(m[2]) : min;
  if (min > max) return { min: null, max: null, error: "Minimum can't be higher than maximum." };
  return { min, max, error: null };
}

const UNK = "Unknown — not enough job information";

function simulate(f: { company: string; title: string; location: string; salary: string; desc: string; url: string }): Job {
  const text = f.desc.toLowerCase();
  const hasDesc = text.trim().length > 0;
  const skills = SKILLS.filter((s) => text.includes(s.toLowerCase()));
  const sal = parseSalary(f.salary);
  const noSponsor = /no (visa )?sponsorship|not sponsor|unable to sponsor/.test(text);
  const sponsor = /sponsor/.test(text) && !noSponsor;
  const citizen = /citizen/.test(text);
  const degree = /bachelor|master|degree|mba|ph\.?d/.test(text);
  const years = text.match(/(\d+)\+?\s*(?:-\s*\d+\s*)?years?/);
  return {
    id: `custom-${Date.now()}`,
    company: f.company.trim(),
    title: f.title.trim(),
    location: f.location.trim() || "Unknown",
    salaryMin: sal.min,
    salaryMax: sal.max,
    companyType: "Startup",
    deadline: null,
    url: f.url || undefined,
    eligibility: {
      workAuth: noSponsor
        ? { status: "Fail", note: "Posting states no sponsorship" }
        : sponsor
          ? { status: "Pass", note: "Sponsorship mentioned" }
          : { status: "Unknown", note: "Sponsorship not mentioned" },
      citizenship: citizen
        ? { status: "Unknown", note: "Citizenship mentioned — verify requirement" }
        : { status: "Unknown", note: hasDesc ? "No citizenship requirement found — verify" : "No job description provided" },
      experience: years
        ? { status: "Unknown", note: `Posting mentions ${years[0]} — verify against your experience` }
        : { status: "Unknown", note: "Experience requirement not stated" },
      education: degree
        ? { status: "Unknown", note: "Degree requirement mentioned — verify" }
        : { status: "Unknown", note: "Education requirement not stated" },
    },
    fit: {
      score: skills.length ? Math.min(90, 60 + skills.length * 6) : 50,
      skills,
      experience: UNK,
      strongest: skills[0] ? `${skills[0]} (mentioned in posting)` : UNK,
      gap: UNK,
    },
    quality: {
      roleClarity: f.desc.length > 200 ? "Medium" : "Unknown",
      learning: "Unknown",
      compensation: sal.max == null ? "Unknown" : sal.max >= 100000 ? "High" : "Medium",
      attractiveness: "Unknown",
    },
    explanation: "Simulated analysis based only on the details you entered. Items marked Unknown weren't stated in the posting.",
    whyFits: skills.length ? `Posting mentions skills you have: ${skills.slice(0, 3).join(", ")}.` : "Not enough job information to assess fit.",
    concern: "Several details are missing — verify with the recruiter.",
  };
}

export function AddJobDialog({ onAdded }: { onAdded: (id: string) => void }) {
  const { addJob, profile } = useStore();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ desc: "", url: "", company: "", title: "", location: "", salary: "" });
  const [phase, setPhase] = useState<"form" | "loading" | "result">("form");
  const [job, setJob] = useState<Job | null>(null);
  const salaryError = parseSalary(f.salary).error;
  const valid = f.company.trim() && f.title.trim() && !salaryError;

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
                  <Label htmlFor={k}>{{ company: "Company *", title: "Job title *", location: "Location", salary: "Annual Salary Range (USD) — Optional" }[k]}</Label>
                  <Input id={k} maxLength={100} placeholder={k === "salary" ? "90000 or 90000-110000" : undefined} aria-invalid={k === "salary" && !!salaryError} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />
                  {k === "salary" && salaryError && <p className="text-xs text-destructive">{salaryError}</p>}
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
