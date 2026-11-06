import { createFileRoute } from "@tanstack/react-router";
import { Award, Flame, Target } from "lucide-react";
import { modules, overallReadiness, skills, streak } from "@/lib/data";
import { Progress } from "@/components/Brand";

export const Route = createFileRoute("/app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — CareerPilot AI" },
      { name: "description", content: "Your skill scores, streaks and module progress." },
      { property: "og:title", content: "Progress — CareerPilot AI" },
      { property: "og:description", content: "See how your placement readiness is growing." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const stats = [
    { label: "Readiness", value: `${overallReadiness}%`, icon: Target },
    { label: "Streak", value: `${streak.current}d`, icon: Flame },
    { label: "Best", value: `${streak.best}d`, icon: Award },
  ];
  return (
    <div className="space-y-5 px-5 pt-8 md:px-6">
      <h1 className="text-2xl font-bold">Your progress</h1>
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-card p-4 text-center shadow-card">
            <s.icon className="mx-auto h-5 w-5 text-primary" />
            <p className="font-display mt-2 text-xl font-bold">{s.value}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-bold">Skill scores</h2>
        <div className="mt-4 flex h-40 items-end justify-between gap-3">
          {skills.map((s) => (
            <div key={s.name} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold">{s.score}</span>
              <div className="bg-brand w-full rounded-t-lg" style={{ height: `${s.score}%` }} />
              <span className="text-[10px] text-muted-foreground">{s.name}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-y-4 rounded-2xl bg-card p-5 shadow-card">
        <h2 className="font-bold">Modules</h2>
        {modules.map((m) => (
          <div key={m.id}>
            <div className="mb-1.5 flex justify-between text-sm"><span>{m.title}</span><b>{m.progress}%</b></div>
            <Progress value={m.progress} />
          </div>
        ))}
      </section>
    </div>
  );
}
