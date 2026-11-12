import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Award,
  Flame,
  Target,
  Mic,
  TrendingUp,
  AlertTriangle,
  Landmark,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import {
  modules,
  skills,
  streak,
  getPathway,
  setPathway,
  getSelectedPathways,
  setSelectedPathways,
  togglePathway,
  getIntegratedMetrics,
  getInterviewSessions,
  getGovResults,
  getGateResults,
  type PreparationPathway,
  type PathwayType,
} from "@/lib/data";
import { getResults } from "@/lib/assessments";
import { Progress } from "@/components/Brand";
import { NotificationBell } from "@/components/NotificationCentre";

export const Route = createFileRoute("/app/progress")({
  head: () => ({
    meta: [
      { title: "Integrated Progress — CareerPilot AI" },
      {
        name: "description",
        content:
          "Track placement readiness, government exam topic accuracies, GATE mocks, and weekly AI mock interview progression.",
      },
      { property: "og:title", content: "Integrated Progress — CareerPilot AI" },
      {
        property: "og:description",
        content: "Real assessment results, weak areas and personalised recommendations.",
      },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const [selectedPathways, setSelectedPathwaysState] = useState<PathwayType[]>([
    "placement",
    "government",
    "gate",
  ]);
  const [metrics, setMetrics] = useState(getIntegratedMetrics());

  const interviewHistory = getInterviewSessions();
  const govResults = getGovResults();
  const gateResults = getGateResults();
  const quantResults = getResults();

  useEffect(() => {
    setSelectedPathwaysState(getSelectedPathways());
    setMetrics(getIntegratedMetrics());
  }, []);

  const handleTogglePathway = (p: PathwayType) => {
    const updated = togglePathway(p);
    setSelectedPathwaysState(updated);
    setMetrics(getIntegratedMetrics());
    toast.success(`Active tracks updated: ${updated.join(", ")}`);
  };

  const handleSelectAll = () => {
    setSelectedPathways(["placement", "government", "gate"]);
    setSelectedPathwaysState(["placement", "government", "gate"]);
    setMetrics(getIntegratedMetrics());
    toast.success("All 3 tracks activated");
  };

  const stats = [
    {
      label: "Readiness",
      value: `${metrics.readiness}%`,
      icon: Target,
      desc: "Integrated Track Score",
    },
    {
      label: "Active Streak",
      value: `${streak.current}d`,
      icon: Flame,
      desc: `Best: ${streak.best} days`,
    },
    {
      label: "Interview Avg",
      value: `${metrics.interviewAvg}%`,
      icon: Mic,
      desc: `${interviewHistory.length} Simulated Rounds`,
    },
    {
      label: "Govt Mock Avg",
      value: `${metrics.govAvg}%`,
      icon: Landmark,
      desc: `${govResults.length} Tests Completed`,
    },
    {
      label: "GATE Mock Avg",
      value: `${metrics.gateAvg}%`,
      icon: GraduationCap,
      desc: `${gateResults.length} Attempts`,
    },
  ];

  return (
    <div className="space-y-6 px-5 pt-8 md:px-6">
      {/* Title & Pathway Selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Integrated Career Progress</h1>
          <p className="text-xs text-muted-foreground">
            Synchronized tracking for Private Placements, Government Exams, and GATE Preparation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* 3 Pathway Pills */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm">
            <button
              onClick={() => handleTogglePathway("placement")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                selectedPathways.includes("placement")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Briefcase className="h-3 w-3" />
              <span>Placement</span>
            </button>
            <button
              onClick={() => handleTogglePathway("government")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                selectedPathways.includes("government")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Landmark className="h-3 w-3" />
              <span>Govt Exams</span>
            </button>
            <button
              onClick={() => handleTogglePathway("gate")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                selectedPathways.includes("gate")
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-3 w-3" />
              <span>GATE</span>
            </button>
            <button
              onClick={handleSelectAll}
              className="rounded-lg px-2 py-1 text-[10px] font-bold text-primary hover:bg-muted"
            >
              All Tracks
            </button>
          </div>
          <NotificationBell triggerVariant="default" />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-border bg-card p-4 text-center shadow-card"
          >
            <s.icon className="mx-auto h-5 w-5 text-primary" />
            <p className="font-display mt-2 text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs font-bold text-foreground">{s.label}</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* WEEKLY AI INTERVIEW MENTOR PROGRESSION (WEEKS COMPARISON) */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-xl bg-violet/15 p-1.5 text-violet">
                <Mic className="h-4 w-4" />
              </span>
              <h2 className="font-display font-bold text-base">
                Weekly AI Interview Mentor: Actual Score & Cadence Progression
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Historical comparison of simulated voice interviews across weeks.
            </p>
          </div>

          <Link
            to="/app/modules/$id"
            params={{ id: "interview-mentor" }}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>Conduct Next Mock Round</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {interviewHistory.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No mock interviews recorded yet. Take your first simulated round to view comparisons!
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {/* Week Comparison Bars */}
            <div className="grid gap-3 sm:grid-cols-2">
              {interviewHistory.map((sess) => (
                <div
                  key={sess.id}
                  className="rounded-xl border border-border/80 bg-muted/20 p-4 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-violet">
                      Week {sess.weekNumber} Simulated Interview
                    </span>
                    <span className="font-display text-sm font-bold text-primary">
                      {sess.evaluation.score} / 100
                    </span>
                  </div>

                  <p className="mt-2 font-medium text-foreground truncate">Role: {sess.role}</p>

                  <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="rounded bg-card p-1.5 border border-border">
                      <span className="text-muted-foreground block">Cadence</span>
                      <span className="font-bold text-foreground">
                        {sess.evaluation.speakingPaceWpm} WPM
                      </span>
                    </div>
                    <div className="rounded bg-card p-1.5 border border-border">
                      <span className="text-muted-foreground block">STAR Structure</span>
                      <span className="font-bold text-foreground">
                        {sess.evaluation.structureScore}%
                      </span>
                    </div>
                    <div className="rounded bg-card p-1.5 border border-border">
                      <span className="text-muted-foreground block">Fillers</span>
                      <span className="font-bold text-foreground">
                        {sess.evaluation.fillerWordCount} detected
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted-foreground">
                    <b>Assigned Drill:</b> {sess.evaluation.recommendedDrill}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* WEAK AREAS & AI INTERVIEW RECOMMENDATIONS */}
      <section className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 shadow-card">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="w-full">
            <h3 className="font-display font-bold text-sm text-amber-900 dark:text-amber-200">
              Real Weak Areas Derived from Your Assessment & Speech Data
            </h3>
            <p className="mt-0.5 text-xs text-amber-800 dark:text-amber-300">
              Personalized interventions to convert bottlenecks into competitive advantages:
            </p>

            <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
              {metrics.weakAreas.map((w, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-amber-500/20 bg-card p-3.5 text-xs shadow-sm"
                >
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>{w.topic}</span>
                    <span className="rounded bg-amber-500/20 px-2 py-0.5 text-amber-700 dark:text-amber-300">
                      {w.score}% Accuracy / Cadence
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] text-muted-foreground">{w.reason}</p>
                  <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2 text-[10px]">
                    <span className="font-bold uppercase text-muted-foreground">
                      {w.track} Track
                    </span>
                    <span className="text-primary font-bold">
                      15-min practice drill recommended
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SKILL SCORES BREAKDOWN */}
      <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-bold text-base mb-1">Skill Competency Matrix</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Scores updated dynamically across Aptitude, Coding, AI Interview, Core CS, and Current
          Affairs.
        </p>
        <div className="mt-4 flex h-44 items-end justify-between gap-3 border-b border-border pb-2">
          {skills.map((s) => (
            <div key={s.name} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-xs font-bold text-foreground">{s.score}%</span>
              <div
                className="bg-brand w-full rounded-t-lg transition-all"
                style={{ height: `${s.score}%` }}
              />
              <span className="truncate max-w-[80px] text-[10px] font-semibold text-muted-foreground text-center">
                {s.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT TEST ATTEMPTS (QUANTITATIVE, GOVT & GATE EXAMS) */}
      <div className="grid gap-5 md:grid-cols-3">
        {/* Quantitative Aptitude Mock Attempts */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Quantitative Aptitude Attempts</h3>
            <Link to="/app/assessment/quant-mock-4" className="text-xs font-bold text-primary">
              Take Mock 4 →
            </Link>
          </div>

          {quantResults.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No full quantitative mocks attempted yet. Launch Mock 4 to record your score!
            </p>
          ) : (
            <div className="space-y-2">
              {quantResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{r.title}</p>
                    <p className="text-[10px] text-muted-foreground">{r.takenAt}</p>
                  </div>
                  <span className="font-display font-bold text-primary text-sm">
                    {r.score} / {r.total} ({Math.round((r.score / r.total) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Government Mock Exam Attempts */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">Government Exam Attempts</h3>
            <Link
              to="/app/modules/$id"
              params={{ id: "government-exams" }}
              className="text-xs font-bold text-primary"
            >
              Open Govt Track →
            </Link>
          </div>

          {govResults.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No government mock quizzes completed yet. Practice UPSC, TNPSC, or SSC questions!
            </p>
          ) : (
            <div className="space-y-2">
              {govResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">{r.examTitle} Mock</p>
                    <p className="text-[10px] text-muted-foreground">{r.takenAt}</p>
                  </div>
                  <span className="font-display font-bold text-primary text-sm">
                    {r.score} / {r.total} ({Math.round((r.score / Math.max(r.total, 1)) * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GATE Exam Attempts */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm">GATE Exam Attempts</h3>
            <Link
              to="/app/modules/$id"
              params={{ id: "gate-prep" }}
              className="text-xs font-bold text-primary"
            >
              Launch GATE →
            </Link>
          </div>

          {gateResults.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">
              No GATE timed mock tests recorded yet. Practice MCQs & NAT questions in GATE Prep!
            </p>
          ) : (
            <div className="space-y-2">
              {gateResults.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-muted/40 p-3 text-xs"
                >
                  <div>
                    <p className="font-bold text-foreground">
                      {r.paperCode} • {r.subjectName || "Mock"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{r.takenAt}</p>
                  </div>
                  <span className="font-display font-bold text-primary text-sm">
                    {r.score} / {r.maxScore} ({r.accuracy}%)
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Preparation Modules Readiness List */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-card">
        <h2 className="font-bold text-base">Track Modules Readiness Overview</h2>
        {modules.map((m) => (
          <div key={m.id}>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-semibold text-foreground">
                {m.title} ({m.track} track)
              </span>
              <b className="text-primary">{m.progress}%</b>
            </div>
            <Progress value={m.progress} className="h-1.5" />
          </div>
        ))}
      </section>
    </div>
  );
}
