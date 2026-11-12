import { useState } from "react";
import { CheckCircle2, Circle, Map, Sparkles, Target, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/Brand";

export function RoadmapModule() {
  const [completed, setCompleted] = useState<string[]>(["m1", "m2", "m3", "m5", "m7"]);

  const toggle = (id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    if (!completed.includes(id)) toast.success("Milestone achieved!");
  };

  const phases = [
    {
      title: "Phase 1: Foundations (DSA & Mathematics)",
      status: "Completed",
      milestones: [
        { id: "m1", title: "Time & Space Complexity Big-O Fundamentals", track: "Core" },
        {
          id: "m2",
          title: "Linear Data Structures: Arrays, Strings, Linked Lists",
          track: "Placement",
        },
        {
          id: "m3",
          title: "Quantitative Aptitude: Percentages, Ratios & Time-Work",
          track: "Both",
        },
      ],
    },
    {
      title: "Phase 2: Core Engineering & Algorithmic Mastery",
      status: "In Progress",
      milestones: [
        {
          id: "m4",
          title: "Trees, Graphs & Dynamic Programming (Kadane, 2-Pointer)",
          track: "Placement",
        },
        {
          id: "m5",
          title: "Database Management (DBMS, SQL Normalization & Indexing)",
          track: "Core",
        },
        { id: "m6", title: "Operating Systems & Concurrency (Threads, Deadlocks)", track: "Core" },
      ],
    },
    {
      title: "Phase 3: High-Impact Portfolio & Fullstack Systems",
      status: "Upcoming",
      milestones: [
        {
          id: "m7",
          title: "Production Fullstack App with Authentication & APIs",
          track: "Placement",
        },
        { id: "m8", title: "ATS-Optimized Resume with Quantified Metrics", track: "Placement" },
        {
          id: "m9",
          title: "Current Affairs & Polity Mastery (Laxmikanth Unit 8)",
          track: "Government",
        },
      ],
    },
    {
      title: "Phase 4: Interview Mastery & Campus Drives",
      status: "Upcoming",
      milestones: [
        { id: "m10", title: "Weekly AI Interview Mentor: 4 Consecutive 75+ Scores", track: "Both" },
        {
          id: "m11",
          title: "Speech Cadence Stabilization (Target 130 WPM, Zero Fillers)",
          track: "Placement",
        },
        {
          id: "m12",
          title: "Company-Specific Mock Drills (TCS NQT, Infosys, UPSC/SSC PYQs)",
          track: "Both",
        },
      ],
    },
  ];

  const totalMilestones = phases.reduce((acc, p) => acc + p.milestones.length, 0);
  const progressPct = Math.round((completed.length / totalMilestones) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-xs font-bold text-violet">
                Placement & Exam Journey
              </span>
              <span className="text-xs text-muted-foreground">Milestone Tracker</span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">Interactive Career Roadmap</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Track key benchmarks from foundational coding to high-impact projects and AI mock
              rounds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand px-4 py-2 text-center text-white shadow-glow">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                Roadmap Completion
              </p>
              <p className="font-display text-2xl font-bold">{progressPct}%</p>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-1">
            <span>Overall Career Milestone Progress</span>
            <span className="text-primary font-bold">
              {completed.length} of {totalMilestones} Completed
            </span>
          </div>
          <Progress value={progressPct} className="h-2" />
        </div>
      </div>

      {/* Phases */}
      <div className="space-y-4">
        {phases.map((phase, pIdx) => (
          <div key={pIdx} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-foreground">{phase.title}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                  phase.status === "Completed"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : phase.status === "In Progress"
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {phase.status}
              </span>
            </div>

            <div className="mt-3.5 space-y-2">
              {phase.milestones.map((m) => {
                const isDone = completed.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left transition hover:bg-muted/50"
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-slate-400" />
                    )}
                    <span
                      className={`flex-1 text-xs font-medium ${
                        isDone ? "text-muted-foreground line-through" : "text-foreground"
                      }`}
                    >
                      {m.title}
                    </span>
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold uppercase text-muted-foreground">
                      {m.track}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
