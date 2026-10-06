import { cn } from "@/lib/utils";
import type { Check, Level, Recommendation, AppStatus } from "@/lib/data";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

type Tone = "success" | "warning" | "danger" | "info" | "neutral" | "teal";

const tones: Record<Tone, string> = {
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
  teal: "bg-accent text-accent-foreground border-teal/20",
  neutral: "bg-muted text-muted-foreground border-border",
};

export function Pill({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-semibold",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export const recTone: Record<Recommendation, Tone> = {
  "Apply Now": "success",
  "Needs Review": "warning",
  Backup: "info",
  Pass: "danger",
};

export function RecBadge({ rec, className }: { rec: Recommendation; className?: string | undefined }) {
  return (
    <Pill tone={recTone[rec]} className={className}>
      {rec}
    </Pill>
  );
}

const checkTone: Record<Check, Tone> = { Pass: "success", Fail: "danger", Unknown: "warning" };
const CheckIcon = { Pass: CheckCircle2, Fail: XCircle, Unknown: HelpCircle };

export function CheckBadge({ status, label }: { status: Check; label?: string }) {
  const I = CheckIcon[status];
  return (
    <Pill tone={checkTone[status]}>
      <I className="size-3" />
      {label ?? status}
    </Pill>
  );
}

const levelTone: Record<Level, Tone> = { High: "success", Medium: "teal", Low: "danger", Unknown: "warning" };
export function LevelBadge({ level }: { level: Level }) {
  return <Pill tone={levelTone[level]}>{level}</Pill>;
}

const statusTone: Record<AppStatus, Tone> = {
  Saved: "neutral",
  Applied: "info",
  Interview: "teal",
  Offer: "success",
  Rejected: "danger",
};
export function StatusBadge({ status }: { status: AppStatus }) {
  return <Pill tone={statusTone[status]}>{status}</Pill>;
}

export function CompanyLogo({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-12 text-base" : "size-10 text-sm";
  return (
    <div className={cn("grid shrink-0 place-items-center rounded-lg bg-primary font-bold text-primary-foreground", s)}>
      {name.slice(0, 1)}
    </div>
  );
}
