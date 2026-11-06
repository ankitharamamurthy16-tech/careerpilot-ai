import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Check, Clock, Flame, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { getStudent } from "@/lib/auth";
import { dailyTasks, modules, overallReadiness, skills, streak } from "@/lib/data";
import { Progress } from "@/components/Brand";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerPilot AI" },
      { name: "description", content: "Your placement readiness, skill scores, daily tasks and streak." },
      { property: "og:title", content: "Dashboard — CareerPilot AI" },
      { property: "og:description", content: "Track placement readiness, skills and daily tasks." },
    ],
  }),
  component: Dashboard,
});

const days = ["M", "T", "W", "T", "F", "S", "S"];

function Dashboard() {
  const student = getStudent();
  const [done, setDone] = useState<string[]>(["t2"]);
  const toggle = (id: string) => {
    setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]));
    if (!done.includes(id)) toast.success("Task complete — nice work!");
  };
  const first = student?.name.split(" ")[0] ?? "Student";

  return (
    <div>
      <header className="bg-hero rounded-b-[2rem] px-5 pb-20 pt-8 text-navy-foreground md:mx-6 md:mt-6 md:rounded-3xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-75">Good afternoon,</p>
            <h1 className="text-2xl font-bold">{first} 👋</h1>
          </div>
          <button onClick={() => toast("Infosys drive registration closes Nov 12")} aria-label="Notifications"
            className="relative rounded-full bg-navy-foreground/10 p-3">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-violet" />
          </button>
        </div>
        <div className="mt-6 flex items-center gap-5">
          <Ring value={overallReadiness} />
          <div>
            <p className="text-xs uppercase tracking-wider opacity-70">Placement readiness</p>
            <p className="font-display text-lg font-semibold">On track for Feb drives</p>
            <p className="mt-1 text-xs opacity-75">+6% this week</p>
          </div>
        </div>
      </header>

      <div className="-mt-12 space-y-5 px-5 md:px-6">
        {/* Streak */}
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-warning/15 p-2.5 text-warning"><Flame className="h-5 w-5" /></span>
              <div>
                <p className="font-display text-xl font-bold">{streak.current} day streak</p>
                <p className="text-xs text-muted-foreground">Best: {streak.best} days</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {streak.week.map((on, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${on ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {on ? <Check className="h-4 w-4" /> : ""}
                </span>
                <span className="text-[11px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Daily tasks */}
          <section className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Today's tasks</h2>
              <span className="text-xs font-semibold text-primary">{done.length}/{dailyTasks.length} done</span>
            </div>
            <ul className="mt-3 space-y-2">
              {dailyTasks.map((t) => {
                const d = done.includes(t.id);
                return (
                  <li key={t.id}>
                    <button onClick={() => toggle(t.id)} className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted">
                      <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${d ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                        {d && <Check className="h-4 w-4" />}
                      </span>
                      <span className={`flex-1 text-sm font-medium ${d ? "text-muted-foreground line-through" : ""}`}>{t.title}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{t.minutes}m</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Skills */}
          <section className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Skill scores</h2>
              <Link to="/app/progress" className="text-xs font-semibold text-primary">Details</Link>
            </div>
            <div className="mt-4 space-y-4">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-1.5 flex justify-between text-sm"><span className="font-medium">{s.name}</span><span className="font-bold">{s.score}</span></div>
                  <Progress value={s.score} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* AI tip */}
        <section className="flex items-start gap-3 rounded-2xl border border-accent bg-accent/60 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm text-accent-foreground"><b>Pilot tip:</b> Communication is your lowest score. Two 10-minute practice sessions this week can lift it by ~8 points.</p>
        </section>

        {/* Modules */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Prepare</h2>
            <Link to="/app/modules" className="text-xs font-semibold text-primary">See all</Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {modules.map((m) => (
              <Link key={m.id} to="/app/modules/$id" params={{ id: m.id }}
                className="rounded-2xl bg-card p-4 shadow-card transition active:scale-[0.97] hover:-translate-y-0.5">
                <span className="inline-flex rounded-xl bg-accent p-2.5 text-primary"><m.icon className="h-5 w-5" /></span>
                <p className="mt-3 text-sm font-bold leading-tight">{m.title}</p>
                <Progress value={m.progress} className="mt-3 h-1.5" />
                <p className="mt-1.5 text-[11px] text-muted-foreground">{m.progress}% complete</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 34, c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle cx="40" cy="40" r={r} strokeWidth="8" className="fill-none stroke-navy-foreground/15" />
        <circle cx="40" cy="40" r={r} strokeWidth="8" strokeLinecap="round" className="fill-none stroke-violet"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} />
      </svg>
      <span className="font-display absolute inset-0 flex items-center justify-center text-2xl font-bold">{value}%</span>
    </div>
  );
}
