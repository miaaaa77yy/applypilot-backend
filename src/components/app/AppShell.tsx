import { Link } from "@tanstack/react-router";
import { LayoutDashboard, Search, Columns3, KanbanSquare, ListChecks, UserRound, Plane, RotateCcw } from "lucide-react";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/jobs", label: "Review Jobs", icon: Search },
  { to: "/compare", label: "Compare", icon: Columns3 },
  { to: "/applications", label: "Applications", icon: KanbanSquare },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
  { to: "/profile", label: "Profile", icon: UserRound },
] as const;

export function AppShell({ title, subtitle, actions, children }: { title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode }) {
  const { profile, reset } = useStore();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-sidebar p-4 text-sidebar-foreground md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 pt-1">
          <div className="grid size-8 place-items-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Plane className="size-4" />
          </div>
          <span className="text-lg font-bold text-sidebar-accent-foreground">ApplyPilot</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border pt-4">
          <p className="px-2 text-sm font-semibold text-sidebar-accent-foreground">{profile.fullName}</p>
          <p className="truncate px-2 text-xs">{profile.degree}</p>
          <button onClick={reset} className="mt-3 flex items-center gap-1.5 px-2 text-xs opacity-70 hover:opacity-100">
            <RotateCcw className="size-3" /> Reset demo
          </button>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="flex gap-1 overflow-x-auto border-b bg-sidebar p-2 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-sidebar-foreground" activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="mx-auto max-w-[1400px] p-4 md:p-8">
          <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {actions}
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

export function Card({ className = "", children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`rounded-xl border bg-card shadow-card ${className}`} {...rest}>
      {children}
    </div>
  );
}
