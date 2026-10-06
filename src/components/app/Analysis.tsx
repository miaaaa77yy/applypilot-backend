import { ShieldCheck, Sparkles, Gem, Compass } from "lucide-react";
import { CheckBadge, LevelBadge, Pill, RecBadge } from "./badges";
import { eligibilityOf, priorityFor, recommendationFor, type Job, type Profile } from "@/lib/data";
import { cn } from "@/lib/utils";

function Section({ icon: I, title, summary, children }: { icon: typeof Gem; title: string; summary?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <I className="size-4 text-teal" /> {title}
        </h4>
        {summary}
      </div>
      <dl className="space-y-2.5">{children}</dl>
    </section>
  );
}

function Row({ label, children, sub }: { label: string; children: React.ReactNode; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <div className="min-w-0">
        <dt className="text-muted-foreground">{label}</dt>
        {sub && <dd className="text-xs text-muted-foreground/80">{sub}</dd>}
      </div>
      <dd className="shrink-0 text-right">{children}</dd>
    </div>
  );
}

const yn = (b: boolean | null) => (b == null ? "Unknown" : b ? "Pass" : "Fail");

export function Verdict({ job, profile }: { job: Job; profile: Profile }) {
  const rec = recommendationFor(job, profile);
  return (
    <div className="rounded-xl border bg-secondary/60 p-4">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Final recommendation</span>
        <RecBadge rec={rec} />
      </div>
      <p className="mt-2 text-sm leading-relaxed">{job.explanation}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-success-soft p-3">
          <p className="text-xs font-semibold text-success">Why this fits</p>
          <p className="mt-1 text-sm">{job.whyFits}</p>
        </div>
        <div className="rounded-lg bg-warning-soft p-3">
          <p className="text-xs font-semibold text-warning">Main concern</p>
          <p className="mt-1 text-sm">{job.concern}</p>
        </div>
      </div>
    </div>
  );
}

export function AnalysisSections({ job, profile, wide }: { job: Job; profile: Profile; wide?: boolean }) {
  const e = job.eligibility;
  const pr = priorityFor(job, profile);
  return (
    <div className={cn("grid gap-3", wide && "lg:grid-cols-2")}>
      <Section icon={ShieldCheck} title="1. Eligibility" summary={<CheckBadge status={eligibilityOf(job)} />}>
        <Row label="Work authorization" sub={e.workAuth.note}><CheckBadge status={e.workAuth.status} /></Row>
        <Row label="Citizenship requirement" sub={e.citizenship.note}><CheckBadge status={e.citizenship.status} /></Row>
        <Row label="Minimum experience" sub={e.experience.note}><CheckBadge status={e.experience.status} /></Row>
        <Row label="Education requirement" sub={e.education.note}><CheckBadge status={e.education.status} /></Row>
      </Section>
      <Section icon={Sparkles} title="2. Background Fit" summary={<Pill tone="teal">{job.fit.score}/100</Pill>}>
        <div className="text-sm">
          <dt className="mb-1.5 text-muted-foreground">Matching skills</dt>
          <dd className="flex flex-wrap gap-1">
            {job.fit.skills.map((s) => <Pill key={s} tone="neutral">{s}</Pill>)}
          </dd>
        </div>
        <Stack label="Relevant experience" value={job.fit.experience} />
        <Stack label="Strongest fit" value={job.fit.strongest} />
        <Stack label="Main skills gap" value={job.fit.gap} />
      </Section>
      <Section icon={Gem} title="3. Opportunity Quality">
        <Row label="Role clarity"><LevelBadge level={job.quality.roleClarity} /></Row>
        <Row label="Learning potential"><LevelBadge level={job.quality.learning} /></Row>
        <Row label="Compensation"><LevelBadge level={job.quality.compensation} /></Row>
        <Row label="Company attractiveness"><LevelBadge level={job.quality.attractiveness} /></Row>
      </Section>
      <Section icon={Compass} title="4. Personal Priority">
        <Row label="Preferred location" sub={job.location}><CheckBadge status={yn(pr.location)} label={pr.location ? "Match" : "No match"} /></Row>
        <Row label="Role direction" sub={job.title}><CheckBadge status={yn(pr.role)} label={pr.role ? "Match" : "No match"} /></Row>
        <Row label="Salary preference" sub={`Min $${profile.minSalary.toLocaleString()}`}>
          <CheckBadge status={yn(pr.salary)} label={pr.salary == null ? "Unknown" : pr.salary ? "Meets" : "Below"} />
        </Row>
        <Row label="Company type" sub={job.companyType}><CheckBadge status={yn(pr.companyType)} label={pr.companyType ? "Match" : "No match"} /></Row>
      </Section>
    </div>
  );
}

function Stack({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-sm">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="mt-0.5">{value}</dd>
    </div>
  );
}
