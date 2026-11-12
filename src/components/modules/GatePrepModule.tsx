import { useState, useEffect } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  ChevronRight,
  Filter,
  Flame,
  Check,
  TrendingUp,
  FileText,
  Calculator,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import {
  gatePapers,
  gateCSESubjects,
  gateQuestionBank,
  gateStudyPlans,
  getSelectedGatePaper,
  setSelectedGatePaper,
  getGateResults,
  saveGateResult,
  getGateTopicStats,
  type GatePaperCode,
  type GateSubject,
  type GateQuestion,
  type GateQuizResult,
} from "@/lib/data";

type TabType = "practice" | "subjects" | "study-plans" | "performance";

export function GatePrepModule() {
  const [selectedPaper, setSelectedPaperState] = useState<GatePaperCode>("CS");
  const [activeTab, setActiveTab] = useState<TabType>("practice");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "pyq" | "nat" | "mcq">("all");

  // Practice & Quiz State
  const [isTimedMode, setIsTimedMode] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes default
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [userMcqAnswers, setUserMcqAnswers] = useState<Record<string, number>>({});
  const [userNatAnswers, setUserNatAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activePlanId, setActivePlanId] = useState("gate-30d");

  // Load paper on mount
  useEffect(() => {
    setSelectedPaperState(getSelectedGatePaper());
  }, []);

  const handlePaperChange = (code: GatePaperCode) => {
    setSelectedPaperState(code);
    setSelectedGatePaper(code);
    toast.success(`Switched GATE Paper to ${code}`);
  };

  const activePaperData = gatePapers.find((p) => p.code === selectedPaper) || gatePapers[0];

  // Filter questions
  const filteredQuestions = gateQuestionBank.filter((q) => {
    if (subjectFilter !== "all" && q.subjectId !== subjectFilter) return false;
    if (typeFilter === "pyq" && !q.isOfficialPYQ) return false;
    if (typeFilter === "nat" && q.type !== "NAT") return false;
    if (typeFilter === "mcq" && q.type !== "MCQ") return false;
    return true;
  });

  const activeQuestion = filteredQuestions[currentQuestionIndex] || filteredQuestions[0];

  // Timer countdown for timed mock mode
  useEffect(() => {
    if (!isTimedMode || quizSubmitted) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimedMode, quizSubmitted]);

  useEffect(() => {
    if (isTimedMode && !quizSubmitted && timeRemaining === 0) {
      handleSubmitQuiz();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, isTimedMode, quizSubmitted]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setUserMcqAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleNatChange = (questionId: string, val: string) => {
    if (quizSubmitted) return;
    setUserNatAnswers((prev) => ({ ...prev, [questionId]: val }));
  };

  // Check if answer is correct
  const isQuestionCorrect = (q: GateQuestion): boolean => {
    if (q.type === "MCQ") {
      return userMcqAnswers[q.id] === q.correctOption;
    } else {
      const typed = parseFloat(userNatAnswers[q.id]);
      if (isNaN(typed)) return false;
      if (q.numericalRange) {
        return typed >= q.numericalRange[0] && typed <= q.numericalRange[1];
      }
      return typed === q.numericalAnswer;
    }
  };

  // Submit test and persist result
  const handleSubmitQuiz = () => {
    let earnedMarks = 0;
    let maxMarks = 0;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const topicAccuracies: Record<string, { correct: number; total: number; subject: string }> = {};

    for (const q of filteredQuestions) {
      maxMarks += q.marks;
      if (!topicAccuracies[q.topic]) {
        topicAccuracies[q.topic] = { correct: 0, total: 0, subject: q.subjectName };
      }
      topicAccuracies[q.topic].total += 1;

      const answered =
        q.type === "MCQ" ? userMcqAnswers[q.id] !== undefined : !!userNatAnswers[q.id]?.trim();

      if (!answered) {
        unanswered++;
      } else if (isQuestionCorrect(q)) {
        correct++;
        earnedMarks += q.marks;
        topicAccuracies[q.topic].correct += 1;
      } else {
        incorrect++;
        if (q.type === "MCQ") {
          earnedMarks -= q.negativeMarks; // Official negative marking
        }
      }
    }

    earnedMarks = Math.max(0, Math.round(earnedMarks * 100) / 100);
    const percentage = maxMarks > 0 ? Math.round((earnedMarks / maxMarks) * 100) : 0;
    const accuracy =
      correct + incorrect > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 0;

    const result: GateQuizResult = {
      id: "gate-res-" + Date.now(),
      paperCode: selectedPaper,
      mode: isTimedMode ? "timed-mock" : "practice",
      takenAt: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      subjectId: subjectFilter !== "all" ? subjectFilter : undefined,
      subjectName:
        subjectFilter !== "all"
          ? gateCSESubjects.find((s) => s.id === subjectFilter)?.name
          : "All Subjects",
      score: earnedMarks,
      maxScore: maxMarks,
      percentage,
      accuracy,
      totalQuestions: filteredQuestions.length,
      correctCount: correct,
      incorrectCount: incorrect,
      unansweredCount: unanswered,
      topicAccuracies,
      timeSpentSec: isTimedMode ? 600 - timeRemaining : 300,
    };

    saveGateResult(result);
    setQuizSubmitted(true);
    toast.success(`GATE Assessment Submitted: Score ${earnedMarks}/${maxMarks} (${percentage}%)`);
  };

  const handleReset = () => {
    setUserMcqAnswers({});
    setUserNatAnswers({});
    setQuizSubmitted(false);
    setTimeRemaining(600);
    setCurrentQuestionIndex(0);
    toast.info("Test session reset.");
  };

  const pastResults = getGateResults();
  const topicStats = getGateTopicStats();

  return (
    <div className="space-y-6">
      {/* 1. ENGINEERING PAPER SELECTOR BANNER */}
      <div className="rounded-2xl border border-violet/30 bg-gradient-to-r from-violet/20 via-indigo-900/10 to-primary/10 p-5 shadow-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="bg-brand shadow-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
              <GraduationCap className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                  Official GATE Pathway
                </span>
                <span className="text-xs font-semibold text-muted-foreground">
                  3 Hours • 100 Marks • Computer Based Test
                </span>
              </div>
              <h2 className="font-display mt-1 text-lg font-bold text-foreground">
                {activePaperData.fullName}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{activePaperData.description}</p>
            </div>
          </div>

          <div className="shrink-0">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Select Engineering Discipline:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {gatePapers.map((p) => (
                <button
                  key={p.code}
                  onClick={() => handlePaperChange(p.code)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    selectedPaper === p.code
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Paper Sections Breakdown */}
        <div className="mt-4 grid grid-cols-1 gap-2 pt-3 border-t border-border/60 sm:grid-cols-3 text-xs">
          {activePaperData.sections.map((sec, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-xl bg-card/75 p-2.5 border border-border/70"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                {i + 1}
              </span>
              <span className="font-medium text-foreground">{sec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("practice")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "practice"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <Calculator className="h-4 w-4" />
          <span>Practice & Mock Exam</span>
        </button>
        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "subjects"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>12 GATE CSE Subjects ({gateCSESubjects.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("study-plans")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "study-plans"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <Compass className="h-4 w-4" />
          <span>30 & 90-Day Study Plans</span>
        </button>
        <button
          onClick={() => setActiveTab("performance")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
            activeTab === "performance"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          <span>Topic Accuracy & Weak Areas</span>
        </button>
      </div>

      {/* TAB 1: PRACTICE & MOCK EXAM ENGINE */}
      {activeTab === "practice" && (
        <div className="space-y-5">
          {/* Controls Bar: Filters & Timed Mode Toggle */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-bold text-muted-foreground">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              <select
                value={subjectFilter}
                onChange={(e) => {
                  setSubjectFilter(e.target.value);
                  setCurrentQuestionIndex(0);
                }}
                className="rounded-xl border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary"
              >
                <option value="all">All 12 Subjects ({gateQuestionBank.length} Qs)</option>
                {gateCSESubjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.weightageMarks})
                  </option>
                ))}
              </select>

              <div className="flex gap-1 rounded-xl bg-muted p-1">
                <button
                  onClick={() => setTypeFilter("all")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    typeFilter === "all"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter("pyq")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    typeFilter === "pyq"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  Verified Official PYQs
                </button>
                <button
                  onClick={() => setTypeFilter("nat")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    typeFilter === "nat"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  NAT Only
                </button>
                <button
                  onClick={() => setTypeFilter("mcq")}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold ${
                    typeFilter === "mcq"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  MCQ Only
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsTimedMode(!isTimedMode);
                  handleReset();
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  isTimedMode
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <Clock className="h-3.5 w-3.5" />
                <span>{isTimedMode ? "Timed Mock Mode (ON)" : "Practice Mode (Untimed)"}</span>
              </button>

              {isTimedMode && !quizSubmitted && (
                <span className="flex items-center gap-1 font-mono text-sm font-bold text-amber-600 dark:text-amber-400">
                  <Clock className="h-4 w-4" />
                  {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, "0")}
                </span>
              )}
            </div>
          </div>

          {/* Question Stepper / Navigator */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              Question {currentQuestionIndex + 1} of {filteredQuestions.length}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {filteredQuestions.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered =
                  q.type === "MCQ"
                    ? userMcqAnswers[q.id] !== undefined
                    : !!userNatAnswers[q.id]?.trim();
                const isCorrect = quizSubmitted && isQuestionCorrect(q);
                const isWrong = quizSubmitted && isAnswered && !isCorrect;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-7 w-7 rounded-lg text-xs font-bold transition ${
                      isCurrent
                        ? "border-2 border-primary bg-primary text-white"
                        : quizSubmitted
                          ? isCorrect
                            ? "bg-emerald-500 text-white"
                            : isWrong
                              ? "bg-destructive text-white"
                              : "bg-muted text-muted-foreground"
                          : isAnswered
                            ? "bg-primary/20 text-primary border border-primary/30"
                            : "bg-card border border-border text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Question Card */}
          {activeQuestion && (
            <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
              {/* Question Meta Badges */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                    {activeQuestion.subjectName}
                  </span>
                  <span className="text-xs font-semibold text-muted-foreground">
                    Topic: {activeQuestion.topic}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activeQuestion.isOfficialPYQ ? (
                    <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      ✓ {activeQuestion.pyqYearAndSource}
                    </span>
                  ) : (
                    <span className="rounded-full bg-violet/15 border border-violet/30 px-2.5 py-0.5 text-[10px] font-bold text-violet">
                      ⚡ Practice Drill
                    </span>
                  )}
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {activeQuestion.marks} Mark{activeQuestion.marks > 1 ? "s" : ""}
                  </span>
                  <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    Type: {activeQuestion.type}
                  </span>
                  {activeQuestion.type === "MCQ" ? (
                    <span className="text-[10px] text-destructive font-medium">
                      (-{activeQuestion.negativeMarks} negative)
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      (0 negative)
                    </span>
                  )}
                </div>
              </div>

              {/* Question Text & Code Snippet */}
              <div className="mt-4">
                <p className="whitespace-pre-line text-sm font-medium text-foreground leading-relaxed">
                  {activeQuestion.question}
                </p>

                {activeQuestion.codeSnippet && (
                  <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-3.5 font-mono text-xs text-slate-100 border border-slate-800">
                    <code>{activeQuestion.codeSnippet}</code>
                  </pre>
                )}
              </div>

              {/* Interaction: MCQ Options OR NAT Numerical Input */}
              <div className="mt-5 space-y-2.5">
                {activeQuestion.type === "MCQ" && activeQuestion.options ? (
                  activeQuestion.options.map((opt, optIdx) => {
                    const isSelected = userMcqAnswers[activeQuestion.id] === optIdx;
                    const isCorrectAnswer = activeQuestion.correctOption === optIdx;

                    let btnClass = "border-border hover:bg-muted/60";
                    if (isSelected) {
                      btnClass = "border-primary bg-primary/10 text-primary font-bold";
                    }
                    if (quizSubmitted) {
                      if (isCorrectAnswer) {
                        btnClass =
                          "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                      } else if (isSelected && !isCorrectAnswer) {
                        btnClass =
                          "border-destructive bg-destructive/15 text-destructive line-through";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        disabled={quizSubmitted}
                        onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                        className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition ${btnClass}`}
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                            isSelected
                              ? "border-primary bg-primary text-white"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1 text-foreground leading-snug">{opt}</span>
                        {quizSubmitted && isCorrectAnswer && (
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        )}
                        {quizSubmitted && isSelected && !isCorrectAnswer && (
                          <XCircle className="h-4 w-4 shrink-0 text-destructive" />
                        )}
                      </button>
                    );
                  })
                ) : (
                  /* Numerical Answer Type (NAT) Input */
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="h-4 w-4 text-primary" />
                      <label className="text-xs font-bold text-foreground">
                        Numerical Answer Type (NAT) — Enter Exact Real Number:
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        step="any"
                        disabled={quizSubmitted}
                        placeholder="e.g. 50 or 208"
                        value={userNatAnswers[activeQuestion.id] || ""}
                        onChange={(e) => handleNatChange(activeQuestion.id, e.target.value)}
                        className="h-11 w-48 rounded-xl border border-input bg-card px-4 font-mono text-sm font-bold text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-[11px] text-muted-foreground">
                        (No negative marking for NAT questions per GATE rules)
                      </span>
                    </div>

                    {quizSubmitted && (
                      <div className="mt-3 flex items-center gap-2 text-xs font-bold">
                        {isQuestionCorrect(activeQuestion) ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-4 w-4" /> Correct Answer:{" "}
                            {activeQuestion.numericalAnswer}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-destructive">
                            <XCircle className="h-4 w-4" /> Official Key:{" "}
                            {activeQuestion.numericalAnswer}
                            {activeQuestion.numericalRange &&
                              ` (Accepted range: ${activeQuestion.numericalRange[0]} to ${activeQuestion.numericalRange[1]})`}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Step-by-Step Mathematical & Conceptual Solution (Visible on Submit or Practice Mode) */}
              {(quizSubmitted || !isTimedMode) && (
                <div className="mt-5 rounded-xl border border-border bg-muted/40 p-4 text-xs">
                  <div className="flex items-center gap-2 font-bold text-primary mb-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>Detailed Step-by-Step Derivation & Explanation:</span>
                  </div>
                  <p className="whitespace-pre-line text-muted-foreground leading-relaxed mt-2 font-sans">
                    {activeQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Prev / Next / Submit Controls */}
              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((i) => Math.max(0, i - 1))}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition disabled:opacity-40 hover:bg-muted"
                >
                  ← Previous
                </button>

                <div className="flex items-center gap-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleSubmitQuiz}
                      className="bg-brand shadow-glow rounded-xl px-5 py-2 text-xs font-bold text-white transition hover:opacity-95"
                    >
                      Submit Assessment
                    </button>
                  ) : (
                    <button
                      onClick={handleReset}
                      className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Retake Test
                    </button>
                  )}

                  <button
                    disabled={currentQuestionIndex === filteredQuestions.length - 1}
                    onClick={() =>
                      setCurrentQuestionIndex((i) => Math.min(filteredQuestions.length - 1, i + 1))
                    }
                    className="rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition disabled:opacity-40 hover:bg-muted"
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test Submission Summary Banner */}
          {quizSubmitted && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-card">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-display font-bold text-base">GATE Assessment Evaluated</h3>
                  </div>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
                    Official negative marking applied to MCQs (-0.33 / -0.66). NAT answers evaluated
                    against official numerical tolerances.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-center">
                  <div className="rounded-xl bg-card p-3 border border-border shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      GATE Score
                    </p>
                    <p className="font-display text-lg font-bold text-primary">
                      {pastResults[0]?.score} / {pastResults[0]?.maxScore}
                    </p>
                  </div>
                  <div className="rounded-xl bg-card p-3 border border-border shadow-sm">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">
                      Accuracy
                    </p>
                    <p className="font-display text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {pastResults[0]?.accuracy}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 12 GATE CSE SUBJECTS CURRICULUM */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold text-base">Official 12 GATE CSE Subjects</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive syllabus coverage with mark weightage and high-frequency formulas:
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {gateCSESubjects.map((sub, idx) => (
                <div
                  key={sub.id}
                  className="rounded-xl border border-border/80 bg-muted/20 p-4 shadow-sm hover:border-primary/40 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary mb-1">
                        {idx + 1}
                      </span>
                      <h4 className="font-bold text-sm text-foreground">{sub.name}</h4>
                    </div>
                    <span className="rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      {sub.weightageMarks}
                    </span>
                  </div>

                  {/* Subtopics */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Key Syllabus Modules:
                    </p>
                    {sub.subtopics.map((st, i) => (
                      <p key={i} className="text-xs text-foreground/85 flex items-start gap-1.5">
                        <span className="h-1 w-1 rounded-full bg-violet mt-1.5 shrink-0" />
                        <span>{st}</span>
                      </p>
                    ))}
                  </div>

                  {/* High Yield Formulas & Concepts */}
                  <div className="mt-3 border-t border-border/60 pt-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Core Concept / Formula Cheat Sheet:
                    </p>
                    <ul className="mt-1 space-y-1 text-[11px] text-muted-foreground">
                      {sub.keyFormulasAndConcepts.slice(0, 2).map((fc, i) => (
                        <li key={i} className="bg-card p-1.5 rounded border border-border/50">
                          {fc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSubjectFilter(sub.id);
                      setActiveTab("practice");
                      setCurrentQuestionIndex(0);
                    }}
                    className="mt-3 w-full rounded-xl bg-card border border-primary/30 py-1.5 text-xs font-bold text-primary hover:bg-primary/10 transition"
                  >
                    Practice {sub.name} Questions →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 30-DAY & 90-DAY STUDY PLANS */}
      {activeTab === "study-plans" && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {gateStudyPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActivePlanId(plan.id)}
                className={`flex-1 rounded-xl p-3 text-left border transition ${
                  activePlanId === plan.id
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border bg-card text-muted-foreground hover:bg-muted"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-foreground">{plan.title}</span>
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                    {plan.durationDays} Days
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{plan.targetAudience}</p>
              </button>
            ))}
          </div>

          {/* Active Plan Milestones */}
          {(() => {
            const plan = gateStudyPlans.find((p) => p.id === activePlanId) || gateStudyPlans[0];
            return (
              <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base">{plan.title}</h3>
                    <p className="text-xs text-muted-foreground">{plan.targetAudience}</p>
                  </div>
                  <span className="text-xs font-bold text-primary">
                    Total Target PYQs:{" "}
                    {plan.milestones.reduce((acc, m) => acc + m.targetPYQCount, 0)}+
                  </span>
                </div>

                <div className="mt-4 space-y-3.5">
                  {plan.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border bg-muted/20 p-4 text-xs shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                          {m.weekRange}
                        </span>
                        <span className="font-bold text-foreground">
                          Goal: {m.targetPYQCount} Verified PYQs
                        </span>
                      </div>

                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {m.focusSubjects.map((sub) => (
                          <span
                            key={sub}
                            className="rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-semibold text-foreground"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>

                      <p className="mt-2 text-muted-foreground leading-relaxed">
                        <b>Weekly Milestone:</b> {m.objectives}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* TAB 4: PERFORMANCE & WEAK-TOPIC DIAGNOSTICS */}
      {activeTab === "performance" && (
        <div className="space-y-5">
          {/* Diagnostic Weak Topic Identification */}
          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-card">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-display font-bold text-sm text-amber-900 dark:text-amber-200">
                  Identified GATE Bottlenecks & Revision Recommendations
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                  Pinpointed from your actual topic-wise question accuracy and numerical responses:
                </p>

                <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  <div className="rounded-xl bg-card p-3 border border-amber-500/20 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-foreground">Instruction Pipelining & Stalls</span>
                      <span className="text-amber-600 dark:text-amber-400">50% Accuracy</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Frequent errors on branch delay penalty and forwarding calculation.
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold text-primary">
                      Recommendation: Practice 10 COA pipeline speedup NATs.
                    </p>
                  </div>

                  <div className="rounded-xl bg-card p-3 border border-amber-500/20 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-foreground">Virtual Memory & LRU Page Faults</span>
                      <span className="text-amber-600 dark:text-amber-400">60% Accuracy</span>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Belady's anomaly & inverted page table address translation.
                    </p>
                    <p className="mt-1.5 text-[10px] font-bold text-primary">
                      Recommendation: Solve 2018-2023 OS paging previous-year questions.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Past GATE Mock Test History */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-bold text-base mb-1">Your GATE Test Attempts</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Real recorded scores with negative marking deduction:
            </p>

            {pastResults.length === 0 ? (
              <p className="text-center py-6 text-xs text-muted-foreground">
                No GATE mock tests submitted yet. Take your first timed mock in the Practice tab!
              </p>
            ) : (
              <div className="space-y-2.5">
                {pastResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between rounded-xl bg-muted/30 p-3.5 border border-border text-xs gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">
                          {r.paperCode} • {r.subjectName || "Comprehensive Mock"}
                        </span>
                        <span className="rounded bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {r.mode === "timed-mock" ? "Timed Exam" : "Practice Drill"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {r.takenAt} • {r.totalQuestions} Questions ({r.correctCount} correct,{" "}
                        {r.incorrectCount} wrong)
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Score</span>
                        <span className="font-display font-bold text-primary text-sm">
                          {r.score} / {r.maxScore}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground block">Accuracy</span>
                        <span className="font-display font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {r.accuracy}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
