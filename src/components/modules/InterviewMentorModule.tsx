import { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Clock,
  Sparkles,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  BookOpen,
  Volume2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  interviewQuestions,
  evaluateInterviewAnswer,
  saveInterviewSession,
  getInterviewSessions,
  type InterviewRole,
  type InterviewSession,
  type InterviewQuestion,
  type InterviewEvaluation,
} from "@/lib/data";

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onresult:
    | ((event: {
        results: { [index: number]: { [index: number]: { transcript: string } }; length: number };
      }) => void)
    | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

export function InterviewMentorModule() {
  const [role, setRole] = useState<InterviewRole>("Software Development Engineer (SDE-1)");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [activeTab, setActiveTab] = useState<"interview" | "history" | "drills">("interview");

  // Questions matching this role
  const roleQuestions = interviewQuestions.filter((q) => q.role === role);
  const [selectedQuestion, setSelectedQuestion] = useState<InterviewQuestion>(
    roleQuestions[0] ?? interviewQuestions[0]!,
  );

  useEffect(() => {
    const q = interviewQuestions.find((x) => x.role === role);
    if (q) setSelectedQuestion(q);
  }, [role]);

  // Answer recording state
  const [isRecording, setIsRecording] = useState(false);
  const [answerText, setAnswerText] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isSpoken, setIsSpoken] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  // Load history
  const [history, setHistory] = useState<InterviewSession[]>(getInterviewSessions());

  // Handle Speech Recognition
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setIsSpoken(true);
    setElapsedSec(0);

    const win = window as unknown as {
      SpeechRecognition?: { new (): ISpeechRecognition };
      webkitSpeechRecognition?: { new (): ISpeechRecognition };
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error(
        "Speech Recognition is not supported in this browser. Please type your answer below or use Chrome.",
      );
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Microphone active — speaking transcription started.");
      };

      recognition.onresult = (event) => {
        let currentTranscript = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i]?.[0];
          if (item) currentTranscript += item.transcript + " ";
        }
        setAnswerText(currentTranscript.trim());
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed") {
          toast.error("Microphone permission denied. You can type your answer directly.");
        }
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;

      // Start elapsed timer
      timerRef.current = setInterval(() => {
        setElapsedSec((prev) => prev + 1);
      }, 1000);
    } catch (e) {
      toast.error("Failed to start audio input. You can type your answer directly.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    toast.success("Recording finished. Review and submit your answer!");
  };

  const handleEvaluate = () => {
    if (!answerText.trim() || answerText.trim().split(/\s+/).length < 5) {
      toast.error("Please provide a substantial answer (at least 5-10 words) to evaluate.");
      return;
    }

    const duration = elapsedSec > 0 ? elapsedSec : 45;
    const result = evaluateInterviewAnswer(selectedQuestion, answerText, duration, isSpoken);
    setEvaluation(result);

    const currentWeek = history.length + 1;
    const session: InterviewSession = {
      id: `session-${Date.now()}`,
      weekNumber: currentWeek,
      date: new Date().toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      role,
      questionId: selectedQuestion.id,
      question: selectedQuestion.question,
      answerText,
      isSpoken,
      durationSec: duration,
      evaluation: result,
    };

    saveInterviewSession(session);
    setHistory(getInterviewSessions());
    toast.success("AI Evaluation complete! Feedback & drill recommendations ready.");
  };

  const handleReset = () => {
    setAnswerText("");
    setElapsedSec(0);
    setEvaluation(null);
    setIsSpoken(false);
  };

  const wordCount = answerText.trim() ? answerText.trim().split(/\s+/).length : 0;
  const liveWpm = elapsedSec > 5 ? Math.round(wordCount / (elapsedSec / 60)) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Customizer */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-violet/15 px-2.5 py-0.5 text-xs font-bold text-violet">
                Week {history.length + 1} Simulation
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Tailored for {department}
              </span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">Weekly AI Interview Mentor</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Simulates one full mock interview per week. Evaluates speech cadence (WPM), structure
              (STAR), grammar & vocabulary.
            </p>
          </div>

          <div className="flex gap-2">
            <button
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
              onClick={() => setActiveTab("history")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "history"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Weekly History ({history.length})
            </button>
            <button
              onClick={() => setActiveTab("drills")}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === "drills"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              Recommended Drills
            </button>
          </div>
        </div>

        {/* Role & Department Pickers */}
        <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Target Interview Role:
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as InterviewRole)}
              className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="Software Development Engineer (SDE-1)">
                Software Development Engineer (SDE-1)
              </option>
              <option value="Data Analyst & Business Intelligence">
                Data Analyst & Business Intelligence
              </option>
              <option value="Frontend / Fullstack Developer">Frontend / Fullstack Developer</option>
              <option value="Banking Probationary Officer (PO)">
                Banking Probationary Officer (PO)
              </option>
              <option value="Civil Services (UPSC / TNPSC Candidate)">
                Civil Services (UPSC / TNPSC Candidate)
              </option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Student Department:
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-input bg-card px-3 text-xs font-semibold text-foreground outline-none focus:border-primary"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Electronics & Communication (ECE)">
                Electronics & Communication (ECE)
              </option>
              <option value="Information Technology">Information Technology</option>
              <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
              <option value="Commerce, Finance & Banking">Commerce, Finance & Banking</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: LIVE SIMULATED INTERVIEW */}
      {activeTab === "interview" && (
        <div className="space-y-5">
          {/* Question Prompt Card */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                {selectedQuestion.category} Question
              </span>
              <span className="text-xs text-muted-foreground">
                Target Role: <b className="text-foreground">{role}</b>
              </span>
            </div>

            <h3 className="font-display mt-3 text-base font-bold leading-relaxed text-foreground">
              "{selectedQuestion.question}"
            </h3>

            {/* Expected competency indicators */}
            <div className="mt-3.5 rounded-xl border border-border/60 bg-muted/30 p-3 text-xs">
              <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">
                Competencies & Key Points Evaluated by AI:
              </p>
              <ul className="mt-1.5 grid gap-1 sm:grid-cols-2 text-muted-foreground">
                {selectedQuestion.keyPointsExpected.map((pt, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Answer Recording / Input Box */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
                    isRecording
                      ? "bg-red-600 animate-pulse shadow-glow"
                      : "bg-brand hover:opacity-95"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? "Stop Speaking" : "Answer via Voice (Mic)"}</span>
                </button>

                {isRecording && (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-red-500">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                    <span>Listening... {elapsedSec}s</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono">
                <span>
                  Words: <b className="text-foreground">{wordCount}</b>
                </span>
                {elapsedSec > 0 && (
                  <span>
                    Cadence: <b className="text-primary">{liveWpm} WPM</b>
                  </span>
                )}
                {answerText && (
                  <button
                    onClick={handleReset}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Answer Text Area (Transcribed or Typed) */}
            <div className="mt-3">
              <textarea
                rows={6}
                value={answerText}
                onChange={(e) => {
                  setAnswerText(e.target.value);
                  if (!isSpoken) setIsSpoken(false);
                }}
                placeholder="Speak using the microphone button above, or type your complete interview response here..."
                className="w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Submit Action */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">
                Evaluates grammar, vocabulary, clarity, relevance, STAR structure & speaking pace.
              </p>
              <button
                onClick={handleEvaluate}
                disabled={isRecording || !answerText.trim()}
                className="bg-brand shadow-glow rounded-xl px-6 py-2.5 text-xs font-bold text-white transition active:scale-[0.98] disabled:opacity-50"
              >
                Submit Answer for AI Evaluation
              </button>
            </div>
          </div>

          {/* AI EVALUATION REPORT */}
          {evaluation && (
            <div className="space-y-4 rounded-2xl border border-violet/30 bg-gradient-to-b from-card to-violet/5 p-6 shadow-glow">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-violet" />
                    <h3 className="font-display text-lg font-bold">
                      Simulated Interview AI Evaluation
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Week {history.length} round scored and saved to student progress.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand px-4 py-2 text-center text-white shadow-glow">
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                      Overall Score
                    </p>
                    <p className="font-display text-2xl font-bold">{evaluation.score} / 100</p>
                  </div>
                </div>
              </div>

              {/* Multi-Dimensional Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {/* Cadence */}
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Speaking Pace (WPM)
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {evaluation.speakingPaceWpm} WPM
                  </p>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${
                      evaluation.paceVerdict === "Optimal"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {evaluation.paceVerdict}
                  </span>
                </div>

                {/* Structure / STAR */}
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    STAR Structure
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {evaluation.structureScore}%
                  </p>
                  <div className="mt-1 flex justify-center gap-1 text-[9px] font-bold">
                    <span
                      className={
                        evaluation.starComponentsFound.situation
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      S✓
                    </span>
                    <span
                      className={
                        evaluation.starComponentsFound.task ? "text-emerald-500" : "text-slate-400"
                      }
                    >
                      T✓
                    </span>
                    <span
                      className={
                        evaluation.starComponentsFound.action
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      A✓
                    </span>
                    <span
                      className={
                        evaluation.starComponentsFound.result
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }
                    >
                      R✓
                    </span>
                  </div>
                </div>

                {/* Clarity & Fillers */}
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Clarity & Fillers
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {evaluation.clarityScore}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {evaluation.fillerWordCount} filler words detected
                  </p>
                </div>

                {/* Relevance */}
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Relevance & Terms
                  </p>
                  <p className="font-display text-lg font-bold text-foreground">
                    {evaluation.relevanceScore}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">Domain competence</p>
                </div>
              </div>

              {/* Strengths & Improvements */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
                  <p className="font-bold text-emerald-700 dark:text-emerald-300">
                    Demonstrated Strengths:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-foreground">
                    {evaluation.strengths.map((s: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
                  <p className="font-bold text-amber-700 dark:text-amber-300">
                    Targeted Improvements:
                  </p>
                  <ul className="mt-1.5 space-y-1 text-foreground">
                    {evaluation.improvements.map((imp: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Recommended Personalized Communication Drill */}
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="font-bold text-primary">
                    Recommended Communication Exercise for Next Week:
                  </p>
                </div>
                <p className="mt-1 font-semibold text-foreground">{evaluation.recommendedDrill}</p>
                <p className="mt-0.5 text-muted-foreground">
                  Complete this 10-minute exercise daily in the Communication Coach to lift your
                  next interview score by ~8 points.
                </p>
              </div>

              {/* Ideal Model Answer Accordion */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <p className="font-bold text-foreground">Ideal Model Response for Comparison:</p>
                <p className="mt-1 leading-relaxed text-muted-foreground italic">
                  "{selectedQuestion.idealModelAnswer}"
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: HISTORICAL WEEK-BY-WEEK COMPARISON */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold">Week-by-Week Interview Progress</h3>
            <p className="text-xs text-muted-foreground">
              Compare actual simulated performance, speaking pace (WPM), and structure scores across
              weeks.
            </p>

            <div className="mt-4 space-y-3">
              {history.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-border/80 bg-muted/20 p-4 text-xs shadow-sm"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold text-violet">
                        Week {s.weekNumber}
                      </span>
                      <span className="ml-2 text-muted-foreground">{s.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display font-bold text-primary text-sm">
                        Score: {s.evaluation.score}/100
                      </span>
                      <span className="rounded bg-muted px-2 py-0.5 font-bold text-foreground">
                        {s.evaluation.speakingPaceWpm} WPM ({s.evaluation.paceVerdict})
                      </span>
                    </div>
                  </div>

                  <p className="mt-2.5 font-semibold text-foreground">Q: {s.question}</p>
                  <p className="mt-1 text-muted-foreground line-clamp-2 italic">"{s.answerText}"</p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px]">
                    <span className="text-muted-foreground">
                      Fillers: <b>{s.evaluation.fillerWordCount}</b> • STAR:{" "}
                      <b>{s.evaluation.structureScore}%</b>
                    </span>
                    <span className="text-primary font-bold">
                      Focus: {s.evaluation.recommendedDrill}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECOMMENDED DRILLS */}
      {activeTab === "drills" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <h3 className="font-display font-bold">Weekly Communication Drills</h3>
            <p className="text-xs text-muted-foreground">
              Curated speech workouts targeting filler reduction, STAR framing, and pace
              stabilization.
            </p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <span className="rounded-md bg-violet/20 px-2 py-0.5 text-[10px] font-bold text-violet">
                  Drill 1
                </span>
                <h4 className="mt-2 font-bold text-sm">STAR Structure 60-Second Workout</h4>
                <p className="mt-1 text-muted-foreground">
                  Practice answering behavioral questions allocating 15s for Situation, 10s for
                  Task, 20s for Action, and 15s for Result.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Drill 2
                </span>
                <h4 className="mt-2 font-bold text-sm">Zero-Filler Pause Control</h4>
                <p className="mt-1 text-muted-foreground">
                  Replace filler words ("um", "like", "basically") with a silent, confident 1-second
                  pause before speaking key phrases.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <span className="rounded-md bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                  Drill 3
                </span>
                <h4 className="mt-2 font-bold text-sm">Cadence Pacing (130 WPM Target)</h4>
                <p className="mt-1 text-muted-foreground">
                  Speak along with a steady rhythm to internalize a natural, professional interview
                  conversational pace.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/40 p-4 text-xs">
                <span className="rounded-md bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  Drill 4
                </span>
                <h4 className="mt-2 font-bold text-sm">Elevator Pitch (60s)</h4>
                <p className="mt-1 text-muted-foreground">
                  Deliver your personal summary, top achievements, and value proposition in 60
                  impactful seconds.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
