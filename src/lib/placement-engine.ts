import { getStudent, type Student } from "./auth";
import {
  getPerformanceAnalytics,
  type AssessmentAttemptRecord,
  type PerformanceAnalytics,
} from "./assessments";
import {
  getDecoderProgress,
  getDecoderStats,
  type DecoderOverallStats,
  type QuestionAttemptRecord,
} from "./code-decoder-data";
import {
  getInterviewProgressSummary,
  getInterviewSessions,
  getSessionScoreTen,
  type InterviewProgressSummary,
  type InterviewSession,
} from "./interview-engine";
import {
  analyzeResumeATS,
  calculateResumeCompletion,
  hasCustomSavedResume,
  loadSavedResume,
  type AtsAnalysisResult,
  type ResumeCompletionResult,
} from "./resume-engine";

// ==========================================
// 0. STORAGE KEYS & STUDENT SCOPING
// ==========================================
const COMM_HISTORY_PREFIX = "cp_communication_history_v1_";
const ROADMAP_PROGRESS_PREFIX = "cp_roadmap_progress_v1_";
const TRACKER_STATUS_PREFIX = "cp_placement_tracker_v1_";
const WEEKLY_GOALS_PREFIX = "cp_weekly_goals_v1_";
const COMPLETED_TASKS_PREFIX = "cp_completed_tasks_";

function normalizeEmail(email?: string | null): string {
  const resolved = email ?? getStudent()?.email ?? "guest@careerpilot.ai";
  return resolved.trim().toLowerCase() || "guest@careerpilot.ai";
}

function safeEmailKey(email?: string | null): string {
  return normalizeEmail(email).replace(/[^a-z0-9]/g, "_");
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

// ==========================================
// 1. COMMUNICATION & ROADMAP REAL PERSISTENCE
// ==========================================
export interface CommunicationAttemptRecord {
  id: string;
  recordedAt: string;
  drill: "self-intro" | "gd-ai" | "email-drill";
  wordCount: number;
  fillerCount: number;
  wpm: number | null;
  isSpoken: boolean;
  durationSec: number;
  hasStructure: boolean;
  scorePct: number;
}

export function getCommunicationHistory(email?: string | null): CommunicationAttemptRecord[] {
  const key = `${COMM_HISTORY_PREFIX}${safeEmailKey(email)}`;
  const list = readJson<CommunicationAttemptRecord[]>(key, []);
  if (!Array.isArray(list)) return [];
  return list.filter((item): item is CommunicationAttemptRecord =>
    Boolean(
      item &&
      typeof item === "object" &&
      typeof item.scorePct === "number" &&
      Number.isFinite(item.scorePct),
    ),
  );
}

export function recordCommunicationAttempt(
  input: Omit<CommunicationAttemptRecord, "id" | "recordedAt" | "scorePct">,
  email?: string | null,
): CommunicationAttemptRecord {
  let pacePts = 18; // typed baseline
  if (input.isSpoken && input.wpm !== null) {
    if (input.wpm >= 115 && input.wpm <= 155) pacePts = 35;
    else if (input.wpm >= 95 && input.wpm <= 175) pacePts = 26;
    else pacePts = 16;
  }
  const fillerPts =
    input.fillerCount === 0
      ? 30
      : input.fillerCount === 1
        ? 24
        : input.fillerCount === 2
          ? 18
          : Math.max(6, 30 - input.fillerCount * 6);
  const structurePts =
    input.wordCount >= 40 ? 35 : input.wordCount >= 25 ? 25 : input.wordCount >= 12 ? 15 : 8;

  const record: CommunicationAttemptRecord = {
    ...input,
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    recordedAt: new Date().toISOString(),
    scorePct: Math.min(100, pacePts + fillerPts + structurePts),
  };

  const existing = getCommunicationHistory(email);
  const updated = [record, ...existing].slice(0, 40);
  writeJson(`${COMM_HISTORY_PREFIX}${safeEmailKey(email)}`, updated);
  return record;
}

export const saveCommunicationAttempt = recordCommunicationAttempt;

export function getExplicitRoadmapCompletedIds(email?: string | null): string[] | null {
  const key = `${ROADMAP_PROGRESS_PREFIX}${safeEmailKey(email)}`;
  const stored = readJson<string[] | null>(key, null);
  return Array.isArray(stored) ? stored : null;
}

export function loadRoadmapCompleted(email?: string | null): string[] {
  return getExplicitRoadmapCompletedIds(email) ?? [];
}

export function saveRoadmapCompleted(ids: string[], email?: string | null): void {
  const key = `${ROADMAP_PROGRESS_PREFIX}${safeEmailKey(email)}`;
  writeJson(key, ids);
}

export const saveRoadmapCompletedIds = saveRoadmapCompleted;

function getPersistedDailyTaskIds(email?: string | null): string[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${COMPLETED_TASKS_PREFIX}${normalizeEmail(email)}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : null;
  } catch {
    return null;
  }
}

// ==========================================
// 2. PLACEMENT PREPARATION TRACKER (8 SECTIONS)
// ==========================================
export type PlacementSectionId =
  | "aptitude"
  | "programming"
  | "core-cs"
  | "technical-interview"
  | "hr-interview"
  | "communication"
  | "resume"
  | "projects-internships";

export type ActivityStatus = "completed" | "ongoing" | "pending";

export interface TrackerActivityDefinition {
  id: string;
  sectionId: PlacementSectionId;
  title: string;
  description: string;
  estimatedMinutes: number;
  targetModuleId: string;
}

export interface TrackerActivity extends TrackerActivityDefinition {
  status: ActivityStatus;
  autoSynced: boolean;
}

export interface PlacementTrackerSection {
  id: PlacementSectionId;
  title: string;
  subtitle: string;
  targetModuleId: string;
  activities: TrackerActivity[];
  completedCount: number;
  ongoingCount: number;
  pendingCount: number;
  progressPct: number;
}

export interface PlacementTrackerState {
  sections: PlacementTrackerSection[];
  totalActivities: number;
  completedCount: number;
  ongoingCount: number;
  pendingCount: number;
  completionPct: number;
}

export const PLACEMENT_SECTION_META: Array<{
  id: PlacementSectionId;
  title: string;
  subtitle: string;
  targetModuleId: string;
}> = [
  {
    id: "aptitude",
    title: "Aptitude Preparation",
    subtitle: "Quantitative aptitude, logical reasoning, speed drills & timed mocks",
    targetModuleId: "assessment",
  },
  {
    id: "programming",
    title: "Programming Skills",
    subtitle: "DSA, debugging mastery in Python/Java/C & problem-solving patterns",
    targetModuleId: "code-decoder",
  },
  {
    id: "core-cs",
    title: "Core CS Subjects",
    subtitle: "DBMS, SQL, Operating Systems, Computer Networks & OOP principles",
    targetModuleId: "assessment",
  },
  {
    id: "technical-interview",
    title: "Technical Interviews",
    subtitle: "System design trade-offs, DSA explanations & live follow-up defense",
    targetModuleId: "interview-mentor",
  },
  {
    id: "hr-interview",
    title: "HR Interviews",
    subtitle: "Behavioral STAR stories, ownership examples & company motivation",
    targetModuleId: "interview-mentor",
  },
  {
    id: "communication",
    title: "Communication Skills",
    subtitle: "Spoken clarity, WPM pacing, filler elimination & professional writing",
    targetModuleId: "communication",
  },
  {
    id: "resume",
    title: "Resume Preparation",
    subtitle: "ATS structure, quantified project bullets & keyword alignment",
    targetModuleId: "resume",
  },
  {
    id: "projects-internships",
    title: "Projects and Internships",
    subtitle: "Portfolio builds, architecture documentation & internship readiness",
    targetModuleId: "projects",
  },
];

export const TRACKER_ACTIVITIES: TrackerActivityDefinition[] = [
  // 1. Aptitude Preparation
  {
    id: "apt-1",
    sectionId: "aptitude",
    title: "Percentages, Profit & Loss & Ratio Foundations",
    description: "Master core arithmetic shortcuts and attempt an Aptitude practice quiz.",
    estimatedMinutes: 25,
    targetModuleId: "assessment",
  },
  {
    id: "apt-2",
    sectionId: "aptitude",
    title: "Time & Work, Speed & Distance & Probability",
    description: "Solve multi-step word problems with accuracy >= 70%.",
    estimatedMinutes: 30,
    targetModuleId: "assessment",
  },
  {
    id: "apt-3",
    sectionId: "aptitude",
    title: "Logical Reasoning (Series, Syllogisms & Puzzles)",
    description: "Practice Easy, Medium, and Hard reasoning sets in My Assessment.",
    estimatedMinutes: 25,
    targetModuleId: "assessment",
  },
  {
    id: "apt-4",
    sectionId: "aptitude",
    title: "Timed Quantitative Mock 4 Simulation",
    description: "Complete full 30-question timed aptitude sprint under exam pressure.",
    estimatedMinutes: 30,
    targetModuleId: "assessment",
  },

  // 2. Programming Skills
  {
    id: "prog-1",
    sectionId: "programming",
    title: "Arrays, Strings & Loop Boundary Debugging",
    description: "Solve Easy debugging & logic challenges in Code Decoder.",
    estimatedMinutes: 25,
    targetModuleId: "code-decoder",
  },
  {
    id: "prog-2",
    sectionId: "programming",
    title: "Binary Search, Recursion & Linked Lists",
    description: "Complete Medium-level pointer and recursion problems without hints.",
    estimatedMinutes: 35,
    targetModuleId: "code-decoder",
  },
  {
    id: "prog-3",
    sectionId: "programming",
    title: "Trees, Caching & Dynamic Programming Drills",
    description: "Tackle Hard Code Decoder challenges and explain time/space complexity.",
    estimatedMinutes: 40,
    targetModuleId: "code-decoder",
  },
  {
    id: "prog-4",
    sectionId: "programming",
    title: "Language Fluency Assessment (C / C++ / Java / Python)",
    description: "Score 70%+ on the Technical Assessment language and DSA section.",
    estimatedMinutes: 20,
    targetModuleId: "assessment",
  },

  // 3. Core CS Subjects
  {
    id: "cs-1",
    sectionId: "core-cs",
    title: "DBMS Normalization, ACID & SQL Queries",
    description: "Review BCNF, transaction isolation levels, and join/indexing queries.",
    estimatedMinutes: 30,
    targetModuleId: "assessment",
  },
  {
    id: "cs-2",
    sectionId: "core-cs",
    title: "Operating Systems: Processes, Deadlocks & Paging",
    description: "Attempt OS questions in Core CS Quiz across Intermediate & Advanced.",
    estimatedMinutes: 30,
    targetModuleId: "assessment",
  },
  {
    id: "cs-3",
    sectionId: "core-cs",
    title: "Computer Networks: TCP/IP, HTTP, DNS & Subnetting",
    description: "Verify OSI layers, 3-way handshake, and routing concepts.",
    estimatedMinutes: 25,
    targetModuleId: "assessment",
  },
  {
    id: "cs-4",
    sectionId: "core-cs",
    title: "OOP Design Patterns & SOLID Principles",
    description: "Complete OOP & System Design quiz set in Core CS.",
    estimatedMinutes: 20,
    targetModuleId: "assessment",
  },

  // 4. Technical Interviews
  {
    id: "tech-int-1",
    sectionId: "technical-interview",
    title: "Complete 1 Technical or Full-Stack Mock Round",
    description: "Answer multi-turn technical questions including follow-up probes.",
    estimatedMinutes: 20,
    targetModuleId: "interview-mentor",
  },
  {
    id: "tech-int-2",
    sectionId: "technical-interview",
    title: "Core CS Oral Defense Round",
    description: "Complete a Core Computer Science Interview round explaining trade-offs.",
    estimatedMinutes: 20,
    targetModuleId: "interview-mentor",
  },
  {
    id: "tech-int-3",
    sectionId: "technical-interview",
    title: "Project Architecture & Database Schema Deep-Dive",
    description: "Practice defending your system choices, bottlenecks, and scaling plan.",
    estimatedMinutes: 20,
    targetModuleId: "interview-mentor",
  },
  {
    id: "tech-int-4",
    sectionId: "technical-interview",
    title: "Achieve >= 7.5/10 Average Technical Interview Score",
    description: "Sustain high correctness, relevance, and structured explanations.",
    estimatedMinutes: 25,
    targetModuleId: "interview-mentor",
  },

  // 5. HR Interviews
  {
    id: "hr-int-1",
    sectionId: "hr-interview",
    title: "Prepare 3 STAR Behavioral Stories",
    description: "Document Situation, Task, Action, Result for teamwork, conflict & failure.",
    estimatedMinutes: 20,
    targetModuleId: "interview-mentor",
  },
  {
    id: "hr-int-2",
    sectionId: "hr-interview",
    title: "Complete HR Interview Mock Simulation",
    description: "Run an HR Interview session in Weekly AI Interview Mentor.",
    estimatedMinutes: 15,
    targetModuleId: "interview-mentor",
  },
  {
    id: "hr-int-3",
    sectionId: "hr-interview",
    title: "Company Motivation & Career Alignment Pitch",
    description: "Prepare clear answers for 'Why this company?' and 'Where in 3 years?'.",
    estimatedMinutes: 15,
    targetModuleId: "interview-mentor",
  },
  {
    id: "hr-int-4",
    sectionId: "hr-interview",
    title: "General Placement Mixed Round Practice",
    description: "Complete a General Placement Interview combining tech + HR questions.",
    estimatedMinutes: 20,
    targetModuleId: "interview-mentor",
  },

  // 6. Communication Skills
  {
    id: "comm-1",
    sectionId: "communication",
    title: "Record 60-Second Self-Introduction Pitch",
    description: "Use Speech Coach to hit 120–150 WPM with <= 1 filler word.",
    estimatedMinutes: 10,
    targetModuleId: "communication",
  },
  {
    id: "comm-2",
    sectionId: "communication",
    title: "Zero-Filler Verbal Articulation Drill",
    description: "Complete spoken interview or coach drills replacing 'um/like' with pauses.",
    estimatedMinutes: 15,
    targetModuleId: "communication",
  },
  {
    id: "comm-3",
    sectionId: "communication",
    title: "Group Discussion Argument Framing",
    description: "Review balanced pros/cons frameworks in Communication Coach.",
    estimatedMinutes: 15,
    targetModuleId: "communication",
  },
  {
    id: "comm-4",
    sectionId: "communication",
    title: "Professional Post-Interview Follow-Up Email",
    description: "Practice concise recruiter communication etiquette.",
    estimatedMinutes: 10,
    targetModuleId: "communication",
  },

  // 7. Resume Preparation
  {
    id: "res-1",
    sectionId: "resume",
    title: "Complete All Core Resume Sections",
    description: "Fill Personal Info, Education, Skills, and Projects in Resume Builder.",
    estimatedMinutes: 25,
    targetModuleId: "resume",
  },
  {
    id: "res-2",
    sectionId: "resume",
    title: "Quantify Project & Internship Bullet Points",
    description: "Use strong action verbs and measurable metrics without fabricating facts.",
    estimatedMinutes: 20,
    targetModuleId: "resume",
  },
  {
    id: "res-3",
    sectionId: "resume",
    title: "Run ATS Analyzer & Reach >= 75/100 Score",
    description: "Fix missing sections, weak descriptions, and keyword gaps.",
    estimatedMinutes: 15,
    targetModuleId: "resume",
  },
  {
    id: "res-4",
    sectionId: "resume",
    title: "Export Clean 1-Page ATS PDF Copy",
    description: "Review Resume Preview alignment and save version snapshot.",
    estimatedMinutes: 10,
    targetModuleId: "resume",
  },

  // 8. Projects and Internships
  {
    id: "proj-1",
    sectionId: "projects-internships",
    title: "Finalize 2 End-to-End Portfolio Projects",
    description: "Verify live demo links, README documentation, and problem statements.",
    estimatedMinutes: 45,
    targetModuleId: "projects",
  },
  {
    id: "proj-2",
    sectionId: "projects-internships",
    title: "Document System Architecture & Trade-Offs",
    description: "Prepare 2-minute explanation for DB schema, API auth, and caching choices.",
    estimatedMinutes: 25,
    targetModuleId: "projects",
  },
  {
    id: "proj-3",
    sectionId: "projects-internships",
    title: "Log Internships, Certifications & Hackathons",
    description: "Record verified work experience and certifications on your profile & resume.",
    estimatedMinutes: 20,
    targetModuleId: "resume",
  },
  {
    id: "proj-4",
    sectionId: "projects-internships",
    title: "Maintain Clean GitHub Commit History & Portfolio",
    description: "Ensure pinned repositories match skills claimed on your resume.",
    estimatedMinutes: 20,
    targetModuleId: "projects",
  },
];

interface StudentSignalSnapshot {
  student: Student | null;
  email: string;
  assessments: PerformanceAnalytics;
  decoder: DecoderOverallStats;
  decoderProgress: Record<string, QuestionAttemptRecord>;
  interviews: InterviewSession[];
  interviewSummary: InterviewProgressSummary;
  commHistory: CommunicationAttemptRecord[];
  hasCustomResume: boolean;
  resumeAts: AtsAnalysisResult | null;
  resumeCompletion: ResumeCompletionResult | null;
  roadmapCompleted: string[];
  persistedDailyTasks: string[] | null;
}

function collectStudentSignals(email?: string | null): StudentSignalSnapshot {
  const student = getStudent();
  const resolvedEmail = normalizeEmail(email);
  const assessments = getPerformanceAnalytics();
  const decoder = getDecoderStats(resolvedEmail);
  const decoderProgress = getDecoderProgress(resolvedEmail);
  const interviews = getInterviewSessions();
  const interviewSummary = getInterviewProgressSummary(interviews);
  const commHistory = getCommunicationHistory(resolvedEmail);
  const hasCustomResume = hasCustomSavedResume(resolvedEmail);

  let resumeAts: AtsAnalysisResult | null = null;
  let resumeCompletion: ResumeCompletionResult | null = null;
  if (hasCustomResume) {
    const saved = loadSavedResume(
      student ?? {
        name: "",
        email: resolvedEmail,
        college: "",
        branch: "",
        year: "",
      },
    );
    resumeAts = analyzeResumeATS(saved.data);
    resumeCompletion = calculateResumeCompletion(saved.data);
  }

  return {
    student,
    email: resolvedEmail,
    assessments,
    decoder,
    decoderProgress,
    interviews,
    interviewSummary,
    commHistory,
    hasCustomResume,
    resumeAts,
    resumeCompletion,
    roadmapCompleted: loadRoadmapCompleted(resolvedEmail),
    persistedDailyTasks: getPersistedDailyTaskIds(resolvedEmail),
  };
}

function getManualTrackerMap(email?: string | null): Record<string, ActivityStatus> {
  return readJson<Record<string, ActivityStatus>>(
    `${TRACKER_STATUS_PREFIX}${safeEmailKey(email)}`,
    {},
  );
}

function detectAutoStatusForActivity(
  id: string,
  signals: StudentSignalSnapshot,
): ActivityStatus | null {
  const emptyCatStat = { attempted: 0, correct: 0, accuracy: 0 };
  const byCategory = signals.assessments?.byCategory;
  const apt = byCategory?.aptitude ?? emptyCatStat;
  const log = byCategory?.logical ?? emptyCatStat;
  const tech = byCategory?.technical ?? emptyCatStat;
  const core = byCategory?.["core-cs"] ?? emptyCatStat;
  const byDiff = signals.decoder?.byDifficulty;
  const easyDiff = byDiff?.Easy ?? { solved: 0, attempted: 0 };
  const medDiff = byDiff?.Medium ?? { solved: 0, attempted: 0 };
  const hardDiff = byDiff?.Hard ?? { solved: 0, attempted: 0 };

  switch (id) {
    case "apt-1":
      if (apt.attempted >= 5) return "completed";
      if (apt.attempted > 0) return "ongoing";
      return null;
    case "apt-3":
      if (log.attempted >= 5) return "completed";
      if (log.attempted > 0) return "ongoing";
      return null;
    case "apt-4":
      if ((signals.assessments?.history ?? []).some((h) => h?.category === "quant-mock")) {
        return "completed";
      }
      return null;
    case "prog-1":
      if (easyDiff.solved >= 2) return "completed";
      if (easyDiff.attempted > 0) return "ongoing";
      return null;
    case "prog-2":
      if (medDiff.solved >= 2) return "completed";
      if (medDiff.attempted > 0) return "ongoing";
      return null;
    case "prog-3":
      if (hardDiff.solved >= 1) return "completed";
      if (hardDiff.attempted > 0) return "ongoing";
      return null;
    case "prog-4":
      if (tech.attempted >= 5 && tech.accuracy >= 70) return "completed";
      if (tech.attempted > 0) return "ongoing";
      return null;
    case "cs-1":
    case "cs-2":
    case "cs-3":
    case "cs-4":
      if (core.attempted >= 6 && core.accuracy >= 70 && id === "cs-1") return "completed";
      if (core.attempted > 0 && id === "cs-1") return "ongoing";
      return null;
    case "tech-int-1": {
      const hasTech = signals.interviews.some(
        (s) =>
          s.category === "Technical Interview" || s.category === "Full Stack Developer Interview",
      );
      return hasTech ? "completed" : null;
    }
    case "tech-int-2": {
      const hasCore = signals.interviews.some(
        (s) => s.category === "Core Computer Science Interview",
      );
      return hasCore ? "completed" : null;
    }
    case "tech-int-4": {
      const techSessions = signals.interviews.filter(
        (s) =>
          s.category === "Technical Interview" ||
          s.category === "Full Stack Developer Interview" ||
          s.category === "Core Computer Science Interview",
      );
      if (techSessions.length === 0) return null;
      const avg =
        techSessions.reduce((acc, s) => acc + getSessionScoreTen(s), 0) / techSessions.length;
      return avg >= 7.5 ? "completed" : "ongoing";
    }
    case "hr-int-2":
      return signals.interviews.some((s) => s.category === "HR Interview") ? "completed" : null;
    case "hr-int-4":
      return signals.interviews.some((s) => s.category === "General Placement Interview")
        ? "completed"
        : null;
    case "comm-1":
      if (signals.commHistory.some((c) => c.isSpoken)) return "completed";
      if (signals.commHistory.length > 0) return "ongoing";
      return null;
    case "res-1":
      if (signals.hasCustomResume && (signals.resumeCompletion?.percentage ?? 0) >= 75) {
        return "completed";
      }
      if (signals.hasCustomResume) return "ongoing";
      return null;
    case "res-3":
      if (signals.hasCustomResume && (signals.resumeAts?.score ?? 0) >= 75) {
        return "completed";
      }
      if (signals.hasCustomResume) return "ongoing";
      return null;
    default:
      return null;
  }
}

export function loadPlacementTracker(
  email?: string | null,
  signalsInput?: StudentSignalSnapshot,
): PlacementTrackerState {
  const signals = signalsInput ?? collectStudentSignals(email);
  const manual = getManualTrackerMap(signals.email);

  const sections: PlacementTrackerSection[] = PLACEMENT_SECTION_META.map((sec) => {
    const items: TrackerActivity[] = TRACKER_ACTIVITIES.filter((a) => a.sectionId === sec.id).map(
      (def) => {
        const manualStatus = manual[def.id];
        if (manualStatus) {
          return { ...def, status: manualStatus, autoSynced: false };
        }
        const autoStatus = detectAutoStatusForActivity(def.id, signals);
        if (autoStatus) {
          return { ...def, status: autoStatus, autoSynced: true };
        }
        return { ...def, status: "pending", autoSynced: false };
      },
    );

    const completedCount = items.filter((i) => i.status === "completed").length;
    const ongoingCount = items.filter((i) => i.status === "ongoing").length;
    const pendingCount = items.filter((i) => i.status === "pending").length;
    const progressPct =
      items.length > 0
        ? Math.round(((completedCount + ongoingCount * 0.5) / items.length) * 100)
        : 0;

    return {
      ...sec,
      activities: items,
      completedCount,
      ongoingCount,
      pendingCount,
      progressPct,
    };
  });

  const allActivities = sections.flatMap((s) => s.activities);
  const totalActivities = allActivities.length;
  const completedCount = allActivities.filter((a) => a.status === "completed").length;
  const ongoingCount = allActivities.filter((a) => a.status === "ongoing").length;
  const pendingCount = allActivities.filter((a) => a.status === "pending").length;
  const completionPct =
    totalActivities > 0
      ? Math.round(((completedCount + ongoingCount * 0.5) / totalActivities) * 100)
      : 0;

  return {
    sections,
    totalActivities,
    completedCount,
    ongoingCount,
    pendingCount,
    completionPct,
  };
}

export function setTrackerActivityStatus(
  activityId: string,
  status: ActivityStatus,
  email?: string | null,
): PlacementTrackerState {
  const resolved = normalizeEmail(email);
  const manual = getManualTrackerMap(resolved);
  manual[activityId] = status;
  writeJson(`${TRACKER_STATUS_PREFIX}${safeEmailKey(resolved)}`, manual);
  return loadPlacementTracker(resolved);
}

// ==========================================
// 3. PLACEMENT READINESS SCORE ENGINE (0-100)
// ==========================================
export type ReadinessCategoryKey =
  | "aptitude"
  | "technical"
  | "coding"
  | "code-decoder"
  | "mock-interview"
  | "communication"
  | "resume"
  | "learning";

export type ReadinessStatus = "Complete" | "Partial" | "Incomplete";

export interface ReadinessCategoryScore {
  key: ReadinessCategoryKey;
  label: string;
  weight: number;
  earned: number;
  rawScorePct: number | null; // null when Incomplete
  status: ReadinessStatus;
  dataPointsLabel: string;
  formulaNote: string;
  targetModuleId: string;
}

export interface PlacementReadinessReport {
  overallScore: number;
  readinessTier:
    "Not Started" | "Early Stage" | "Building Momentum" | "Competitive" | "Placement Ready";
  categories: ReadinessCategoryScore[];
  completedCount: number;
  partialCount: number;
  incompleteCount: number;
  calculationExplanation: string;
  dataCoveragePct: number;
}

function roundOneDecimal(val: number): number {
  return Math.round(val * 10) / 10;
}

function extractInterviewCommunicationPct(
  session: InterviewSession | null | undefined,
): number | null {
  if (!session || typeof session !== "object") return null;

  const dims = session.dimensionAverages ?? session.evaluation?.dimensions;
  if (dims && typeof dims === "object") {
    const hasComm =
      typeof dims.communicationSkills === "number" && Number.isFinite(dims.communicationSkills);
    const hasConf = typeof dims.confidence === "number" && Number.isFinite(dims.confidence);
    if (hasComm && hasConf) {
      return ((dims.communicationSkills + dims.confidence) / 2) * 10;
    }
    if (hasComm) {
      return dims.communicationSkills * 10;
    }
    if (hasConf) {
      return dims.confidence * 10;
    }
  }

  if (Array.isArray(session.turns) && session.turns.length > 0) {
    const turnVals: number[] = [];
    for (const turn of session.turns) {
      const turnDims = turn?.evaluation?.dimensions;
      if (
        turnDims &&
        typeof turnDims.communicationSkills === "number" &&
        Number.isFinite(turnDims.communicationSkills) &&
        typeof turnDims.confidence === "number" &&
        Number.isFinite(turnDims.confidence)
      ) {
        turnVals.push(((turnDims.communicationSkills + turnDims.confidence) / 2) * 10);
      }
    }
    if (turnVals.length > 0) {
      return turnVals.reduce((a, b) => a + b, 0) / turnVals.length;
    }
  }

  const evalObj = session.evaluation;
  if (evalObj && typeof evalObj === "object") {
    const clarity =
      typeof evalObj.clarityScore === "number" && Number.isFinite(evalObj.clarityScore)
        ? evalObj.clarityScore
        : null;
    const grammar =
      typeof evalObj.grammarScore === "number" && Number.isFinite(evalObj.grammarScore)
        ? evalObj.grammarScore
        : null;
    if (clarity !== null && grammar !== null) {
      return (clarity + grammar) / 2;
    }
    if (clarity !== null) return clarity;
    if (grammar !== null) return grammar;
  }

  return null;
}

export function calculatePlacementReadiness(email?: string | null): PlacementReadinessReport {
  const signals = collectStudentSignals(email);
  const tracker = loadPlacementTracker(signals.email, signals);
  const goals = loadWeeklyPlacementGoals(signals.email, false, signals);

  const categories: ReadinessCategoryScore[] = [];
  const emptyCatStat = { attempted: 0, correct: 0, accuracy: 0 };
  const byCategory = signals.assessments?.byCategory;

  // 1. Aptitude performance (Weight: 15) -> Aptitude + Logical Reasoning
  const aptStat = byCategory?.aptitude ?? emptyCatStat;
  const logStat = byCategory?.logical ?? emptyCatStat;
  const aptAttempted = (aptStat.attempted || 0) + (logStat.attempted || 0);
  const aptCorrect = (aptStat.correct || 0) + (logStat.correct || 0);
  if (aptAttempted === 0) {
    categories.push({
      key: "aptitude",
      label: "Aptitude Performance",
      weight: 15,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "0 questions attempted",
      formulaNote: "Attempt Quantitative Aptitude or Logical Reasoning sets to generate score.",
      targetModuleId: "assessment",
    });
  } else {
    const rawPct = Math.round((aptCorrect / aptAttempted) * 100);
    const coverage = Math.min(1, aptAttempted / 10);
    const status: ReadinessStatus = aptAttempted >= 10 ? "Complete" : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 15 * coverage);
    categories.push({
      key: "aptitude",
      label: "Aptitude Performance",
      weight: 15,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${aptCorrect}/${aptAttempted} correct (${rawPct}% accuracy)`,
      formulaNote:
        status === "Complete"
          ? `${rawPct}% accuracy × 15 pts weight = ${earned}/15`
          : `${rawPct}% accuracy × 15 pts × ${Math.round(coverage * 100)}% sample coverage (${aptAttempted}/10 Qs) = ${earned}/15`,
      targetModuleId: "assessment",
    });
  }

  // 2. Technical assessment results (Weight: 15) -> Technical Assessment + Core CS Quiz
  const techStat = byCategory?.technical ?? emptyCatStat;
  const coreStat = byCategory?.["core-cs"] ?? emptyCatStat;
  const techAttempted = (techStat.attempted || 0) + (coreStat.attempted || 0);
  const techCorrect = (techStat.correct || 0) + (coreStat.correct || 0);
  if (techAttempted === 0) {
    categories.push({
      key: "technical",
      label: "Technical Assessment Results",
      weight: 15,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "0 technical / Core CS questions attempted",
      formulaNote: "Complete Technical Assessment or Core CS Quiz sets to generate score.",
      targetModuleId: "assessment",
    });
  } else {
    const rawPct = Math.round((techCorrect / techAttempted) * 100);
    const coverage = Math.min(1, techAttempted / 10);
    const status: ReadinessStatus = techAttempted >= 10 ? "Complete" : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 15 * coverage);
    categories.push({
      key: "technical",
      label: "Technical Assessment Results",
      weight: 15,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${techCorrect}/${techAttempted} correct (${rawPct}% accuracy)`,
      formulaNote:
        status === "Complete"
          ? `${rawPct}% accuracy × 15 pts weight = ${earned}/15`
          : `${rawPct}% accuracy × 15 pts × ${Math.round(coverage * 100)}% sample coverage (${techAttempted}/10 Qs) = ${earned}/15`,
      targetModuleId: "assessment",
    });
  }

  // 3. Coding skills (Weight: 15) -> Coding language/DSA topic assessments + Code Decoder Med/Hard + Programming tracker
  const codingTopics = new Set([
    "C",
    "C++",
    "Java",
    "Python",
    "SQL",
    "Data Structures & Algorithms",
  ]);
  const codingTopicStats = (signals.assessments?.topicStats ?? []).filter((t) =>
    codingTopics.has(t.topic),
  );
  const codingQsAttempted = codingTopicStats.reduce((a, t) => a + (t.attempted || 0), 0);
  const codingQsCorrect = codingTopicStats.reduce((a, t) => a + (t.correct || 0), 0);
  const codingQuizPct =
    codingQsAttempted > 0 ? Math.round((codingQsCorrect / codingQsAttempted) * 100) : null;

  const progSection = (tracker.sections ?? []).find((s) => s.id === "programming");
  const progTrackerHasActivity =
    (progSection?.completedCount ?? 0) > 0 || (progSection?.ongoingCount ?? 0) > 0;
  const decoderHasActivity = (signals.decoder?.totalAttempted ?? 0) > 0;

  if (codingQsAttempted === 0 && !decoderHasActivity && !progTrackerHasActivity) {
    categories.push({
      key: "coding",
      label: "Coding Skills",
      weight: 15,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "No coding assessments or debugging exercises logged",
      formulaNote:
        "Attempt Technical coding/DSA topics, Code Decoder problems, or Programming tracker tasks.",
      targetModuleId: "code-decoder",
    });
  } else {
    const components: number[] = [];
    if (codingQuizPct !== null) components.push(codingQuizPct);
    if (decoderHasActivity) {
      const medHardSolved =
        (signals.decoder?.byDifficulty?.Medium?.solved ?? 0) +
        (signals.decoder?.byDifficulty?.Hard?.solved ?? 0);
      const decoderCodingSignal = Math.round(
        (signals.decoder?.overallAccuracy ?? 0) * 0.65 +
          Math.min(100, (medHardSolved / 4) * 100) * 0.35,
      );
      components.push(decoderCodingSignal);
    }
    if (progTrackerHasActivity && progSection) {
      components.push(progSection.progressPct);
    }
    const rawPct = Math.round(components.reduce((a, b) => a + b, 0) / components.length);
    const evidenceVolume =
      (codingQsAttempted >= 5 ? 1 : codingQsAttempted / 5) * 0.5 +
      (signals.decoder.totalSolved >= 3 ? 1 : signals.decoder.totalSolved / 3) * 0.5;
    const coverage = Math.min(1, Math.max(0.35, evidenceVolume));
    const status: ReadinessStatus =
      codingQsAttempted >= 4 && signals.decoder.totalSolved >= 2 ? "Complete" : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 15 * (status === "Complete" ? 1 : coverage));
    categories.push({
      key: "coding",
      label: "Coding Skills",
      weight: 15,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${codingQsAttempted} coding Qs • ${signals.decoder.totalSolved} bugs solved`,
      formulaNote: `Blends coding/DSA accuracy + Code Decoder problem solving + Programming tracker = ${earned}/15`,
      targetModuleId: "code-decoder",
    });
  }

  // 4. Code Decoder performance (Weight: 10)
  if (signals.decoder.totalAttempted === 0) {
    categories.push({
      key: "code-decoder",
      label: "Code Decoder Performance",
      weight: 10,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: `0/${signals.decoder.totalQuestions} challenges attempted`,
      formulaNote: "Solve debugging & complexity problems in Code Decoder to earn points.",
      targetModuleId: "code-decoder",
    });
  } else {
    const solveCoverage = Math.min(1, signals.decoder.totalSolved / 6);
    const rawPct = Math.round(
      signals.decoder.overallAccuracy * 0.6 +
        Math.min(100, Math.round((signals.decoder.totalSolved / 6) * 100)) * 0.4,
    );
    const status: ReadinessStatus = signals.decoder.totalSolved >= 5 ? "Complete" : "Partial";
    const earned = roundOneDecimal(
      (rawPct / 100) * 10 * (status === "Complete" ? 1 : Math.max(0.35, solveCoverage)),
    );
    categories.push({
      key: "code-decoder",
      label: "Code Decoder Performance",
      weight: 10,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${signals.decoder.totalSolved} solved / ${signals.decoder.totalAttempted} attempted (${signals.decoder.overallAccuracy}% acc)`,
      formulaNote: `${signals.decoder.overallAccuracy}% solve accuracy & ${signals.decoder.totalSolved} solved challenges = ${earned}/10`,
      targetModuleId: "code-decoder",
    });
  }

  // 5. Mock interview performance (Weight: 15)
  if (signals.interviewSummary.totalInterviews === 0) {
    categories.push({
      key: "mock-interview",
      label: "Mock Interview Performance",
      weight: 15,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "0 mock interviews completed",
      formulaNote: "Complete simulated AI interviews to score this category.",
      targetModuleId: "interview-mentor",
    });
  } else {
    const rawPct = Math.round(signals.interviewSummary.averageScoreTen * 10);
    const countFactor = Math.min(1, signals.interviewSummary.totalInterviews / 2);
    const status: ReadinessStatus =
      signals.interviewSummary.completedInterviews >= 2 ||
      signals.interviewSummary.totalInterviews >= 2
        ? "Complete"
        : "Partial";
    const earned = roundOneDecimal(
      (rawPct / 100) * 15 * (status === "Complete" ? 1 : Math.max(0.6, countFactor)),
    );
    categories.push({
      key: "mock-interview",
      label: "Mock Interview Performance",
      weight: 15,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${signals.interviewSummary.averageScoreTen}/10 avg across ${signals.interviewSummary.totalInterviews} round(s)`,
      formulaNote: `${signals.interviewSummary.averageScoreTen}/10 interview average (${rawPct}%) × 15 pts = ${earned}/15`,
      targetModuleId: "interview-mentor",
    });
  }

  // 6. Communication skills (Weight: 10) -> Communication Coach + Mock Interview Communication/Confidence
  const validCommHistory = (signals.commHistory ?? []).filter(
    (c) => c && typeof c.scorePct === "number" && Number.isFinite(c.scorePct),
  );
  const intCommVals = (signals.interviews ?? [])
    .map(extractInterviewCommunicationPct)
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const hasCommCoach = validCommHistory.length > 0;
  const hasInterviewComm = intCommVals.length > 0;
  if (!hasCommCoach && !hasInterviewComm) {
    categories.push({
      key: "communication",
      label: "Communication Skills",
      weight: 10,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "No speech coach or interview communication data",
      formulaNote: "Record a pitch in Communication Coach or complete a Mock Interview.",
      targetModuleId: "communication",
    });
  } else {
    const scores: number[] = [];
    if (hasCommCoach) {
      const coachAvg =
        validCommHistory.reduce((acc, c) => acc + c.scorePct, 0) / validCommHistory.length;
      scores.push(coachAvg);
    }
    if (hasInterviewComm) {
      const intCommAvg = intCommVals.reduce((a, b) => a + b, 0) / intCommVals.length;
      scores.push(intCommAvg);
    }
    const rawPct = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const hasSpokenCoach = validCommHistory.some((c) => Boolean(c.isSpoken));
    const status: ReadinessStatus =
      (hasCommCoach && hasInterviewComm) || hasSpokenCoach || intCommVals.length >= 2
        ? "Complete"
        : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 10 * (status === "Complete" ? 1 : 0.75));
    categories.push({
      key: "communication",
      label: "Communication Skills",
      weight: 10,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${validCommHistory.length} speech drill(s) • ${intCommVals.length} interview evaluation(s)`,
      formulaNote: `Combined cadence, filler control & interview communication (${rawPct}%) = ${earned}/10`,
      targetModuleId: "communication",
    });
  }

  // 7. Resume quality (Weight: 10) -> Strictly requires custom saved or uploaded resume
  if (!signals.hasCustomResume || !signals.resumeAts || !signals.resumeCompletion) {
    categories.push({
      key: "resume",
      label: "Resume Quality",
      weight: 10,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "No customized or uploaded resume saved yet",
      formulaNote: "Save, edit, or upload your resume in Resume Builder to compute ATS quality.",
      targetModuleId: "resume",
    });
  } else {
    const atsScore = signals.resumeAts.score;
    const compPct = signals.resumeCompletion.percentage;
    const rawPct = Math.round(atsScore * 0.7 + compPct * 0.3);
    const status: ReadinessStatus = atsScore >= 70 && compPct >= 70 ? "Complete" : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 10);
    categories.push({
      key: "resume",
      label: "Resume Quality",
      weight: 10,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `ATS ${atsScore}/100 • ${compPct}% sections complete`,
      formulaNote: `(70% × ${atsScore} ATS + 30% × ${compPct}% completeness) × 10 = ${earned}/10`,
      targetModuleId: "resume",
    });
  }

  // 8. Learning progress (Weight: 10) -> Tracker activities + weekly goals + roadmap + persisted daily tasks
  const trackerDoneSignals = tracker.completedCount + tracker.ongoingCount * 0.5;
  const goalsDone = goals.goals.filter((g) => g.completed).length;
  const roadmapDone = signals.roadmapCompleted.length;
  const dailyDone = signals.persistedDailyTasks ? signals.persistedDailyTasks.length : 0;

  const hasLearningActivity =
    trackerDoneSignals > 0 || goalsDone > 0 || roadmapDone > 0 || dailyDone > 0;

  if (!hasLearningActivity) {
    categories.push({
      key: "learning",
      label: "Learning Progress",
      weight: 10,
      earned: 0,
      rawScorePct: null,
      status: "Incomplete",
      dataPointsLabel: "0 completed preparation tasks or goals",
      formulaNote: "Complete tracker activities, weekly goals, or roadmap milestones to advance.",
      targetModuleId: "roadmap",
    });
  } else {
    const trackerRatio =
      tracker.totalActivities > 0 ? trackerDoneSignals / tracker.totalActivities : 0;
    const goalsRatio = goals.goals.length > 0 ? goalsDone / goals.goals.length : 0;
    const roadmapRatio = Math.min(1, roadmapDone / 8);
    const rawPct = Math.min(
      100,
      Math.round((trackerRatio * 0.55 + goalsRatio * 0.3 + roadmapRatio * 0.15) * 100),
    );
    const status: ReadinessStatus =
      tracker.completedCount >= 8 && goalsDone >= 2 ? "Complete" : "Partial";
    const earned = roundOneDecimal((rawPct / 100) * 10);
    categories.push({
      key: "learning",
      label: "Learning Progress",
      weight: 10,
      earned,
      rawScorePct: rawPct,
      status,
      dataPointsLabel: `${tracker.completedCount} tracker done • ${goalsDone}/${goals.goals.length} weekly goals`,
      formulaNote: `Weighted tracker (${Math.round(trackerRatio * 100)}%), weekly goals (${Math.round(goalsRatio * 100)}%) & roadmap = ${earned}/10`,
      targetModuleId: "roadmap",
    });
  }

  const completedCount = categories.filter((c) => c.status === "Complete").length;
  const partialCount = categories.filter((c) => c.status === "Partial").length;
  const incompleteCount = categories.filter((c) => c.status === "Incomplete").length;

  const rawTotal = Math.round(categories.reduce((acc, c) => acc + c.earned, 0));
  // Guardrail: never report 100% readiness if any category is incomplete or partial
  const overallScore =
    incompleteCount > 0 || partialCount > 0 ? Math.min(rawTotal, 94) : Math.min(100, rawTotal);

  const readinessTier: PlacementReadinessReport["readinessTier"] =
    overallScore === 0
      ? "Not Started"
      : overallScore < 35
        ? "Early Stage"
        : overallScore < 60
          ? "Building Momentum"
          : overallScore < 80
            ? "Competitive"
            : "Placement Ready";

  const dataCoveragePct = Math.round(
    ((completedCount + partialCount * 0.5) / categories.length) * 100,
  );

  const calculationExplanation =
    incompleteCount === categories.length
      ? "Overall score is 0/100 because all 8 readiness categories are currently Incomplete. Complete assessments, Code Decoder problems, mock interviews, communication drills, and save your resume to unlock real scores."
      : `Overall Placement Readiness (${overallScore}/100) is the sum of earned points across 8 weighted categories (${completedCount} Complete, ${partialCount} Partial, ${incompleteCount} Incomplete). Missing categories contribute 0 points and prevent 100% readiness until real evidence is recorded.`;

  return {
    overallScore,
    readinessTier,
    categories,
    completedCount,
    partialCount,
    incompleteCount,
    calculationExplanation,
    dataCoveragePct,
  };
}

// ==========================================
// 4. COMPANY PREPARATION CATALOG (9 COMPANIES)
// ==========================================
export interface CompanyPrepGuide {
  id: string;
  name: string;
  tierLabel: string;
  targetReadinessMin: number;
  overview: string;
  commonSelectionRounds: string[];
  aptitudeTopics: string[];
  technicalTopics: string[];
  codingPrep: {
    focus: string;
    difficulty: "Easy–Medium" | "Medium" | "Medium–Hard" | "Hard";
    sampleTopics: string[];
  };
  hrPrep: string[];
  suggestedActivities: Array<{
    label: string;
    moduleId: string;
    description: string;
  }>;
  hiringDisclaimer: string;
}

export const COMPANY_GUIDANCE_DISCLAIMER =
  "Important Notice: Patterns below provide general historical preparation guidance only. Verified current hiring requirements, eligibility cutoffs, test platforms, and round structures vary by hiring drive, year, and campus/off-campus role — always verify against the company's official careers portal or your placement cell notice.";

export const COMPANY_PREP_GUIDES: CompanyPrepGuide[] = [
  {
    id: "tcs",
    name: "TCS",
    tierLabel: "IT Services & Digital Engineering",
    targetReadinessMin: 45,
    overview:
      "Common campus tracks include Ninja, Digital, and Prime roles emphasizing foundational aptitude, clean code logic, and CS basics.",
    commonSelectionRounds: [
      "Online Integrated Test (Foundational Quantitative, Verbal, Reasoning + Coding)",
      "Technical Interview (Programming language basics, project walkthrough, SQL/DBMS)",
      "Managerial / HR Interview (Flexibility, teamwork, relocation, communication)",
    ],
    aptitudeTopics: [
      "Percentages & Profit/Loss",
      "Time, Speed & Distance",
      "Time & Work",
      "Number System & Probability",
      "Syllogisms & Number Series",
    ],
    technicalTopics: [
      "C / Java / Python syntax & pointers/OOP",
      "SQL Joins, Group By & Normalization",
      "OS Scheduling & Memory Basics",
      "Resume Project Architecture",
    ],
    codingPrep: {
      focus: "Arrays, String manipulation, number theory & clean edge-case handling",
      difficulty: "Easy–Medium",
      sampleTopics: [
        "Array traversal & subarrays",
        "String parsing",
        "Prime/GCD logic",
        "Hash maps",
      ],
    },
    hrPrep: [
      "Tell me about yourself structured under 60 seconds",
      "Why TCS and willingness to adapt across tech stacks",
      "Handling tight project deadlines in a team",
    ],
    suggestedActivities: [
      {
        label: "Practice Quant Mock 4 & Percentages",
        moduleId: "assessment",
        description: "Build speed and 75%+ accuracy on numerical & reasoning drills.",
      },
      {
        label: "Solve Easy & Medium Code Decoder Sets",
        moduleId: "code-decoder",
        description: "Eliminate off-by-one loop and reference equality bugs.",
      },
      {
        label: "Run General Placement Mock Interview",
        moduleId: "interview-mentor",
        description: "Practice defending your flagship project clearly.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "infosys",
    name: "Infosys",
    tierLabel: "IT Consulting & Specialist Programmer",
    targetReadinessMin: 48,
    overview:
      "Evaluates analytical reasoning, pseudocode/output tracing, and database/OOP fluency for Systems Engineer & Specialist Programmer tracks.",
    commonSelectionRounds: [
      "Online Assessment (Reasoning, Mathematical Ability, Verbal, Pseudocode, Puzzles)",
      "Technical + HR Combined Interview (Projects, OOP/SQL, situational HR)",
    ],
    aptitudeTopics: [
      "Cryptarithmetic & Number Puzzles",
      "Permutations & Probability",
      "Data Interpretation & Averages",
      "Syllogisms & Deductive Logic",
    ],
    technicalTopics: [
      "Java / Python OOP (Polymorphism, Abstraction)",
      "DBMS Keys, ACID & SQL Queries",
      "Pseudocode tracing & recursion output",
      "SDLC & Software Testing basics",
    ],
    codingPrep: {
      focus: "Greedy logic, sorting/searching & dynamic programming for Specialist roles",
      difficulty: "Medium",
      sampleTopics: [
        "Sorting & Two Pointers",
        "Recursion & Backtracking",
        "Greedy intervals",
        "DP basics",
      ],
    },
    hrPrep: [
      "Learning agility & adapting to new enterprise technologies",
      "Conflict resolution during college/internship teamwork",
      "Strengths backed by concrete examples",
    ],
    suggestedActivities: [
      {
        label: "Logical Reasoning Medium & Hard Puzzles",
        moduleId: "assessment",
        description: "Sharpen puzzle and syllogism accuracy in My Assessment.",
      },
      {
        label: "Technical Assessment (Java/Python & SQL)",
        moduleId: "assessment",
        description: "Test OOP and SQL fluency with explanations.",
      },
      {
        label: "Polish 60s Elevator Pitch",
        moduleId: "communication",
        description: "Target 120–145 WPM with zero filler words.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "wipro",
    name: "Wipro",
    tierLabel: "Global IT Services & Engineering",
    targetReadinessMin: 42,
    overview:
      "Focuses on quantitative accuracy, English communication clarity, foundational coding, and practical project knowledge.",
    commonSelectionRounds: [
      "Online Assessment (Aptitude, Logical, Verbal + Essay/Written Communication + Coding)",
      "Technical Interview (Core programming, DBMS, project roles)",
      "HR Interview (Behavioral fit, career goals, adaptability)",
    ],
    aptitudeTopics: [
      "Percentages & Averages",
      "Time & Work / Pipes",
      "Blood Relations & Directions",
      "Coding-Decoding",
    ],
    technicalTopics: [
      "C/Java/Python fundamentals",
      "Arrays, Strings & Basic Searching",
      "RDBMS concepts & Joins",
      "Computer Networks basics",
    ],
    codingPrep: {
      focus: "Input/output parsing, matrix/array logic & string transformations",
      difficulty: "Easy–Medium",
      sampleTopics: ["Frequency counting", "Palindrome/Anagram checks", "Pattern & array loops"],
    },
    hrPrep: [
      "Clear explanation of final-year or semester projects",
      "Willingness to learn enterprise platforms",
      "Handling constructive feedback",
    ],
    suggestedActivities: [
      {
        label: "Aptitude Foundations Quiz",
        moduleId: "assessment",
        description: "Practice Blood Relations, Directions, and Percentages.",
      },
      {
        label: "Professional Email & GD Prep",
        moduleId: "communication",
        description: "Strengthen structured written and spoken clarity.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "accenture",
    name: "Accenture",
    tierLabel: "Technology Consulting & Engineering",
    targetReadinessMin: 50,
    overview:
      "Combines cognitive & technical assessment (pseudocode, networking/cloud/MS office/security) with coding and communication screening.",
    commonSelectionRounds: [
      "Cognitive & Technical Assessment (Abstract Reasoning, Pseudocode, Networks/Cloud)",
      "Coding Assessment (2 programming problems)",
      "Communication Assessment (Speaking fluency & comprehension)",
      "Combined Technical + HR Interview",
    ],
    aptitudeTopics: [
      "Abstract & Flowchart Reasoning",
      "Critical Reasoning & Syllogisms",
      "Percentages & Ratio Word Problems",
    ],
    technicalTopics: [
      "Pseudocode debugging & bitwise tracing",
      "Networking protocols (TCP/UDP, HTTP, DNS)",
      "Cloud fundamentals & Security basics",
      "Project impact & team collaboration",
    ],
    codingPrep: {
      focus: "Clean problem decomposition with arrays, strings, and hash maps",
      difficulty: "Easy–Medium",
      sampleTopics: ["Two-sum style hashing", "String decoding", "Subarray problems"],
    },
    hrPrep: [
      "STAR stories emphasizing team leadership & client empathy",
      "Explaining technical decisions to non-technical stakeholders",
    ],
    suggestedActivities: [
      {
        label: "Computer Networks & Core CS Quiz",
        moduleId: "assessment",
        description: "Solidify OSI, TCP/IP, and security fundamentals.",
      },
      {
        label: "HR Interview Mock Round",
        moduleId: "interview-mentor",
        description: "Practice STAR behavioral stories with speaking WPM tracking.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "cognizant",
    name: "Cognizant",
    tierLabel: "Digital Engineering & Enterprise IT",
    targetReadinessMin: 48,
    overview:
      "Assesses quantitative & analytical aptitude alongside Java/Python/SQL proficiency across GenC and GenC Next engineering profiles.",
    commonSelectionRounds: [
      "Aptitude & Analytical Assessment",
      "Coding & SQL Query Evaluation (especially for GenC Next / Elevate)",
      "Technical + HR Interview",
    ],
    aptitudeTopics: [
      "Data Interpretation & Averages",
      "Number Series & Coding-Decoding",
      "Time, Speed & Distance",
    ],
    technicalTopics: [
      "SQL Joins, Subqueries & Aggregations",
      "Java Collections & Exception Handling",
      "OOP Concepts & REST API fundamentals",
    ],
    codingPrep: {
      focus: "SQL data querying plus Java/Python algorithmic problem solving",
      difficulty: "Medium",
      sampleTopics: ["SQL queries & indexing", "Java List/Map manipulation", "Binary search"],
    },
    hrPrep: [
      "Project contribution clarity (what YOU built vs team)",
      "Career aspirations in enterprise digital engineering",
    ],
    suggestedActivities: [
      {
        label: "SQL & Java Technical Assessment",
        moduleId: "assessment",
        description: "Verify query writing and Java Collections knowledge.",
      },
      {
        label: "Java Debugging in Code Decoder",
        moduleId: "code-decoder",
        description: "Master ConcurrentModificationException & NullPointer edge cases.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "capgemini",
    name: "Capgemini",
    tierLabel: "Engineering Consulting & IT Services",
    targetReadinessMin: 46,
    overview:
      "Features pseudocode debugging, spoken/written English evaluation, game-based or analytical reasoning, and core CS fundamentals.",
    commonSelectionRounds: [
      "Technical Assessment (Pseudocode & Core CS MCQs)",
      "English Communication / Written Assessment",
      "Coding & Behavioral Assessment",
      "Technical + HR Interview",
    ],
    aptitudeTopics: [
      "Logical Puzzles & Directions",
      "Quantitative Word Problems",
      "Pattern Recognition",
    ],
    technicalTopics: [
      "C/C++/Java Pseudocode output tracing",
      "Data Structures (Stacks, Queues, Linked Lists)",
      "DBMS & OS fundamentals",
    ],
    codingPrep: {
      focus: "Pointer/recursion tracing & clean iterative implementations",
      difficulty: "Easy–Medium",
      sampleTopics: ["Linked list reversal", "Stack/Queue simulation", "String formatting"],
    },
    hrPrep: ["Communication clarity & active listening", "Handling ambiguity in group projects"],
    suggestedActivities: [
      {
        label: "C & C++ Debugging in Code Decoder",
        moduleId: "code-decoder",
        description: "Practice pointer safety and recursion edge cases.",
      },
      {
        label: "Spoken Cadence Coach Drill",
        moduleId: "communication",
        description: "Measure WPM and filler reduction.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "zoho",
    name: "Zoho",
    tierLabel: "Product Engineering & SaaS",
    targetReadinessMin: 68,
    overview:
      "Heavily coding- and design-driven; minimal reliance on standard MCQs with deep emphasis on C/Java/Python implementation and OOD.",
    commonSelectionRounds: [
      "Round 1: C / Programming Output Tracing & Aptitude",
      "Round 2: Short Coding Problems (Arrays, Matrices, Strings, Recursion)",
      "Round 3: Advanced Coding / Low-Level System Design (Console App in 2-3 hrs)",
      "Round 4 & 5: Deep Technical + HR Interview",
    ],
    aptitudeTopics: ["Logical Puzzles & Number Crunching", "Flowchart & Dry-Run Tracing"],
    technicalTopics: [
      "Object-Oriented Design (OOP modularity without frameworks)",
      "Memory Management, Pointers & Recursion",
      "Data Structures from scratch (Linked Lists, Trees, Hash Maps)",
    ],
    codingPrep: {
      focus: "Implementing clean modular logic without relying solely on heavy library shortcuts",
      difficulty: "Medium–Hard",
      sampleTopics: [
        "Matrix traversal & pattern optimization",
        "Booking / Call-center / Railway LLD simulation",
        "Recursion & backtracking",
        "Sliding window & two pointers",
      ],
    },
    hrPrep: [
      "Genuine passion for building software products from scratch",
      "Debugging mindset & ownership of edge cases",
    ],
    suggestedActivities: [
      {
        label: "Hard Code Decoder Challenges",
        moduleId: "code-decoder",
        description: "Practice LRU Cache, BST deletion, and Two-Pointer invariants.",
      },
      {
        label: "Technical Interview Mentor Round",
        moduleId: "interview-mentor",
        description: "Defend modular design & memory/complexity choices.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "amazon",
    name: "Amazon",
    tierLabel: "High-Scale Product & Cloud (SDE)",
    targetReadinessMin: 75,
    overview:
      "Evaluates algorithmic problem solving, time/space complexity optimization, scalable system fundamentals, and Leadership Principles.",
    commonSelectionRounds: [
      "Online Assessment (2 DSA Coding Problems + Work Style / Leadership Simulation)",
      "Technical Interviews (2–3 rounds of live DSA + Core CS/Design)",
      "Bar Raiser / Leadership Principles Behavioral Assessment",
    ],
    aptitudeTopics: [
      "Time-boxed Analytical & Work-Style Scenarios",
      "Complexity Trade-Off Estimation",
    ],
    technicalTopics: [
      "Graphs (BFS/DFS/Shortest Path), Trees, Heaps & Dynamic Programming",
      "Distributed Caching, Load Balancing & Database Scaling",
      "OS Concurrency, Deadlocks & Indexing",
    ],
    codingPrep: {
      focus: "Optimal O(n) / O(n log n) algorithms with crisp verbalization of edge cases",
      difficulty: "Hard",
      sampleTopics: [
        "LRU Cache & Hash+DLL design",
        "Sliding Window & Monotonic Stack",
        "Trees, Tries & Graph Traversals",
        "Greedy & Dynamic Programming",
      ],
    },
    hrPrep: [
      "Prepare STAR examples mapped to Ownership, Customer Obsession, Dive Deep, Bias for Action",
      "Quantify impact with honest real metrics from your work",
    ],
    suggestedActivities: [
      {
        label: "Full Technical & Full-Stack Mock Rounds",
        moduleId: "interview-mentor",
        description: "Practice system design (URL shortener) and follow-up probes.",
      },
      {
        label: "Advanced Core CS Quiz",
        moduleId: "assessment",
        description: "Master CAP theorem, Consistent Hashing, OS concurrency.",
      },
      {
        label: "Optimize Resume ATS Bullets (>= 85)",
        moduleId: "resume",
        description: "Highlight scale, performance gains, and clean architecture.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
  {
    id: "google",
    name: "Google",
    tierLabel: "Big Tech Engineering & Research",
    targetReadinessMin: 80,
    overview:
      "Focuses deeply on algorithmic rigor, clean bug-free code on the first pass, asymptotic proofs, and Googleyness collaboration.",
    commonSelectionRounds: [
      "Online Coding Challenge / Recruiter Technical Screen",
      "Technical Coding Rounds (3–4 rounds covering Graphs, DP, Trees, Strings, Math)",
      "Googleyness & Leadership Behavioral Round",
    ],
    aptitudeTopics: ["Combinatorics, Probability & Algorithmic Math Proofs"],
    technicalTopics: [
      "Graph Algorithms (Dijkstra, Topological Sort, Union-Find)",
      "Dynamic Programming & Tree DP",
      "Concurrency, Memory Model & Clean Code Modularity",
      "System Scalability & API Ergonomics",
    ],
    codingPrep: {
      focus:
        "Proving correctness, writing dry-run tested code, and handling adversarial edge cases",
      difficulty: "Hard",
      sampleTopics: [
        "Graph connectivity & shortest paths",
        "Two-pointer invariants & binary search on answer",
        "Intervals, Heaps & Tries",
        "String matching & DP state compression",
      ],
    },
    hrPrep: [
      "Navigating ambiguity collaboratively without ego",
      "Mentoring peers & driving inclusive engineering discussions",
    ],
    suggestedActivities: [
      {
        label: "Master Hard Code Decoder Invariants",
        moduleId: "code-decoder",
        description: "Verify pointer proofs and zero-bug boundary logic.",
      },
      {
        label: "Score 8+/10 in Technical & HR Interviews",
        moduleId: "interview-mentor",
        description: "Practice explaining proofs and trade-offs out loud.",
      },
    ],
    hiringDisclaimer: COMPANY_GUIDANCE_DISCLAIMER,
  },
];

// ==========================================
// 5. WEEKLY PLACEMENT GOALS ENGINE
// ==========================================
export interface WeeklyPlacementGoal {
  id: string;
  title: string;
  category: string;
  targetModuleId: string;
  completed: boolean;
  isCustom: boolean;
  reason: string;
}

export interface WeeklyGoalsState {
  weekLabel: string;
  goals: WeeklyPlacementGoal[];
  completedCount: number;
  totalCount: number;
  completionPct: number;
}

function getCurrentWeekLabel(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

export function generatePersonalizedWeeklyGoals(
  signalsInput?: StudentSignalSnapshot,
): WeeklyPlacementGoal[] {
  const signals = signalsInput ?? collectStudentSignals();
  const goals: WeeklyPlacementGoal[] = [];

  const emptyCat = { attempted: 0, correct: 0, accuracy: 0 };
  const aptStat = signals.assessments?.byCategory?.aptitude ?? emptyCat;
  const logStat = signals.assessments?.byCategory?.logical ?? emptyCat;
  const aptTotal = aptStat.attempted + logStat.attempted;
  const aptAcc =
    aptTotal > 0 ? Math.round(((aptStat.correct + logStat.correct) / aptTotal) * 100) : 0;

  if (aptTotal < 15 || aptAcc < 75) {
    goals.push({
      id: "wg-aptitude-15",
      title: "Complete 15 quantitative aptitude & logical reasoning questions",
      category: "Aptitude",
      targetModuleId: "assessment",
      completed: false,
      isCustom: false,
      reason:
        aptTotal === 0
          ? "Aptitude assessment data is currently incomplete."
          : `Current aptitude accuracy is ${aptAcc}% across ${aptTotal} questions.`,
    });
  }

  if (signals.decoder.totalSolved < 10) {
    goals.push({
      id: "wg-coding-10",
      title: "Solve 10 programming & debugging problems",
      category: "Coding",
      targetModuleId: "code-decoder",
      completed: false,
      isCustom: false,
      reason: `You have solved ${signals.decoder.totalSolved} Code Decoder challenges so far.`,
    });
  }

  const coreStat = signals.assessments?.byCategory?.["core-cs"] ?? emptyCat;
  const coreAcc = coreStat.accuracy;
  if (coreStat.attempted < 8 || coreAcc < 75) {
    goals.push({
      id: "wg-corecs-revise",
      title: "Revise DBMS & OS and complete Core CS Quiz set",
      category: "Core CS",
      targetModuleId: "assessment",
      completed: false,
      isCustom: false,
      reason:
        coreStat.attempted === 0
          ? "Core CS benchmark has not been attempted yet."
          : `Current Core CS accuracy is ${coreAcc}% — aim for 75%+.`,
    });
  }

  if (
    signals.interviewSummary.totalInterviews === 0 ||
    signals.interviewSummary.averageScoreTen < 7.5
  ) {
    goals.push({
      id: "wg-mock-interview",
      title: "Complete 1 full adaptive mock interview round",
      category: "Interviews",
      targetModuleId: "interview-mentor",
      completed: false,
      isCustom: false,
      reason:
        signals.interviewSummary.totalInterviews === 0
          ? "No mock interview rounds recorded yet."
          : `Current interview avg is ${signals.interviewSummary.averageScoreTen}/10 — target 7.5+/10.`,
    });
  }

  if (
    !signals.hasCustomResume ||
    (signals.resumeAts?.score ?? 0) < 82 ||
    (signals.resumeCompletion?.percentage ?? 0) < 85
  ) {
    goals.push({
      id: "wg-resume-section",
      title: "Improve 1 weak resume section & verify ATS score",
      category: "Resume",
      targetModuleId: "resume",
      completed: false,
      isCustom: false,
      reason: !signals.hasCustomResume
        ? "Customize or upload your resume to establish a real ATS baseline."
        : `ATS score is ${signals.resumeAts?.score ?? 0}/100 with ${signals.resumeCompletion?.incompleteLabels[0] ?? "bullet metrics"} to refine.`,
    });
  }

  if (!signals.commHistory.some((c) => c.isSpoken)) {
    goals.push({
      id: "wg-comm-pitch",
      title: "Record a 60s self-introduction in Communication Coach",
      category: "Communication",
      targetModuleId: "communication",
      completed: false,
      isCustom: false,
      reason: "Establish your real spoken pace (WPM) and filler count.",
    });
  }

  if (goals.length < 4) {
    goals.push({
      id: "wg-company-sprint",
      title: "Complete 1 target company coding & HR drill",
      category: "Company Prep",
      targetModuleId: "placement-tracker",
      completed: false,
      isCustom: false,
      reason: "Maintain weekly momentum across technical & behavioral readiness.",
    });
  }

  return goals.slice(0, 6);
}

interface StoredWeeklyGoalsPayload {
  weekLabel: string;
  goals: WeeklyPlacementGoal[];
}

export function loadWeeklyPlacementGoals(
  email?: string | null,
  forceRegenerate = false,
  signalsInput?: StudentSignalSnapshot,
): WeeklyGoalsState {
  const resolved = normalizeEmail(email);
  const key = `${WEEKLY_GOALS_PREFIX}${safeEmailKey(resolved)}`;
  const weekLabel = getCurrentWeekLabel();

  if (!forceRegenerate) {
    const existing = readJson<StoredWeeklyGoalsPayload | null>(key, null);
    if (existing && Array.isArray(existing.goals) && existing.goals.length > 0) {
      const completedCount = existing.goals.filter((g) => g.completed).length;
      const totalCount = existing.goals.length;
      return {
        weekLabel: existing.weekLabel || weekLabel,
        goals: existing.goals,
        completedCount,
        totalCount,
        completionPct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
      };
    }
  }

  const signals = signalsInput ?? collectStudentSignals(resolved);
  const existingCustom = forceRegenerate
    ? (readJson<StoredWeeklyGoalsPayload | null>(key, null)?.goals.filter((g) => g.isCustom) ?? [])
    : [];
  const generated = generatePersonalizedWeeklyGoals(signals);
  const merged = [...generated, ...existingCustom];
  writeJson(key, { weekLabel, goals: merged });

  const completedCount = merged.filter((g) => g.completed).length;
  const totalCount = merged.length;
  return {
    weekLabel,
    goals: merged,
    completedCount,
    totalCount,
    completionPct: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
  };
}

export function toggleWeeklyGoal(goalId: string, email?: string | null): WeeklyGoalsState {
  const resolved = normalizeEmail(email);
  const current = loadWeeklyPlacementGoals(resolved);
  const updatedGoals = current.goals.map((g) =>
    g.id === goalId ? { ...g, completed: !g.completed } : g,
  );
  writeJson(`${WEEKLY_GOALS_PREFIX}${safeEmailKey(resolved)}`, {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
  });
  const completedCount = updatedGoals.filter((g) => g.completed).length;
  return {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
    completedCount,
    totalCount: updatedGoals.length,
    completionPct:
      updatedGoals.length > 0 ? Math.round((completedCount / updatedGoals.length) * 100) : 0,
  };
}

export function addCustomWeeklyGoal(
  title: string,
  category = "Custom",
  email?: string | null,
): WeeklyGoalsState {
  const trimmed = title.trim();
  const resolved = normalizeEmail(email);
  const current = loadWeeklyPlacementGoals(resolved);
  if (!trimmed) return current;

  const newGoal: WeeklyPlacementGoal = {
    id: `wg-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: trimmed,
    category,
    targetModuleId: "placement-tracker",
    completed: false,
    isCustom: true,
    reason: "Custom student-defined weekly target.",
  };
  const updatedGoals = [...current.goals, newGoal];
  writeJson(`${WEEKLY_GOALS_PREFIX}${safeEmailKey(resolved)}`, {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
  });
  const completedCount = updatedGoals.filter((g) => g.completed).length;
  return {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
    completedCount,
    totalCount: updatedGoals.length,
    completionPct:
      updatedGoals.length > 0 ? Math.round((completedCount / updatedGoals.length) * 100) : 0,
  };
}

export function removeWeeklyGoal(goalId: string, email?: string | null): WeeklyGoalsState {
  const resolved = normalizeEmail(email);
  const current = loadWeeklyPlacementGoals(resolved);
  const updatedGoals = current.goals.filter((g) => g.id !== goalId);
  writeJson(`${WEEKLY_GOALS_PREFIX}${safeEmailKey(resolved)}`, {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
  });
  const completedCount = updatedGoals.filter((g) => g.completed).length;
  return {
    weekLabel: current.weekLabel,
    goals: updatedGoals,
    completedCount,
    totalCount: updatedGoals.length,
    completionPct:
      updatedGoals.length > 0 ? Math.round((completedCount / updatedGoals.length) * 100) : 0,
  };
}

// ==========================================
// 6. PLACEMENT PROGRESS ANALYTICS
// ==========================================
export interface TimeBucketPoint {
  period: string;
  activitiesCompleted: number;
  avgScorePct: number | null;
}

export interface AssessmentHistoryPoint {
  label: string;
  date: string;
  scorePct: number;
  accuracyPct: number;
  category: string;
}

export interface InterviewHistoryPoint {
  label: string;
  date: string;
  scoreTen: number;
  scorePct: number;
  category: string;
}

export interface PlacementAnalyticsData {
  weeklyProgress: TimeBucketPoint[];
  monthlyProgress: TimeBucketPoint[];
  assessmentScoreHistory: AssessmentHistoryPoint[];
  interviewScoreHistory: InterviewHistoryPoint[];
  skillsImproved: Array<{ skill: string; scorePct: number; detail: string }>;
  weakAreas: Array<{ area: string; scorePct: number; detail: string; targetModuleId: string }>;
  completedPreparationActivities: number;
  ongoingPreparationActivities: number;
  totalPreparationActivities: number;
  sectionProgressBars: Array<{
    section: string;
    completed: number;
    ongoing: number;
    pending: number;
    progressPct: number;
  }>;
}

function getIsoWeekKey(dateStr: string): string | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNum = Math.max(1, Math.ceil((days + startOfYear.getDay() + 1) / 7));
  return `${d.getFullYear()} W${String(weekNum).padStart(2, "0")}`;
}

function getMonthKey(dateStr: string): string | null {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function getPlacementAnalyticsData(email?: string | null): PlacementAnalyticsData {
  const signals = collectStudentSignals(email);
  const tracker = loadPlacementTracker(signals.email, signals);

  // Collect real timestamped score/activity events
  const events: Array<{ timestamp: string; scorePct: number | null }> = [];
  for (const a of signals.assessments.history) {
    events.push({ timestamp: a.takenAt, scorePct: a.accuracyPct });
  }
  for (const i of signals.interviews) {
    events.push({ timestamp: i.date, scorePct: Math.round(getSessionScoreTen(i) * 10) });
  }
  for (const dec of Object.values(signals.decoderProgress)) {
    events.push({
      timestamp: dec.solvedAt || dec.lastAttemptAt,
      scorePct: dec.isSolved ? 100 : 0,
    });
  }
  for (const comm of signals.commHistory) {
    events.push({ timestamp: comm.recordedAt, scorePct: comm.scorePct });
  }

  const weeklyMap = new Map<string, { count: number; scores: number[] }>();
  const monthlyMap = new Map<string, { count: number; scores: number[] }>();

  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );

  for (const ev of sortedEvents) {
    const wk = getIsoWeekKey(ev.timestamp);
    if (wk) {
      const entry = weeklyMap.get(wk) ?? { count: 0, scores: [] };
      entry.count += 1;
      if (ev.scorePct !== null) entry.scores.push(ev.scorePct);
      weeklyMap.set(wk, entry);
    }
    const mk = getMonthKey(ev.timestamp);
    if (mk) {
      const entry = monthlyMap.get(mk) ?? { count: 0, scores: [] };
      entry.count += 1;
      if (ev.scorePct !== null) entry.scores.push(ev.scorePct);
      monthlyMap.set(mk, entry);
    }
  }

  const weeklyProgress: TimeBucketPoint[] = Array.from(weeklyMap.entries())
    .slice(-8)
    .map(([period, data]) => ({
      period,
      activitiesCompleted: data.count,
      avgScorePct:
        data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : null,
    }));

  const monthlyProgress: TimeBucketPoint[] = Array.from(monthlyMap.entries())
    .slice(-6)
    .map(([period, data]) => ({
      period,
      activitiesCompleted: data.count,
      avgScorePct:
        data.scores.length > 0
          ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
          : null,
    }));

  // Chronological Assessment Score History (oldest -> newest)
  const assessmentScoreHistory: AssessmentHistoryPoint[] = [...signals.assessments.history]
    .reverse()
    .slice(-12)
    .map((a: AssessmentAttemptRecord, idx) => ({
      label: `#${idx + 1} ${a.title.slice(0, 18)}`,
      date: new Date(a.takenAt).toLocaleDateString(),
      scorePct: a.scorePct,
      accuracyPct: a.accuracyPct,
      category: a.category,
    }));

  // Chronological Interview Score History (oldest -> newest)
  const interviewScoreHistory: InterviewHistoryPoint[] = [...signals.interviews]
    .reverse()
    .slice(-12)
    .map((s, idx) => {
      const scoreTen = getSessionScoreTen(s);
      return {
        label: `Round ${idx + 1}`,
        date: new Date(s.date).toLocaleDateString(),
        scoreTen,
        scorePct: Math.round(scoreTen * 10),
        category: s.category ?? s.role,
      };
    });

  // Skills Improved (strictly real strengths & positive deltas)
  const skillsImproved: PlacementAnalyticsData["skillsImproved"] = [];
  for (const st of signals.assessments.strengths.slice(0, 5)) {
    skillsImproved.push({
      skill: st.topic,
      scorePct: st.accuracy,
      detail: `${st.correct}/${st.attempted} correct in ${st.category} assessments`,
    });
  }
  for (const lang of ["python", "java", "c"] as const) {
    const stat = signals.decoder.byLanguage[lang];
    if (stat.solved > 0 && stat.accuracy >= 70) {
      skillsImproved.push({
        skill: `${lang.toUpperCase()} Debugging`,
        scorePct: stat.accuracy,
        detail: `${stat.solved}/${stat.attempted} challenges solved cleanly`,
      });
    }
  }
  if (
    signals.interviewSummary.improvementDeltaTen !== null &&
    signals.interviewSummary.improvementDeltaTen > 0
  ) {
    skillsImproved.push({
      skill: "Mock Interview Performance",
      scorePct: Math.round(signals.interviewSummary.averageScoreTen * 10),
      detail: `+${signals.interviewSummary.improvementDeltaTen}/10 improvement from previous round`,
    });
  }
  if (signals.hasCustomResume && (signals.resumeAts?.score ?? 0) >= 75) {
    skillsImproved.push({
      skill: "ATS Resume Optimization",
      scorePct: signals.resumeAts?.score ?? 0,
      detail: `Resume ATS compatibility rated ${signals.resumeAts?.grade}`,
    });
  }

  // Weak Areas (strictly real gaps)
  const weakAreas: PlacementAnalyticsData["weakAreas"] = [];
  for (const w of signals.assessments.weaknesses.slice(0, 5)) {
    weakAreas.push({
      area: w.topic,
      scorePct: w.accuracy,
      detail: `${w.correct}/${w.attempted} correct (${w.accuracy}% accuracy)`,
      targetModuleId: "assessment",
    });
  }
  for (const struggle of signals.interviewSummary.repeatedStruggles.slice(0, 3)) {
    weakAreas.push({
      area: `Interview: ${struggle.area}`,
      scorePct: Math.round(struggle.avgScoreTen * 10),
      detail: `Scored ${struggle.avgScoreTen}/10 across ${struggle.occurrences} mock round(s)`,
      targetModuleId: "interview-mentor",
    });
  }
  if (signals.decoder.totalIncorrect > 0) {
    weakAreas.push({
      area: "Code Decoder Unsolved Attempts",
      scorePct: signals.decoder.overallAccuracy,
      detail: `${signals.decoder.totalIncorrect} attempted problem(s) not yet solved correctly`,
      targetModuleId: "code-decoder",
    });
  }
  if (signals.hasCustomResume && (signals.resumeAts?.score ?? 100) < 75) {
    weakAreas.push({
      area: "Resume ATS Score",
      scorePct: signals.resumeAts?.score ?? 0,
      detail:
        signals.resumeAts?.deductions[0]?.reason || "Needs stronger impact bullets & keywords.",
      targetModuleId: "resume",
    });
  }

  const sectionProgressBars = tracker.sections.map((s) => ({
    section: s.title.replace(" Preparation", "").replace(" Subjects", "").replace(" Skills", ""),
    completed: s.completedCount,
    ongoing: s.ongoingCount,
    pending: s.pendingCount,
    progressPct: s.progressPct,
  }));

  return {
    weeklyProgress,
    monthlyProgress,
    assessmentScoreHistory,
    interviewScoreHistory,
    skillsImproved,
    weakAreas,
    completedPreparationActivities: tracker.completedCount,
    ongoingPreparationActivities: tracker.ongoingCount,
    totalPreparationActivities: tracker.totalActivities,
    sectionProgressBars,
  };
}

// ==========================================
// 7. AI PLACEMENT MENTOR ENGINE
// ==========================================
export interface MentorActionRecommendation {
  priority: "High" | "Medium" | "Next";
  title: string;
  reason: string;
  targetModuleId: string;
}

export interface MentorCompanyRecommendation {
  companyId: string;
  companyName: string;
  fitStatus: "Ready to Target" | "Near Target" | "Build Foundation First";
  reason: string;
}

export interface PlacementMentorReport {
  summary: string;
  weaknessesIdentified: string[];
  nextPracticeActions: MentorActionRecommendation[];
  recommendedCompanyPaths: MentorCompanyRecommendation[];
  improvementStrategies: string[];
}

export function generatePlacementMentorReport(email?: string | null): PlacementMentorReport {
  const readiness = calculatePlacementReadiness(email);
  const analytics = getPlacementAnalyticsData(email);
  const signals = collectStudentSignals(email);

  const incompleteCats = readiness.categories.filter((c) => c.status === "Incomplete");
  const partialCats = readiness.categories.filter((c) => c.status === "Partial");
  const completeCats = readiness.categories.filter((c) => c.status === "Complete");

  let summary = "";
  if (readiness.overallScore === 0) {
    summary =
      "Your placement readiness is at 0/100 because no real assessment, coding, interview, communication, or saved resume data has been recorded yet. Start with a quick baseline across Aptitude, Code Decoder, and Resume Builder to unlock accurate diagnostics.";
  } else if (incompleteCats.length > 0) {
    summary = `Your current Placement Readiness is ${readiness.overallScore}/100 (${readiness.readinessTier}). You have completed ${completeCats.length}/8 readiness dimensions (${partialCats.length} partial), while ${incompleteCats.map((c) => c.label).join(", ")} remain incomplete and currently contribute 0 points.`;
  } else {
    summary = `Your Placement Readiness is ${readiness.overallScore}/100 (${readiness.readinessTier}) with active evidence across all 8 dimensions. Focus on lifting lower-scoring categories and practicing Hard-tier company rounds.`;
  }

  const weaknessesIdentified: string[] = [];
  for (const w of analytics.weakAreas.slice(0, 4)) {
    weaknessesIdentified.push(`${w.area}: ${w.detail}`);
  }
  for (const inc of incompleteCats.slice(0, 4)) {
    weaknessesIdentified.push(`${inc.label} is Incomplete — no recorded evidence yet.`);
  }

  const nextPracticeActions: MentorActionRecommendation[] = [];

  if (!signals.hasCustomResume || (signals.resumeAts?.score ?? 0) < 75) {
    nextPracticeActions.push({
      priority: "High",
      title: !signals.hasCustomResume
        ? "Create or Upload Your Resume in Resume Builder"
        : `Raise Resume ATS Score from ${signals.resumeAts?.score}/100 to 80+`,
      reason: !signals.hasCustomResume
        ? "Resume Quality (10 pts) is currently Incomplete."
        : signals.resumeAts?.suggestions[0] ||
          "Add missing sections and measurable project bullets.",
      targetModuleId: "resume",
    });
  }

  if (signals.assessments.byCategory.aptitude.attempted < 5) {
    nextPracticeActions.push({
      priority: "High",
      title: "Take Quantitative Aptitude & Logical Reasoning Practice Sets",
      reason: "Establishes your real Aptitude benchmark (15 pts weight) for screening tests.",
      targetModuleId: "assessment",
    });
  } else if (analytics.weakAreas.some((w) => w.targetModuleId === "assessment")) {
    const firstWeak = analytics.weakAreas.find((w) => w.targetModuleId === "assessment")!;
    nextPracticeActions.push({
      priority: "High",
      title: `Drill Weak Assessment Topic: ${firstWeak.area}`,
      reason: firstWeak.detail,
      targetModuleId: "assessment",
    });
  }

  if (signals.decoder.totalSolved < 3) {
    nextPracticeActions.push({
      priority: "High",
      title: "Solve 3 Debugging Challenges in Code Decoder",
      reason:
        "Unlocks your Coding Beginner milestone and populates Code Decoder & Coding readiness.",
      targetModuleId: "code-decoder",
    });
  }

  if (signals.interviewSummary.totalInterviews === 0) {
    nextPracticeActions.push({
      priority: "Medium",
      title: "Complete Your First Adaptive AI Mock Interview",
      reason: "Captures real technical correctness, confidence, and speaking cadence metrics.",
      targetModuleId: "interview-mentor",
    });
  } else if (signals.interviewSummary.averageScoreTen < 7.5) {
    nextPracticeActions.push({
      priority: "Medium",
      title: "Run Another Technical / Core CS Interview Round",
      reason: `Current interview avg is ${signals.interviewSummary.averageScoreTen}/10 — target >= 7.5/10.`,
      targetModuleId: "interview-mentor",
    });
  }

  if (!signals.commHistory.some((c) => c.isSpoken)) {
    nextPracticeActions.push({
      priority: "Next",
      title: "Record a 60s Pitch in Communication Coach",
      reason: "Measures actual spoken WPM and filler words for HR & GD rounds.",
      targetModuleId: "communication",
    });
  }

  // Company recommendations grounded in current readiness
  const recommendedCompanyPaths: MentorCompanyRecommendation[] = COMPANY_PREP_GUIDES.map((co) => {
    let fitStatus: MentorCompanyRecommendation["fitStatus"] = "Build Foundation First";
    let reason = `Needs ~${co.targetReadinessMin}+ readiness; currently ${readiness.overallScore}/100.`;

    if (readiness.overallScore >= co.targetReadinessMin + 8) {
      fitStatus = "Ready to Target";
      reason = `Your ${readiness.overallScore}/100 readiness aligns well with ${co.name} prep benchmarks.`;
    } else if (readiness.overallScore >= co.targetReadinessMin - 10) {
      fitStatus = "Near Target";
      reason = `Close to ${co.name} benchmark (${co.targetReadinessMin}+). Focus on ${co.technicalTopics[0] ?? "core rounds"}.`;
    }
    return {
      companyId: co.id,
      companyName: co.name,
      fitStatus,
      reason,
    };
  }).slice(0, 6);

  const improvementStrategies: string[] = [];
  if (incompleteCats.length >= 3) {
    improvementStrategies.push(
      "Phase 1 (Days 1–7): Eliminate Incomplete dimensions first — complete 1 Aptitude quiz, 1 Core CS quiz, 3 Code Decoder problems, 1 Mock Interview, and save your Resume.",
    );
  }
  if (analytics.weakAreas.length > 0) {
    improvementStrategies.push(
      `Targeted Remediation: Dedicate 20 minutes daily to your weakest recorded topics (${analytics.weakAreas
        .slice(0, 2)
        .map((w) => w.area)
        .join(", ")}) before attempting mixed mocks.`,
    );
  }
  improvementStrategies.push(
    "Interview Cadence Strategy: Practice answering every technical prompt in 4 steps — Core Definition, Mechanism/Data Structure, Complexity/Trade-Off, and Real Project Example — targeting 120–150 WPM.",
  );
  improvementStrategies.push(
    "Company Alignment Rule: Master service-track speed & CS fundamentals (TCS/Infosys/Accenture) while steadily ramping Hard DSA & LLD problems for Zoho, Amazon, and Google.",
  );

  return {
    summary,
    weaknessesIdentified,
    nextPracticeActions: nextPracticeActions.slice(0, 5),
    recommendedCompanyPaths,
    improvementStrategies,
  };
}

// ==========================================
// 8. PLACEMENT MILESTONES (REAL ACTIVITY UNLOCKS)
// ==========================================
export interface PlacementMilestone {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressPct: number;
  criteriaLabel: string;
  targetModuleId: string;
}

export function evaluatePlacementMilestones(email?: string | null): PlacementMilestone[] {
  const signals = collectStudentSignals(email);
  const readiness = calculatePlacementReadiness(signals.email);
  const tracker = loadPlacementTracker(signals.email, signals);

  // 1. First Assessment Completed
  const assessmentsDone = signals.assessments.totalAssessments;
  const m1Unlocked = assessmentsDone >= 1;

  // 2. First Mock Interview Completed
  const interviewsDone = signals.interviewSummary.totalInterviews;
  const m2Unlocked = interviewsDone >= 1;

  // 3. Resume Ready
  const atsScore = signals.resumeAts?.score ?? 0;
  const resumeComp = signals.resumeCompletion?.percentage ?? 0;
  const m3Unlocked = signals.hasCustomResume && atsScore >= 75 && resumeComp >= 75;
  const m3Pct = !signals.hasCustomResume
    ? 0
    : Math.min(
        100,
        Math.round((Math.min(1, atsScore / 75) * 0.6 + Math.min(1, resumeComp / 75) * 0.4) * 100),
      );

  // 4. Coding Beginner
  const solvedCount = signals.decoder.totalSolved;
  const codingTopics = new Set([
    "C",
    "C++",
    "Java",
    "Python",
    "SQL",
    "Data Structures & Algorithms",
  ]);
  const codingAttempted = signals.assessments.topicStats
    .filter((t) => codingTopics.has(t.topic))
    .reduce((a, t) => a + t.attempted, 0);
  const m4Unlocked = solvedCount >= 3 || codingAttempted >= 5;
  const m4Pct = m4Unlocked
    ? 100
    : Math.min(95, Math.round(Math.max(solvedCount / 3, codingAttempted / 5) * 100));

  // 5. Technical Interview Ready
  const techQs =
    signals.assessments.byCategory.technical.attempted +
    signals.assessments.byCategory["core-cs"].attempted;
  const techCorrect =
    signals.assessments.byCategory.technical.correct +
    signals.assessments.byCategory["core-cs"].correct;
  const techAcc = techQs > 0 ? Math.round((techCorrect / techQs) * 100) : 0;

  const techInterviews = signals.interviews.filter(
    (s) =>
      s.category === "Technical Interview" ||
      s.category === "Full Stack Developer Interview" ||
      s.category === "Core Computer Science Interview",
  );
  const bestTechInterview = techInterviews.reduce(
    (best, s) => Math.max(best, getSessionScoreTen(s)),
    0,
  );
  const m5Unlocked =
    techQs >= 5 && techAcc >= 70 && techInterviews.length >= 1 && bestTechInterview >= 7.0;
  const m5Pct = m5Unlocked
    ? 100
    : Math.min(
        95,
        Math.round(
          (Math.min(1, techQs / 5) * 0.35 +
            Math.min(1, techAcc / 70) * 0.25 +
            Math.min(1, techInterviews.length) * 0.2 +
            Math.min(1, bestTechInterview / 7.0) * 0.2) *
            100,
        ),
      );

  // 6. Placement Preparation Completed
  const trackerRatio =
    tracker.totalActivities > 0 ? tracker.completedCount / tracker.totalActivities : 0;
  const m6Unlocked =
    readiness.overallScore >= 80 && readiness.incompleteCount === 0 && trackerRatio >= 0.75;
  const m6Pct = m6Unlocked
    ? 100
    : Math.min(
        95,
        Math.round(
          (Math.min(1, readiness.overallScore / 80) * 0.5 +
            ((8 - readiness.incompleteCount) / 8) * 0.25 +
            Math.min(1, trackerRatio / 0.75) * 0.25) *
            100,
        ),
      );

  return [
    {
      id: "ms-first-assessment",
      title: "First Assessment Completed",
      description: "Complete your first Aptitude, Logical, Technical, or Core CS assessment.",
      unlocked: m1Unlocked,
      progressPct: m1Unlocked ? 100 : 0,
      criteriaLabel: m1Unlocked
        ? `${assessmentsDone} assessment(s) completed`
        : "0 / 1 assessments completed",
      targetModuleId: "assessment",
    },
    {
      id: "ms-first-interview",
      title: "First Mock Interview Completed",
      description: "Finish an interactive mock interview round in Weekly AI Interview Mentor.",
      unlocked: m2Unlocked,
      progressPct: m2Unlocked ? 100 : 0,
      criteriaLabel: m2Unlocked
        ? `${interviewsDone} mock interview(s) completed`
        : "0 / 1 mock interviews completed",
      targetModuleId: "interview-mentor",
    },
    {
      id: "ms-resume-ready",
      title: "Resume Ready",
      description: "Save or upload a customized resume with >= 75 ATS score and >= 75% completion.",
      unlocked: m3Unlocked,
      progressPct: m3Unlocked ? 100 : m3Pct,
      criteriaLabel: signals.hasCustomResume
        ? `ATS ${atsScore}/100 • ${resumeComp}% complete (need 75+ & 75%+)`
        : "No customized resume saved yet",
      targetModuleId: "resume",
    },
    {
      id: "ms-coding-beginner",
      title: "Coding Beginner",
      description:
        "Solve at least 3 Code Decoder debugging challenges or attempt 5 coding questions.",
      unlocked: m4Unlocked,
      progressPct: m4Pct,
      criteriaLabel: `${solvedCount}/3 Code Decoder solved • ${codingAttempted}/5 coding Qs`,
      targetModuleId: "code-decoder",
    },
    {
      id: "ms-tech-interview-ready",
      title: "Technical Interview Ready",
      description:
        "Achieve >= 70% across 5+ Technical/Core CS questions AND >= 7.0/10 in a Technical/Core CS mock interview.",
      unlocked: m5Unlocked,
      progressPct: m5Pct,
      criteriaLabel: `${techQs}/5 tech Qs (${techAcc}% acc) • Best tech mock: ${bestTechInterview}/10`,
      targetModuleId: "interview-mentor",
    },
    {
      id: "ms-placement-completed",
      title: "Placement Preparation Completed",
      description:
        "Reach >= 80/100 Placement Readiness with all 8 dimensions active and >= 75% tracker activities completed.",
      unlocked: m6Unlocked,
      progressPct: m6Pct,
      criteriaLabel: `Readiness ${readiness.overallScore}/80 • ${8 - readiness.incompleteCount}/8 dimensions • ${Math.round(trackerRatio * 100)}%/75% tracker`,
      targetModuleId: "placement-tracker",
    },
  ];
}
