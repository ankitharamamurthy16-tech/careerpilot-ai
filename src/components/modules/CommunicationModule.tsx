import { useState, useEffect } from "react";
import {
  MessageCircle,
  Mic,
  MicOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  Mail,
  Users,
  RotateCcw,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useSpeechRecorder } from "@/hooks/use-speech-recorder";
import { saveCommunicationAttempt } from "@/lib/data";

type SpeechFeedback = {
  wpm: number | null;
  paceVerdict: string;
  wordCount: number;
  fillerCount: number;
  hasStructure: boolean;
  isSpoken: boolean;
  durationSec: number;
};

export function CommunicationModule() {
  const [selectedDrill, setSelectedDrill] = useState<"self-intro" | "gd-ai" | "email-drill">(
    "self-intro",
  );

  // Voice recording & editable transcript state for communication practice
  const [spokenText, setSpokenText] = useState("");
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);

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
      setSpokenText(transcript);
    },
    onRecordingStart: () => {
      setFeedback(null);
      toast.info("Microphone active — speak your response clearly.");
    },
    onRecordingComplete: () => {
      toast.success("Recording complete. Review or edit your transcript before analyzing.");
    },
    onEmptyRecording: () => {
      toast.warning("No speech detected. Please speak clearly or type your response.");
    },
    onError: (msg) => {
      toast.error(msg);
    },
  });

  // Stop active recording if user switches away from the voice drill
  useEffect(() => {
    if (selectedDrill !== "self-intro" && (isRecording || isRequestingPermission)) {
      stopRecording();
    }
  }, [selectedDrill, isRecording, isRequestingPermission, stopRecording]);

  const toggleRecording = () => {
    if (isRecording || isRequestingPermission) {
      stopRecording();
    } else {
      void startRecording(spokenText);
    }
  };

  const handleReset = () => {
    resetRecording();
    setSpokenText("");
    setFeedback(null);
  };

  const handleAnalyzeSpeech = () => {
    const trimmed = spokenText.trim();
    if (!trimmed) {
      toast.error("Please record speech or type your answer first.");
      return;
    }

    const words = trimmed.split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const lower = trimmed.toLowerCase();
    const fillers = ["um", "uh", "like", "basically", "actually", "you know"];
    let fillerCount = 0;
    fillers.forEach((f) => {
      const matches = lower.match(new RegExp(`\\b${f}\\b`, "g"));
      if (matches) fillerCount += matches.length;
    });

    const isSpoken = hasRecordedSpeech && durationMs > 0;
    let wpm: number | null = null;
    let paceVerdict = "Typed Response";
    let actualDurationSec = 0;

    if (isSpoken) {
      actualDurationSec = Math.max(durationMs / 1000, 1);
      wpm = Math.round(wordCount / (actualDurationSec / 60));
      paceVerdict = "Optimal (120-150 WPM)";
      if (wpm < 110) paceVerdict = "A Bit Slow (<110 WPM)";
      else if (wpm > 165) paceVerdict = "A Bit Fast (>165 WPM)";
    }

    const roundedDurationSec = Math.round(actualDurationSec);
    setFeedback({
      wpm,
      paceVerdict,
      wordCount,
      fillerCount,
      hasStructure: wordCount >= 40,
      isSpoken,
      durationSec: roundedDurationSec,
    });
    saveCommunicationAttempt({
      drill: selectedDrill,
      wordCount,
      fillerCount,
      wpm,
      isSpoken,
      hasStructure: wordCount >= 40,
      durationSec: roundedDurationSec,
    });
    toast.success("Speech analysis complete!");
  };

  const wordCount = spokenText.trim() ? spokenText.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner connecting with Weekly AI Interview Mentor */}
      <div className="relative overflow-hidden rounded-2xl border border-violet/30 bg-gradient-to-r from-violet/15 via-indigo-500/10 to-primary/10 p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5">
            <span className="bg-brand shadow-glow flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white">
              <Sparkles className="h-6 w-6" />
            </span>
            <div>
              <span className="rounded-full bg-violet/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet">
                Integrated Communication System
              </span>
              <h2 className="font-display mt-1 text-base font-bold text-foreground">
                Connected with Weekly AI Interview Mentor
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Practice daily communication drills here, then test your growth in the Weekly AI
                Simulated Mock Interview.
              </p>
            </div>
          </div>

          <Link
            to="/app/modules/$id"
            params={{ id: "interview-mentor" }}
            className="bg-brand shadow-glow inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-white transition active:scale-95 hover:opacity-95"
          >
            <span>Launch AI Interview Mentor</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Drill Selector Tabs */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            setSelectedDrill("self-intro");
            setFeedback(null);
          }}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            selectedDrill === "self-intro"
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-card hover:bg-muted"
          }`}
        >
          <span className="rounded-xl bg-violet/15 p-2 text-violet">
            <Mic className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold">1. "Tell Me About Yourself"</p>
            <p className="text-[11px] text-muted-foreground">60s Elevator Pitch Drill</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedDrill("gd-ai");
            setFeedback(null);
          }}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            selectedDrill === "gd-ai"
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-card hover:bg-muted"
          }`}
        >
          <span className="rounded-xl bg-emerald-500/15 p-2 text-emerald-600 dark:text-emerald-400">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold">2. Group Discussion (GD)</p>
            <p className="text-[11px] text-muted-foreground">Topic: AI in Entry-Level Jobs</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedDrill("email-drill");
            setFeedback(null);
          }}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            selectedDrill === "email-drill"
              ? "border-primary bg-primary/10 shadow-sm"
              : "border-border bg-card hover:bg-muted"
          }`}
        >
          <span className="rounded-xl bg-primary/15 p-2 text-primary">
            <Mail className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xs font-bold">3. Professional Email Writing</p>
            <p className="text-[11px] text-muted-foreground">Follow-up with HR Recruiter</p>
          </div>
        </button>
      </div>

      {/* Selected Drill Interactive Workspace */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        {selectedDrill === "self-intro" && (
          <div className="space-y-4">
            <div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                Voice & Spoken Practice
              </span>
              <h3 className="font-display mt-2 text-base font-bold">
                "Tell me about yourself and your journey in engineering."
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Formula: Present role & college → 2 key technical competencies/projects → Career
                aspiration alignment with company.
              </p>
            </div>

            {/* Voice Recording Box */}
            <div className="rounded-xl border border-border bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleRecording}
                    disabled={isRequestingPermission || isProcessing}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 disabled:opacity-60 ${
                      isRecording
                        ? "bg-red-600 animate-pulse shadow-glow"
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
                      data-testid="comm-recording-status"
                      className="flex items-center gap-1.5 text-xs font-bold text-red-500"
                    >
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      <span>Recording... {elapsedSec}s</span>
                    </span>
                  )}

                  {isRequestingPermission && (
                    <span
                      data-testid="comm-recording-status"
                      className="text-xs font-semibold text-amber-600 dark:text-amber-400"
                    >
                      Waiting for microphone permission...
                    </span>
                  )}

                  {isProcessing && (
                    <span
                      data-testid="comm-recording-status"
                      className="text-xs font-semibold text-primary"
                    >
                      Finalizing transcription...
                    </span>
                  )}

                  {status === "stopped" && spokenText.trim() && (
                    <span
                      data-testid="comm-recording-status"
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Transcription ready — edit below before analyzing</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <span>
                    Words: <b className="text-foreground">{wordCount}</b>
                  </span>
                  <span>
                    Duration: <b className="text-primary">{elapsedSec}s</b>
                  </span>
                  {(spokenText || elapsedSec > 0 || speechError) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      title="Reset recording and text"
                      aria-label="Reset recording and text"
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

              <textarea
                rows={4}
                aria-label="Speech transcription and response"
                value={spokenText}
                onChange={(e) => {
                  const next = e.target.value;
                  setSpokenText(next);
                  setFeedback(null);
                  if (speechError) clearError();
                  if (!next.trim() && !isRecording) {
                    resetRecording();
                  }
                }}
                placeholder="Click 'Start Recording' to speak, or type your self-introduction here..."
                className="mt-3 w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />

              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={handleAnalyzeSpeech}
                  disabled={
                    isRecording || isRequestingPermission || isProcessing || !spokenText.trim()
                  }
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-5 py-2 text-xs font-bold transition active:scale-95 disabled:opacity-50"
                >
                  Analyze Cadence & Fillers
                </button>
              </div>
            </div>

            {feedback && (
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs">
                <p className="font-bold text-primary">Speech Coach Evaluation:</p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-lg bg-card p-2 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Pace</p>
                    <p className="font-bold text-foreground">
                      {feedback.wpm !== null ? `${feedback.wpm} WPM` : "Typed"}
                    </p>
                    <p className="text-[10px] text-primary">{feedback.paceVerdict}</p>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Fillers</p>
                    <p className="font-bold text-foreground">{feedback.fillerCount}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {feedback.fillerCount > 0 ? "Pause instead" : "Zero fillers! ✓"}
                    </p>
                  </div>
                  <div className="rounded-lg bg-card p-2 border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">
                      Structure
                    </p>
                    <p className="font-bold text-foreground">
                      {feedback.hasStructure ? "Solid Length" : "Too Brief"}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{feedback.wordCount} words</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {selectedDrill === "gd-ai" && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Group Discussion Strategy
              </span>
              <h3 className="font-display mt-2 text-base font-bold">
                Topic: "Will Generative AI Replace Entry-Level Software Engineers?"
              </h3>
              <p className="mt-1 text-muted-foreground">
                Placement drives frequently use this topic. Evaluators look for balanced viewpoints,
                data-backed examples, and collaboration.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="font-bold text-primary mb-1">Perspective A: Productivity Amplifier</p>
                <p className="text-muted-foreground leading-relaxed">
                  "AI elevates engineers from syntax typists to system architects. Engineers using
                  Copilot write boilerplate 40% faster, allowing focus on system design and business
                  logic."
                </p>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <p className="font-bold text-violet mb-1">Perspective B: Rising Entry Bar</p>
                <p className="text-muted-foreground leading-relaxed">
                  "Entry-level roles shifting from trivial code writing to prompt engineering, code
                  auditing, and verification. Deep fundamental knowledge of algorithms is more vital
                  than ever to spot AI hallucinations."
                </p>
              </div>
            </div>
          </div>
        )}

        {selectedDrill === "email-drill" && (
          <div className="space-y-4 text-xs">
            <div>
              <span className="rounded-full bg-violet/10 px-2.5 py-0.5 text-xs font-bold text-violet">
                Written Communication
              </span>
              <h3 className="font-display mt-2 text-base font-bold">
                Professional Post-Interview Thank You & Follow-Up Email
              </h3>
              <p className="mt-1 text-muted-foreground">
                Send within 24 hours of technical round. Reiterate key problem solved during
                interview.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-slate-900 p-4 text-slate-200 font-mono text-[11px] leading-relaxed">
              <p className="text-slate-400">
                Subject: Thank You – Technical Interview for SDE-1 Role | [Your Name]
              </p>
              <br />
              <p>Dear [Interviewer Name],</p>
              <br />
              <p>
                Thank you for the opportunity to discuss the SDE-1 opening at [Company Name] earlier
                today. I especially enjoyed our discussion regarding [mention specific problem,
                e.g., URL shortener cache eviction strategy].
              </p>
              <br />
              <p>
                Our conversation reinforced my enthusiasm to contribute to your engineering team.
                Please let me know if you require any additional work samples or references.
              </p>
              <br />
              <p>
                Best regards,
                <br />
                [Your Name] • [Your Phone] • [GitHub / Portfolio]
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
