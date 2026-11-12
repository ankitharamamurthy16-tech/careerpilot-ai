import { useState } from "react";
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Download,
  Plus,
  Trash2,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { getStudent } from "@/lib/auth";

export function ResumeBuilderModule() {
  const student = getStudent();

  const [fullName, setFullName] = useState(student?.name || "Aarav Sharma");
  const [email, setEmail] = useState(student?.email || "aarav@student.edu");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [github, setGithub] = useState("github.com/aarav-sharma");
  const [linkedin, setLinkedin] = useState("linkedin.com/in/aarav-sharma");

  const [summary, setSummary] = useState(
    "Pre-final year Computer Science undergraduate with hands-on expertise in Fullstack Web Development (React, Node.js), Data Structures & Algorithms, and Cloud systems. Eager to contribute to scalable software engineering teams.",
  );

  const [skills, setSkills] = useState([
    "Python",
    "Java",
    "C++",
    "React.js",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Git",
    "Docker",
    "RESTful APIs",
  ]);
  const [newSkill, setNewSkill] = useState("");

  const [projects, setProjects] = useState([
    {
      title: "Placement Preparation & Assessment Platform",
      tech: "React, TypeScript, Tailwind CSS, Vite",
      bullets: [
        "Architected a responsive mobile-first PWA serving 500+ student assessment simulations with real-time analytics.",
        "Engineered algorithmic speech cadence tracker evaluating words-per-minute (WPM) and STAR interview structure.",
        "Reduced initial bundle load time by 42% utilizing code-splitting and dynamic imports.",
      ],
    },
    {
      title: "Distributed File Cache & URL Shortener",
      tech: "Go, Redis, Docker, PostgreSQL",
      bullets: [
        "Constructed high-throughput URL shortening service handling 10,000+ simulated requests per second.",
        "Implemented Redis LRU cache cluster achieving a 91% cache hit ratio for frequently accessed URLs.",
      ],
    },
  ]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    setSkills([...skills, newSkill.trim()]);
    setNewSkill("");
    toast.success("Skill added!");
  };

  const handleRemoveSkill = (idx: number) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  // Calculate real ATS score
  const hasQuantifiedMetrics = projects.some((p) =>
    p.bullets.some((b) => /\d+%|\d+\+|\d+s/i.test(b)),
  );
  const skillCount = skills.length;
  const hasSummary = summary.length > 80;

  let atsScore = 60;
  if (hasSummary) atsScore += 10;
  if (skillCount >= 8) atsScore += 15;
  if (hasQuantifiedMetrics) atsScore += 15;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* ATS Header & Score */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ATS Compatibility Engine
              </span>
              <span className="text-xs text-muted-foreground">Clean 1-Page Layout</span>
            </div>
            <h2 className="font-display mt-1 text-xl font-bold">ATS Resume Builder & Optimizer</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Format, quantify achievements, and export placement-ready resumes optimized for ATS
              scanners.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand px-4 py-2 text-center text-white shadow-glow">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">ATS Score</p>
              <p className="font-display text-2xl font-bold">{atsScore} / 100</p>
            </div>
            <button
              onClick={handlePrint}
              className="bg-primary hover:bg-primary/90 flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition active:scale-95"
            >
              <Printer className="h-4 w-4" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* ATS Quality Checklist */}
        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-3 sm:grid-cols-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="font-medium text-foreground">Single-Column Standard Layout</span>
          </div>
          <div className="flex items-center gap-2">
            {hasQuantifiedMetrics ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="font-medium text-foreground">Quantified Metrics Included</span>
          </div>
          <div className="flex items-center gap-2">
            {skillCount >= 8 ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <span className="font-medium text-foreground">{skillCount} Technical Keywords</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Editor Form */}
        <div className="space-y-4 lg:col-span-6">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="font-bold text-sm mb-3">1. Personal & Contact Info</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  Phone
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2 text-xs text-foreground"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-muted-foreground">
                  LinkedIn
                </label>
                <input
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  className="mt-1 h-9 w-full rounded-lg border border-input bg-card px-2 text-xs text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="font-bold text-sm mb-2">2. Professional Summary</h3>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-input bg-card p-2 text-xs leading-relaxed text-foreground"
            />
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="font-bold text-sm mb-2">3. Technical Skills</h3>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {skills.map((s, idx) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold"
                >
                  <span>{s}</span>
                  <button
                    onClick={() => handleRemoveSkill(idx)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                placeholder="Add skill (e.g. AWS, Kotlin, SQL)..."
                className="h-9 flex-1 rounded-lg border border-input bg-card px-3 text-xs"
              />
              <button
                onClick={handleAddSkill}
                className="rounded-lg bg-primary px-3 text-xs font-bold text-white"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Live Resume Sheet Preview */}
        <div className="lg:col-span-6">
          <div className="sticky top-4 rounded-2xl border border-border bg-white p-6 text-slate-900 shadow-card">
            {/* Header */}
            <div className="border-b border-slate-300 pb-3 text-center">
              <h1 className="text-xl font-bold tracking-tight text-slate-950">{fullName}</h1>
              <p className="mt-1 text-[11px] text-slate-600">
                {email} • {phone} • {linkedin} • {github}
              </p>
            </div>

            {/* Summary */}
            <div className="mt-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                Professional Summary
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-700">{summary}</p>
            </div>

            {/* Skills */}
            <div className="mt-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                Technical Skills
              </h2>
              <p className="mt-1 text-[11px] text-slate-700 leading-relaxed">
                <b>Languages & Frameworks:</b> {skills.join(", ")}
              </p>
            </div>

            {/* Projects */}
            <div className="mt-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                Projects
              </h2>
              <div className="mt-2 space-y-2.5">
                {projects.map((p, i) => (
                  <div key={i} className="text-[11px]">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>{p.title}</span>
                      <span className="font-normal italic text-slate-600">{p.tech}</span>
                    </div>
                    <ul className="mt-1 list-disc pl-4 text-slate-700 space-y-0.5">
                      {p.bullets.map((b, bi) => (
                        <li key={bi}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
