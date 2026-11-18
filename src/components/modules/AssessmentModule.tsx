import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Cpu,
  History,
  Lock,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  ASSESSMENT_CATEGORIES,
  buildAttemptRecord,
  clearAssessmentHistory,
  difficultyToSkillTier,
  getPerformanceAnalytics,
  getQuestionsByCategory,
  pickAdaptiveDifficulty,
  saveAssessmentAttempt,
  type AssessmentAttemptRecord,
  type AssessmentCategory,
  type AssessmentQuestion,
  type DifficultyLevel,
  type PerformanceAnalytics,
  type SkillTier,
} from "@/lib/assessments";
import { Progress } from "@/components/Brand";

type HubTab = "overview" | "aptitude" | "logical" | "technical" | "core-cs" | "performance";

interface ActiveQuizSession {
  attemptId: string;
  assessmentId: string;
  category: AssessmentCategory | "recommended";
  title: string;
  topicFilter: string;
  difficultyFilter: string;
  questions: AssessmentQuestion[];
  startedAtMs: number;
}

const formatDuration = (sec: number) => {
  const safe = Math.max(0, Math.round(sec));
  const m = Math.floor(safe / 60);
  const s = safe % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function AssessmentModule() {
  const [activeTab, setActiveTab] = useState<HubTab>("overview");
  const [analytics, setAnalytics] = useState<PerformanceAnalytics>(() => getPerformanceAnalytics());

  // Per-tab filter selections
  const [topicFilters, setTopicFilters] = useState<Record<AssessmentCategory, string>>({
    aptitude: "all",
    logical: "all",
    technical: "all",
    "core-cs": "all",
  });
  const [difficultyFilters, setDifficultyFilters] = useState<
    Record<AssessmentCategory, DifficultyLevel | "all">
  >({
    aptitude: "all",
    logical: "all",
    technical: "all",
    "core-cs": "all",
  });

  // Active quiz runner & final result state
  const [activeSession, setActiveSession] = useState<ActiveQuizSession | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [draftSelection, setDraftSelection] = useState<number | null>(null);
  const [lockedAnswers, setLockedAnswers] = useState<Record<string, number>>({});
  const [elapsedSec, setElapsedSec] = useState(0);
  const [completedResult, setCompletedResult] = useState<{
    record: AssessmentAttemptRecord;
    questions: AssessmentQuestion[];
    nextAdaptive: { difficulty: DifficultyLevel; tier: SkillTier; reason: string };
  } | null>(null);

  const finalizedAttemptIdsRef = useRef<Set<string>>(new Set());

  const refreshAnalytics = () => {
    setAnalytics(getPerformanceAnalytics());
  };

  useEffect(() => {
    refreshAnalytics();
  }, []);

  // Quiz timer
  useEffect(() => {
    if (!activeSession || completedResult) return;
    const interval = setInterval(() => {
      setElapsedSec(Math.max(1, Math.floor((Date.now() - activeSession.startedAtMs) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession, completedResult]);

  const startSession = (params: {
    assessmentId: string;
    category: AssessmentCategory | "recommended";
    title: string;
    topicFilter: string;
    difficultyFilter: string;
    questions: AssessmentQuestion[];
  }) => {
    if (!params.questions.length) {
      toast.error("No questions matched the selected topic and difficulty filter.");
      return;
    }

    const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setActiveSession({
      attemptId,
      assessmentId: params.assessmentId,
      category: params.category,
      title: params.title,
      topicFilter: params.topicFilter,
      difficultyFilter: params.difficultyFilter,
      questions: params.questions,
      startedAtMs: Date.now(),
    });
    setCurrentIdx(0);
    setDraftSelection(null);
    setLockedAnswers({});
    setElapsedSec(0);
    setCompletedResult(null);
  };

  const launchCategoryQuiz = (
    category: AssessmentCategory,
    overrideTopic?: string,
    overrideDifficulty?: DifficultyLevel | "all",
  ) => {
    const topic = overrideTopic ?? topicFilters[category];
    const diff = overrideDifficulty ?? difficultyFilters[category];
    let questions = getQuestionsByCategory(category, topic, diff);

    // Fallback to all difficulties in topic if exact combination has 0 items
    let effectiveDiff = diff;
    if (!questions.length && diff !== "all") {
      questions = getQuestionsByCategory(category, topic, "all");
      effectiveDiff = "all";
    }

    const catMeta = ASSESSMENT_CATEGORIES.find((c) => c.id === category);
    const topicLabel = topic === "all" ? "All Topics" : topic;
    const diffLabel =
      effectiveDiff === "all"
        ? "All Levels"
        : category === "core-cs"
          ? difficultyToSkillTier(effectiveDiff)
          : effectiveDiff;

    startSession({
      assessmentId: `${category}-${topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${effectiveDiff.toLowerCase()}`,
      category,
      title: `${catMeta?.shortLabel ?? category} — ${topicLabel} (${diffLabel})`,
      topicFilter: topic,
      difficultyFilter: diffLabel,
      questions,
    });
  };

  const launchRecommendedPractice = (customTopic?: string, customDifficulty?: DifficultyLevel) => {
    if (customTopic && customTopic !== "all") {
      const cat =
        ASSESSMENT_CATEGORIES.find((c) => c.topics.includes(customTopic))?.id ?? "aptitude";
      launchCategoryQuiz(cat, customTopic, customDifficulty ?? "all");
      return;
    }

    const questions = analytics.recommendedQuestions;
    const weakNames = analytics.weaknesses.slice(0, 2).map((w) => w.topic);
    const subtitle =
      weakNames.length > 0
        ? `Weak Topics Focus (${weakNames.join(", ")})`
        : `Adaptive Starter (${analytics.adaptiveDifficulty})`;

    startSession({
      assessmentId: "recommended-adaptive-drill",
      category: "recommended",
      title: `Personalized Drill — ${subtitle}`,
      topicFilter: weakNames.join(", ") || "Mixed",
      difficultyFilter: analytics.adaptiveDifficulty,
      questions,
    });
  };

  const handleSubmitSingleAnswer = () => {
    if (!activeSession) return;
    const q = activeSession.questions[currentIdx];
    if (!q) return;

    // Prevent submitting multiple answers for the same question
    if (lockedAnswers[q.id] !== undefined) {
      return;
    }

    if (draftSelection === null) {
      toast.error("Please select an answer option first.");
      return;
    }

    setLockedAnswers((prev) => {
      if (prev[q.id] !== undefined) return prev;
      return { ...prev, [q.id]: draftSelection };
    });
  };

  const handleNavigateQuestion = (nextIndex: number) => {
    if (!activeSession) return;
    if (nextIndex < 0 || nextIndex >= activeSession.questions.length) return;
    setCurrentIdx(nextIndex);
    const targetQ = activeSession.questions[nextIndex];
    if (targetQ && lockedAnswers[targetQ.id] !== undefined) {
      setDraftSelection(lockedAnswers[targetQ.id] ?? null);
    } else {
      setDraftSelection(null);
    }
  };

  const handleFinishAssessment = () => {
    if (!activeSession) return;
    // Prevent duplicate final submission for the same assessment attempt
    if (finalizedAttemptIdsRef.current.has(activeSession.attemptId)) {
      return;
    }

    const totalAnswered = Object.keys(lockedAnswers).length;
    if (totalAnswered === 0) {
      toast.error("Submit at least one question before finishing the assessment.");
      return;
    }

    finalizedAttemptIdsRef.current.add(activeSession.attemptId);

    const timeTakenSec = Math.max(1, Math.floor((Date.now() - activeSession.startedAtMs) / 1000));
    const record = buildAttemptRecord({
      id: activeSession.attemptId,
      assessmentId: activeSession.assessmentId,
      category: activeSession.category,
      title: activeSession.title,
      topicFilter: activeSession.topicFilter,
      difficultyFilter: activeSession.difficultyFilter,
      questions: activeSession.questions,
      answers: lockedAnswers,
      timeTakenSec,
    });

    saveAssessmentAttempt(record);
    const updatedAnalytics = getPerformanceAnalytics();
    setAnalytics(updatedAnalytics);

    const nextAdaptive = pickAdaptiveDifficulty(record.accuracyPct, record.attempted);
    setCompletedResult({
      record,
      questions: activeSession.questions,
      nextAdaptive,
    });
    toast.success(
      `Assessment complete! Score: ${record.score}/${record.total} (${record.accuracyPct}% accuracy)`,
    );
  };

  const handleExitRunner = () => {
    setActiveSession(null);
    setCompletedResult(null);
    setDraftSelection(null);
    setLockedAnswers({});
    setCurrentIdx(0);
  };

  const handleClearHistory = () => {
    clearAssessmentHistory();
    refreshAnalytics();
    toast.success("Assessment history cleared.");
  };

  // ==========================================
  // FINAL RESULT VIEW
  // ==========================================
  if (activeSession && completedResult) {
    const { record, questions, nextAdaptive } = completedResult;
    const topicEntries = Object.entries(record.topicBreakdown).sort(
      (a, b) => a[1].correct / Math.max(a[1].total, 1) - b[1].correct / Math.max(b[1].total, 1),
    );
    const sessionWeakTopics = topicEntries
      .filter(([, stats]) => stats.attempted > 0 && stats.correct / stats.attempted < 0.6)
      .map(([name]) => name);

    return (
      <div className="space-y-5" data-testid="assessment-final-result">
        <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <button
                type="button"
                onClick={handleExitRunner}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Assessment Hub
              </button>
              <h2 className="font-display mt-2 text-xl font-bold text-foreground">
                {record.title}
              </h2>
              <p className="text-xs text-muted-foreground">
                Completed in {formatDuration(record.timeTakenSec)} • Real-time score recorded to
                Performance Tracking
              </p>
            </div>

            <div className="bg-brand shadow-glow rounded-2xl px-5 py-3 text-center text-white">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                Final Score
              </p>
              <p className="font-display text-2xl font-bold">
                {record.score} / {record.total}
              </p>
              <p className="text-xs font-semibold opacity-90">{record.scorePct}%</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Attempted</p>
              <p className="font-display text-lg font-bold text-foreground">{record.attempted}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Correct</p>
              <p className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {record.score}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Incorrect</p>
              <p className="font-display text-lg font-bold text-destructive">{record.incorrect}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Accuracy</p>
              <p className="font-display text-lg font-bold text-primary">{record.accuracyPct}%</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-3 text-center col-span-2 sm:col-span-1">
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Next Difficulty
              </p>
              <p className="font-display text-lg font-bold text-violet">
                {nextAdaptive.difficulty}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-violet/30 bg-violet/10 p-3.5 text-xs">
            <p className="font-bold text-violet flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              Adaptive Difficulty Adjustment: {nextAdaptive.difficulty} ({nextAdaptive.tier})
            </p>
            <p className="mt-1 text-foreground">{nextAdaptive.reason}</p>
          </div>
        </div>

        {/* Topic Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-base font-bold">Topic-Wise Breakdown</h3>
          <div className="mt-3 space-y-3">
            {topicEntries.map(([topicName, st]) => {
              const topicAcc = st.attempted > 0 ? Math.round((st.correct / st.attempted) * 100) : 0;
              return (
                <div key={topicName} className="text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">{topicName}</span>
                    <span className="font-bold text-muted-foreground">
                      {st.correct}/{st.attempted} correct ({topicAcc}%)
                    </span>
                  </div>
                  <Progress value={topicAcc} className="mt-1 h-1.5" />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-2.5">
            {sessionWeakTopics.length > 0 && (
              <button
                type="button"
                onClick={() =>
                  launchRecommendedPractice(sessionWeakTopics[0], nextAdaptive.difficulty)
                }
                className="bg-brand shadow-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95"
              >
                <Target className="h-4 w-4" />
                <span>Practice Weak Topic: {sessionWeakTopics[0]}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                startSession({
                  assessmentId: activeSession.assessmentId,
                  category: activeSession.category,
                  title: activeSession.title,
                  topicFilter: activeSession.topicFilter,
                  difficultyFilter: activeSession.difficultyFilter,
                  questions,
                })
              }
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-bold text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Retake Quiz</span>
            </button>
            <button
              type="button"
              onClick={handleExitRunner}
              className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-foreground hover:bg-accent"
            >
              <span>Return to Assessment Hub</span>
            </button>
          </div>
        </div>

        {/* Question-by-Question Review & Explanations */}
        <div className="space-y-3">
          <h3 className="font-display text-base font-bold">Answers & Detailed Explanations</h3>
          {questions.map((q, i) => {
            const chosen = lockedAnswers[q.id];
            const isAnswered = chosen !== undefined;
            const isCorrect = isAnswered && chosen === q.answer;
            return (
              <div
                key={q.id}
                className="rounded-2xl border border-border bg-card p-4 text-xs shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-foreground">
                    Q{i + 1}. {q.q}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      !isAnswered
                        ? "bg-muted text-muted-foreground"
                        : isCorrect
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-destructive/15 text-destructive"
                    }`}
                  >
                    {!isAnswered ? "Unanswered" : isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                {q.codeSnippet && (
                  <pre className="mt-2 overflow-x-auto rounded-xl bg-slate-950 p-3 font-mono text-[11px] text-slate-100">
                    <code>{q.codeSnippet}</code>
                  </pre>
                )}

                <div className="mt-2 space-y-1">
                  <p>
                    Your answer:{" "}
                    <b>
                      {isAnswered ? `${"ABCD"[chosen!]}. ${q.options[chosen!]}` : "Not answered"}
                    </b>
                  </p>
                  <p>
                    Correct answer:{" "}
                    <b className="text-emerald-600 dark:text-emerald-400">
                      {"ABCD"[q.answer]}. {q.options[q.answer]}
                    </b>
                  </p>
                </div>
                <p className="mt-2 rounded-xl bg-muted/40 p-2.5 text-muted-foreground leading-relaxed">
                  <b>Explanation:</b> {q.explain}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIVE QUIZ RUNNER (ONE-BY-ONE WITH SINGLE-SUBMIT LOCK & EXPLANATION)
  // ==========================================
  if (activeSession) {
    const questions = activeSession.questions;
    const total = questions.length;
    const currentQ = questions[currentIdx] ?? questions[0]!;
    const submittedChoice = lockedAnswers[currentQ.id];
    const isQuestionSubmitted = submittedChoice !== undefined;
    const isCurrentCorrect = isQuestionSubmitted && submittedChoice === currentQ.answer;

    const totalSubmittedCount = Object.keys(lockedAnswers).length;
    const liveCorrectCount = questions.reduce(
      (acc, item) => (lockedAnswers[item.id] === item.answer ? acc + 1 : acc),
      0,
    );
    const liveIncorrectCount = Math.max(0, totalSubmittedCount - liveCorrectCount);
    const progressPct = total > 0 ? Math.round((totalSubmittedCount / total) * 100) : 0;

    return (
      <div className="space-y-4" data-testid="assessment-quiz-runner">
        {/* Progress Header */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <button
                type="button"
                onClick={handleExitRunner}
                className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Exit Assessment
              </button>
              <h2 className="font-display mt-1 text-base font-bold text-foreground">
                {activeSession.title}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 font-mono font-bold text-foreground">
                <Clock className="h-3.5 w-3.5 text-primary" />
                {formatDuration(elapsedSec)}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 font-bold text-emerald-600 dark:text-emerald-400">
                Correct: {liveCorrectCount}
              </span>
              <span className="rounded-full bg-destructive/15 px-2.5 py-1 font-bold text-destructive">
                Wrong: {liveIncorrectCount}
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-xs">
            <Progress value={progressPct} className="h-2 flex-1" />
            <span
              className="font-bold text-primary whitespace-nowrap"
              data-testid="quiz-progress-label"
            >
              {totalSubmittedCount}/{total} submitted ({progressPct}%)
            </span>
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-foreground" data-testid="question-counter">
              Question {currentIdx + 1} of {total}
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                {currentQ.topic}
              </span>
              <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[11px] font-bold text-violet">
                {currentQ.category === "core-cs"
                  ? `${currentQ.csLevel} (${currentQ.difficulty})`
                  : currentQ.difficulty}
              </span>
              {isQuestionSubmitted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground">
                  <Lock className="h-3 w-3" /> Answer Locked
                </span>
              )}
            </div>
          </div>

          <p className="mt-3 text-sm font-semibold leading-relaxed text-foreground sm:text-base">
            {currentQ.q}
          </p>

          {currentQ.codeSnippet && (
            <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-slate-100">
              <code>{currentQ.codeSnippet}</code>
            </pre>
          )}

          {/* Options */}
          <div className="mt-4 space-y-2.5" role="radiogroup" aria-label="Answer choices">
            {currentQ.options.map((opt, idx) => {
              const isSelected = isQuestionSubmitted
                ? submittedChoice === idx
                : draftSelection === idx;
              const isAnswerKey = currentQ.answer === idx;

              let borderClass = "border-border bg-card hover:bg-muted/50";
              if (isQuestionSubmitted) {
                if (isAnswerKey) {
                  borderClass = "border-emerald-500 bg-emerald-500/10";
                } else if (isSelected && !isAnswerKey) {
                  borderClass = "border-destructive bg-destructive/10";
                } else {
                  borderClass = "border-border/60 bg-muted/20 opacity-75";
                }
              } else if (isSelected) {
                borderClass = "border-primary bg-primary/10";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  disabled={isQuestionSubmitted}
                  onClick={() => {
                    if (!isQuestionSubmitted) {
                      setDraftSelection(idx);
                    }
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left text-xs font-medium transition sm:text-sm disabled:cursor-not-allowed ${borderClass}`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isQuestionSubmitted && isAnswerKey
                        ? "bg-emerald-600 text-white"
                        : isQuestionSubmitted && isSelected && !isAnswerKey
                          ? "bg-destructive text-white"
                          : isSelected
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-foreground"
                    }`}
                  >
                    {"ABCD"[idx]}
                  </span>
                  <span className="flex-1 text-foreground">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Submit Answer Action (Locked after first submission) */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {!isQuestionSubmitted ? (
              <button
                type="button"
                onClick={handleSubmitSingleAnswer}
                disabled={draftSelection === null}
                className="bg-brand shadow-glow inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Submit Answer</span>
              </button>
            ) : (
              <div
                className="inline-flex items-center gap-2 rounded-xl bg-muted px-4 py-2 text-xs font-bold text-muted-foreground"
                data-testid="answer-locked-badge"
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Response Submitted</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => handleNavigateQuestion(currentIdx - 1)}
                className="inline-flex h-11 items-center gap-1 rounded-xl border border-border bg-card px-4 text-xs font-bold text-foreground disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </button>

              {currentIdx < total - 1 ? (
                <button
                  type="button"
                  onClick={() => handleNavigateQuestion(currentIdx + 1)}
                  className="inline-flex h-11 items-center gap-1 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground transition hover:opacity-95"
                >
                  <span>Next Question</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishAssessment}
                  className="bg-brand shadow-glow inline-flex h-11 items-center gap-1.5 rounded-xl px-5 text-xs font-bold text-white transition active:scale-[0.98]"
                >
                  <Award className="h-4 w-4" />
                  <span>Finish & View Result</span>
                </button>
              )}
            </div>
          </div>

          {/* Immediate Feedback & Explanation after submission */}
          {isQuestionSubmitted && (
            <div
              data-testid="question-explanation-box"
              className={`mt-4 rounded-xl border p-4 text-xs ${
                isCurrentCorrect
                  ? "border-emerald-500/30 bg-emerald-500/10"
                  : "border-destructive/30 bg-destructive/10"
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {isCurrentCorrect ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-emerald-700 dark:text-emerald-300">
                      Correct! Option {"ABCD"[currentQ.answer]} is right.
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-destructive" />
                    <span className="text-destructive">
                      Incorrect — Correct answer is {"ABCD"[currentQ.answer]}.{" "}
                      {currentQ.options[currentQ.answer]}
                    </span>
                  </>
                )}
              </div>
              <p className="mt-2 leading-relaxed text-foreground">
                <b>Explanation:</b> {currentQ.explain}
              </p>
            </div>
          )}
        </div>

        {/* Question Palette & Finish Early Button */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Question Navigator
            </span>
            <button
              type="button"
              onClick={handleFinishAssessment}
              className="rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/15"
            >
              Submit Assessment ({totalSubmittedCount}/{total})
            </button>
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
            {questions.map((item, i) => {
              const ans = lockedAnswers[item.id];
              const isSubmitted = ans !== undefined;
              const isOk = isSubmitted && ans === item.answer;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigateQuestion(i)}
                  className={`h-9 rounded-lg text-xs font-bold transition ${
                    i === currentIdx ? "ring-2 ring-primary ring-offset-1" : ""
                  } ${
                    !isSubmitted
                      ? "bg-muted text-muted-foreground"
                      : isOk
                        ? "bg-emerald-600 text-white"
                        : "bg-destructive text-white"
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER CATEGORY PRACTICE / QUIZ PANEL
  // ==========================================
  const renderCategoryTab = (category: AssessmentCategory) => {
    const meta = ASSESSMENT_CATEGORIES.find((c) => c.id === category)!;
    const selectedTopic = topicFilters[category];
    const selectedDifficulty = difficultyFilters[category];
    const matchingQuestions = getQuestionsByCategory(category, selectedTopic, selectedDifficulty);
    const catStats = analytics.byCategory[category];
    const isCoreCs = category === "core-cs";

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-lg font-bold text-foreground">{meta.label}</h3>
                <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[11px] font-bold text-violet">
                  Adaptive Level:{" "}
                  {isCoreCs ? catStats.recommendedTier : catStats.recommendedDifficulty}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3.5 py-2 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                  Accuracy
                </span>
                <span className="font-display font-bold text-primary">{catStats.accuracy}%</span>
              </div>
              <div className="h-6 w-px bg-border" />
              <div>
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                  Attempted
                </span>
                <span className="font-display font-bold text-foreground">{catStats.attempted}</span>
              </div>
            </div>
          </div>

          {/* Topic Filter Pills */}
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Topic
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTopicFilters((p) => ({ ...p, [category]: "all" }))}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  selectedTopic === "all"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                All Topics
              </button>
              {meta.topics.map((topic) => {
                const topicStat = analytics.topicStats.find((t) => t.topic === topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setTopicFilters((p) => ({ ...p, [category]: topic }))}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedTopic === topic
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{topic}</span>
                    {topicStat && topicStat.attempted > 0 && (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] ${
                          selectedTopic === topic
                            ? "bg-white/20 text-white"
                            : topicStat.accuracy >= 75
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : topicStat.accuracy < 60
                                ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                                : "bg-muted text-foreground"
                        }`}
                      >
                        {topicStat.accuracy}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty / Level Filter Pills */}
          <div className="mt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {isCoreCs ? "Quiz Level (Beginner / Intermediate / Advanced)" : "Difficulty Level"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["all", "Easy", "Medium", "Hard"] as const).map((diff) => {
                const label =
                  diff === "all" ? "All Levels" : isCoreCs ? difficultyToSkillTier(diff) : diff;
                return (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficultyFilters((p) => ({ ...p, [category]: diff }))}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                      selectedDifficulty === diff
                        ? "bg-violet text-white shadow-sm"
                        : "border border-border bg-muted/40 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Launch Bar */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Ready: <b className="text-foreground">{matchingQuestions.length} questions</b> matched
              • Instant explanations & single-submit verification
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() =>
                  launchCategoryQuiz(category, selectedTopic, catStats.recommendedDifficulty)
                }
                className="inline-flex items-center gap-1.5 rounded-xl border border-violet/40 bg-violet/10 px-4 py-2 text-xs font-bold text-violet hover:bg-violet/15"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>
                  Adaptive ({isCoreCs ? catStats.recommendedTier : catStats.recommendedDifficulty})
                </span>
              </button>
              <button
                type="button"
                disabled={matchingQuestions.length === 0}
                onClick={() => launchCategoryQuiz(category)}
                className="bg-brand shadow-glow inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Start {meta.shortLabel}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Link to full 30-question timed Quant Mock 4 on Aptitude tab */}
        {category === "aptitude" && (
          <Link
            to="/app/assessment/quant-mock-4"
            className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left shadow-card transition active:scale-[0.98] hover:bg-primary/15"
          >
            <Clock className="h-6 w-6 shrink-0 text-primary" />
            <div className="flex-1">
              <span className="block text-sm font-bold text-foreground">
                Full Timed Test: Quantitative Aptitude – Mock 4 (30 Questions)
              </span>
              <span className="text-xs text-muted-foreground">
                Timed 30 mins • Company pattern full-length mock test with detailed review
              </span>
            </div>
            <span className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-glow">
              Start Timed Mock
            </span>
          </Link>
        )}
      </div>
    );
  };

  // ==========================================
  // HUB NAVIGATION & CONTENT
  // ==========================================
  const navItems: Array<{ id: HubTab; label: string; icon: typeof Sparkles }> = [
    { id: "overview", label: "Overview & Recommendations", icon: Sparkles },
    { id: "aptitude", label: "Aptitude Practice", icon: Target },
    { id: "logical", label: "Logical Reasoning", icon: Brain },
    { id: "technical", label: "Technical Assessment", icon: Code2 },
    { id: "core-cs", label: "Core CS Quiz", icon: Cpu },
    { id: "performance", label: "Performance & History", icon: BarChart3 },
  ];

  return (
    <div className="space-y-5">
      {/* Horizontal Navigation Pills (Mobile Responsive) */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-2 shadow-card">
        {navItems.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & PERSONALIZED RECOMMENDATIONS */}
      {activeTab === "overview" && (
        <div className="space-y-5">
          {/* Real Performance KPI Strip (Zero Fixed Sample Scores) */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="assessment-kpi-strip">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Questions Attempted
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-foreground">
                {analytics.totalQuestionsAttempted}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Across {analytics.totalAssessments} assessment
                {analytics.totalAssessments === 1 ? "" : "s"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Correct / Incorrect
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-foreground">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {analytics.totalCorrect}
                </span>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-destructive">{analytics.totalIncorrect}</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Verified question outcomes</p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Overall Accuracy
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-primary">
                {analytics.overallAccuracy}%
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {analytics.totalQuestionsAttempted === 0
                  ? "Attempt a quiz to compute"
                  : `Avg test score: ${analytics.averageScorePct}%`}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">
                Adaptive Difficulty
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-violet">
                {analytics.adaptiveDifficulty}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                CS Level: {analytics.adaptiveTier}
              </p>
            </div>
          </div>

          {/* Personalized Recommendations & Daily Practice Tasks */}
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Recommended Weak-Topic Practice Launcher */}
            <div className="rounded-2xl border border-violet/30 bg-gradient-to-br from-violet/10 via-card to-primary/5 p-5 shadow-card">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                    <Sparkles className="h-3 w-3" />
                    Personalized Practice Plan
                  </span>
                  <h3 className="font-display mt-1.5 text-base font-bold text-foreground">
                    Recommended Questions & Difficulty Calibration
                  </h3>
                </div>
              </div>

              <p className="mt-1.5 text-xs text-muted-foreground">{analytics.adaptiveReason}</p>

              {analytics.weaknesses.length > 0 ? (
                <div className="mt-3 space-y-2">
                  <p className="text-[11px] font-bold uppercase text-amber-700 dark:text-amber-300">
                    Weak Topics Prioritized ({analytics.weaknesses.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analytics.weaknesses.slice(0, 4).map((w) => (
                      <button
                        key={w.topic}
                        type="button"
                        onClick={() =>
                          launchRecommendedPractice(
                            w.topic,
                            w.accuracy < 50 ? "Easy" : analytics.adaptiveDifficulty,
                          )
                        }
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        <span>
                          {w.topic} ({w.accuracy}%)
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-3 rounded-xl border border-border bg-card/70 p-3 text-xs text-muted-foreground">
                  {analytics.totalQuestionsAttempted === 0
                    ? "Take any practice quiz or the diagnostic drill below to identify your strong and weak topics."
                    : "No weak topics below 60% right now! Keep pushing with adaptive challenges."}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                <span className="text-xs text-muted-foreground">
                  Curated set: <b>{analytics.recommendedQuestions.length} questions</b> (
                  {analytics.adaptiveDifficulty})
                </span>
                <button
                  type="button"
                  onClick={() => launchRecommendedPractice()}
                  className="bg-brand shadow-glow inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Start Recommended Practice</span>
                </button>
              </div>
            </div>

            {/* Dynamic Daily Practice Tasks */}
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-base font-bold text-foreground">
                  Generated Daily Practice Tasks
                </h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  Auto-Updated
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Tasks generated from your topic accuracy and unattempted placement subjects.
              </p>

              <div className="mt-3 space-y-2.5">
                {analytics.dailyPracticeTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-muted/25 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            task.priority === "High"
                              ? "bg-amber-500/20 text-amber-700 dark:text-amber-300"
                              : "bg-primary/15 text-primary"
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="font-bold text-foreground">{task.title}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">{task.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        task.category === "recommended"
                          ? launchRecommendedPractice()
                          : launchCategoryQuiz(task.category, task.topic, task.difficulty)
                      }
                      className="shrink-0 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:opacity-90"
                    >
                      Practice ({task.estimatedMinutes}m)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Assessment Modules Grid */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display text-base font-bold">
              Aptitude, Logical, Technical & Core CS Assessments
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Select a specialized practice track or launch the full-length timed Quantitative Mock
              4.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {ASSESSMENT_CATEGORIES.map((cat) => {
                const catStat = analytics.byCategory[cat.id];
                const qCount = getQuestionsByCategory(cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex flex-col justify-between rounded-2xl border border-border bg-muted/20 p-4 transition hover:border-primary/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-sm font-bold text-foreground">
                          {cat.label}
                        </h4>
                        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                          {qCount} Qs
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{cat.description}</p>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-xs">
                      <span className="text-muted-foreground">
                        {catStat.attempted > 0
                          ? `Accuracy: ${catStat.accuracy}% (${catStat.correct}/${catStat.attempted})`
                          : `Recommended: ${cat.id === "core-cs" ? catStat.recommendedTier : catStat.recommendedDifficulty}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab(cat.id)}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline"
                      >
                        <span>Open Section</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Preserved Quantitative Mock 4 Timed Assessment Card */}
            <Link
              to="/app/assessment/quant-mock-4"
              className="mt-4 flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-left shadow-card transition active:scale-[0.98] hover:bg-primary/15"
            >
              <PlayCircle className="h-6 w-6 shrink-0 text-primary" />
              <div className="flex-1">
                <span className="block text-sm font-bold text-foreground">
                  Quantitative Aptitude – Mock 4 (30 Questions)
                </span>
                <span className="text-xs text-muted-foreground">
                  Timed 30 mins • Percentages, Profit & Loss, Time-Speed-Distance
                </span>
              </div>
              <span className="rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-glow">
                Start Test
              </span>
            </Link>
          </div>
        </div>
      )}

      {/* TABS 2-5: CATEGORY QUIZZES */}
      {activeTab === "aptitude" && renderCategoryTab("aptitude")}
      {activeTab === "logical" && renderCategoryTab("logical")}
      {activeTab === "technical" && renderCategoryTab("technical")}
      {activeTab === "core-cs" && renderCategoryTab("core-cs")}

      {/* TAB 6: PERFORMANCE TRACKING & HISTORY */}
      {activeTab === "performance" && (
        <div className="space-y-5" data-testid="performance-tracking-panel">
          {/* Summary Stats */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Assessment Performance & Topic Mastery
                </h3>
                <p className="text-xs text-muted-foreground">
                  Computed strictly from your submitted answers and completed assessments.
                </p>
              </div>
              {analytics.history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset History</span>
                </button>
              )}
            </div>

            {/* Category Breakdown */}
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(analytics.byCategory) as AssessmentCategory[]).map((catKey) => {
                const c = analytics.byCategory[catKey];
                return (
                  <div
                    key={catKey}
                    className="rounded-xl border border-border bg-muted/25 p-3.5 text-xs"
                  >
                    <p className="font-bold text-foreground">{c.label}</p>
                    <p className="font-display mt-1 text-xl font-bold text-primary">
                      {c.accuracy}%
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {c.correct} correct • {c.incorrect} incorrect ({c.attempted} attempted)
                    </p>
                    <Progress value={c.accuracy} className="mt-2 h-1.5" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Topic Strengths & Weaknesses */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-500/25 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="h-4 w-4" />
                <h4 className="font-display text-sm font-bold">Topic Strengths (≥ 75%)</h4>
              </div>
              {analytics.strengths.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  Complete assessments to reveal your strongest topics.
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {analytics.strengths.map((s) => (
                    <div key={s.topic} className="text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>{s.topic}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          {s.accuracy}% ({s.correct}/{s.attempted})
                        </span>
                      </div>
                      <Progress value={s.accuracy} className="mt-1 h-1.5" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-amber-500/25 bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" />
                <h4 className="font-display text-sm font-bold">
                  Weak Topics Needing Practice (&lt; 60%)
                </h4>
              </div>
              {analytics.weaknesses.length === 0 ? (
                <p className="mt-3 text-xs text-muted-foreground">
                  {analytics.totalQuestionsAttempted === 0
                    ? "No weak topics recorded yet — attempt a section to evaluate your baseline."
                    : "No weak topics under 60% detected."}
                </p>
              ) : (
                <div className="mt-3 space-y-2.5">
                  {analytics.weaknesses.map((w) => (
                    <div
                      key={w.topic}
                      className="flex items-center justify-between gap-2 rounded-xl bg-amber-500/10 p-2.5 text-xs"
                    >
                      <div>
                        <p className="font-bold text-foreground">{w.topic}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {w.correct}/{w.attempted} correct ({w.accuracy}%)
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => launchRecommendedPractice(w.topic)}
                        className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-bold text-primary-foreground"
                      >
                        Drill Topic
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assessment History */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h4 className="font-display text-base font-bold">Assessment History</h4>
            </div>

            {analytics.history.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">
                No completed assessments yet. Launch any Aptitude, Logical, Technical, Core CS, or
                Quant Mock test to build your history.
              </p>
            ) : (
              <div className="mt-3 space-y-2.5">
                {analytics.history.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-muted/20 p-3.5 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-foreground">{item.title}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(item.takenAt).toLocaleString()} • Time:{" "}
                        {formatDuration(item.timeTakenSec)} • Attempted {item.attempted}/
                        {item.total}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg bg-emerald-500/15 px-2.5 py-1 font-bold text-emerald-600 dark:text-emerald-400">
                        {item.score} Correct
                      </span>
                      <span className="rounded-lg bg-destructive/15 px-2.5 py-1 font-bold text-destructive">
                        {item.incorrect} Wrong
                      </span>
                      <span className="font-display rounded-lg bg-primary/10 px-2.5 py-1 font-bold text-primary">
                        {item.accuracyPct}% Acc
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
