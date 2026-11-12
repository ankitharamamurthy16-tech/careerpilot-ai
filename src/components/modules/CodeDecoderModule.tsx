import { useState, useEffect, useMemo, useId } from "react";
import {
  Code2,
  Terminal,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  Copy,
  Check,
  Award,
  AlertCircle,
  Filter,
  Play,
  Flame,
  HelpCircle,
  Layers,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import {
  decoderQuestions,
  getDecoderProgress,
  saveDecoderProgress,
  getDecoderStats,
  resetDecoderProgress,
  getDecoderDrafts,
  saveDecoderDraft,
  clearDecoderDraft,
  type CodeLanguage,
  type DifficultyLevel,
  type PracticeMode,
  type CodeDecoderQuestion,
} from "@/lib/data";
import { CodeDecoderProgressDashboard } from "./CodeDecoderProgressDashboard";

type CustomAnalysis = {
  lineCount: number;
  timeComp: string;
  spaceComp: string;
  lines: { line: number; text: string; explanation: string }[];
  bugTraps: string[];
};

export function CodeDecoderModule() {
  const customTextareaId = useId();
  const codeEditorTextareaId = useId();

  // Mode: Curated Interactive Bug Hunter vs Progress Dashboard vs Custom Code Explainer
  const [activeTab, setActiveTab] = useState<"practice" | "progress" | "custom">("practice");

  // Practice Filters
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage>("python");
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | "All">("All");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("topic");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");

  // Questions filtering
  const filteredQuestions = useMemo(() => {
    return decoderQuestions.filter((q) => {
      if (q.language !== selectedLanguage) return false;
      if (selectedDifficulty !== "All" && q.difficulty !== selectedDifficulty) return false;
      if (selectedTopic !== "All" && q.topic !== selectedTopic) return false;
      return true;
    });
  }, [selectedLanguage, selectedDifficulty, selectedTopic]);

  // Available topics for currently selected language
  const availableTopics = useMemo(() => {
    const set = new Set<string>();
    decoderQuestions
      .filter((q) => q.language === selectedLanguage)
      .forEach((q) => set.add(q.topic));
    return Array.from(set);
  }, [selectedLanguage]);

  // Current Question Pointer
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fallback safe active question
  const activeQuestion: CodeDecoderQuestion =
    filteredQuestions[currentIndex] || filteredQuestions[0] || decoderQuestions[0]!;

  // User Code Editor State
  const [userCode, setUserCode] = useState<string>("");

  // Hidden State Controls (CRITICAL: Hidden by default!)
  const [showHint, setShowHint] = useState<boolean>(false);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  // Submission validation result
  const [submissionResult, setSubmissionResult] = useState<{
    isCorrect: boolean;
    feedback: string;
  } | null>(null);

  // Copied states
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedSolution, setCopiedSolution] = useState<boolean>(false);

  // Overall Stats State
  const [stats, setStats] = useState(getDecoderStats);

  // Check if current question is solved
  const isCurrentSolved = useMemo(() => {
    if (stats.totalSolved < 0) return false;
    const progress = getDecoderProgress();
    return !!progress[activeQuestion.id]?.isSolved;
  }, [activeQuestion.id, stats]);

  // Load question code when active question changes
  const activeQuestionId = activeQuestion.id;
  const activeQuestionBuggyCode = activeQuestion.buggyCode;

  useEffect(() => {
    const drafts = getDecoderDrafts();
    const draftCode = drafts[activeQuestionId];
    const progress = getDecoderProgress();
    const record = progress[activeQuestionId];

    if (draftCode !== undefined) {
      setUserCode(draftCode);
    } else if (record?.lastCode) {
      setUserCode(record.lastCode);
    } else {
      setUserCode(activeQuestionBuggyCode);
    }

    // Always keep answers, explanations, and hints hidden when switching questions!
    setShowHint(false);
    setShowAnswer(false);
    setShowExplanation(false);

    // Preserve previous submission feedback if this question was already solved
    if (record?.isSolved) {
      setSubmissionResult({
        isCorrect: true,
        feedback: "Previously solved correctly! All test cases verified.",
      });
    } else {
      setSubmissionResult(null);
    }
  }, [activeQuestionId, activeQuestionBuggyCode]);

  // When filters change, reset index safely
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedLanguage, selectedDifficulty, selectedTopic, practiceMode]);

  // Navigation handlers
  const handleNext = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      saveDecoderDraft(activeQuestion.id, userCode);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      saveDecoderDraft(activeQuestion.id, userCode);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleRandomQuestion = () => {
    if (filteredQuestions.length <= 1) return;
    saveDecoderDraft(activeQuestion.id, userCode);
    let nextIdx = Math.floor(Math.random() * filteredQuestions.length);
    if (nextIdx === currentIndex) {
      nextIdx = (currentIndex + 1) % filteredQuestions.length;
    }
    setCurrentIndex(nextIdx);
    toast.info("Switched to random practice challenge!");
  };

  // Reset to initial buggy code
  const handleResetToBuggy = () => {
    setUserCode(activeQuestion.buggyCode);
    clearDecoderDraft(activeQuestion.id);
    setSubmissionResult(null);
    toast.info("Editor reset to original buggy code.");
  };

  // Handle Tab key in code editor
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const spaces = "    "; // 4 spaces
      const newCode = userCode.substring(0, start) + spaces + userCode.substring(end);
      setUserCode(newCode);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + spaces.length;
      }, 0);
    }
  };

  // Submission handler
  const handleSubmitCode = () => {
    if (!userCode.trim()) {
      toast.error("Code editor cannot be empty!");
      return;
    }

    // Validate using the question's specific evaluation rules
    const result = activeQuestion.validateCode(userCode);
    setSubmissionResult(result);

    // Save progress to localStorage
    saveDecoderProgress(
      activeQuestion.id,
      activeQuestion.language,
      activeQuestion.difficulty,
      userCode,
      result.isCorrect,
      showAnswer,
      showExplanation,
      showHint,
    );
    saveDecoderDraft(activeQuestion.id, userCode);
    setStats(getDecoderStats());

    if (result.isCorrect) {
      toast.success("Awesome! Bug fixed successfully!");
    } else {
      toast.error("Solution incorrect. Review the feedback and try again!");
    }
  };

  // Toggle reveal answer (independent explicit student action)
  const handleToggleAnswer = () => {
    setShowAnswer((prev) => !prev);
  };

  // Toggle reveal explanation (independent explicit student action)
  const handleToggleExplanation = () => {
    setShowExplanation((prev) => !prev);
  };

  // Toggle hint (independent explicit student action)
  const handleToggleHint = () => {
    setShowHint((prev) => !prev);
  };

  // Copy code helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopiedCode(true);
    toast.success("Editor code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(activeQuestion.correctCode);
    setCopiedSolution(true);
    toast.success("Corrected solution copied to clipboard!");
    setTimeout(() => setCopiedSolution(false), 2000);
  };

  // Practice topic challenge directly from progress dashboard
  const handlePracticeTopicQuestion = (language: CodeLanguage, questionId: string) => {
    setSelectedLanguage(language);
    setSelectedDifficulty("All");
    setSelectedTopic("All");
    const langQuestions = decoderQuestions.filter((q) => q.language === language);
    const targetIdx = langQuestions.findIndex((q) => q.id === questionId);
    setCurrentIndex(targetIdx >= 0 ? targetIdx : 0);
    setActiveTab("practice");
  };

  // Reset progress handler for student account
  const handleResetProgress = () => {
    resetDecoderProgress();
    setStats(getDecoderStats());
    setSubmissionResult(null);
  };

  // Custom code explainer state (preserved functionality)
  const [customCode, setCustomCode] = useState(
    `# Paste any Python, Java, or C snippet here\ndef binary_search(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target:\n            return mid\n        elif arr[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1`,
  );
  const [customAnalysis, setCustomAnalysis] = useState<CustomAnalysis | null>(null);

  const handleAnalyzeCustom = () => {
    const lines = customCode.split("\n").filter((l) => l.trim().length > 0);
    const lineCount = lines.length;
    const hasLoops = /for\s|while\s/g.test(customCode);
    const hasNestedLoops = /(for|while)[\s\S]*?(for|while)/g.test(customCode);
    const hasRecursion = /return\s+[a-zA-Z0-9_]+\(/g.test(customCode);

    let timeComp = "O(1) constant time";
    if (hasNestedLoops) timeComp = "O(n²) quadratic time (nested loops)";
    else if (hasLoops) {
      if (
        customCode.includes("// 2") ||
        customCode.includes("/ 2") ||
        customCode.includes(">> 1")
      ) {
        timeComp = "O(log n) logarithmic time (divide and conquer / binary search)";
      } else {
        timeComp = "O(n) linear time (single traversal)";
      }
    } else if (hasRecursion) {
      timeComp = "O(2ⁿ) or O(n) recursive branching";
    }

    const spaceComp =
      customCode.includes("malloc") ||
      customCode.includes("new ") ||
      customCode.includes("[]") ||
      customCode.includes("{}")
        ? "O(n) auxiliary heap / dynamic allocation"
        : "O(1) auxiliary space (in-place)";

    setCustomAnalysis({
      lineCount,
      timeComp,
      spaceComp,
      lines: lines.map((text, idx) => ({
        line: idx + 1,
        text: text.trim(),
        explanation:
          text.includes("def ") || text.includes("public ") || text.includes("int ")
            ? "Function definition with parameters and return signature."
            : text.includes("while") || text.includes("for")
              ? "Loop construct controlling algorithmic iteration."
              : text.includes("if ") || text.includes("else")
                ? "Conditional branching based on state."
                : text.includes("return")
                  ? "Terminal condition returning result to caller."
                  : "Assignment or memory operation.",
      })),
      bugTraps: [
        "Watch for boundary and index out of bounds conditions on extreme inputs.",
        "Check for integer overflow when summing high values in C/Java (e.g. (low + high) / 2 vs low + (high - low) / 2).",
        "Verify off-by-one errors in while conditions (< vs <=).",
      ],
    });
    toast.success("Code decoded and analyzed successfully!");
  };

  return (
    <div className="w-full max-w-full space-y-6 overflow-hidden">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & PROGRESS SUMMARY                         */}
      {/* ======================================================== */}
      <div className="rounded-3xl border border-border bg-card p-5 shadow-card transition-all sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet/15 text-violet">
                <Code2 className="h-5 w-5" />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                Code Decoder & Bug Hunter
              </h2>
              <span className="rounded-full bg-violet/10 px-2.5 py-0.5 text-xs font-bold text-violet border border-violet/20">
                Interactive Practice
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Identify intentional bugs in Python, Java, and C. Correct the code, test your fixes,
              and master core placement traps. Answers & explanations remain strictly hidden by
              default.
            </p>
          </div>

          {/* Overall Stats Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <div className="rounded-2xl border border-border/80 bg-muted/40 px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Attempted
              </p>
              <p className="font-display text-sm font-bold text-foreground">
                {stats.totalAttempted}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Solved
              </p>
              <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                <span className="text-emerald-500">{stats.totalSolved}</span> /{" "}
                {stats.totalQuestions}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Incorrect
              </p>
              <p className="font-display text-sm font-bold text-rose-600 dark:text-rose-400">
                {stats.totalIncorrect}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Accuracy
              </p>
              <p className="font-display text-sm font-bold text-amber-600 dark:text-amber-400">
                {stats.overallAccuracy}%
              </p>
            </div>
            <div className="rounded-2xl border border-border/80 bg-muted/40 px-3 py-1.5 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Remaining
              </p>
              <p className="font-display text-sm font-bold text-muted-foreground">
                {stats.totalRemaining}
              </p>
            </div>
          </div>
        </div>

        {/* Difficulty Breakdown Badges & Quick Action to Dashboard */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-muted-foreground flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-primary" />
              <span>Difficulty Progress:</span>
            </span>
            <span className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Easy: {stats.byDifficulty.Easy.solved}/{stats.byDifficulty.Easy.total} solved (
              {stats.byDifficulty.Easy.accuracy}% acc)
            </span>
            <span className="rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Medium: {stats.byDifficulty.Medium.solved}/{stats.byDifficulty.Medium.total} solved (
              {stats.byDifficulty.Medium.accuracy}% acc)
            </span>
            <span className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
              Hard: {stats.byDifficulty.Hard.solved}/{stats.byDifficulty.Hard.total} solved (
              {stats.byDifficulty.Hard.accuracy}% acc)
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab("progress")}
            className="flex items-center gap-1.5 rounded-xl border border-violet/30 bg-violet/10 px-3 py-1 text-xs font-bold text-violet hover:bg-violet/20 transition cursor-pointer"
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Open Progress Dashboard</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MODE & LANGUAGE NAVIGATION BAR                        */}
      {/* ======================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-card">
        {/* Main Tab Toggle: Practice vs Progress Dashboard vs Custom Explainer */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("practice")}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "practice"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Curated Bug Challenges
          </button>
          <button
            onClick={() => setActiveTab("progress")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "progress"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Progress Dashboard</span>
            <span className="rounded-full bg-white/20 dark:bg-black/20 px-1.5 py-0.2 text-[10px]">
              {stats.totalSolved}/{stats.totalQuestions}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
              activeTab === "custom"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Custom Code Decoder</span>
          </button>
        </div>

        {/* Language Tabs (Python, Java, C) */}
        {activeTab === "practice" && (
          <div className="flex rounded-xl bg-muted p-1">
            {(["python", "java", "c"] as CodeLanguage[]).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLanguage(l)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase transition flex items-center gap-1.5 ${
                  selectedLanguage === l
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>{l === "python" ? "Python 3" : l === "java" ? "Java 17" : "C (GCC)"}</span>
                <span className="rounded-full bg-muted-foreground/15 px-1.5 py-0.2 text-[10px]">
                  {stats.byLanguage[l].solved}/{stats.byLanguage[l].total}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. TAB VIEW: PROGRESS DASHBOARD vs PRACTICE vs CUSTOM    */}
      {/* ======================================================== */}
      {activeTab === "progress" ? (
        <CodeDecoderProgressDashboard
          stats={stats}
          onPracticeQuestion={handlePracticeTopicQuestion}
          onResetProgress={handleResetProgress}
          onSwitchToPractice={() => setActiveTab("practice")}
        />
      ) : activeTab === "practice" ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/60 p-3.5 backdrop-blur-sm">
            {/* Left Controls: Practice Mode & Difficulty */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Practice Mode Toggle */}
              <div className="flex items-center rounded-xl border border-border bg-muted/60 p-1">
                <button
                  onClick={() => setPracticeMode("topic")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                    practiceMode === "topic"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Topic-Wise
                </button>
                <button
                  onClick={() => setPracticeMode("random")}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                    practiceMode === "random"
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Shuffle className="h-3 w-3" />
                  <span>Random Practice</span>
                </button>
              </div>

              {/* Difficulty Filter */}
              <div className="flex items-center gap-1 text-xs">
                {(["All", "Easy", "Medium", "Hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                      selectedDifficulty === diff
                        ? diff === "Easy"
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30"
                          : diff === "Medium"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold border border-amber-500/30"
                            : diff === "Hard"
                              ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30"
                              : "bg-primary text-primary-foreground font-bold shadow-xs"
                        : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              {/* Topic Selector in Topic-Wise Mode */}
              {practiceMode === "topic" && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-semibold text-foreground outline-none focus:border-primary"
                  >
                    <option value="All">All Topics ({availableTopics.length})</option>
                    {availableTopics.map((top) => (
                      <option key={top} value={top}>
                        {top}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Controls: Question Counter & Shuffle */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                Question {currentIndex + 1} of {Math.max(filteredQuestions.length, 1)}
              </span>

              <button
                type="button"
                onClick={handleRandomQuestion}
                className="flex items-center gap-1 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground cursor-pointer"
                title="Shuffle Random Question"
              >
                <Shuffle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Shuffle</span>
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. CURRENT QUESTION DISPLAY CARD                         */}
          {/* ======================================================== */}
          <div className="w-full max-w-full rounded-3xl border border-border bg-card p-4 sm:p-6 shadow-card space-y-4 overflow-hidden box-border">
            {/* Question Title & Meta Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs ${
                    isCurrentSolved
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-primary/10 text-primary"
                  }`}
                >
                  {isCurrentSolved ? <Check className="h-4 w-4" /> : `#${currentIndex + 1}`}
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                    {activeQuestion.title}
                    {isCurrentSolved && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        Solved ✓
                      </span>
                    )}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      <span>{activeQuestion.topic}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono uppercase font-bold text-violet">
                      {activeQuestion.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Difficulty Badge */}
              <span
                className={`rounded-xl px-3 py-1 text-xs font-bold ${
                  activeQuestion.difficulty === "Easy"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                    : activeQuestion.difficulty === "Medium"
                      ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                }`}
              >
                {activeQuestion.difficulty}
              </span>
            </div>

            {/* Problem Statement & Expected Behavior */}
            <div className="space-y-2 rounded-2xl bg-muted/40 p-4 border border-border/60">
              <p className="text-xs text-foreground leading-relaxed">
                <span className="font-bold text-primary">Challenge: </span>
                {activeQuestion.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 text-[11px]">
                <div className="rounded-xl border border-border/80 bg-card p-2.5">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">
                    Expected Behavior
                  </p>
                  <p className="font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {activeQuestion.expectedBehavior}
                  </p>
                </div>
                <div className="rounded-xl border border-border/80 bg-card p-2.5">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">
                    Sample I/O
                  </p>
                  <pre className="font-mono text-muted-foreground mt-0.5 whitespace-pre-wrap">
                    {activeQuestion.sampleInputOutput}
                  </pre>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 5. INTERACTIVE CODE EDITOR WITH LINE NUMBERS             */}
            {/* ======================================================== */}
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-card">
              {/* Editor Header Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-violet" />
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Fix the Buggy Code • {activeQuestion.language.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetToBuggy}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                    title="Reset to original buggy code"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Reset</span>
                  </button>
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition"
                  >
                    {copiedCode ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedCode ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Code Editor Textarea with Tab Support */}
              <div className="relative p-3">
                <label htmlFor={codeEditorTextareaId} className="sr-only">
                  Interactive Code Editor
                </label>
                <textarea
                  id={codeEditorTextareaId}
                  value={userCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserCode(val);
                    saveDecoderDraft(activeQuestion.id, val);
                    if (submissionResult) setSubmissionResult(null);
                  }}
                  onKeyDown={handleKeyDown}
                  rows={14}
                  spellCheck={false}
                  className="w-full resize-y rounded-xl bg-transparent font-mono text-xs text-slate-100 outline-none leading-relaxed selection:bg-violet/40 focus:ring-0"
                  placeholder="Identify and correct the bug here..."
                />
              </div>

              {/* Editor Footer / Hotkey Reminder */}
              <div className="flex flex-wrap items-center justify-between border-t border-slate-800 bg-slate-900/60 px-4 py-2 text-[10px] text-slate-400">
                <span>Tip: Press Tab to indent (4 spaces). Find and repair the bug above.</span>
                <span>Language: {activeQuestion.language}</span>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 6. ACTION BAR: SUBMIT, HINT, VIEW ANSWER, EXPLANATION     */}
            {/* ======================================================== */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitCode}
                  className="bg-brand shadow-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] hover:opacity-95 cursor-pointer"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Submit Answer</span>
                </button>

                {/* Hint Button (Toggles hint clue) */}
                <button
                  type="button"
                  onClick={handleToggleHint}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    showHint
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Lightbulb className="h-3.5 w-3.5" />
                  <span>{showHint ? "Hide Hint" : "Get Hint"}</span>
                </button>
              </div>

              {/* View Answer and View Explanation (Hidden by default!) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* View Answer Button */}
                <button
                  type="button"
                  onClick={handleToggleAnswer}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    showAnswer
                      ? "border-violet/40 bg-violet/10 text-violet font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {showAnswer ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                  <span>{showAnswer ? "Hide Correct Answer" : "View Answer"}</span>
                </button>

                {/* View Explanation Button */}
                <button
                  type="button"
                  onClick={handleToggleExplanation}
                  className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition cursor-pointer ${
                    showExplanation
                      ? "border-primary/40 bg-primary/10 text-primary font-bold"
                      : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>{showExplanation ? "Hide Explanation" : "View Explanation"}</span>
                </button>
              </div>
            </div>

            {/* ======================================================== */}
            {/* 7. SUBMISSION VALIDATION FEEDBACK BANNER                 */}
            {/* ======================================================== */}
            {submissionResult && (
              <div
                className={`rounded-2xl border p-4 transition-all ${
                  submissionResult.isCorrect
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {submissionResult.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
                  )}
                  <div className="space-y-1">
                    <p className="font-display text-xs font-bold uppercase tracking-wider">
                      {submissionResult.isCorrect
                        ? "Test Verification: Correct Fix!"
                        : "Test Verification: Fix Incomplete or Bug Remains"}
                    </p>
                    <p className="text-xs leading-relaxed">{submissionResult.feedback}</p>
                    {!submissionResult.isCorrect && !showHint && (
                      <button
                        onClick={() => setShowHint(true)}
                        className="mt-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 underline hover:opacity-80"
                      >
                        Need a clue? Click here to reveal the hint without seeing the solution.
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 8. HINT BOX (COLLAPSED BY DEFAULT)                       */}
            {/* ======================================================== */}
            {showHint && (
              <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 transition-all">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                  <div className="space-y-1">
                    <h4 className="font-display text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                      Hint Clue
                    </h4>
                    <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                      {activeQuestion.hint}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 9. VIEW ANSWER: REVEALS ONLY CORRECT CODE ON CLICK       */}
            {/* ======================================================== */}
            {showAnswer && (
              <div className="rounded-2xl border border-violet/30 bg-violet/5 p-4 space-y-3 transition-all">
                <div className="flex items-center justify-between border-b border-violet/20 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-violet" />
                    <h4 className="font-display text-xs font-bold uppercase tracking-wider text-violet">
                      Corrected Solution ({activeQuestion.language.toUpperCase()})
                    </h4>
                  </div>
                  <button
                    onClick={handleCopySolution}
                    className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-medium text-violet hover:bg-violet/10 transition"
                  >
                    {copiedSolution ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                    <span>{copiedSolution ? "Copied" : "Copy Solution"}</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-100">
                  <pre>{activeQuestion.correctCode}</pre>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Compare this with your code to see the syntax differences and pointer handling.
                </p>
              </div>
            )}

            {/* ======================================================== */}
            {/* 10. VIEW EXPLANATION: STEP-BY-STEP ERROR BREAKDOWN       */}
            {/* ======================================================== */}
            {showExplanation && (
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4 transition-all">
                <div className="flex items-center gap-2 border-b border-primary/20 pb-2.5">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  <h4 className="font-display text-sm font-bold text-foreground">
                    Step-by-Step Bug Breakdown & Resolution
                  </h4>
                </div>

                {/* Summary & Root Cause */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">
                      Why the Error Occurred (Root Cause)
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeQuestion.explanation.rootCause}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border/80 bg-card p-3 space-y-1">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">
                      How to Correct It
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      {activeQuestion.explanation.howToFix}
                    </p>
                  </div>
                </div>

                {/* Line Corrections Table */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-foreground">Line-by-Line Changes:</p>
                  <div className="overflow-x-auto rounded-xl border border-border bg-card">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/60 text-[10px] font-bold uppercase text-muted-foreground">
                        <tr>
                          <th className="p-2.5">Line</th>
                          <th className="p-2.5">Buggy Snippet</th>
                          <th className="p-2.5">Corrected Snippet</th>
                          <th className="p-2.5">Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {activeQuestion.explanation.lineCorrections.map((corr, idx) => (
                          <tr key={idx} className="hover:bg-muted/30">
                            <td className="p-2.5 font-mono font-bold text-primary">#{corr.line}</td>
                            <td className="p-2.5 font-mono text-rose-500 bg-rose-500/5">
                              {corr.buggySnippet}
                            </td>
                            <td className="p-2.5 font-mono text-emerald-500 bg-emerald-500/5">
                              {corr.fixedSnippet}
                            </td>
                            <td className="p-2.5 text-muted-foreground">{corr.reason}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Placement Interview Tip */}
                <div className="flex items-start gap-2 rounded-xl bg-violet/10 border border-violet/20 p-3 text-xs text-violet">
                  <Flame className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Placement Interview Tip: </span>
                    <span className="text-foreground/90">
                      {activeQuestion.explanation.placementTip}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* 11. BOTTOM NAVIGATION BAR - PREVIOUS & NEXT QUESTION     */}
            {/* ======================================================== */}
            <div className="w-full max-w-full border-t border-border/70 pt-4 mt-2">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
                <div className="text-center sm:text-left text-xs font-medium text-muted-foreground order-2 sm:order-1">
                  Question <span className="font-bold text-foreground">{currentIndex + 1}</span> of{" "}
                  <span className="font-bold text-foreground">
                    {Math.max(filteredQuestions.length, 1)}
                  </span>
                  <span className="hidden md:inline text-muted-foreground/60">
                    {" "}
                    • {activeQuestion.topic}
                  </span>
                </div>

                {/* Side-by-side Button Pair: Previous Question beside Next Question */}
                <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="min-w-0 flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground px-3 sm:px-4 py-2.5 text-xs font-bold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                    title="Previous Question"
                  >
                    <ChevronLeft className="h-4 w-4 shrink-0" />
                    <span className="truncate">Previous Question</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQuestions.length - 1}
                    className="min-w-0 bg-brand shadow-glow flex items-center justify-center gap-1.5 rounded-xl px-3 sm:px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    title="Next Question"
                  >
                    <span className="truncate">Next Question</span>
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ======================================================== */
        /* 11. INTERACTIVE CUSTOM CODE EXPLAINER (PRESERVED)        */
        /* ======================================================== */
        <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-card">
          <div>
            <h3 className="font-display text-base font-bold">Paste Code for Instant Decoding</h3>
            <p className="text-xs text-muted-foreground">
              Paste your Python, Java, or C code below. Our decoder will estimate time/space
              complexity and generate line-by-line breakdown.
            </p>
          </div>

          <label htmlFor={customTextareaId} className="sr-only">
            Paste Python, Java, or C code
          </label>
          <textarea
            id={customTextareaId}
            rows={10}
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 font-mono text-xs text-slate-100 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            placeholder="Paste Python, Java, or C code here..."
          />

          <div className="flex justify-end">
            <button
              onClick={handleAnalyzeCustom}
              className="bg-brand shadow-glow flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Decode & Analyze Code</span>
            </button>
          </div>

          {customAnalysis && (
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/60 p-3 text-xs">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">
                    Estimated Time Complexity
                  </p>
                  <p className="font-bold text-primary">{customAnalysis.timeComp}</p>
                </div>
                <div className="rounded-xl bg-muted/60 p-3 text-xs">
                  <p className="font-bold text-muted-foreground uppercase text-[10px]">
                    Estimated Space Complexity
                  </p>
                  <p className="font-bold text-foreground">{customAnalysis.spaceComp}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-muted/30 p-3 text-xs">
                <p className="font-bold mb-2">Decoded Line-by-Line Breakdown:</p>
                <div className="space-y-1.5 font-mono">
                  {customAnalysis.lines.map((l) => (
                    <div key={l.line} className="flex gap-2">
                      <span className="text-primary font-bold">{l.line}.</span>
                      <span className="text-foreground">{l.text}</span>
                      <span className="text-muted-foreground font-sans">— {l.explanation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
