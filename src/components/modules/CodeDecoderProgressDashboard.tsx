import { useState, useMemo } from "react";
import {
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Award,
  ArrowRight,
  RotateCcw,
  Layers,
  Terminal,
  Code2,
  Filter,
  Flame,
  Check,
  Percent,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { toast } from "sonner";
import type { DecoderOverallStats, CodeLanguage, DifficultyLevel } from "@/lib/data";

interface CodeDecoderProgressDashboardProps {
  stats: DecoderOverallStats;
  onPracticeQuestion: (language: CodeLanguage, questionId: string) => void;
  onResetProgress: () => void;
  onSwitchToPractice: () => void;
}

export function CodeDecoderProgressDashboard({
  stats,
  onPracticeQuestion,
  onResetProgress,
  onSwitchToPractice,
}: CodeDecoderProgressDashboardProps) {
  const [topicFilterLang, setTopicFilterLang] = useState<CodeLanguage | "All">("All");
  const [topicFilterStatus, setTopicFilterStatus] = useState<
    "All" | "Mastered" | "In Progress" | "Not Started"
  >("All");
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Prepare chart data for Language Comparison (Solved, Incorrect, Remaining)
  const languageChartData = useMemo(() => {
    return [
      {
        name: "Python 3",
        key: "python" as CodeLanguage,
        Solved: stats.byLanguage.python.solved,
        Incorrect: stats.byLanguage.python.incorrect,
        Remaining: stats.byLanguage.python.remaining,
        Total: stats.byLanguage.python.total,
        Accuracy: `${stats.byLanguage.python.accuracy}%`,
      },
      {
        name: "Java 17",
        key: "java" as CodeLanguage,
        Solved: stats.byLanguage.java.solved,
        Incorrect: stats.byLanguage.java.incorrect,
        Remaining: stats.byLanguage.java.remaining,
        Total: stats.byLanguage.java.total,
        Accuracy: `${stats.byLanguage.java.accuracy}%`,
      },
      {
        name: "C (GCC)",
        key: "c" as CodeLanguage,
        Solved: stats.byLanguage.c.solved,
        Incorrect: stats.byLanguage.c.incorrect,
        Remaining: stats.byLanguage.c.remaining,
        Total: stats.byLanguage.c.total,
        Accuracy: `${stats.byLanguage.c.accuracy}%`,
      },
    ];
  }, [stats]);

  // Filtered topics
  const filteredTopics = useMemo(() => {
    return stats.topics.filter((t) => {
      if (topicFilterLang !== "All" && t.language !== topicFilterLang) return false;
      if (topicFilterStatus !== "All" && t.status !== topicFilterStatus) return false;
      return true;
    });
  }, [stats.topics, topicFilterLang, topicFilterStatus]);

  const handleConfirmReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
    toast.success("Code Decoder progress reset for this student account.");
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* ======================================================== */}
      {/* 1. STUDENT PROFILE & SYNC STATUS BANNER                  */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card transition-all sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/15 text-violet">
                <Award className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Code Decoder Performance Dashboard
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Verified Progress Tracking
              </span>
            </div>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-1.5">
              <span>Student Account:</span>
              <span className="font-bold text-foreground">
                {stats.studentName
                  ? `${stats.studentName} (${stats.studentEmail})`
                  : stats.studentEmail}
              </span>
              <span>•</span>
              <span className="text-emerald-500 font-medium">Progress auto-saved per student</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchToPractice}
              className="bg-brand shadow-glow flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-[0.98] hover:opacity-95 cursor-pointer"
            >
              <span>Continue Practice</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
              title="Reset progress for this student"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Confirmation modal / banner for reset */}
        {showConfirmReset && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-600 dark:text-rose-400">
            <p className="font-bold">Are you sure you want to reset your Code Decoder progress?</p>
            <p className="mt-1 text-muted-foreground">
              This will clear all recorded attempts, solved statuses, and question accuracy for{" "}
              <span className="font-semibold text-foreground">{stats.studentEmail}</span>. Draft
              code will be preserved.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="rounded-lg bg-rose-600 px-3 py-1.5 font-bold text-white hover:bg-rose-700 transition cursor-pointer"
              >
                Yes, Reset Progress
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 font-medium text-foreground hover:bg-muted transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. PRIMARY 5 METRIC CARDS                                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Metric 1: Total Attempted */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Questions Attempted
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/10 text-violet">
              <Target className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl font-bold text-foreground">
              {stats.totalAttempted}{" "}
              <span className="text-xs font-normal text-muted-foreground">
                / {stats.totalQuestions}
              </span>
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Distinct questions tested</p>
          </div>
        </div>

        {/* Metric 2: Total Solved Correctly */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Solved Correctly
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats.totalSolved}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stats.completionRate}% of question bank
            </p>
          </div>
        </div>

        {/* Metric 3: Answered Incorrectly */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Answered Incorrectly
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <XCircle className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
              {stats.totalIncorrect}
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">Attempted & awaiting fix</p>
          </div>
        </div>

        {/* Metric 4: Overall Accuracy */}
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Overall Accuracy
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <p className="font-display text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.overallAccuracy}%
            </p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {stats.totalSolved} correct / {stats.totalAttempted} tried
            </p>
          </div>
        </div>

        {/* Metric 5: Completed & Remaining */}
        <div className="col-span-2 lg:col-span-1 rounded-2xl border border-border bg-card p-4 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Completed & Remaining
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Percent className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-emerald-500">Done: {stats.totalSolved}</span>
              <span className="text-muted-foreground">Left: {stats.totalRemaining}</span>
            </div>
            {/* Dual-color bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted flex">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${(stats.totalSolved / stats.totalQuestions) * 100}%` }}
                title={`Solved: ${stats.totalSolved}`}
              />
              <div
                className="h-full bg-rose-500/70 transition-all duration-300"
                style={{ width: `${(stats.totalIncorrect / stats.totalQuestions) * 100}%` }}
                title={`Incorrect: ${stats.totalIncorrect}`}
              />
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground text-center">
              Total {stats.totalQuestions} questions in bank
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. VISUAL PERFORMANCE CHARTS & BREAKDOWN                 */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recharts Bar Chart: Solved vs Incorrect vs Remaining by Language */}
        <div className="lg:col-span-7 rounded-3xl border border-border bg-card p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                <Code2 className="h-4 w-4 text-violet" />
                Language Mastery Breakdown
              </h3>
              <p className="text-xs text-muted-foreground">
                Distribution of Solved, Incorrect, and Remaining questions
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
              Python • Java • C
            </span>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={languageChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    fontSize: "12px",
                    color: "#f8fafc",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar
                  dataKey="Solved"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  name="Solved Correctly"
                />
                <Bar
                  dataKey="Incorrect"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  name="Incorrect / Unsolved"
                />
                <Bar dataKey="Remaining" fill="#64748b" radius={[4, 4, 0, 0]} name="Remaining" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Language Quick Cards */}
        <div className="lg:col-span-5 space-y-3">
          {(["python", "java", "c"] as CodeLanguage[]).map((lang) => {
            const data = stats.byLanguage[lang];
            const title = lang === "python" ? "Python 3" : lang === "java" ? "Java 17" : "C (GCC)";

            return (
              <div
                key={lang}
                className="rounded-2xl border border-border bg-card p-4 shadow-card space-y-2.5 hover:border-violet/40 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet/10 font-bold font-mono text-xs text-violet">
                      {lang === "python" ? "Py" : lang === "java" ? "Jv" : "C"}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{title}</h4>
                      <p className="text-[10px] text-muted-foreground">
                        {data.solved} of {data.total} Solved ({data.completionRate}%)
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-500">
                      {data.accuracy}% Accuracy
                    </span>
                    <p className="text-[10px] text-muted-foreground">{data.attempted} attempted</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted flex">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(data.solved / data.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500"
                    style={{ width: `${(data.incorrect / data.total) * 100}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                      ✓ {data.solved} Solved
                    </span>
                    <span className="text-rose-600 dark:text-rose-400 font-semibold">
                      ✗ {data.incorrect} Incorrect
                    </span>
                    <span>• {data.remaining} Remaining</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const firstQ = stats.topics.find((t) => t.language === lang);
                      if (firstQ) onPracticeQuestion(lang, firstQ.sampleQuestionId);
                    }}
                    className="text-xs font-bold text-violet hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Practice</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. PROGRESS BY DIFFICULTY (EASY, MEDIUM, HARD)           */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              Progress by Difficulty Level
            </h3>
            <p className="text-xs text-muted-foreground">
              Evaluated across Easy foundations, Medium algorithmic traps, and Hard pointer puzzles
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {stats.totalSolved} / {stats.totalQuestions} Total Solved
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(["Easy", "Medium", "Hard"] as DifficultyLevel[]).map((diff) => {
            const data = stats.byDifficulty[diff];
            const colorClass =
              diff === "Easy"
                ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5"
                : diff === "Medium"
                  ? "text-amber-500 border-amber-500/20 bg-amber-500/5"
                  : "text-rose-500 border-rose-500/20 bg-rose-500/5";
            const barFill =
              diff === "Easy"
                ? "bg-emerald-500"
                : diff === "Medium"
                  ? "bg-amber-500"
                  : "bg-rose-500";

            return (
              <div
                key={diff}
                className={`rounded-2xl border p-4 shadow-xs space-y-3 ${colorClass}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs uppercase tracking-wider">{diff} Level</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {data.total} Curated Challenges
                    </p>
                  </div>
                  <span className="font-display text-lg font-bold">
                    {data.solved} / {data.total}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted/80 flex">
                  <div
                    className={`h-full ${barFill}`}
                    style={{ width: `${(data.solved / data.total) * 100}%` }}
                  />
                  <div
                    className="h-full bg-rose-500/80"
                    style={{ width: `${(data.incorrect / data.total) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/40 text-center text-[10px]">
                  <div>
                    <span className="text-muted-foreground uppercase font-bold">Attempted</span>
                    <p className="font-bold text-foreground text-xs mt-0.5">{data.attempted}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase font-bold">Incorrect</span>
                    <p className="font-bold text-rose-500 text-xs mt-0.5">{data.incorrect}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground uppercase font-bold">Accuracy</span>
                    <p className="font-bold text-foreground text-xs mt-0.5">{data.accuracy}%</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. TOPIC-WISE PERFORMANCE MATRIX                         */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-violet" />
              Topic-Wise Placement Performance
            </h3>
            <p className="text-xs text-muted-foreground">
              Deep dive into every specific programming concept tested in technical interviews
            </p>
          </div>

          {/* Filters for Topic List */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-xl bg-muted p-1 text-xs">
              {(["All", "python", "java", "c"] as (CodeLanguage | "All")[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setTopicFilterLang(l)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold uppercase transition cursor-pointer ${
                    topicFilterLang === l
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-muted p-1 text-xs">
              {(["All", "Mastered", "In Progress", "Not Started"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopicFilterStatus(s)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer ${
                    topicFilterStatus === s
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTopics.map((topic) => {
            const isMastered = topic.status === "Mastered";
            const isInProgress = topic.status === "In Progress";

            return (
              <div
                key={topic.topic}
                className="rounded-2xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5 flex flex-col justify-between hover:border-violet/40 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-foreground line-clamp-1">
                      {topic.topic}
                    </span>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                        isMastered
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : isInProgress
                            ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {topic.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
                    <span className="font-mono uppercase font-bold text-violet">
                      {topic.language}
                    </span>
                    <span>•</span>
                    <span
                      className={
                        topic.difficulty === "Easy"
                          ? "text-emerald-500"
                          : topic.difficulty === "Medium"
                            ? "text-amber-500"
                            : "text-rose-500"
                      }
                    >
                      {topic.difficulty}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="text-[10px] text-muted-foreground">
                      Accuracy: <span className="font-bold text-foreground">{topic.accuracy}%</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Solved: {topic.solved}/{topic.total} • Incorrect: {topic.incorrect}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPracticeQuestion(topic.language, topic.sampleQuestionId)}
                    className="flex items-center gap-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                  >
                    <span>{isMastered ? "Review" : "Practice"}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTopics.length === 0 && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No topics match the selected language and status filters.
          </div>
        )}
      </div>
    </div>
  );
}
