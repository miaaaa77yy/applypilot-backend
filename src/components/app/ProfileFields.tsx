import { useRef, useState } from "react";
import { FileText, Loader2, UploadCloud, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "./MultiSelect";
import {
  COMPANY_TYPE_OPTIONS,
  LOCATION_OPTIONS,
  ROLE_OPTIONS,
  SPONSORSHIP_OPTIONS,
  WORK_AUTH_OPTIONS,
  type Profile,
} from "@/lib/data";
import { cn } from "@/lib/utils";

/* ---------- Resume upload (UI states only) ---------- */

export function ResumeUpload({ fileName, onChange }: { fileName: string | null; onChange: (n: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "uploading" | "error">("idle");
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);

  const handle = (f: File | undefined) => {
    if (!f) return;
    const ok = /\.(pdf|docx)$/i.test(f.name);
    if (!ok) {
      setState("error");
      setError(`"${f.name}" isn't supported. Please upload a PDF or DOCX file.`);
      return;
    }
    setState("uploading");
    setTimeout(() => {
      setState("idle");
      onChange(f.name);
    }, 1200);
  };

  const input = (
    <input
      ref={ref}
      type="file"
      accept=".pdf,.docx"
      className="hidden"
      onChange={(e) => {
        handle(e.target.files?.[0]);
        e.target.value = "";
      }}
    />
  );

  if (state === "uploading")
    return (
      <div className="flex items-center gap-3 rounded-xl border border-teal/40 bg-accent/50 p-5">
        <Loader2 className="size-5 animate-spin text-teal" />
        <div className="flex-1">
          <p className="text-sm font-medium">Uploading resume…</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-teal" />
          </div>
        </div>
      </div>
    );

  if (fileName)
    return (
      <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success-soft p-4">
        <div className="grid size-10 place-items-center rounded-lg bg-card">
          <FileText className="size-5 text-success" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{fileName}</p>
          <p className="flex items-center gap-1 text-xs text-success">
            <CheckCircle2 className="size-3" /> Uploaded successfully
          </p>
        </div>
        <Button variant="outline" size="sm" type="button" onClick={() => ref.current?.click()}>
          Replace
        </Button>
        <Button variant="ghost" size="sm" type="button" onClick={() => onChange(null)}>
          Remove
        </Button>
        {input}
      </div>
    );

  return (
    <div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed bg-card p-8 text-center transition-colors hover:border-teal/60",
          drag ? "border-teal bg-accent/40" : state === "error" ? "border-danger/50" : "border-input",
        )}
      >
        <UploadCloud className="size-8 text-teal" />
        <p className="text-sm font-semibold">Drop your resume here or click to browse</p>
        <p className="text-xs text-muted-foreground">PDF or DOCX, up to 10 MB</p>
      </button>
      {state === "error" && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4" /> {error}
        </p>
      )}
      {input}
    </div>
  );
}

/* ---------- Basics ---------- */

export type BasicsDraft = { fullName: string; degree: string; years: string; months: string; minSalary: string };

export const toBasicsDraft = (p: Profile): BasicsDraft => ({
  fullName: p.fullName,
  degree: p.degree,
  years: String(p.years),
  months: String(p.months),
  minSalary: String(p.minSalary),
});

export function validateBasics(d: BasicsDraft) {
  const e: Partial<Record<keyof BasicsDraft, string>> = {};
  if (!d.fullName.trim()) e.fullName = "Enter your full name.";
  if (d.fullName.length > 100) e.fullName = "Keep it under 100 characters.";
  if (!d.degree.trim()) e.degree = "Enter your degree or program.";
  if (!/^\d+$/.test(d.years.trim())) e.years = "Use a whole number of 0 or more.";
  if (!/^\d+$/.test(d.months.trim()) || Number(d.months) > 11) e.months = "Use a whole number from 0 to 11.";
  if (d.minSalary.trim() === "" || isNaN(Number(d.minSalary)) || Number(d.minSalary) < 0)
    e.minSalary = "Salary must be 0 or more.";
  return e;
}

export const basicsToProfile = (d: BasicsDraft) => ({
  fullName: d.fullName.trim(),
  degree: d.degree.trim(),
  years: Number(d.years),
  months: Number(d.months),
  minSalary: Number(d.minSalary),
});

function Field({ label, error, children, htmlFor }: { label: string; error?: string | undefined; children: React.ReactNode; htmlFor: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

export function BasicsFields({
  draft,
  onChange,
  errors,
}: {
  draft: BasicsDraft;
  onChange: (d: BasicsDraft) => void;
  errors: Partial<Record<keyof BasicsDraft, string>>;
}) {
  const set = (k: keyof BasicsDraft) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...draft, [k]: e.target.value });
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
        <Input id="fullName" value={draft.fullName} onChange={set("fullName")} maxLength={100} />
      </Field>
      <Field label="Degree / Program" htmlFor="degree" error={errors.degree}>
        <Input id="degree" value={draft.degree} onChange={set("degree")} maxLength={120} />
      </Field>
      <div className="space-y-1.5">
        <Label>Total Work Experience</Label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="relative">
              <Input aria-label="Years" inputMode="numeric" value={draft.years} onChange={set("years")} className="pr-14" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">years</span>
            </div>
            {errors.years && <p className="mt-1 text-xs text-danger">{errors.years}</p>}
          </div>
          <div>
            <div className="relative">
              <Input aria-label="Months" inputMode="numeric" value={draft.months} onChange={set("months")} className="pr-16" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">months</span>
            </div>
            {errors.months && <p className="mt-1 text-xs text-danger">{errors.months}</p>}
          </div>
        </div>
      </div>
      <Field label="Minimum Desired Annual Salary (USD)" htmlFor="minSalary" error={errors.minSalary}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <Input id="minSalary" inputMode="numeric" value={draft.minSalary} onChange={set("minSalary")} className="pl-7" />
        </div>
      </Field>
    </div>
  );
}

/* ---------- Preferences ---------- */

export type PrefsDraft = Pick<Profile, "roles" | "locations" | "companyTypes" | "workAuth" | "sponsorship">;

export const toPrefsDraft = (p: Profile): PrefsDraft => ({
  roles: p.roles,
  locations: p.locations,
  companyTypes: p.companyTypes,
  workAuth: p.workAuth,
  sponsorship: p.sponsorship,
});

export function PreferenceFields({ draft, onChange }: { draft: PrefsDraft; onChange: (d: PrefsDraft) => void }) {
  return (
    <div className="grid gap-5">
      <div className="space-y-1.5">
        <Label htmlFor="roles">Preferred Roles</Label>
        <MultiSelect id="roles" options={ROLE_OPTIONS} value={draft.roles} onChange={(roles) => onChange({ ...draft, roles })} placeholder="Select roles" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="locations">Preferred Locations</Label>
        <MultiSelect id="locations" options={LOCATION_OPTIONS} value={draft.locations} onChange={(locations) => onChange({ ...draft, locations })} placeholder="Select locations" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="ctypes">Company Types</Label>
        <MultiSelect id="ctypes" options={COMPANY_TYPE_OPTIONS} value={draft.companyTypes} onChange={(companyTypes) => onChange({ ...draft, companyTypes })} placeholder="Select company types" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Work Authorization</Label>
          <Select value={draft.workAuth} onValueChange={(workAuth) => onChange({ ...draft, workAuth })}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORK_AUTH_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Sponsorship Needs</Label>
          <Select value={draft.sponsorship} onValueChange={(sponsorship) => onChange({ ...draft, sponsorship })}>
            <SelectTrigger className="bg-card"><SelectValue /></SelectTrigger>
            <SelectContent>
              {SPONSORSHIP_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
