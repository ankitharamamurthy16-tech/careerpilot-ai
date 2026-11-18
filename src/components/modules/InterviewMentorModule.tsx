import { useState } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Flag,
  Target,
  BarChart3,
  MessageSquare,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import {
  INTERVIEW_CATEGORIES,
  evaluateInterviewAnswer,
  saveInterviewSession,
  getInterviewSessions,
  selectInitialQuestion,
  generateNextInterviewQuestion,
  buildInterviewSummary,
  getInterviewProgressSummary,
  getSmartPracticeRecommendations,
  getHistoricallyAskedQuestionIds,
  getSessionScoreTen,
  type InterviewCategory,
  type InterviewDifficulty,
  type InterviewCompletionStatus,
  type InterviewQuestion,
  type InterviewEvaluation,
  type InterviewSession,
  type InterviewTurnRecord,
} from "@/lib/data";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";

type ModuleTab = "interview" | "history" | "practice";

const TARGET_QUESTION_OPTIONS = [3, 5, 7] as const;

const DIMENSION_LABELS: Array<{
  key: keyof InterviewEvaluation["dimensions"];
  label: string;
}> = [
  { key: "technicalCorrectness", label: "Technical Correctness" },
  { key: "communicationSkills", label: "Communication Skills" },
  { key: "confidence", label: "Confidence" },
  { key: "relevance", label: "Relevance" },
  { key: "answerStructure", label: "Answer Structure" },
];

function createSessionId(): string {
  return `interview-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function formatDateLabel(): string {
  return new Date().toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function difficultyBadgeClass(diff: InterviewDifficulty): string {
  switch (diff) {
    case "Easy":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "Hard":
      return "bg-rose-500/15 text-rose-700 dark:text-rose-300";
    default:
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
  }
}

function statusBadgeClass(status: InterviewCompletionStatus): string {
  switch (status) {
    case "Completed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300";
    case "Ended Early":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-300";
    default:
      return "bg-primary/15 text-primary";
  }
}

export function InterviewMentorModule() {
  const [activeTab, setActiveTab] = useState<ModuleTab>("interview");
  const [selectedCategory, setSelectedCategory] =
    useState<InterviewCategory>("Technical Interview");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [targetQuestionCount, setTargetQuestionCount] = useState<number>(5);

  // Active live interview session state
  const [sessionId, setSessionId] = useState<string>(() => createSessionId());
  const [currentQuestion, setCurrentQuestion] = useState<InterviewQuestion>(() =>
    selectInitialQuestion(
      "Technical Interview",
      getHistoricallyAskedQuestionIds("Technical Interview"),
      "Medium",
    ),
  );
  const [currentDifficulty, setCurrentDifficulty] = useState<InterviewDifficulty>(
    () => currentQuestion.difficulty ?? "Medium",
  );
  const [turns, setTurns] = useState<InterviewTurnRecord[]>([]);
  const [askedQuestionIds, setAskedQuestionIds] = useState<string[]>(() => [currentQuestion.id]);
  const [askedFollowUpIds, setAskedFollowUpIds] = useState<string[]>([]);
  const [consecutiveFollowUps, setConsecutiveFollowUps] = useState<number>(0);

  // Current turn answer & evaluation state
  const [answerText, setAnswerText] = useState("");
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null);
  const [completedReport, setCompletedReport] = useState<InterviewSession | null>(null);

  // Persistent history
  const [history, setHistory] = useState<InterviewSession[]>(() => getInterviewSessions());

  const {
    status,
    isRecording,
    isRequestingPermission,
    isProcessing,
    elapsedSec,
    durationMs,
    error: speechError,
    hasRecordedSpeech,
    startRecording,
    stopRecording,
    resetRecording,
    clearError,
  } = useSpeechRecorder({
    onTranscriptChange: (transcript) => {
      setAnswerText(transcript);
    },
    onRecordingStart: () => {
      toast.info("Microphone active — speaking transcription started.");
    },
    onRecordingComplete: () => {
      toast.success("Recording finished. Review or edit your answer before submitting!");
    },
    onEmptyRecording: () => {
      toast.warning("No speech detected. Please speak clearly or type your answer below.");
    },
    onError: (msg) => {
      toast.error(msg);
    },
  });

  const progressSummary = getInterviewProgressSummary(history);
  const smartRecommendations = getSmartPracticeRecommendations(history, selectedCategory);

  const toggleRecording = () => {
    if (isRecording || isRequestingPermission) {
      stopRecording();
    } else {
      void startRecording(answerText);
    }
  };

  const startNewInterview = (
    categoryOverride?: InterviewCategory,
    customStartQuestion?: InterviewQuestion,
  ) => {
    if (isRecording || isRequestingPermission) stopRecording();
    resetRecording();

    const targetCategory = categoryOverride ?? selectedCategory;
    if (categoryOverride) setSelectedCategory(categoryOverride);

    const historicalIds = getHistoricallyAskedQuestionIds(targetCategory);
    const firstQuestion =
      customStartQuestion ?? selectInitialQuestion(targetCategory, historicalIds, "Medium");

    setSessionId(createSessionId());
    setCurrentQuestion(firstQuestion);
    setCurrentDifficulty(firstQuestion.difficulty ?? "Medium");
    setTurns([]);
    setAskedQuestionIds([firstQuestion.id]);
    setAskedFollowUpIds([]);
    setConsecutiveFollowUps(0);
    setAnswerText("");
    setCurrentEvaluation(null);
    setCompletedReport(null);
    setActiveTab("interview");

    toast.success(`${targetCategory} started — Question 1 ready.`);
  };

  const handleCategorySelect = (cat: InterviewCategory) => {
    if (cat === selectedCategory && !completedReport) return;
    setSelectedCategory(cat);
    // If no answers submitted yet in the current draft round, switch Question 1 immediately
    if (turns.length === 0 && !currentEvaluation && !completedReport) {
      if (isRecording || isRequestingPermission) stopRecording();
      resetRecording();
      const firstQ = selectInitialQuestion(cat, getHistoricallyAskedQuestionIds(cat), "Medium");
      setSessionId(createSessionId());
      setCurrentQuestion(firstQ);
      setCurrentDifficulty(firstQ.difficulty ?? "Medium");
      setAskedQuestionIds([firstQ.id]);
      setAskedFollowUpIds([]);
      setConsecutiveFollowUps(0);
      setAnswerText("");
    }
  };

  const persistSessionSnapshot = (
    nextTurns: InterviewTurnRecord[],
    completionStatus: InterviewCompletionStatus,
    categoryForSession: InterviewCategory,
  ): InterviewSession => {
    const summary = buildInterviewSummary(nextTurns, categoryForSession, completionStatus);
    const latestTurn = nextTurns[nextTurns.length - 1]!;
    const existingCount = history.filter((s) => s.id !== sessionId).length;

    const session: InterviewSession = {
      id: sessionId,
      weekNumber: existingCount + 1,
      date: formatDateLabel(),
      role: categoryForSession,
      category: categoryForSession,
      completionStatus,
      targetQuestionCount,
      questionId: latestTurn.questionId,
      question: latestTurn.question,
      answerText: latestTurn.answerText,
      isSpoken: latestTurn.isSpoken,
      durationSec: latestTurn.durationSec,
      evaluation: latestTurn.evaluation,
      turns: nextTurns,
      overallScoreTen: summary.overallScoreTen,
      questionsAnsweredCorrectly: summary.questionsAnsweredCorrectly,
      totalQuestionsAnswered: nextTurns.length,
      strongAreas: summary.strongAreas,
      weakAreas: summary.weakAreas,
      areasForImprovement: summary.areasForImprovement,
      personalizedRecommendations: summary.personalizedRecommendations,
      dimensionAverages: summary.dimensionAverages,
      updatedAt: new Date().toISOString(),
    };

    saveInterviewSession(session);
    setHistory(getInterviewSessions());
    return session;
  };

  const handleEvaluate = () => {
    if (currentEvaluation) {
      toast.info("This question is already evaluated. Click Next Question or End Interview.");
      return;
    }

    const trimmed = answerText.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
    if (!trimmed || words.length < 5) {
      toast.error("Please provide a substantial answer (at least 5 words) to evaluate.");
      return;
    }

    const isSpoken = hasRecordedSpeech && durationMs > 0;
    const actualDurationSec = isSpoken ? Math.max(durationMs / 1000, 1) : 0;
    const result = evaluateInterviewAnswer(currentQuestion, trimmed, actualDurationSec, isSpoken);
    setCurrentEvaluation(result);

    const turnRecord: InterviewTurnRecord = {
      turnNumber: turns.length + 1,
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      topic: currentQuestion.topic ?? currentQuestion.category,
      difficulty: currentQuestion.difficulty ?? currentDifficulty,
      isFollowUp: Boolean(currentQuestion.isFollowUp),
      adaptationReason: currentQuestion.adaptationReason,
      answerText: trimmed,
      isSpoken,
      durationSec: Math.round(actualDurationSec),
      evaluation: result,
      idealModelAnswer: currentQuestion.idealModelAnswer,
    };

    const updatedTurns = [...turns, turnRecord];
    setTurns(updatedTurns);

    const isFinalQuestion = updatedTurns.length >= targetQuestionCount;
    const statusToSave: InterviewCompletionStatus = isFinalQuestion ? "Completed" : "In Progress";
    persistSessionSnapshot(updatedTurns, statusToSave, selectedCategory);

    toast.success(`Answer scored ${result.overallScoreTen}/10! Review detailed feedback below.`);
  };

  const handleNextQuestion = () => {
    if (!currentEvaluation) {
      toast.error("Please submit your answer before moving to the next question.");
      return;
    }

    if (turns.length >= targetQuestionCount) {
      handleEndInterview(true);
      return;
    }

    if (isRecording || isRequestingPermission) stopRecording();
    resetRecording();

    const historicalIds = getHistoricallyAskedQuestionIds(selectedCategory);
    const combinedAsked = Array.from(new Set([...askedQuestionIds, ...historicalIds]));

    const generated = generateNextInterviewQuestion({
      category: selectedCategory,
      currentQuestion,
      answerText,
      evaluation: currentEvaluation,
      askedQuestionIds: combinedAsked,
      askedFollowUpIds,
      consecutiveFollowUps,
      currentDifficulty,
    });

    setCurrentQuestion(generated.nextQuestion);
    setCurrentDifficulty(generated.nextDifficulty);
    if (generated.isFollowUp) {
      setAskedFollowUpIds((prev) => [...prev, generated.nextQuestion.id]);
      setConsecutiveFollowUps((prev) => prev + 1);
    } else {
      setAskedQuestionIds((prev) => [...prev, generated.nextQuestion.id]);
      setConsecutiveFollowUps(0);
    }

    setAnswerText("");
    setCurrentEvaluation(null);
    toast.info(
      generated.isFollowUp
        ? "Dynamic follow-up question generated from your answer."
        : `Next question loaded (${generated.nextDifficulty} difficulty).`,
    );
  };

  const handleEndInterview = (forceCompleted = false) => {
    if (isRecording || isRequestingPermission) stopRecording();
    resetRecording();

    if (turns.length === 0) {
      startNewInterview(selectedCategory);
      toast.info("Interview reset. Select a category and answer Question 1 when ready.");
      return;
    }

    const finalStatus: InterviewCompletionStatus =
      forceCompleted || turns.length >= targetQuestionCount ? "Completed" : "Ended Early";
    const finalSession = persistSessionSnapshot(turns, finalStatus, selectedCategory);
    setCompletedReport(finalSession);
    toast.success(
      finalStatus === "Completed"
        ? "Interview completed! Your full performance report is ready."
        : "Interview ended early and saved to your progress history.",
    );
  };

  const handleResetCurrentAnswer = () => {
    resetRecording();
    setAnswerText("");
    if (
      !turns.some((t) => t.questionId === currentQuestion.id && t.turnNumber === turns.length + 1)
    ) {
      setCurrentEvaluation(null);
    }
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).filter(Boolean).length : 0;
  const effectiveSec = durationMs > 0 ? durationMs / 1000 : elapsedSec;
  const liveWpm =
    hasRecordedSpeech && effectiveSec >= 1 && wordCount > 0
      ? Math.round(wordCount / (effectiveSec / 60))
      : 0;

  const currentQuestionIndex = currentEvaluation ? turns.length : turns.length + 1;
  const progressPct = Math.min(
    100,
    Math.round(((currentEvaluation ? turns.length : turns.length) / targetQuestionCount) * 100),
  );
  const isOnFinalQuestion = turns.length >= targetQuestionCount && Boolean(currentEvaluation);
  const isCurrentSessionSaved = history.some((s) => s.id === sessionId);
  const currentRoundNumber = isCurrentSessionSaved ? history.length : history.length + 1;

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Tabs */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-xs font-bold text-violet">
                AI Placement Interviewer
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {department} • Round #{currentRoundNumber}
              </span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">
              Adaptive AI Placement Interview System
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              One-on-one adaptive interviews with dynamic follow-ups, voice or typed answers, and
              real 5-dimension evaluation out of 10.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("interview")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "interview"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Live Interview
            </button>
            <button
              type="button"
              onClick={() => {
                if (isRecording || isRequestingPermission) stopRecording();
                setActiveTab("history");
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Interview Progress ({history.length})
            </button>
            <button
              type="button"
              onClick={() => {
                if (isRecording || isRequestingPermission) stopRecording();
                setActiveTab("practice");
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "practice"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Smart Practice
            </button>
          </div>
        </div>

        {/* Category Selection Grid + Session Config */}
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Interview Category
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Department:
                <select
                  aria-label="Student Department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="ml-1.5 h-8 rounded-lg border border-input bg-card px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
                >
                  <option value="Computer Science & Engineering">CSE</option>
                  <option value="Information Technology">IT</option>
                  <option value="Electronics & Communication (ECE)">ECE</option>
                  <option value="Mechanical & Mechatronics">Mechanical</option>
                  <option value="Data Science & AI">Data Science</option>
                </select>
              </label>

              <label className="text-[11px] font-semibold text-muted-foreground">
                Questions:
                <select
                  aria-label="Number of interview questions"
                  value={targetQuestionCount}
                  onChange={(e) => setTargetQuestionCount(Number(e.target.value))}
                  className="ml-1.5 h-8 rounded-lg border border-input bg-card px-2 text-xs font-semibold text-foreground outline-none focus:border-primary"
                >
                  {TARGET_QUESTION_OPTIONS.map((count) => (
                    <option key={count} value={count}>
                      {count} Qs
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => startNewInterview(selectedCategory)}
                className="bg-brand inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-95 active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Start Interview</span>
              </button>
            </div>
          </div>

          <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            {INTERVIEW_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.label)}
                  className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-1 ring-primary/40"
                      : "border-border bg-muted/30 hover:bg-muted/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-foreground">{cat.label}</span>
                      {isSelected && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">
                      {cat.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE INTERVIEW OR END-OF-INTERVIEW RESULTS */}
      {activeTab === "interview" && completedReport && (
        <div className="space-y-5" data-testid="interview-results-report">
          <div className="rounded-2xl border border-violet/30 bg-gradient-to-b from-card to-violet/5 p-6 shadow-glow">
            <div className="flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${statusBadgeClass(
                      completedReport.completionStatus ?? "Completed",
                    )}`}
                  >
                    {completedReport.completionStatus ?? "Completed"}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                    {completedReport.category ?? selectedCategory}
                  </span>
                  <span className="text-xs text-muted-foreground">{completedReport.date}</span>
                </div>
                <h3 className="font-display mt-1.5 text-xl font-bold">
                  Interview Performance Results
                </h3>
                <p className="text-xs text-muted-foreground">
                  {completedReport.questionsAnsweredCorrectly ?? 0} of{" "}
                  {completedReport.totalQuestionsAnswered ?? turns.length} questions answered
                  correctly
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-brand rounded-2xl px-5 py-3 text-center text-white shadow-glow">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-85">
                    Overall Score
                  </p>
                  <p className="font-display text-2xl font-bold">
                    {getSessionScoreTen(completedReport)} / 10
                  </p>
                  <p className="text-[10px] opacity-85">
                    ({Math.round(getSessionScoreTen(completedReport) * 10)}% Readiness)
                  </p>
                </div>
              </div>
            </div>

            {/* 5 Evaluation Dimensions Summary */}
            {completedReport.dimensionAverages && (
              <div className="mt-4 grid gap-3 sm:grid-cols-5">
                {DIMENSION_LABELS.map((dim) => {
                  const val = completedReport.dimensionAverages![dim.key];
                  return (
                    <div
                      key={dim.key}
                      className="rounded-xl border border-border bg-card p-3 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {dim.label}
                      </p>
                      <p className="font-display mt-1 text-lg font-bold text-foreground">
                        {val} / 10
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="bg-brand h-full rounded-full"
                          style={{ width: `${val * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Strong Areas vs Weak Areas */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Strong Areas</p>
                {completedReport.strongAreas && completedReport.strongAreas.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-foreground">
                    {completedReport.strongAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-muted-foreground">
                    Keep practicing structured examples to turn partial answers into strong areas.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                <p className="font-bold text-amber-700 dark:text-amber-300">
                  Weak Areas & Improvement Focus
                </p>
                {completedReport.weakAreas && completedReport.weakAreas.length > 0 ? (
                  <ul className="mt-2 space-y-1.5 text-foreground">
                    {completedReport.weakAreas.map((area, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-emerald-700 dark:text-emerald-300">
                    No weak areas detected in this round!
                  </p>
                )}
              </div>
            </div>

            {/* Areas Requiring Improvement & Personalized Recommendations */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-4 text-xs">
                <p className="font-bold text-foreground">Areas Requiring Improvement</p>
                <ul className="mt-2 space-y-1.5 text-muted-foreground">
                  {(completedReport.areasForImprovement ?? []).map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>Personalized Recommendations</span>
                </div>
                <ul className="mt-2 space-y-1.5 text-foreground">
                  {(completedReport.personalizedRecommendations ?? []).map((rec, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Question-by-Question Review */}
            <div className="mt-5 space-y-3">
              <h4 className="font-display text-sm font-bold text-foreground">
                Question-by-Question Breakdown
              </h4>
              {(completedReport.turns ?? []).map((t) => (
                <div
                  key={t.turnNumber}
                  className="rounded-xl border border-border bg-card p-4 text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-muted px-2 py-0.5 font-bold text-foreground">
                        Q{t.turnNumber} • {t.topic}
                      </span>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${difficultyBadgeClass(
                          t.difficulty,
                        )}`}
                      >
                        {t.difficulty}
                      </span>
                      {t.isFollowUp && (
                        <span className="rounded-md bg-violet/15 px-2 py-0.5 text-[10px] font-bold text-violet">
                          Dynamic Follow-up
                        </span>
                      )}
                    </div>
                    <span className="font-display text-sm font-bold text-primary">
                      {t.evaluation.overallScoreTen} / 10 ({t.evaluation.verdict})
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-foreground">{t.question}</p>
                  <p className="mt-1 text-muted-foreground italic">Your Answer: "{t.answerText}"</p>
                  <p className="mt-2 text-foreground">{t.evaluation.feedbackSummary}</p>
                  {t.evaluation.improvements.length > 0 && (
                    <p className="mt-1 text-amber-700 dark:text-amber-300">
                      <b>Improve:</b> {t.evaluation.improvements[0]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setActiveTab("practice")}
                className="rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted"
              >
                View Smart Practice Plan
              </button>
              <button
                type="button"
                onClick={() => startNewInterview(selectedCategory)}
                className="bg-brand shadow-glow rounded-xl px-5 py-2.5 text-xs font-bold text-white transition hover:opacity-95"
              >
                Start Another {selectedCategory}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "interview" && !completedReport && (
        <div className="space-y-5">
          {/* Progress Indicator Bar */}
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-foreground">
                  Question {Math.min(currentQuestionIndex, targetQuestionCount)} of{" "}
                  {targetQuestionCount}
                </span>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                  {selectedCategory}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${difficultyBadgeClass(
                    currentQuestion.difficulty ?? currentDifficulty,
                  )}`}
                >
                  {currentQuestion.difficulty ?? currentDifficulty}
                </span>
                {currentQuestion.isFollowUp && (
                  <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[11px] font-bold text-violet">
                    Dynamic Follow-Up
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleEndInterview(false)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <Flag className="h-3.5 w-3.5" />
                <span>End Interview</span>
              </button>
            </div>

            <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="bg-brand h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(8, progressPct)}%` }}
              />
            </div>

            {currentQuestion.adaptationReason && (
              <p className="mt-2 text-[11px] font-medium text-violet">
                {currentQuestion.adaptationReason}
              </p>
            )}
          </div>

          {/* Current Interview Question Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {currentQuestion.topic ?? currentQuestion.category}
              </span>
              <span className="text-xs text-muted-foreground">
                Category: <b className="text-foreground">{selectedCategory}</b>
              </span>
            </div>

            <h3 className="font-display mt-3 text-base font-bold leading-relaxed text-foreground">
              "{currentQuestion.question}"
            </h3>

            <div className="mt-3.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Competencies & Key Points Evaluated by AI:
              </p>
              <ul className="mt-1.5 grid gap-1 text-muted-foreground sm:grid-cols-2">
                {currentQuestion.keyPointsExpected.map((pt, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-violet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Answer Recording / Typed Response Panel */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={toggleRecording}
                  disabled={isRequestingPermission || isProcessing || Boolean(currentEvaluation)}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-60 ${
                    isRecording
                      ? "animate-pulse bg-red-600 shadow-glow"
                      : "bg-brand hover:opacity-95"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>
                    {isRequestingPermission
                      ? "Requesting Mic..."
                      : isProcessing
                        ? "Finalizing..."
                        : isRecording
                          ? "Stop Recording"
                          : "Start Recording"}
                  </span>
                </button>

                {isRecording && (
                  <span
                    data-testid="interview-recording-status"
                    className="flex items-center gap-1.5 text-xs font-bold text-red-500"
                  >
                    <span className="h-2 w-2 animate-ping rounded-full bg-red-500" />
                    <span>Listening... {elapsedSec}s</span>
                  </span>
                )}

                {isRequestingPermission && (
                  <span
                    data-testid="interview-recording-status"
                    className="text-xs font-semibold text-amber-600 dark:text-amber-400"
                  >
                    Waiting for microphone permission...
                  </span>
                )}

                {isProcessing && (
                  <span
                    data-testid="interview-recording-status"
                    className="text-xs font-semibold text-primary"
                  >
                    Finalizing transcription...
                  </span>
                )}

                {status === "stopped" && answerText.trim() && (
                  <span
                    data-testid="interview-recording-status"
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Transcription ready — edit below before submitting</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
                <span>
                  Words: <b className="text-foreground">{wordCount}</b>
                </span>
                {elapsedSec > 0 && (
                  <span>
                    Duration: <b className="text-foreground">{elapsedSec}s</b>
                  </span>
                )}
                {liveWpm > 0 && (
                  <span>
                    Cadence: <b className="text-primary">{liveWpm} WPM</b>
                  </span>
                )}
                {(answerText || elapsedSec > 0 || speechError) && !currentEvaluation && (
                  <button
                    type="button"
                    onClick={handleResetCurrentAnswer}
                    title="Reset answer and recording"
                    aria-label="Reset answer and recording"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {speechError && (
              <div
                role="alert"
                className="mt-3 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="mt-3">
              <textarea
                rows={6}
                aria-label="Interview answer transcription and response"
                value={answerText}
                disabled={Boolean(currentEvaluation)}
                onChange={(e) => {
                  const next = e.target.value;
                  setAnswerText(next);
                  if (speechError) clearError();
                  if (!next.trim() && !isRecording) {
                    resetRecording();
                  }
                }}
                placeholder="Click 'Start Recording' to speak using the microphone, or type your complete interview response here..."
                className="w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-75"
              />
            </div>

            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-muted-foreground">
                Evaluates technical correctness, communication skills, confidence, relevance &
                answer structure out of 10.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={
                    isRecording ||
                    isRequestingPermission ||
                    isProcessing ||
                    !answerText.trim() ||
                    Boolean(currentEvaluation)
                  }
                  className="bg-brand shadow-glow rounded-xl px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
                >
                  Submit Answer<span className="sr-only"> for AI Evaluation</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  disabled={!currentEvaluation}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 text-xs font-bold text-primary transition hover:bg-primary/20 disabled:opacity-40"
                >
                  <span>{isOnFinalQuestion ? "Finish & View Results" : "Next Question"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* PER-QUESTION AI EVALUATION REPORT */}
          {currentEvaluation && (
            <div className="space-y-4 rounded-2xl border border-violet/30 bg-gradient-to-b from-card to-violet/5 p-6 shadow-glow">
              <div className="flex flex-col gap-4 border-b border-border/80 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Award className="h-5 w-5 text-violet" />
                    <h3 className="font-display text-lg font-bold">
                      Simulated Interview AI Evaluation
                    </h3>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        currentEvaluation.verdict === "Correct"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : currentEvaluation.verdict === "Partially Correct"
                            ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                            : "bg-rose-500/15 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {currentEvaluation.verdict}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currentEvaluation.feedbackSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-brand rounded-2xl px-4 py-2 text-center text-white shadow-glow">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Question Score
                    </p>
                    <p className="font-display text-2xl font-bold">
                      {currentEvaluation.overallScoreTen} / 10
                    </p>
                    <p className="text-[10px] opacity-80">{currentEvaluation.score} / 100</p>
                  </div>
                </div>
              </div>

              {/* 5 Required Rubric Dimensions (/10) */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {DIMENSION_LABELS.map((dim) => {
                  const scoreTen = currentEvaluation.dimensions[dim.key];
                  return (
                    <div
                      key={dim.key}
                      className="rounded-xl border border-border bg-card p-3 text-center"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {dim.label}
                      </p>
                      <p className="font-display mt-1 text-lg font-bold text-foreground">
                        {scoreTen} / 10
                      </p>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="bg-brand h-full rounded-full"
                          style={{ width: `${scoreTen * 10}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Cadence & Speech Diagnostics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Speaking Pace (WPM)
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {currentEvaluation.speakingPaceWpm} WPM
                  </p>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      currentEvaluation.paceVerdict === "Optimal"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {currentEvaluation.paceVerdict}
                  </span>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Structure & Framing
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {currentEvaluation.structureScore}%
                  </p>
                  <div className="mt-1 flex justify-center gap-1 text-[9px] font-bold">
                    <span
                      className={
                        currentEvaluation.starComponentsFound.situation
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      S✓
                    </span>
                    <span
                      className={
                        currentEvaluation.starComponentsFound.task
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      T✓
                    </span>
                    <span
                      className={
                        currentEvaluation.starComponentsFound.action
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      A✓
                    </span>
                    <span
                      className={
                        currentEvaluation.starComponentsFound.result
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      R✓
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Clarity & Fillers
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {currentEvaluation.clarityScore}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {currentEvaluation.fillerWordCount} filler words detected
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Concept Coverage
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {currentEvaluation.detectedConcepts.length} /{" "}
                    {currentEvaluation.detectedConcepts.length +
                      currentEvaluation.missedConcepts.length}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Expected key points</p>
                </div>
              </div>

              {/* Strengths & Improvement Suggestions */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    Demonstrated Strengths:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-foreground">
                    {currentEvaluation.strengths.map((s, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    Suggestions for Improvement:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-foreground">
                    {currentEvaluation.improvements.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <p className="font-bold text-foreground">Ideal Model Response for Comparison:</p>
                <p className="mt-1 leading-relaxed text-muted-foreground italic">
                  "{currentQuestion.idealModelAnswer}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INTERVIEW PROGRESS TRACKING */}
      {activeTab === "history" && (
        <div className="space-y-5">
          {/* KPI Summary */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Total Interviews
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-foreground">
                {progressSummary.totalInterviews}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {progressSummary.completedInterviews} Completed •{" "}
                {progressSummary.endedEarlyInterviews} Ended Early
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Average Score
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-primary">
                {progressSummary.averageScoreTen} / 10
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {progressSummary.latestScoreTen !== null
                  ? `Latest: ${progressSummary.latestScoreTen}/10`
                  : "No rounds yet"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Score Improvement
              </p>
              <p className="font-display mt-1 text-2xl font-bold text-foreground">
                {progressSummary.improvementDeltaTen === null
                  ? "—"
                  : `${progressSummary.improvementDeltaTen >= 0 ? "+" : ""}${progressSummary.improvementDeltaTen} / 10`}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {progressSummary.overallGrowthDeltaTen !== null
                  ? `Overall trend: ${progressSummary.overallGrowthDeltaTen >= 0 ? "+" : ""}${progressSummary.overallGrowthDeltaTen}`
                  : "Complete 2+ rounds to track delta"}
              </p>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Top Category
              </p>
              <p className="font-display mt-1 truncate text-base font-bold text-foreground">
                {progressSummary.strongestCategory ?? "None yet"}
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Based on saved interview scores
              </p>
            </div>
          </div>

          {/* Repeatedly Struggled Areas */}
          <div className="rounded-2xl border border-amber-500/25 bg-amber-500/10 p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <h3 className="font-display text-sm font-bold text-amber-900 dark:text-amber-200">
                Areas Where You Repeatedly Struggle
              </h3>
            </div>
            {progressSummary.repeatedStruggles.length === 0 ? (
              <p className="mt-2 text-xs text-muted-foreground">
                Complete mock interviews to surface recurring weak topics or rubric dimensions.
              </p>
            ) : (
              <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                {progressSummary.repeatedStruggles.map((item) => (
                  <div
                    key={item.area}
                    className="rounded-xl border border-amber-500/20 bg-card p-3 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-foreground">{item.area}</span>
                      <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        {item.avgScoreTen}/10
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Flagged in {item.occurrences} interview{item.occurrences > 1 ? "s" : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Historical Interview Timeline */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-display font-bold">Interview History & Performance Trend</h3>
                <p className="text-xs text-muted-foreground">
                  Review past scores, completion status, and improvements over time.
                </p>
              </div>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>

            {history.length === 0 ? (
              <div className="mt-6 rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                No interviews recorded yet. Start your first interview in the Live Interview tab to
                track scores and progress!
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {history.map((s) => {
                  const scoreTen = getSessionScoreTen(s);
                  const statusLabel = s.completionStatus ?? "Completed";
                  const categoryLabel = s.category ?? s.role;
                  return (
                    <div
                      key={s.id}
                      className="rounded-xl border border-border/80 bg-muted/20 p-4 text-xs shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-[10px] font-bold text-violet">
                            {categoryLabel}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadgeClass(
                              statusLabel,
                            )}`}
                          >
                            {statusLabel}
                          </span>
                          <span className="text-muted-foreground">{s.date}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-display text-sm font-bold text-primary">
                            Score: {scoreTen} / 10
                          </span>
                          <span className="rounded bg-muted px-2 py-0.5 font-semibold text-foreground">
                            {s.questionsAnsweredCorrectly ??
                              (s.evaluation.verdict === "Correct" ? 1 : 0)}
                            /{s.totalQuestionsAnswered ?? s.turns?.length ?? 1} correct
                          </span>
                        </div>
                      </div>

                      <p className="mt-2.5 font-semibold text-foreground">Latest Q: {s.question}</p>
                      <p className="mt-1 line-clamp-2 text-muted-foreground italic">
                        "{s.answerText}"
                      </p>

                      {s.weakAreas && s.weakAreas.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/50 pt-2 text-[11px]">
                          <span className="font-bold text-muted-foreground">Focus Areas:</span>
                          {s.weakAreas.slice(0, 3).map((w, idx) => (
                            <span
                              key={idx}
                              className="rounded-md bg-amber-500/10 px-2 py-0.5 font-medium text-amber-700 dark:text-amber-300"
                            >
                              {w}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SMART PRACTICE RECOMMENDATIONS */}
      {activeTab === "practice" && (
        <div className="space-y-5">
          {/* 1. Topics to Revise */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold">Topics to Revise</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Prioritized directly from your interview gaps and low-scoring responses.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {smartRecommendations.topicsToRevise.map((topicItem) => (
                <div
                  key={topicItem.topic}
                  className="rounded-xl border border-border bg-muted/30 p-4 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-foreground">{topicItem.topic}</span>
                    <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                      {topicItem.currentScoreTen !== null
                        ? `${topicItem.currentScoreTen}/10`
                        : topicItem.category}
                    </span>
                  </div>
                  <p className="mt-1.5 text-muted-foreground">{topicItem.reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Technical Questions to Practise & 3. HR Questions to Prepare */}
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-violet" />
                <h3 className="font-display font-bold">Technical Questions to Practise</h3>
              </div>
              <div className="mt-4 space-y-3">
                {smartRecommendations.technicalQuestionsToPractice.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-primary">{q.topic}</span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${difficultyBadgeClass(
                          q.difficulty ?? "Medium",
                        )}`}
                      >
                        {q.difficulty ?? "Medium"}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium text-foreground">{q.question}</p>
                    <button
                      type="button"
                      onClick={() =>
                        startNewInterview(q.interviewCategory ?? "Technical Interview", q)
                      }
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <span>Practice Question</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-display font-bold">HR Questions to Prepare</h3>
              </div>
              <div className="mt-4 space-y-3">
                {smartRecommendations.hrQuestionsToPrepare.map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {q.topic}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${difficultyBadgeClass(
                          q.difficulty ?? "Medium",
                        )}`}
                      >
                        {q.difficulty ?? "Medium"}
                      </span>
                    </div>
                    <p className="mt-1.5 font-medium text-foreground">{q.question}</p>
                    <button
                      type="button"
                      onClick={() => startNewInterview("HR Interview", q)}
                      className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
                    >
                      <span>Practice HR Question</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Communication Improvement Exercises */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <h3 className="font-display font-bold">Communication Improvement Exercises</h3>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Targeted drills selected from your filler words, speaking pace, and answer structure.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {smartRecommendations.communicationExercises.map((ex) => (
                <div
                  key={ex.title}
                  className="rounded-xl border border-border bg-muted/30 p-4 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-md bg-violet/15 px-2 py-0.5 text-[10px] font-bold text-violet">
                      {ex.durationMinutes} min drill
                    </span>
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {ex.focus}
                    </span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-foreground">{ex.title}</h4>
                  <p className="mt-1.5 leading-relaxed text-muted-foreground">{ex.instruction}</p>
                  <p className="mt-2.5 font-bold text-primary">Target: {ex.targetMetric}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
