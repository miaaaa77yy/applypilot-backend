import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  defaultProfile,
  seedApplications,
  seedJobs,
  seedTasks,
  TODAY,
  type Application,
  type AppStatus,
  type Job,
  type Profile,
  type Task,
} from "./data";

interface State {
  onboarded: boolean;
  profile: Profile;
  jobs: Job[];
  applications: Application[];
  tasks: Task[];
  compareIds: string[];
  passedJobIds: string[];
}

const initial: State = {
  onboarded: false,
  profile: defaultProfile,
  jobs: seedJobs,
  applications: seedApplications,
  tasks: seedTasks,
  compareIds: ["spotify-da", "adobe-pa"],
  passedJobIds: [],
};

const KEY = "applypilot-state-v1";
let idc = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}-${idc++}`;

function useStoreValue() {
  const [state, setState] = useState<State>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const saved = { ...initial, ...JSON.parse(raw) } as State;
        // Migrate untouched old demo persona to the new default
        if (saved.profile.fullName === "Katherine Ma") saved.profile = { ...saved.profile, fullName: defaultProfile.fullName };
        if (saved.profile.degree === "M.S. Business Analytics, UCLA Anderson") saved.profile = { ...saved.profile, degree: defaultProfile.degree };
        setState(saved);
      }
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);

  const actions = useMemo(
    () => ({
      setProfile: (patch: Partial<Profile>) => update((s) => ({ ...s, profile: { ...s.profile, ...patch } })),
      completeOnboarding: () => update((s) => ({ ...s, onboarded: true })),
      addJob: (job: Job) => update((s) => ({ ...s, jobs: [job, ...s.jobs] })),
      passJob: (jobId: string) =>
        update((s) => s.passedJobIds.includes(jobId) ? s : { ...s, passedJobIds: [...s.passedJobIds, jobId] }),
      toggleCompare: (id: string) =>
        update((s) => {
          if (s.compareIds.includes(id)) return { ...s, compareIds: s.compareIds.filter((x) => x !== id) };
          if (s.compareIds.length >= 3) return s;
          return { ...s, compareIds: [...s.compareIds, id] };
        }),
      setCompare: (ids: string[]) => update((s) => ({ ...s, compareIds: ids.slice(0, 3) })),
      trackJob: (jobId: string, status: AppStatus) =>
        update((s) => {
          const existing = s.applications.find((a) => a.jobId === jobId);
          if (existing) {
            if (existing.status === status) return s;
            return {
              ...s,
              applications: s.applications.map((a) =>
                a.id === existing.id
                  ? { ...a, status, timeline: [...a.timeline, { date: TODAY, label: `Moved to ${status}` }] }
                  : a,
              ),
            };
          }
          const app: Application = {
            id: uid("app"),
            jobId,
            status,
            date: TODAY,
            nextAction: status === "Saved" ? "Decide whether to apply" : "Follow up in one week",
            notes: "",
            timeline: [{ date: TODAY, label: status === "Saved" ? "Saved job" : status }],
          };
          return { ...s, applications: [...s.applications, app] };
        }),
      setStatus: (appId: string, status: AppStatus) =>
        update((s) => ({
          ...s,
          applications: s.applications.map((a) =>
            a.id === appId && a.status !== status
              ? { ...a, status, timeline: [...a.timeline, { date: TODAY, label: `Moved to ${status}` }] }
              : a,
          ),
        })),
      setNotes: (appId: string, notes: string) =>
        update((s) => ({ ...s, applications: s.applications.map((a) => (a.id === appId ? { ...a, notes } : a)) })),
      setNextAction: (appId: string, nextAction: string) =>
        update((s) => ({
          ...s,
          applications: s.applications.map((a) => (a.id === appId ? { ...a, nextAction } : a)),
        })),
      addTask: (t: Omit<Task, "id" | "done">) =>
        update((s) => ({ ...s, tasks: [...s.tasks, { ...t, id: uid("task"), done: false }] })),
      toggleTask: (id: string) =>
        update((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),
      reset: () => {
        localStorage.removeItem(KEY);
        setState(initial);
      },
    }),
    [update],
  );

  return { ...state, hydrated, ...actions };
}

type Store = ReturnType<typeof useStoreValue>;
// Keep one context instance across hot reloads so provider and consumers always match
const g = globalThis as unknown as { __applypilotCtx?: React.Context<Store | null> };
const Ctx = (g.__applypilotCtx ??= createContext<Store | null>(null));

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue();
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useStore outside provider");
  return v;
}

export function useJob(id: string | null | undefined) {
  const { jobs } = useStore();
  return jobs.find((j) => j.id === id) ?? null;
}
