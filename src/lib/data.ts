export type Check = "Pass" | "Fail" | "Unknown";
export type Level = "High" | "Medium" | "Low" | "Unknown";
export type Recommendation = "Apply Now" | "Needs Review" | "Backup" | "Pass";
export type AppStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected";

export const RECOMMENDATIONS: Recommendation[] = ["Apply Now", "Needs Review", "Backup", "Pass"];
export const CHECKS: Check[] = ["Pass", "Fail", "Unknown"];
export const STATUSES: AppStatus[] = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

export const ROLE_OPTIONS = [
  "Data Analyst",
  "Business Analyst",
  "Product Analyst",
  "Strategy Analyst",
  "Operations Analyst",
  "Marketing Analyst",
  "Financial Analyst",
];
export const LOCATION_OPTIONS = [
  "New York, NY",
  "San Francisco, CA",
  "Seattle, WA",
  "Los Angeles, CA",
  "Boston, MA",
  "Chicago, IL",
  "Austin, TX",
  "Remote",
];
export const COMPANY_TYPE_OPTIONS = [
  "Big Tech",
  "Consulting",
  "Fintech",
  "Media & Entertainment",
  "Startup",
  "Finance",
  "Retail",
];
export const WORK_AUTH_OPTIONS = [
  "U.S. Citizen",
  "Green Card Holder",
  "F-1 Student (CPT)",
  "F-1 OPT / STEM OPT",
  "H-1B",
  "Other visa",
];
export const SPONSORSHIP_OPTIONS = [
  "No sponsorship needed",
  "Will need sponsorship in the future",
  "Need sponsorship now",
];

export interface Profile {
  resumeName: string | null;
  fullName: string;
  degree: string;
  years: number;
  months: number;
  minSalary: number;
  roles: string[];
  locations: string[];
  companyTypes: string[];
  workAuth: string;
  sponsorship: string;
}

export interface Job {
  id: string;
  company: string;
  title: string;
  location: string;
  salaryMin: number | null;
  salaryMax: number | null;
  companyType: string;
  deadline: string | null;
  url?: string | undefined;
  eligibility: {
    workAuth: { status: Check; note: string };
    citizenship: { status: Check; note: string };
    experience: { status: Check; note: string };
    education: { status: Check; note: string };
  };
  fit: {
    score: number;
    skills: string[];
    experience: string;
    strongest: string;
    gap: string;
  };
  quality: {
    roleClarity: Level;
    learning: Level;
    compensation: Level;
    attractiveness: Level;
  };
  explanation: string;
  whyFits: string;
  concern: string;
}

export interface Application {
  id: string;
  jobId: string;
  status: AppStatus;
  date: string;
  nextAction: string;
  notes: string;
  timeline: { date: string; label: string }[];
}

export interface Task {
  id: string;
  title: string;
  jobId: string | null;
  due: string;
  done: boolean;
}

export const TODAY = "2026-10-06";

export const defaultProfile: Profile = {
  resumeName: null,
  fullName: "Maya Chen",
  degree: "M.S. Business Analytics, USC Marshall",
  years: 1,
  months: 6,
  minSalary: 85000,
  roles: ["Data Analyst", "Product Analyst", "Strategy Analyst"],
  locations: ["New York, NY", "San Francisco, CA", "Remote"],
  companyTypes: ["Big Tech", "Consulting"],
  workAuth: "F-1 OPT / STEM OPT",
  sponsorship: "Will need sponsorship in the future",
};

const pass = (note: string) => ({ status: "Pass" as Check, note });
const unk = (note: string) => ({ status: "Unknown" as Check, note });
const fail = (note: string) => ({ status: "Fail" as Check, note });

export const seedJobs: Job[] = [
  {
    id: "spotify-da",
    company: "Spotify",
    title: "Data Analyst",
    location: "New York, NY",
    salaryMin: 95000,
    salaryMax: 115000,
    companyType: "Big Tech",
    deadline: "2026-10-14",
    eligibility: {
      workAuth: pass("Sponsorship offered for this role"),
      citizenship: pass("No citizenship requirement"),
      experience: pass("1+ years required; you have 1y 6m"),
      education: pass("Bachelor's in quantitative field"),
    },
    fit: {
      score: 88,
      skills: ["SQL", "Python", "A/B testing", "Tableau"],
      experience: "Product analytics internship with experimentation work",
      strongest: "Experimentation and dashboarding experience",
      gap: "No prior exposure to streaming or audio data",
    },
    quality: { roleClarity: "High", learning: "High", compensation: "High", attractiveness: "High" },
    explanation: "You meet every eligibility requirement, your skills match closely, and the role lines up with your location and salary goals.",
    whyFits: "Core skills (SQL, Python, A/B testing) map directly to the listed responsibilities.",
    concern: "Highly competitive posting — apply early.",
  },
  {
    id: "deloitte-ba",
    company: "Deloitte",
    title: "Business Analyst",
    location: "New York, NY",
    salaryMin: 80000,
    salaryMax: 92000,
    companyType: "Consulting",
    deadline: "2026-10-20",
    eligibility: {
      workAuth: pass("Sponsorship available for analyst track"),
      citizenship: pass("No citizenship requirement"),
      experience: pass("0–2 years required"),
      education: pass("Master's preferred"),
    },
    fit: {
      score: 80,
      skills: ["Excel", "SQL", "Stakeholder communication"],
      experience: "Client-facing capstone project for a retail company",
      strongest: "Structured problem solving from consulting-style capstone",
      gap: "Limited experience with process mapping tools",
    },
    quality: { roleClarity: "Medium", learning: "High", compensation: "Medium", attractiveness: "High" },
    explanation: "A solid option with strong learning potential, but the role title is outside your preferred list and pay is near your minimum.",
    whyFits: "Consulting background and communication skills fit the client-facing work.",
    concern: "Role direction drifts toward general consulting rather than analytics.",
  },
  {
    id: "adobe-pa",
    company: "Adobe",
    title: "Product Analyst",
    location: "San Francisco, CA",
    salaryMin: 105000,
    salaryMax: 125000,
    companyType: "Big Tech",
    deadline: "2026-10-11",
    eligibility: {
      workAuth: pass("Sponsorship offered"),
      citizenship: pass("No citizenship requirement"),
      experience: pass("1+ years required"),
      education: pass("Bachelor's required"),
    },
    fit: {
      score: 85,
      skills: ["SQL", "Product metrics", "Python", "Amplitude"],
      experience: "Built funnel dashboards during product analytics internship",
      strongest: "Product metrics and funnel analysis",
      gap: "No experience with creative or design software users",
    },
    quality: { roleClarity: "High", learning: "High", compensation: "High", attractiveness: "High" },
    explanation: "Strong eligibility, strong fit, and above your salary target in a preferred city.",
    whyFits: "Your funnel and product-metrics work is exactly what the team describes.",
    concern: "Deadline is soon — this week.",
  },
  {
    id: "visa-sa",
    company: "Visa",
    title: "Strategy Analyst",
    location: "San Francisco, CA",
    salaryMin: 98000,
    salaryMax: 118000,
    companyType: "Fintech",
    deadline: "2026-10-25",
    eligibility: {
      workAuth: unk("Posting does not mention sponsorship"),
      citizenship: pass("No citizenship requirement"),
      experience: pass("1–3 years required"),
      education: pass("MBA or Master's preferred"),
    },
    fit: {
      score: 78,
      skills: ["Market sizing", "Excel modeling", "SQL"],
      experience: "Strategy coursework and a market-entry case competition",
      strongest: "Market sizing and business case modeling",
      gap: "No payments-industry experience",
    },
    quality: { roleClarity: "Medium", learning: "High", compensation: "High", attractiveness: "High" },
    explanation: "Promising role, but sponsorship is unclear — confirm with the recruiter before investing time.",
    whyFits: "Strategy-focused role in a preferred city with strong pay.",
    concern: "Sponsorship status unknown.",
  },
  {
    id: "amazon-oa",
    company: "Amazon",
    title: "Operations Analyst",
    location: "Seattle, WA",
    salaryMin: 78000,
    salaryMax: 90000,
    companyType: "Big Tech",
    deadline: "2026-11-02",
    eligibility: {
      workAuth: pass("Sponsorship offered"),
      citizenship: pass("No citizenship requirement"),
      experience: unk("Posting says 'some' experience"),
      education: pass("Bachelor's required"),
    },
    fit: {
      score: 72,
      skills: ["SQL", "Excel"],
      experience: "Supply-chain analytics course project",
      strongest: "SQL reporting skills",
      gap: "Little hands-on operations or logistics experience",
    },
    quality: { roleClarity: "Medium", learning: "Medium", compensation: "Medium", attractiveness: "High" },
    explanation: "Eligible and a known brand, but location and role direction don't match your preferences.",
    whyFits: "Your SQL reporting skills transfer well.",
    concern: "Seattle isn't a preferred location and the role leans operational.",
  },
  {
    id: "disney-fa",
    company: "Disney",
    title: "Financial Analyst",
    location: "Los Angeles, CA",
    salaryMin: 70000,
    salaryMax: 82000,
    companyType: "Media & Entertainment",
    deadline: "2026-10-30",
    eligibility: {
      workAuth: fail("Posting states no visa sponsorship"),
      citizenship: pass("No citizenship requirement"),
      experience: pass("0–2 years required"),
      education: pass("Bachelor's in finance or related"),
    },
    fit: {
      score: 65,
      skills: ["Excel modeling"],
      experience: "Corporate finance coursework",
      strongest: "Financial modeling coursework",
      gap: "No FP&A or accounting experience",
    },
    quality: { roleClarity: "High", learning: "Medium", compensation: "Low", attractiveness: "High" },
    explanation: "This role does not sponsor visas, which conflicts with your future sponsorship needs.",
    whyFits: "Strong brand and clear role scope.",
    concern: "No sponsorship — likely ineligible.",
  },
];

export const seedApplications: Application[] = [
  {
    id: "app-adobe",
    jobId: "adobe-pa",
    status: "Saved",
    date: "2026-10-04",
    nextAction: "Tailor resume to product metrics",
    notes: "",
    timeline: [{ date: "2026-10-04", label: "Saved job" }],
  },
  {
    id: "app-spotify",
    jobId: "spotify-da",
    status: "Applied",
    date: "2026-09-29",
    nextAction: "Follow up with recruiter",
    notes: "Referred by alumni contact (Jamie L.).",
    timeline: [
      { date: "2026-09-27", label: "Saved job" },
      { date: "2026-09-29", label: "Applied" },
    ],
  },
  {
    id: "app-deloitte",
    jobId: "deloitte-ba",
    status: "Interview",
    date: "2026-09-20",
    nextAction: "Prepare case interview",
    notes: "First-round behavioral went well. Case round next.",
    timeline: [
      { date: "2026-09-18", label: "Saved job" },
      { date: "2026-09-20", label: "Applied" },
      { date: "2026-10-01", label: "Moved to Interview" },
    ],
  },
  {
    id: "app-amazon",
    jobId: "amazon-oa",
    status: "Applied",
    date: "2026-09-25",
    nextAction: "Wait for online assessment",
    notes: "",
    timeline: [{ date: "2026-09-25", label: "Applied" }],
  },
];

export const seedTasks: Task[] = [
  { id: "t1", title: "Practice market-sizing case", jobId: "deloitte-ba", due: "2026-10-08", done: false },
  { id: "t2", title: "Email Spotify recruiter follow-up", jobId: "spotify-da", due: "2026-10-09", done: false },
  { id: "t3", title: "Tailor resume for Adobe", jobId: "adobe-pa", due: "2026-10-10", done: false },
  { id: "t4", title: "Update LinkedIn headline", jobId: null, due: "2026-10-12", done: true },
];

/* ---------- Deterministic scoring ---------- */

export interface Priority {
  location: boolean;
  role: boolean;
  salary: boolean | null;
  companyType: boolean;
}

export function priorityFor(job: Job, p: Profile): Priority {
  return {
    location: p.locations.includes(job.location),
    role: p.roles.includes(job.title),
    salary: job.salaryMax == null ? null : job.salaryMax >= p.minSalary,
    companyType: p.companyTypes.includes(job.companyType),
  };
}

export function priorityCount(pr: Priority) {
  return [pr.location, pr.role, pr.salary === true, pr.companyType].filter(Boolean).length;
}

export function eligibilityOf(job: Job): Check {
  const s = Object.values(job.eligibility).map((e) => e.status);
  if (s.includes("Fail")) return "Fail";
  if (s.includes("Unknown")) return "Unknown";
  return "Pass";
}

export function recommendationFor(job: Job, p: Profile): Recommendation {
  const elig = eligibilityOf(job);
  if (elig === "Fail") return "Pass";
  const score = job.fit.score + priorityCount(priorityFor(job, p)) * 8;
  let rec: Recommendation =
    score >= 110 ? "Apply Now" : score >= 95 ? "Needs Review" : score >= 80 ? "Backup" : "Pass";
  if (elig === "Unknown" && rec === "Apply Now") rec = "Needs Review";
  return rec;
}

export function rankScore(job: Job, p: Profile) {
  const order = { "Apply Now": 3, "Needs Review": 2, Backup: 1, Pass: 0 };
  return order[recommendationFor(job, p)] * 1000 + job.fit.score + priorityCount(priorityFor(job, p)) * 8;
}

/* ---------- Formatting ---------- */

export function fmtDate(d: string | null) {
  if (!d) return "—";
  const [y = 0, m = 1, day = 1] = d.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtSalary(min: number | null, max: number | null) {
  if (min == null && max == null) return "Salary not listed";
  const k = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min != null && max != null) return `${k(min)}–${k(max)}`;
  return k((min ?? max)!);
}

export function daysUntil(d: string) {
  const a = new Date(TODAY).getTime();
  const b = new Date(d).getTime();
  return Math.round((b - a) / 86400000);
}
