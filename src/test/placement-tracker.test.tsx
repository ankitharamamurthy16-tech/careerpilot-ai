import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import {
  buildAttemptRecord,
  assessmentQuestionBank,
  saveAssessmentAttempt,
} from "@/lib/assessments";
import { saveDecoderProgress } from "@/lib/code-decoder-data";
import { saveInterviewSession, type InterviewSession } from "@/lib/interview-engine";
import { saveResumeToStorage, createStarterResume } from "@/lib/resume-engine";
import {
  COMPANY_PREP_GUIDES,
  addCustomWeeklyGoal,
  calculatePlacementReadiness,
  evaluatePlacementMilestones,
  generatePlacementMentorReport,
  getPlacementAnalyticsData,
  loadPlacementTracker,
  loadWeeklyPlacementGoals,
  recordCommunicationAttempt,
  setTrackerActivityStatus,
  toggleWeeklyGoal,
} from "@/lib/placement-engine";
import { PlacementTrackerModule } from "@/components/modules/PlacementTrackerModule";
import { Route as DashboardRoute } from "@/routes/app.index";

// Stub Link from @tanstack/react-router so component tests render cleanly without full RouterProvider
vi.mock("@tanstack/react-router", async () => {
  const actual =
    await vi.importActual<typeof import("@tanstack/react-router")>("@tanstack/react-router");
  return {
    ...actual,
    Link: ({
      children,
      className,
      to,
    }: {
      children: React.ReactNode;
      className?: string;
      to?: string;
    }) => (
      <a href={to || "#"} className={className}>
        {children}
      </a>
    ),
  };
});

const TEST_STUDENT = {
  name: "Priya Nair",
  email: "priya.test@student.edu",
  college: "NIT Trichy",
  branch: "Computer Science",
  year: "4th Year",
};

function loginTestStudent() {
  localStorage.setItem("cp_student", JSON.stringify(TEST_STUDENT));
}

describe("Smart Placement Tracker & Placement Readiness Dashboard", () => {
  beforeEach(() => {
    localStorage.clear();
    loginTestStudent();
  });

  describe("1. Placement Readiness Score & Missing-Data Safeguards", () => {
    it("starts at 0/100 with all 8 categories marked Incomplete when student has no data", () => {
      const readiness = calculatePlacementReadiness(TEST_STUDENT.email);

      expect(readiness.overallScore).toBe(0);
      expect(readiness.readinessTier).toBe("Not Started");
      expect(readiness.categories).toHaveLength(8);
      expect(readiness.incompleteCount).toBe(8);
      expect(readiness.completedCount).toBe(0);
      expect(readiness.categories.every((c) => c.status === "Incomplete")).toBe(true);
      expect(readiness.categories.every((c) => c.rawScorePct === null && c.earned === 0)).toBe(
        true,
      );
    });

    it("never computes 100% readiness when only partial categories have data", () => {
      const aptQs = assessmentQuestionBank.filter((q) => q.category === "aptitude").slice(0, 4);
      const answers: Record<string, number> = {};
      aptQs.forEach((q) => {
        answers[q.id] = q.answer;
      });
      saveAssessmentAttempt(
        buildAttemptRecord({
          id: "attempt-apt-1",
          assessmentId: "apt-set-1",
          category: "aptitude",
          title: "Aptitude Quick Drill",
          questions: aptQs,
          answers,
          timeTakenSec: 90,
        }),
      );

      const readiness = calculatePlacementReadiness(TEST_STUDENT.email);
      const aptCat = readiness.categories.find((c) => c.key === "aptitude")!;
      const interviewCat = readiness.categories.find((c) => c.key === "mock-interview")!;

      expect(aptCat.status).toBe("Partial");
      expect(aptCat.rawScorePct).toBe(100);
      expect(aptCat.earned).toBeGreaterThan(0);
      expect(interviewCat.status).toBe("Incomplete");
      expect(readiness.overallScore).toBeGreaterThan(0);
      expect(readiness.overallScore).toBeLessThan(100);
    });

    it("aggregates real data across assessments, Code Decoder, interviews, communication, resume & tracker", () => {
      // Aptitude (10 Qs)
      const aptQs = assessmentQuestionBank.filter((q) => q.category === "aptitude").slice(0, 10);
      const aptAnswers: Record<string, number> = {};
      aptQs.forEach((q, idx) => {
        aptAnswers[q.id] = idx < 8 ? q.answer : (q.answer + 1) % 4;
      });
      saveAssessmentAttempt(
        buildAttemptRecord({
          id: "att-apt-10",
          assessmentId: "apt-10",
          category: "aptitude",
          title: "Aptitude 10",
          questions: aptQs,
          answers: aptAnswers,
          timeTakenSec: 200,
        }),
      );

      // Technical + Core CS (10 Qs)
      const techQs = assessmentQuestionBank
        .filter((q) => q.category === "technical" || q.category === "core-cs")
        .slice(0, 10);
      const techAnswers: Record<string, number> = {};
      techQs.forEach((q, idx) => {
        techAnswers[q.id] = idx < 9 ? q.answer : (q.answer + 1) % 4;
      });
      saveAssessmentAttempt(
        buildAttemptRecord({
          id: "att-tech-10",
          assessmentId: "tech-10",
          category: "technical",
          title: "Technical 10",
          questions: techQs,
          answers: techAnswers,
          timeTakenSec: 220,
        }),
      );

      // Code Decoder (5 solved)
      const decoderIds = [
        "py-easy-offbyone",
        "py-easy-dictlookup",
        "py-med-binarysearch",
        "java-easy-stringequality",
        "py-hard-lrucache",
      ];
      decoderIds.forEach((qid) => {
        saveDecoderProgress(
          qid,
          "python",
          "Medium",
          "fixed code",
          true,
          false,
          false,
          false,
          TEST_STUDENT.email,
        );
      });

      // Mock Interview
      const mockSession: InterviewSession = {
        id: "int-session-1",
        weekNumber: 1,
        date: new Date().toISOString(),
        role: "Technical Interview",
        category: "Technical Interview",
        completionStatus: "Completed",
        questionId: "tech-1",
        question: "Design a URL shortener",
        answerText: "Use Base62 encoding, Redis LRU cache, and database replicas.",
        isSpoken: true,
        durationSec: 45,
        overallScoreTen: 8.2,
        evaluation: {
          score: 82,
          overallScoreTen: 8.2,
          dimensions: {
            technicalCorrectness: 8.5,
            communicationSkills: 8.0,
            confidence: 8.0,
            relevance: 8.5,
            answerStructure: 8.0,
          },
          verdict: "Correct",
          feedbackSummary: "Strong architecture points.",
          detectedConcepts: ["Base62", "Redis"],
          missedConcepts: [],
          speakingPaceWpm: 132,
          paceVerdict: "Optimal",
          grammarScore: 85,
          clarityScore: 84,
          relevanceScore: 85,
          structureScore: 80,
          starComponentsFound: { situation: true, task: true, action: true, result: true },
          fillerWordCount: 0,
          fillerWordsDetected: [],
          strengths: ["Clear structure"],
          improvements: [],
          recommendedDrill: "Hard system design probes",
        },
      };
      saveInterviewSession(mockSession);

      // Communication Coach drill
      recordCommunicationAttempt(
        {
          drill: "self-intro",
          wordCount: 55,
          fillerCount: 0,
          wpm: 135,
          isSpoken: true,
          durationSec: 25,
          hasStructure: true,
        },
        TEST_STUDENT.email,
      );

      // Saved Resume
      saveResumeToStorage(createStarterResume(TEST_STUDENT), "modern", TEST_STUDENT.email);

      // Tracker progress
      setTrackerActivityStatus("proj-1", "completed", TEST_STUDENT.email);

      const readiness = calculatePlacementReadiness(TEST_STUDENT.email);
      expect(readiness.incompleteCount).toBe(0);
      expect(readiness.overallScore).toBeGreaterThanOrEqual(65);
      expect(readiness.calculationExplanation).toContain("8 weighted categories");
    });

    it("handles legacy or incomplete interview sessions missing dimensionAverages and evaluation.dimensions without crashing", () => {
      // Simulate legacy interview sessions where dimensionAverages and evaluation.dimensions are undefined
      localStorage.setItem(
        "cp_interview_history",
        JSON.stringify([
          null,
          {
            id: "legacy-no-eval",
            weekNumber: 1,
            date: new Date().toISOString(),
            role: "Technical Interview",
            questionId: "q-1",
            question: "Explain indexing",
            answerText: "B-tree indexes speed up lookups",
            isSpoken: false,
            durationSec: 20,
          },
          {
            id: "legacy-no-dims",
            weekNumber: 1,
            date: new Date().toISOString(),
            role: "HR Interview",
            questionId: "q-2",
            question: "Tell me about yourself",
            answerText: "I am a final year CS student",
            isSpoken: true,
            durationSec: 30,
            evaluation: {
              score: 76,
              clarityScore: 80,
              grammarScore: 84,
              relevanceScore: 75,
              structureScore: 70,
              speakingPaceWpm: 130,
              paceVerdict: "Optimal",
              fillerWordCount: 0,
              fillerWordsDetected: [],
              strengths: [],
              improvements: [],
              recommendedDrill: "Practice STAR",
            },
          },
        ]),
      );

      const readiness = calculatePlacementReadiness(TEST_STUDENT.email);
      const commCat = readiness.categories.find((c) => c.key === "communication")!;

      expect(commCat.status).toBe("Partial");
      expect(commCat.rawScorePct).toBe(82);
      expect(Number.isFinite(commCat.earned)).toBe(true);
      expect(readiness.overallScore).toBeGreaterThan(0);

      // When only a session with NO evaluation/communication metrics exists, Communication stays Incomplete
      localStorage.setItem(
        "cp_interview_history",
        JSON.stringify([
          {
            id: "in-progress-empty",
            weekNumber: 1,
            date: new Date().toISOString(),
            role: "General Placement Interview",
            questionId: "q-3",
            question: "Explain OOP",
            answerText: "",
            isSpoken: false,
            durationSec: 0,
          },
        ]),
      );

      const emptyCommReadiness = calculatePlacementReadiness(TEST_STUDENT.email);
      const emptyCommCat = emptyCommReadiness.categories.find((c) => c.key === "communication")!;
      expect(emptyCommCat.status).toBe("Incomplete");
      expect(emptyCommCat.rawScorePct).toBeNull();
      expect(emptyCommCat.earned).toBe(0);
    });

    it("handles missing cp_student profile and corrupted stored data gracefully", () => {
      localStorage.clear();
      localStorage.setItem("cp_student", "{invalid-json");
      localStorage.setItem("cp_interview_history", "not-an-array");
      localStorage.setItem("cp_assessment_history_v2", "[null, {}]");

      const readiness = calculatePlacementReadiness();
      expect(readiness.overallScore).toBe(0);
      expect(readiness.readinessTier).toBe("Not Started");
      expect(readiness.categories).toHaveLength(8);
    });
  });

  describe("2. 8-Section Placement Preparation Tracker & Persistence", () => {
    it("contains all 8 required sections and persists Completed/Ongoing/Pending updates", () => {
      const initial = loadPlacementTracker(TEST_STUDENT.email);
      expect(initial.sections).toHaveLength(8);
      expect(initial.sections.map((s) => s.title)).toEqual([
        "Aptitude Preparation",
        "Programming Skills",
        "Core CS Subjects",
        "Technical Interviews",
        "HR Interviews",
        "Communication Skills",
        "Resume Preparation",
        "Projects and Internships",
      ]);
      expect(initial.pendingCount).toBe(32);
      expect(initial.completedCount).toBe(0);

      setTrackerActivityStatus("apt-1", "ongoing", TEST_STUDENT.email);
      setTrackerActivityStatus("res-1", "completed", TEST_STUDENT.email);

      const reloaded = loadPlacementTracker(TEST_STUDENT.email);
      expect(reloaded.ongoingCount).toBe(1);
      expect(reloaded.completedCount).toBe(1);
      expect(reloaded.pendingCount).toBe(30);
    });
  });

  describe("3. 9-Company Preparation Catalog & Disclaimers", () => {
    it("covers all 9 required companies with rounds, topics, coding/HR prep & hiring disclaimers", () => {
      const names = COMPANY_PREP_GUIDES.map((c) => c.name);
      expect(names).toEqual([
        "TCS",
        "Infosys",
        "Wipro",
        "Accenture",
        "Cognizant",
        "Capgemini",
        "Zoho",
        "Amazon",
        "Google",
      ]);

      for (const co of COMPANY_PREP_GUIDES) {
        expect(co.commonSelectionRounds.length).toBeGreaterThanOrEqual(2);
        expect(co.aptitudeTopics.length).toBeGreaterThan(0);
        expect(co.technicalTopics.length).toBeGreaterThan(0);
        expect(co.codingPrep.sampleTopics.length).toBeGreaterThan(0);
        expect(co.hrPrep.length).toBeGreaterThan(0);
        expect(co.suggestedActivities.length).toBeGreaterThan(0);
        expect(co.hiringDisclaimer).toMatch(/general historical preparation guidance/i);
        expect(co.hiringDisclaimer).toMatch(/official careers portal/i);
      }
    });
  });

  describe("4. Weekly Goals, Progress Analytics, AI Mentor & Milestones", () => {
    it("persists weekly goals toggles and custom goals across reloads", () => {
      const initial = loadWeeklyPlacementGoals(TEST_STUDENT.email);
      expect(initial.goals.length).toBeGreaterThanOrEqual(4);
      const firstId = initial.goals[0]!.id;

      toggleWeeklyGoal(firstId, TEST_STUDENT.email);
      addCustomWeeklyGoal("Solve 5 dynamic programming problems", "Coding", TEST_STUDENT.email);

      const reloaded = loadWeeklyPlacementGoals(TEST_STUDENT.email);
      expect(reloaded.goals.find((g) => g.id === firstId)?.completed).toBe(true);
      expect(reloaded.goals.some((g) => g.title === "Solve 5 dynamic programming problems")).toBe(
        true,
      );
    });

    it("unlocks milestones strictly based on real completed student activities", () => {
      const emptyMilestones = evaluatePlacementMilestones(TEST_STUDENT.email);
      expect(emptyMilestones).toHaveLength(6);
      expect(emptyMilestones.every((m) => !m.unlocked)).toBe(true);

      // Complete 1 aptitude assessment -> unlocks First Assessment Completed only
      const aptQs = assessmentQuestionBank.filter((q) => q.category === "aptitude").slice(0, 2);
      saveAssessmentAttempt(
        buildAttemptRecord({
          id: "ms-apt-1",
          assessmentId: "apt-2",
          category: "aptitude",
          title: "Mini Aptitude",
          questions: aptQs,
          answers: { [aptQs[0]!.id]: aptQs[0]!.answer, [aptQs[1]!.id]: aptQs[1]!.answer },
          timeTakenSec: 40,
        }),
      );

      // Solve 3 Code Decoder challenges -> unlocks Coding Beginner
      ["py-easy-offbyone", "py-easy-dictlookup", "java-easy-stringequality"].forEach((qid) => {
        saveDecoderProgress(
          qid,
          "python",
          "Easy",
          "fixed",
          true,
          false,
          false,
          false,
          TEST_STUDENT.email,
        );
      });

      const updated = evaluatePlacementMilestones(TEST_STUDENT.email);
      expect(updated.find((m) => m.id === "ms-first-assessment")?.unlocked).toBe(true);
      expect(updated.find((m) => m.id === "ms-coding-beginner")?.unlocked).toBe(true);
      expect(updated.find((m) => m.id === "ms-first-interview")?.unlocked).toBe(false);
      expect(updated.find((m) => m.id === "ms-resume-ready")?.unlocked).toBe(false);
    });

    it("produces real analytics and honest AI mentor feedback without fake data", () => {
      const analytics = getPlacementAnalyticsData(TEST_STUDENT.email);
      expect(analytics.assessmentScoreHistory).toHaveLength(0);
      expect(analytics.interviewScoreHistory).toHaveLength(0);
      expect(analytics.weeklyProgress).toHaveLength(0);

      const mentor = generatePlacementMentorReport(TEST_STUDENT.email);
      expect(mentor.summary).toContain("0/100");
      expect(mentor.weaknessesIdentified.length).toBeGreaterThan(0);
      expect(mentor.nextPracticeActions.length).toBeGreaterThan(0);
      expect(mentor.recommendedCompanyPaths.length).toBeGreaterThan(0);
    });
  });

  describe("5. PlacementTrackerModule UI Integration & Persistence", () => {
    it("renders Readiness Breakdown, Prep Tracker, Company Prep & Weekly Goals tabs interactively", () => {
      const { unmount } = render(<PlacementTrackerModule />);

      expect(screen.getByText("Placement Readiness Score")).toBeInTheDocument();
      expect(screen.getByText("AI Placement Mentor")).toBeInTheDocument();
      expect(screen.getByTestId("readiness-cat-aptitude")).toHaveTextContent("Incomplete");

      // Switch to Prep Tracker (8) and mark an activity completed
      fireEvent.click(screen.getByRole("button", { name: /Prep Tracker \(8\)/i }));
      expect(screen.getByText("8-Section Placement Preparation Tracker")).toBeInTheDocument();
      const aptSection = screen.getByTestId("tracker-section-aptitude");
      const completedButtons = within(aptSection).getAllByRole("button", { name: "completed" });
      fireEvent.click(completedButtons[0]!);
      expect(within(aptSection).getByText("1 Completed")).toBeInTheDocument();

      // Switch to Company Prep (9) and verify disclaimer + Zoho switching
      fireEvent.click(screen.getByRole("button", { name: /Company Prep \(9\)/i }));
      expect(
        screen.getByText(/General Preparation Guidance vs\. Verified Current Hiring Requirements/i),
      ).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /Zoho/i }));
      expect(screen.getByText("Zoho Placement Preparation Guide")).toBeInTheDocument();

      // Switch to Milestones tab
      fireEvent.click(screen.getByRole("button", { name: /Milestones/i }));
      expect(screen.getByText("First Assessment Completed")).toBeInTheDocument();
      expect(screen.getByText("Placement Preparation Completed")).toBeInTheDocument();

      unmount();

      // Remount and verify tracker completion persisted
      render(<PlacementTrackerModule />);
      fireEvent.click(screen.getByRole("button", { name: /Prep Tracker \(8\)/i }));
      const aptSectionReloaded = screen.getByTestId("tracker-section-aptitude");
      expect(within(aptSectionReloaded).getByText("1 Completed")).toBeInTheDocument();
    });
  });

  describe("6. Dashboard Route Integration & Resilience", () => {
    it("renders Dashboard without crashing when student data is missing or interview history lacks evaluation.dimensions", () => {
      const DashboardComponent = DashboardRoute.options.component!;

      // Case 1: Completely missing user profile & no stored data
      localStorage.clear();
      const { unmount } = render(<DashboardComponent />);
      expect(screen.getByText(/Good day, Student/i)).toBeInTheDocument();
      expect(screen.getByText(/0 \/ 100/)).toBeInTheDocument();
      unmount();

      // Case 2: Logged-in user with legacy interview session lacking dimensionAverages & evaluation.dimensions
      loginTestStudent();
      localStorage.setItem(
        "cp_interview_history",
        JSON.stringify([
          {
            id: "dash-legacy-1",
            weekNumber: 2,
            date: new Date().toISOString(),
            role: "Technical Interview",
            questionId: "tech-legacy",
            question: "Explain ACID properties",
            answerText: "Atomicity, Consistency, Isolation, Durability",
            isSpoken: false,
            durationSec: 35,
            evaluation: {
              score: 80,
              clarityScore: 80,
              grammarScore: 80,
              relevanceScore: 80,
              structureScore: 78,
              speakingPaceWpm: 125,
              paceVerdict: "Optimal",
              fillerWordCount: 0,
              fillerWordsDetected: [],
              strengths: ["Concise"],
              improvements: [],
              recommendedDrill: "Deepen isolation levels",
            },
          },
        ]),
      );

      render(<DashboardComponent />);
      expect(screen.getByText(/Good day, Priya/i)).toBeInTheDocument();
      expect(
        screen.getByText(/Smart Placement Tracker & Readiness Dashboard/i),
      ).toBeInTheDocument();
    });
  });
});
