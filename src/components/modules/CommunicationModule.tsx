import { useState, useRef } from "react";
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
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

type SpeechFeedback = {
  wpm: number;
  paceVerdict: string;
  wordCount: number;
  fillerCount: number;
  hasStructure: boolean;
};

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

export function CommunicationModule() {
  const [selectedDrill, setSelectedDrill] = useState<"self-intro" | "gd-ai" | "email-drill">(
    "self-intro",
  );

  // Voice recording state for communication practice
  const [isRecording, setIsRecording] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [feedback, setFeedback] = useState<SpeechFeedback | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const startRecording = () => {
    setSpokenText("");
    setElapsedSec(0);
    setFeedback(null);

    const win = window as unknown as {
      SpeechRecognition?: { new (): ISpeechRecognition };
      webkitSpeechRecognition?: { new (): ISpeechRecognition };
    };
    const SpeechRecognitionClass = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      toast.error(
        "Speech Recognition not supported in this browser. Please type your speech response.",
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
        toast.info("Listening... speak your response clearly.");
      };

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          const item = event.results[i]?.[0];
          if (item) transcript += item.transcript + " ";
        }
        setSpokenText(transcript.trim());
      };

      recognition.onerror = (e) => {
        toast.error("Speech recognition stopped: " + e.error);
        stopRecording();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;

      timerRef.current = setInterval(() => {
        setElapsedSec((p) => p + 1);
      }, 1000);
    } catch {
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
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const handleAnalyzeSpeech = () => {
    if (!spokenText.trim()) {
      toast.error("Please speak or write your answer first.");
      return;
    }

    const words = spokenText.trim().split(/\s+/).filter(Boolean);
    const duration = elapsedSec > 0 ? elapsedSec : 40;
    const wpm = Math.round(words.length / (duration / 60));

    const lower = spokenText.toLowerCase();
    const fillers = ["um", "uh", "like", "basically", "actually", "you know"];
    let fillerCount = 0;
    fillers.forEach((f) => {
      const matches = lower.match(new RegExp(`\\b${f}\\b`, "g"));
      if (matches) fillerCount += matches.length;
    });

    let paceVerdict = "Optimal (120-150 WPM)";
    if (wpm < 110) paceVerdict = "A Bit Slow (<110 WPM)";
    else if (wpm > 165) paceVerdict = "A Bit Fast (>165 WPM)";

    setFeedback({
      wpm,
      paceVerdict,
      wordCount: words.length,
      fillerCount,
      hasStructure: words.length >= 40,
    });
    toast.success("Speech analysis complete!");
  };

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
                <button
                  onClick={toggleRecording}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95 ${
                    isRecording
                      ? "bg-red-600 animate-pulse shadow-glow"
                      : "bg-brand hover:opacity-95"
                  }`}
                >
                  {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  <span>{isRecording ? "Stop Speaking" : "Record Speech (Mic)"}</span>
                </button>

                <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                  <span>
                    Words:{" "}
                    <b className="text-foreground">
                      {spokenText.split(/\s+/).filter(Boolean).length}
                    </b>
                  </span>
                  <span>
                    Duration: <b className="text-primary">{elapsedSec}s</b>
                  </span>
                </div>
              </div>

              <textarea
                rows={4}
                value={spokenText}
                onChange={(e) => setSpokenText(e.target.value)}
                placeholder="Click 'Record Speech' to speak, or type your self-introduction here..."
                className="mt-3 w-full rounded-xl border border-input bg-card p-3 text-xs leading-relaxed text-foreground"
              />

              <div className="mt-3 flex justify-end">
                <button
                  onClick={handleAnalyzeSpeech}
                  disabled={isRecording || !spokenText.trim()}
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
                    <p className="font-bold text-foreground">{feedback.wpm} WPM</p>
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
