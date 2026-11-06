import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, Check, X, Flag, RotateCcw } from "lucide-react";
import { quantMock4, scoreAssessment, saveResult, type AssessmentResult } from "@/lib/assessments";
import { Progress } from "@/components/Brand";

export const Route = createFileRoute("/app/assessment/quant-mock-4")({
  head: () => ({
    meta: [
      { title: "Quantitative Aptitude Mock 4 — CareerPilot AI" },
      { name: "description", content: "30-question timed quantitative aptitude mock test with explanations." },
      { property: "og:title", content: "Quantitative Aptitude Mock 4 — CareerPilot AI" },
      { property: "og:description", content: "Timed 30-question aptitude test with score and explanations." },
    ],
  }),
  component: QuantTest,
});

const T = quantMock4;
const N = T.questions.length;
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

function QuantTest() {
  const [stage, setStage] = useState<"intro" | "test" | "review" | "result">("intro");
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array(N).fill(null));
  const [idx, setIdx] = useState(0);
  const [left, setLeft] = useState(T.durationSec);
  const [confirm, setConfirm] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const answersRef = useRef(answers);
  answersRef.current = answers;
  const leftRef = useRef(left);
  leftRef.current = left;

  function submit() {
    const a = answersRef.current;
    const s = scoreAssessment(T.questions, a);
    const r: AssessmentResult = { assessmentId: T.id, title: T.title, takenAt: new Date().toISOString(), timeTakenSec: T.durationSec - leftRef.current, answers: a, ...s };
    saveResult(r);
    setResult(r);
    setConfirm(false);
    setStage("result");
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    if (stage !== "test" && stage !== "review") return;
    const t = setInterval(() => setLeft((l) => (l <= 1 ? 0 : l - 1)), 1000);
    return () => clearInterval(t);
  }, [stage]);
  useEffect(() => { if (left === 0 && (stage === "test" || stage === "review")) submit(); }, [left, stage]);

  function restart() {
    setAnswers(Array(N).fill(null)); setIdx(0); setLeft(T.durationSec); setResult(null); setStage("test");
  }

  const answeredCount = answers.filter((a) => a !== null).length;

  const header = (
    <header className="bg-hero rounded-b-[2rem] px-5 pb-6 pt-6 text-navy-foreground md:mx-6 md:mt-6 md:rounded-3xl">
      <Link to="/app/modules/$id" params={{ id: "assessment" }} className="inline-flex items-center gap-1 text-sm opacity-80"><ArrowLeft className="h-4 w-4" /> My Assessment</Link>
      <h1 className="mt-4 text-xl font-bold">{T.title}</h1>
      {(stage === "test" || stage === "review") && (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <Progress value={(answeredCount / N) * 100} className="bg-navy-foreground/15" />
          <span className="whitespace-nowrap">{answeredCount}/{N}</span>
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-bold ${left < 300 ? "bg-destructive text-destructive-foreground" : "bg-navy-foreground/15"}`} aria-label="Time left">
            <Clock className="h-4 w-4" />{fmt(left)}
          </span>
        </div>
      )}
    </header>
  );

  if (stage === "intro") {
    return (
      <div>{header}
        <div className="space-y-4 px-5 py-6 md:px-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            {[["30", "Questions"], ["30 min", "Duration"], ["+1 / 0", "Marking"]].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-lg font-bold">{v}</p><p className="text-xs text-muted-foreground">{l}</p></div>
            ))}
          </div>
          <ul className="space-y-2 rounded-2xl bg-card p-4 text-sm shadow-card">
            <li>• Beginner and intermediate questions on percentages, profit & loss, speed, work, interest, probability and more.</li>
            <li>• Move freely between questions and review unanswered ones before submitting.</li>
            <li>• The test submits automatically when the timer ends.</li>
          </ul>
          <button onClick={restart} className="bg-brand shadow-glow h-12 w-full rounded-xl font-semibold text-primary-foreground active:scale-[0.98]">Start test</button>
        </div>
      </div>
    );
  }

  if (stage === "result" && result) return <ResultView r={result} onRetake={restart} />;

  if (stage === "review") {
    const unanswered = answers.map((a, i) => (a === null ? i : -1)).filter((i) => i >= 0);
    return (
      <div>{header}
        <div className="space-y-4 px-5 py-6 md:px-6">
          <h2 className="font-bold">Review questions</h2>
          <p className="text-sm text-muted-foreground">{unanswered.length ? `${unanswered.length} unanswered — tap a number to go to it.` : "All questions answered."}</p>
          <Palette answers={answers} current={-1} onPick={(i) => { setIdx(i); setStage("test"); }} />
          <button onClick={() => setStage("test")} className="h-12 w-full rounded-xl border border-border bg-card font-semibold">Back to test</button>
          <button onClick={() => setConfirm(true)} className="bg-brand shadow-glow h-12 w-full rounded-xl font-semibold text-primary-foreground">Submit Test</button>
        </div>
        {confirm && <Confirm unanswered={unanswered.length} onCancel={() => setConfirm(false)} onOk={submit} />}
      </div>
    );
  }

  const q = T.questions[idx];
  return (
    <div>{header}
      <div className="space-y-4 px-5 py-6 md:px-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-bold">Question {idx + 1} of {N}</span>
          <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{q.level} · {q.topic}</span>
        </div>
        <p className="rounded-2xl bg-card p-4 text-base font-semibold shadow-card">{q.q}</p>
        <div className="space-y-2" role="radiogroup">
          {q.options.map((o, i) => {
            const sel = answers[idx] === i;
            return (
              <button key={i} role="radio" aria-checked={sel}
                onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? i : v)))}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-left text-sm font-medium transition active:scale-[0.99] ${sel ? "border-primary bg-accent" : "border-transparent bg-card shadow-card"}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sel ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{"ABCD"[i]}</span>
                {o}
              </button>
            );
          })}
        </div>
        {answers[idx] !== null && (
          <button onClick={() => setAnswers((a) => a.map((v, j) => (j === idx ? null : v)))} className="text-xs font-semibold text-muted-foreground underline">Clear answer</button>
        )}
        <div className="grid grid-cols-2 gap-3">
          <button disabled={idx === 0} onClick={() => setIdx(idx - 1)} className="flex h-12 items-center justify-center gap-1 rounded-xl border border-border bg-card font-semibold disabled:opacity-40"><ChevronLeft className="h-4 w-4" />Previous</button>
          {idx < N - 1
            ? <button onClick={() => setIdx(idx + 1)} className="bg-brand flex h-12 items-center justify-center gap-1 rounded-xl font-semibold text-primary-foreground">Next<ChevronRight className="h-4 w-4" /></button>
            : <button onClick={() => setStage("review")} className="bg-brand flex h-12 items-center justify-center gap-1 rounded-xl font-semibold text-primary-foreground"><Flag className="h-4 w-4" />Review</button>}
        </div>
        <Palette answers={answers} current={idx} onPick={setIdx} />
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setStage("review")} className="h-12 rounded-xl border border-border bg-card font-semibold">Review unanswered</button>
          <button onClick={() => setConfirm(true)} className="bg-brand shadow-glow h-12 rounded-xl font-semibold text-primary-foreground">Submit Test</button>
        </div>
      </div>
      {confirm && <Confirm unanswered={N - answeredCount} onCancel={() => setConfirm(false)} onOk={submit} />}
    </div>
  );
}

function Palette({ answers, current, onPick }: { answers: (number | null)[]; current: number; onPick: (i: number) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2 rounded-2xl bg-card p-4 shadow-card sm:grid-cols-10">
      {answers.map((a, i) => (
        <button key={i} onClick={() => onPick(i)} aria-label={`Question ${i + 1}${a === null ? " unanswered" : " answered"}`}
          className={`h-9 rounded-lg text-xs font-bold ${i === current ? "ring-2 ring-ring" : ""} ${a !== null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</button>
      ))}
    </div>
  );
}

function Confirm({ unanswered, onCancel, onOk }: { unanswered: number; onCancel: () => void; onOk: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground/40 p-4 md:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-3xl bg-card p-6 shadow-glow">
        <h3 className="text-lg font-bold">Submit test?</h3>
        <p className="mt-1 text-sm text-muted-foreground">{unanswered ? `You have ${unanswered} unanswered question${unanswered > 1 ? "s" : ""}.` : "All questions are answered."} You can't change answers after submitting.</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button onClick={onCancel} className="h-11 rounded-xl border border-border font-semibold">Keep going</button>
          <button onClick={onOk} className="bg-brand h-11 rounded-xl font-semibold text-primary-foreground">Submit</button>
        </div>
      </div>
    </div>
  );
}

function ResultView({ r, onRetake }: { r: AssessmentResult; onRetake: () => void }) {
  const pct = Math.round((r.score / r.total) * 100);
  const accuracy = r.attempted ? Math.round((r.score / r.attempted) * 100) : 0;
  const topics = Object.entries(r.topicBreakdown).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
  const weak = topics.filter(([, t]) => t.correct / t.total < 0.5).map(([n]) => n);
  const verdict = pct >= 80 ? "Excellent — you're placement ready in aptitude." : pct >= 60 ? "Good work — a little more practice will get you there." : pct >= 40 ? "Fair — focus on your weak topics below." : "Needs work — revisit the basics and retake.";
  return (
    <div>
      <header className="bg-hero rounded-b-[2rem] px-5 pb-8 pt-6 text-navy-foreground md:mx-6 md:mt-6 md:rounded-3xl">
        <Link to="/app/modules/$id" params={{ id: "assessment" }} className="inline-flex items-center gap-1 text-sm opacity-80"><ArrowLeft className="h-4 w-4" /> My Assessment</Link>
        <p className="mt-4 text-sm opacity-80">{r.title}</p>
        <p className="mt-1 text-4xl font-bold" aria-label="Score">{r.score} / {r.total}</p>
        <p className="text-sm opacity-90">{verdict}</p>
      </header>
      <div className="space-y-4 px-5 py-6 md:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Score", `${pct}%`], ["Attempted", r.attempted], ["Unanswered", r.unanswered], ["Accuracy", `${accuracy}%`], ["Correct", r.score], ["Wrong", r.attempted - r.score], ["Time taken", fmt(r.timeTakenSec)]].map(([l, v]) => (
            <div key={l} className="rounded-2xl bg-card p-4 shadow-card"><p className="text-xs text-muted-foreground">{l}</p><p className="text-xl font-bold">{v}</p></div>
          ))}
        </div>
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <h2 className="font-bold">Performance by topic</h2>
          <div className="mt-3 space-y-3">
            {topics.map(([n, t]) => (
              <div key={n} className="text-sm">
                <div className="flex justify-between"><span>{n}</span><b>{t.correct}/{t.total}</b></div>
                <Progress value={(t.correct / t.total) * 100} className="mt-1 h-1.5" />
              </div>
            ))}
          </div>
          {weak.length > 0 && <p className="mt-4 text-sm text-muted-foreground">Focus next on: <b className="text-foreground">{weak.join(", ")}</b></p>}
        </section>
        <button onClick={onRetake} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card font-semibold"><RotateCcw className="h-4 w-4" />Retake test</button>
        <h2 className="pt-2 font-bold">Answers & explanations</h2>
        {quantMock4.questions.map((q, i) => {
          const a = r.answers[i];
          const ok = a === q.answer;
          return (
            <div key={i} className="rounded-2xl bg-card p-4 text-sm shadow-card">
              <div className="flex items-start gap-2">
                <span className={`mt-0.5 rounded-full p-1 ${a === null ? "bg-muted text-muted-foreground" : ok ? "bg-success text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}>{ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}</span>
                <p className="font-semibold">Q{i + 1}. {q.q}</p>
              </div>
              <p className="mt-2">Your answer: <b>{a === null ? "Not answered" : q.options[a]}</b></p>
              {!ok && <p>Correct answer: <b className="text-primary">{q.options[q.answer]}</b></p>}
              <p className="mt-2 text-muted-foreground">{q.explain}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
