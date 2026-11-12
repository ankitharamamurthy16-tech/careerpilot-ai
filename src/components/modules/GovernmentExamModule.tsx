import { useState } from "react";
import {
  Landmark,
  CheckCircle2,
  XCircle,
  Calendar,
  BookOpen,
  Award,
  Layers,
  Sparkles,
  FileCheck2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  govExams,
  govQuestionBank,
  saveGovResult,
  getGovResults,
  type GovExamId,
  type GovQuestion,
} from "@/lib/data";

export function GovernmentExamModule() {
  const [selectedExamId, setSelectedExamId] = useState<GovExamId>("upsc");
  const [activeTab, setActiveTab] = useState<"practice" | "study-plan" | "history">("practice");
  const [questionFilter, setQuestionFilter] = useState<"all" | "pyq" | "current-affairs">("all");

  // Selected exam details
  const exam = govExams.find((e) => e.id === selectedExamId) ?? govExams[0]!;

  // Questions for this exam
  const questions = govQuestionBank.filter((q) => {
    if (q.examId !== selectedExamId) return false;
    if (questionFilter === "pyq") return q.isPYQ;
    if (questionFilter === "current-affairs") return !q.isPYQ;
    return true;
  });

  // Quiz state
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length === 0) {
      toast.error("Please answer at least one question before submitting.");
      return;
    }

    setSubmitted(true);
    let correctCount = 0;
    const topicAccuracies: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const topic = q.topic || q.subject;
      if (!topicAccuracies[topic]) {
        topicAccuracies[topic] = { correct: 0, total: 0 };
      }
      topicAccuracies[topic]!.total += 1;

      if (userAnswers[q.id] === q.answer) {
        correctCount += 1;
        topicAccuracies[topic]!.correct += 1;
      }
    });

    saveGovResult({
      examId: selectedExamId,
      examTitle: exam.name,
      takenAt: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      score: correctCount,
      total: questions.length,
      topicAccuracies,
    });

    toast.success(`Quiz completed! You scored ${correctCount}/${questions.length}`);
  };

  const pastResults = getGovResults().filter((r) => r.examId === selectedExamId);

  return (
    <div className="space-y-6">
      {/* Exam Selector Carousel/Tabs */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Select Your Target Government Examination:
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {govExams.map((e) => {
            const isSelected = e.id === selectedExamId;
            return (
              <button
                key={e.id}
                onClick={() => {
                  setSelectedExamId(e.id);
                  setUserAnswers({});
                  setSubmitted(false);
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition active:scale-[0.98] ${
                  isSelected
                    ? "bg-brand text-primary-foreground shadow-glow"
                    : "border border-border bg-muted/40 hover:bg-muted"
                }`}
              >
                <Landmark className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"}`} />
                <span className="mt-1.5 text-xs font-bold">{e.name}</span>
                <span
                  className={`mt-0.5 text-[9px] font-medium uppercase ${
                    isSelected ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {e.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Exam Header Card */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {exam.badge}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Next Cycle: {exam.nextExamDate}
              </span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">{exam.fullName}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{exam.description}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("practice")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "practice"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Practice & PYQs
            </button>
            <button
              onClick={() => setActiveTab("study-plan")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "study-plan"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Study Plan
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              History ({pastResults.length})
            </button>
          </div>
        </div>

        {/* Subjects in this exam */}
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3">
          <span className="text-xs font-semibold text-muted-foreground">Syllabus Subjects:</span>
          {exam.subjects.map((s) => (
            <span
              key={s}
              className="rounded-lg bg-accent/70 px-2.5 py-0.5 text-[11px] font-medium text-accent-foreground"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* TAB 1: PRACTICE QUESTIONS & PREVIOUS YEAR QUESTIONS */}
      {activeTab === "practice" && (
        <div className="space-y-4">
          {/* Question Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setQuestionFilter("all")}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  questionFilter === "all"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-card text-muted-foreground"
                }`}
              >
                All Questions ({questions.length})
              </button>
              <button
                onClick={() => setQuestionFilter("pyq")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  questionFilter === "pyq"
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-card text-muted-foreground"
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                <span>Official PYQs Only</span>
              </button>
              <button
                onClick={() => setQuestionFilter("current-affairs")}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  questionFilter === "current-affairs"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-card text-muted-foreground"
                }`}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Current Affairs (Sourced)</span>
              </button>
            </div>

            {submitted && (
              <button
                onClick={handleResetQuiz}
                className="text-xs font-semibold text-primary underline"
              >
                Try Again / Retake
              </button>
            )}
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {questions.map((q, idx) => {
              const selectedOpt = userAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={q.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-card transition"
                >
                  {/* Question Header & Distinguishing Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      Question {idx + 1} of {questions.length} • {q.subject}
                    </span>

                    {/* Official PYQ Badge vs Current Affairs / Practice Badge */}
                    {q.isPYQ ? (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        <Award className="h-3.5 w-3.5" />
                        <span>Official PYQ: {q.pyqSource}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Current Affairs ({q.sourceDate})</span>
                      </span>
                    )}
                  </div>

                  {/* Question Stem */}
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground whitespace-pre-line">
                    {q.q}
                  </p>

                  {/* Source Reference Details for Current Affairs */}
                  {q.sourceRef && (
                    <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Official Source:
                      </span>
                      <span>{q.sourceRef}</span>
                      <span>•</span>
                      <span>{q.sourceDate}</span>
                    </div>
                  )}

                  {/* Options */}
                  <div className="mt-4 space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = selectedOpt === optIdx;
                      let btnStyle = "border-border bg-card text-foreground hover:bg-muted/70";

                      if (submitted) {
                        if (optIdx === q.answer) {
                          btnStyle =
                            "border-success bg-success/15 text-success-foreground font-semibold";
                        } else if (isChosen && optIdx !== q.answer) {
                          btnStyle =
                            "border-destructive bg-destructive/15 text-destructive font-semibold";
                        } else {
                          btnStyle = "border-border/40 opacity-50";
                        }
                      } else if (isChosen) {
                        btnStyle =
                          "border-primary bg-primary/10 text-primary font-semibold ring-2 ring-primary/20";
                      }

                      return (
                        <button
                          key={optIdx}
                          disabled={submitted}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left text-xs transition ${btnStyle}`}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[11px] font-bold">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                          {submitted && optIdx === q.answer && (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                          )}
                          {submitted && isChosen && optIdx !== q.answer && (
                            <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation after submission */}
                  {submitted && (
                    <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs">
                      <p className="font-bold text-primary">Detailed Official Explanation:</p>
                      <p className="mt-1 leading-relaxed text-foreground">{q.explain}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Action */}
          {!submitted ? (
            <div className="sticky bottom-4 rounded-2xl border border-border bg-card/95 p-4 shadow-glow backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Answered: {Object.keys(userAnswers).length} of {questions.length} questions
                </span>
                <button
                  onClick={handleSubmitQuiz}
                  className="bg-brand shadow-glow rounded-xl px-6 py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
                >
                  Submit & Score Test
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-center">
              <h3 className="font-display text-lg font-bold text-success">Test Results Recorded</h3>
              <p className="text-xs text-muted-foreground">
                Your topic accuracy scores have been updated in your Integrated Career Profile.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: STRUCTURED STUDY PLAN */}
      {activeTab === "study-plan" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold">
                  {exam.studyPlanDays}-Day Structured Study Plan
                </h3>
                <p className="text-xs text-muted-foreground">
                  Targeted milestone roadmap for {exam.name} examination preparation
                </p>
              </div>
              <span className="rounded-full bg-violet/15 px-3 py-1 text-xs font-bold text-violet">
                {exam.studyPlanDays} Days Total
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {exam.studyPlanHighlights.map((planItem, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 text-xs"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-primary text-[11px] font-bold text-white">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{planItem}</p>
                    <p className="text-[11px] text-muted-foreground">
                      Target: Week {idx * 2 + 1}–{idx * 2 + 2} • 15 practice MCQs daily
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PAST ATTEMPTS & TOPIC ACCURACY */}
      {activeTab === "history" && (
        <div className="space-y-4">
          {pastResults.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-xs text-muted-foreground">
              No previous test attempts yet for {exam.name}. Complete a practice test to record
              topic accuracies!
            </div>
          ) : (
            <div className="space-y-3">
              {pastResults.map((r, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{r.examTitle} Mock Test</p>
                      <p className="text-[11px] text-muted-foreground">{r.takenAt}</p>
                    </div>
                    <span className="font-display text-base font-bold text-primary">
                      {r.score} / {r.total} ({Math.round((r.score / Math.max(r.total, 1)) * 100)}%)
                    </span>
                  </div>

                  {/* Topic breakdown */}
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-2 text-xs sm:grid-cols-3">
                    {Object.entries(r.topicAccuracies).map(([topic, stats]) => (
                      <div key={topic} className="rounded-lg bg-muted/50 p-2">
                        <span className="truncate block font-medium">{topic}</span>
                        <span className="text-[11px] font-bold text-primary">
                          {stats.correct}/{stats.total} correct
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
