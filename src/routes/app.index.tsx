import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Bell,
  Check,
  Clock,
  Flame,
  Sparkles,
  Mic,
  Landmark,
  Briefcase,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Target,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import { getStudent } from "@/lib/auth";
import {
  getPathway,
  setPathway,
  getSelectedPathways,
  setSelectedPathways,
  togglePathway,
  getIntegratedMetrics,
  getCompletedTaskIds,
  setTaskCompleted,
  streak,
  skills,
  type PreparationPathway,
  type PathwayType,
} from "@/lib/data";
import { Progress, BrandMark } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationCentre";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — CareerPilot AI" },
      {
        name: "description",
        content:
          "AI-powered placement, government exam, and GATE examination preparation dashboard.",
      },
      { property: "og:title", content: "Dashboard — CareerPilot AI" },
      {
        property: "og:description",
        content:
          "Track placement readiness, government exams, GATE CSE, and weekly AI mock interviews.",
      },
    ],
  }),
  component: Dashboard,
});

const days = ["M", "T", "W", "T", "F", "S", "S"];

function Dashboard() {
  const student = getStudent();
  const [selectedPathways, setSelectedPathwaysState] = useState<PathwayType[]>([
    "placement",
    "government",
    "gate",
  ]);
  const [done, setDone] = useState<string[]>([]);
  const [metrics, setMetrics] = useState(getIntegratedMetrics());

  useEffect(() => {
    setSelectedPathwaysState(getSelectedPathways());
    setMetrics(getIntegratedMetrics());
    setDone(getCompletedTaskIds());
  }, []);

  const handleTogglePathway = (p: PathwayType) => {
    const updated = togglePathway(p);
    setSelectedPathwaysState(updated);
    setMetrics(getIntegratedMetrics());
    toast.success(
      updated.includes(p)
        ? `Added ${p === "gate" ? "GATE Prep" : p === "government" ? "Govt Exams" : "Placements"} to your tracks`
        : `Removed ${p === "gate" ? "GATE Prep" : p === "government" ? "Govt Exams" : "Placements"} from active view`,
    );
  };

  const handleSelectAll = () => {
    setSelectedPathways(["placement", "government", "gate"]);
    setSelectedPathwaysState(["placement", "government", "gate"]);
    setMetrics(getIntegratedMetrics());
    toast.success("Active tracks: Placements, Government Exams, and GATE Preparation");
  };

  const toggle = (id: string) => {
    const isDone = done.includes(id);
    const updated = setTaskCompleted(id, !isDone);
    setDone(updated);
    if (!isDone) toast.success("Task completed — great progress!");
  };

  const first = student?.name.split(" ")[0] ?? "Student";

  return (
    <div>
      {/* Header Banner */}
      <header className="bg-hero rounded-b-[2rem] px-5 pb-16 pt-8 text-navy-foreground md:mx-6 md:mt-6 md:rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <BrandMark size={44} className="border border-white/20 shadow-glow" />
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider opacity-75">
                <span>{student?.branch || "Computer Science"}</span>
                <span>•</span>
                <span>{student?.college || "College Student"}</span>
              </div>
              <h1 className="mt-0.5 text-2xl font-bold">Good day, {first} 👋</h1>
            </div>
          </div>
          <NotificationBell triggerVariant="header" />
        </div>

        {/* 3 Pathways Multi-Select Selector */}
        <div className="mt-6 rounded-2xl bg-black/25 p-2 backdrop-blur">
          <div className="flex items-center justify-between px-2 pb-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-75">
              Active Preparation Pathways (Select One or Multiple):
            </p>
            <button
              onClick={handleSelectAll}
              className="text-[10px] font-bold text-yellow-300 hover:underline"
            >
              Select All 3 Tracks
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              onClick={() => handleTogglePathway("placement")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition ${
                selectedPathways.includes("placement")
                  ? "bg-white text-navy shadow-sm"
                  : "text-navy-foreground opacity-60 hover:opacity-100 bg-white/5"
              }`}
            >
              <Briefcase className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Placements</span>
              {selectedPathways.includes("placement") && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>
            <button
              onClick={() => handleTogglePathway("government")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition ${
                selectedPathways.includes("government")
                  ? "bg-white text-navy shadow-sm"
                  : "text-navy-foreground opacity-60 hover:opacity-100 bg-white/5"
              }`}
            >
              <Landmark className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Govt Exams</span>
              {selectedPathways.includes("government") && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>
            <button
              onClick={() => handleTogglePathway("gate")}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-xs font-bold transition ${
                selectedPathways.includes("gate")
                  ? "bg-white text-navy shadow-sm"
                  : "text-navy-foreground opacity-60 hover:opacity-100 bg-white/5"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">GATE Prep</span>
              {selectedPathways.includes("gate") && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Readiness Ring and Pathway Summary */}
        <div className="mt-6 flex items-center gap-5">
          <Ring value={metrics.readiness} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">
              {selectedPathways.length === 1
                ? `${selectedPathways[0].toUpperCase()} Track Readiness`
                : "Integrated Multi-Track Readiness"}
            </p>
            <p className="font-display text-lg font-bold">
              {metrics.readiness >= 75
                ? "Excellent Pace — Competitive Ready"
                : "Steady Progress — Daily Growth"}
            </p>
            <p className="mt-0.5 text-xs opacity-80">
              AI Interview: {metrics.interviewAvg}% • Govt Mock: {metrics.govAvg}% • GATE Mock:{" "}
              {metrics.gateAvg}%
            </p>
          </div>
        </div>
      </header>

      <div className="-mt-8 space-y-5 px-5 md:px-6">
        {/* Weekly AI Interview Mentor Highlight Card */}
        <section className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-r from-violet/15 via-indigo-500/10 to-primary/10 p-5 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <span className="bg-brand shadow-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
                <Mic className="h-6 w-6" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                    Week 2 Simulated Round
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" /> 10-15 mins
                  </span>
                </div>
                <h3 className="font-display mt-1 text-base font-bold">
                  Weekly AI Interview Mentor
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Spoken voice & typed evaluations with speech pace (WPM), STAR answer structure,
                  and grammar feedback.
                </p>
              </div>
            </div>

            <Link
              to="/app/modules/$id"
              params={{ id: "interview-mentor" }}
              className="bg-brand shadow-glow inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] hover:opacity-95"
            >
              <span>Start Simulated Interview</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Historical comparison teaser */}
          {metrics.latestInterview && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/75 p-3 text-xs">
              <span className="font-medium text-muted-foreground">
                Last Interview (Week {metrics.latestInterview.weekNumber}):
              </span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-primary">
                  Score: {metrics.latestInterview.evaluation.score}/100
                </span>
                <span>•</span>
                <span className="font-semibold text-foreground">
                  Pace: {metrics.latestInterview.evaluation.speakingPaceWpm} WPM (
                  {metrics.latestInterview.evaluation.paceVerdict})
                </span>
                <span>•</span>
                <span className="text-muted-foreground">
                  Fillers: {metrics.latestInterview.evaluation.fillerWordCount}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Government Exam Track Highlight (if active) */}
        {selectedPathways.includes("government") && (
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Landmark className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="font-display font-bold">Government Examination Track</h3>
                  <p className="text-xs text-muted-foreground">
                    UPSC, TNPSC, SSC, Banking (IBPS/SBI) & Railway (RRB)
                  </p>
                </div>
              </div>
              <Link
                to="/app/modules/$id"
                params={{ id: "government-exams" }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Open Track →
              </Link>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  PYQs Available
                </p>
                <p className="font-display text-base font-bold text-foreground">1,200+ PYQs</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Current Affairs
                </p>
                <p className="font-display text-base font-bold text-success">Verified Sources</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Target Exams
                </p>
                <p className="font-display text-base font-bold text-foreground">5 Major Cadres</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Study Plan
                </p>
                <p className="font-display text-base font-bold text-primary">30-90 Day Paths</p>
              </div>
            </div>
          </section>
        )}

        {/* GATE Exam Preparation Track Highlight (if active) */}
        {selectedPathways.includes("gate") && (
          <section className="rounded-2xl border border-violet/30 bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-violet/15 p-2.5 text-violet">
                  <GraduationCap className="h-5 w-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold">GATE Exam Preparation</h3>
                    <span className="rounded-full bg-violet/20 px-2 py-0.5 text-[10px] font-bold text-violet">
                      7 Papers
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    CS, DA, EC, EE, ME, CE & Other • 12 Subjects • Official PYQs & NAT Questions
                  </p>
                </div>
              </div>
              <Link
                to="/app/modules/$id"
                params={{ id: "gate-prep" }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Open GATE →
              </Link>
            </div>

            <div className="mt-3.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  CSE Subjects
                </p>
                <p className="font-display text-base font-bold text-foreground">All 12 Included</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Question Formats
                </p>
                <p className="font-display text-base font-bold text-violet">MCQs & NATs</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Official PYQs
                </p>
                <p className="font-display text-base font-bold text-emerald-600 dark:text-emerald-400">
                  Verified Marking
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-2.5 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Roadmaps
                </p>
                <p className="font-display text-base font-bold text-primary">30 & 90 Days</p>
              </div>
            </div>
          </section>
        )}

        {/* Streak card */}
        <section className="rounded-2xl bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="rounded-xl bg-warning/15 p-2.5 text-warning">
                <Flame className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display text-xl font-bold">{streak.current} day streak</p>
                <p className="text-xs text-muted-foreground">Personal best: {streak.best} days</p>
              </div>
            </div>
            <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-bold text-success">
              Active Today
            </span>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-2">
            {streak.week.map((on, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold ${
                    on ? "bg-brand text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {on ? <Check className="h-4 w-4" /> : ""}
                </span>
                <span className="text-[11px] text-muted-foreground">{days[i]}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Daily Tasks Filtered by Pathway */}
          <section className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Today's Daily Tasks</h2>
              <span className="text-xs font-semibold text-primary">
                {done.length}/{metrics.filteredTasks.length} done
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {metrics.filteredTasks.map((t) => {
                const isDone = done.includes(t.id);
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => toggle(t.id)}
                      className="flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition hover:bg-muted"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 ${
                          isDone
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border"
                        }`}
                      >
                        {isDone && <Check className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className={`block text-sm font-medium ${
                            isDone ? "text-muted-foreground line-through" : ""
                          }`}
                        >
                          {t.title}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {t.track} track
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {t.minutes}m
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Skill Scores */}
          <section className="rounded-2xl bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Skill Scores</h2>
              <Link to="/app/progress" className="text-xs font-semibold text-primary">
                Detailed Analysis →
              </Link>
            </div>
            <div className="mt-4 space-y-3.5">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="mb-1 flex justify-between text-xs font-semibold">
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-primary">{s.score}%</span>
                  </div>
                  <Progress value={s.score} className="h-2" />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Real Weak Areas & Personalised Recommendation Card */}
        <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 shadow-card">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="w-full">
              <h4 className="font-display font-bold text-amber-900 dark:text-amber-200">
                Identified Weak Areas & AI Focus Advice
              </h4>
              <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
                Derived directly from recent assessment and weekly AI interview evaluations:
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {metrics.weakAreas.map((w) => (
                  <div
                    key={w.topic}
                    className="rounded-xl border border-amber-500/20 bg-card/85 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-foreground">
                      <span>{w.topic}</span>
                      <span className="text-amber-600 dark:text-amber-400">{w.score}%</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{w.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Modules Section Filtered by Pathway */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">Preparation Modules</h2>
              <p className="text-xs text-muted-foreground">
                Showing {metrics.filteredModules.length} modules for{" "}
                {selectedPathways
                  .map((p) =>
                    p === "gate" ? "GATE" : p === "government" ? "Govt Exams" : "Placements",
                  )
                  .join(" + ")}
              </p>
            </div>
            <Link to="/app/modules" className="text-xs font-semibold text-primary">
              View all modules →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {metrics.filteredModules.map((m) => (
              <Link
                key={m.id}
                to="/app/modules/$id"
                params={{ id: m.id }}
                className="group relative flex flex-col justify-between rounded-2xl bg-card p-4 shadow-card transition active:scale-[0.97] hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-flex rounded-xl bg-accent p-2.5 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <m.icon className="h-5 w-5" />
                    </span>
                    <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                      {m.track}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-tight">{m.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{m.tagline}</p>
                </div>
                <div className="mt-4">
                  <Progress value={m.progress} className="h-1.5" />
                  <p className="mt-1.5 text-[10px] font-semibold text-muted-foreground">
                    {m.progress}% complete
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Ring({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative h-24 w-24 shrink-0">
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={r}
          strokeWidth="8"
          className="fill-none stroke-navy-foreground/15"
        />
        <circle
          cx="40"
          cy="40"
          r={r}
          strokeWidth="8"
          strokeLinecap="round"
          className="fill-none stroke-violet"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <span className="font-display absolute inset-0 flex items-center justify-center text-2xl font-bold">
        {value}%
      </span>
    </div>
  );
}
