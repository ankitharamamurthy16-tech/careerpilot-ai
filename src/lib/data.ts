// Sample data. Replace with database / AI service calls later.
import {
  ClipboardCheck,
  Code2,
  MessageCircle,
  Map,
  FolderKanban,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Module = {
  id: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  progress: number;
  highlights: string[];
};

export const modules: Module[] = [
  { id: "assessment", title: "My Assessment", tagline: "Aptitude, reasoning & technical tests", icon: ClipboardCheck, progress: 68,
    highlights: ["Quantitative Aptitude – Mock 4 (30 Qs)", "Logical Reasoning – Puzzles set", "DBMS & OS technical quiz", "Company-wise test: TCS NQT pattern"] },
  { id: "code-decoder", title: "Code Decoder", tagline: "Understand & solve coding problems", icon: Code2, progress: 54,
    highlights: ["Arrays: Two Sum, Kadane's Algorithm", "Strings: Longest Palindromic Substring", "Linked Lists: Reverse in K groups", "Explain any code line by line (AI soon)"] },
  { id: "communication", title: "Communication Coach", tagline: "HR answers, GD & spoken English", icon: MessageCircle, progress: 41,
    highlights: ["Tell me about yourself – practice", "Group discussion: AI in jobs", "Email writing drill", "Pronunciation feedback (AI soon)"] },
  { id: "roadmap", title: "Career Roadmap", tagline: "Your path to a dream role", icon: Map, progress: 35,
    highlights: ["Goal: Software Engineer @ Product company", "Phase 1: DSA fundamentals – done", "Phase 2: Core CS + Projects – in progress", "Phase 3: Mock interviews – Jan 2027"] },
  { id: "projects", title: "Projects", tagline: "Build portfolio-worthy work", icon: FolderKanban, progress: 60,
    highlights: ["Smart Attendance System (React + Firebase)", "Expense Tracker API (Node.js)", "Suggested: AI Resume Parser", "Suggested: Campus Event App"] },
  { id: "resume", title: "Resume Builder", tagline: "ATS-friendly resumes in minutes", icon: FileText, progress: 80,
    highlights: ["ATS score: 78 / 100", "Add 2 quantified achievements", "Template: Clean Tech (1 page)", "Export as PDF (coming soon)"] },
  { id: "community", title: "Campus Community", tagline: "Peers, seniors & placement buzz", icon: Users, progress: 25,
    highlights: ["Infosys drive on Nov 14 – 212 registered", "Senior AMA: Cracking Amazon SDE-1", "DSA study group – 38 members", "Interview experiences shared this week: 17"] },
];

export const skills = [
  { name: "Aptitude", score: 72 },
  { name: "Coding", score: 64 },
  { name: "Communication", score: 58 },
  { name: "Core CS", score: 70 },
  { name: "Resume", score: 78 },
];

export type Task = { id: string; title: string; module: string; minutes: number };

export const dailyTasks: Task[] = [
  { id: "t1", title: "Solve 3 array problems", module: "code-decoder", minutes: 45 },
  { id: "t2", title: "Aptitude: Time & Work quiz", module: "assessment", minutes: 20 },
  { id: "t3", title: "Record a 60s self-introduction", module: "communication", minutes: 10 },
  { id: "t4", title: "Add a project to your resume", module: "resume", minutes: 15 },
];

export const streak = {
  current: 12,
  best: 21,
  week: [true, true, true, true, false, true, true], // Mon–Sun
};

export const overallReadiness = 64;
