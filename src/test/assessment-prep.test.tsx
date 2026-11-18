import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to?: string }) => (
    <a href={to ?? "#"} className={className}>
      {children}
    </a>
  ),
}));

import {
  assessmentQuestionBank,
  buildAttemptRecord,
  clearAssessmentHistory,
  getAssessmentHistory,
  getPerformanceAnalytics,
  getQuestionsByCategory,
  pickAdaptiveDifficulty,
  saveAssessmentAttempt,
} from "@/lib/assessments";
import { AssessmentModule } from "@/components/modules/AssessmentModule";

describe("Upgraded Assessment & Placement Preparation System", () => {
  beforeEach(() => {
    localStorage.clear();
    clearAssessmentHistory();
    vi.restoreAllMocks();
  });

  describe("1. Question Bank Completeness & Coverage", () => {
    it("covers all required Quantitative Aptitude topics with 4 options and explanations", () => {
      const aptQs = getQuestionsByCategory("aptitude");
      const topics = new Set(aptQs.map((q) => q.topic));
      expect(topics).toEqual(
        new Set([
          "Percentages",
          "Profit & Loss",
          "Time & Work",
          "Speed & Distance",
          "Averages",
          "Probability",
        ]),
      );
      for (const q of aptQs) {
        expect(q.options).toHaveLength(4);
        expect(q.explain.trim().length).toBeGreaterThan(10);
      }
    });

    it("covers all Logical Reasoning topics across Easy, Medium, and Hard levels", () => {
      const logicalQs = getQuestionsByCategory("logical");
      const topics = new Set(logicalQs.map((q) => q.topic));
      expect(topics).toEqual(
        new Set([
          "Puzzles",
          "Number Series",
          "Coding-Decoding",
          "Blood Relations",
          "Directions",
          "Syllogisms",
        ]),
      );
      expect(getQuestionsByCategory("logical", "all", "Easy").length).toBeGreaterThanOrEqual(6);
      expect(getQuestionsByCategory("logical", "all", "Medium").length).toBeGreaterThanOrEqual(6);
      expect(getQuestionsByCategory("logical", "all", "Hard").length).toBeGreaterThanOrEqual(6);
    });

    it("covers C, C++, Java, Python, SQL, DSA, OS, DBMS, and Computer Networks in Technical Assessment", () => {
      const techQs = getQuestionsByCategory("technical");
      const topics = new Set(techQs.map((q) => q.topic));
      expect(topics).toEqual(
        new Set([
          "C",
          "C++",
          "Java",
          "Python",
          "SQL",
          "Data Structures & Algorithms",
          "Operating Systems",
          "DBMS",
          "Computer Networks",
        ]),
      );
      for (const q of techQs) {
        expect(q.explain.trim().length).toBeGreaterThan(10);
      }
    });

    it("provides topic-wise Core CS quizzes across Beginner, Intermediate, and Advanced levels", () => {
      const csQs = getQuestionsByCategory("core-cs");
      const tiers = new Set(csQs.map((q) => q.csLevel));
      expect(tiers).toEqual(new Set(["Beginner", "Intermediate", "Advanced"]));
      expect(new Set(csQs.map((q) => q.topic)).size).toBeGreaterThanOrEqual(4);
    });
  });

  describe("2. Performance Tracking, Adaptive Difficulty & Personalized Recommendations", () => {
    it("starts with zero fixed sample scores when no assessments have been attempted", () => {
      const stats = getPerformanceAnalytics();
      expect(stats.totalAssessments).toBe(0);
      expect(stats.totalQuestionsAttempted).toBe(0);
      expect(stats.totalCorrect).toBe(0);
      expect(stats.totalIncorrect).toBe(0);
      expect(stats.overallAccuracy).toBe(0);
      expect(stats.averageScorePct).toBe(0);
      expect(stats.history).toHaveLength(0);
    });

    it("tracks real scores, strengths/weaknesses, adaptive difficulty, daily tasks, and blocks duplicate saves", () => {
      const pctQs = getQuestionsByCategory("aptitude", "Percentages");
      const probQs = getQuestionsByCategory("aptitude", "Probability");
      const mixedQs = [...pctQs.slice(0, 3), ...probQs.slice(0, 3)];

      // Answer all 3 Percentages correctly, and all 3 Probability incorrectly -> 50% overall
      const answers: Record<string, number> = {};
      pctQs.slice(0, 3).forEach((q) => {
        answers[q.id] = q.answer;
      });
      probQs.slice(0, 3).forEach((q) => {
        answers[q.id] = (q.answer + 1) % 4;
      });

      const attempt = buildAttemptRecord({
        id: "attempt-unique-1",
        assessmentId: "aptitude-mixed",
        category: "aptitude",
        title: "Aptitude Mixed Drill",
        questions: mixedQs,
        answers,
        timeTakenSec: 120,
      });

      saveAssessmentAttempt(attempt);
      // Duplicate save with identical id must be ignored
      saveAssessmentAttempt(attempt);

      expect(getAssessmentHistory()).toHaveLength(1);

      const analytics = getPerformanceAnalytics();
      expect(analytics.totalQuestionsAttempted).toBe(6);
      expect(analytics.totalCorrect).toBe(3);
      expect(analytics.totalIncorrect).toBe(3);
      expect(analytics.overallAccuracy).toBe(50);

      // Strengths vs weaknesses strictly derived from performance
      expect(analytics.strengths.map((s) => s.topic)).toContain("Percentages");
      expect(analytics.weaknesses.map((w) => w.topic)).toContain("Probability");

      // Recommended questions & daily tasks prioritize weak topic (Probability)
      expect(analytics.recommendedQuestions[0]?.topic).toBe("Probability");
      expect(analytics.dailyPracticeTasks.some((t) => t.topic === "Probability")).toBe(true);

      // Adaptive difficulty checks
      expect(pickAdaptiveDifficulty(35, 10).difficulty).toBe("Easy");
      expect(pickAdaptiveDifficulty(65, 10).difficulty).toBe("Medium");
      expect(pickAdaptiveDifficulty(85, 10).difficulty).toBe("Hard");
      expect(pickAdaptiveDifficulty(85, 10).tier).toBe("Advanced");
    });
  });

  describe("3. Interactive Quiz Runner & UI Workflows", () => {
    it("prevents multiple answer submissions per question, shows explanation, advances with Next Question, and saves Final Result", () => {
      render(<AssessmentModule />);

      // Verify zeroed initial KPIs
      const kpis = screen.getByTestId("assessment-kpi-strip");
      expect(kpis.textContent).toContain("0%");

      // Switch to Logical Reasoning tab and pick Puzzles -> Easy
      fireEvent.click(screen.getByRole("button", { name: /logical reasoning/i }));
      fireEvent.click(screen.getByRole("button", { name: "Puzzles" }));
      fireEvent.click(screen.getByRole("button", { name: "Easy" }));

      fireEvent.click(screen.getByRole("button", { name: /start logical reasoning/i }));

      // Question 1 of 1 (Easy Puzzles) — or check multi-question flow with All Levels
      expect(screen.getByTestId("question-counter").textContent).toMatch(/Question 1 of/);
      fireEvent.click(screen.getByRole("button", { name: /exit assessment/i }));

      // Now run All Levels of Core CS -> Operating Systems (3 questions: Beginner, Intermediate, Advanced)
      fireEvent.click(screen.getByRole("button", { name: /core cs quiz/i }));
      fireEvent.click(screen.getByRole("button", { name: "Operating Systems" }));
      fireEvent.click(screen.getByRole("button", { name: "All Levels" }));
      fireEvent.click(screen.getByRole("button", { name: /start core cs quiz/i }));

      expect(screen.getByTestId("question-counter").textContent).toBe("Question 1 of 3");

      // Select option A and submit answer
      const radios = screen.getAllByRole("radio");
      fireEvent.click(radios[0]!);
      fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

      // Option must now be locked and explanation shown immediately
      expect(screen.getByTestId("answer-locked-badge")).toBeDefined();
      expect(screen.getByTestId("question-explanation-box").textContent).toMatch(/Explanation:/i);
      const lockedRadios = screen.getAllByRole("radio") as HTMLButtonElement[];
      expect(lockedRadios.every((r) => r.disabled)).toBe(true);
      expect(screen.queryByRole("button", { name: /submit answer/i })).toBeNull();

      // Advance with Next Question button
      fireEvent.click(screen.getByRole("button", { name: /next question/i }));
      expect(screen.getByTestId("question-counter").textContent).toBe("Question 2 of 3");

      // Submit Q2
      fireEvent.click(screen.getAllByRole("radio")[1]!);
      fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

      // Advance to Q3 and submit Q3
      fireEvent.click(screen.getByRole("button", { name: /next question/i }));
      expect(screen.getByTestId("question-counter").textContent).toBe("Question 3 of 3");
      fireEvent.click(screen.getAllByRole("radio")[1]!);
      fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

      // Finish & View Result
      fireEvent.click(screen.getByRole("button", { name: /finish & view result/i }));

      const finalView = screen.getByTestId("assessment-final-result");
      expect(finalView.textContent).toMatch(/Final Score/i);
      expect(finalView.textContent).toMatch(/3 \/ 3/);
      expect(finalView.textContent).toMatch(/100%/);
      expect(finalView.textContent).toMatch(/Adaptive Difficulty Adjustment: Hard/i);
      expect(finalView.textContent).toMatch(/Answers & Detailed Explanations/i);

      // Return to Hub, switch to Overview & verify KPIs & History updated from actual attempt
      fireEvent.click(screen.getByRole("button", { name: /return to assessment hub/i }));
      fireEvent.click(screen.getByRole("button", { name: /overview & recommendations/i }));
      const updatedKpis = screen.getByTestId("assessment-kpi-strip");
      expect(updatedKpis.textContent).toContain("100%");
      expect(updatedKpis.textContent).toContain("Across 1 assessment");

      fireEvent.click(screen.getByRole("button", { name: /performance & history/i }));
      const perfPanel = screen.getByTestId("performance-tracking-panel");
      expect(perfPanel.textContent).toContain("Operating Systems");
      expect(perfPanel.textContent).toContain("Assessment History");
    }, 15000);

    it("supports filtering Technical Assessment across languages and CS subjects", () => {
      render(<AssessmentModule />);
      fireEvent.click(screen.getByRole("button", { name: /technical assessment/i }));

      for (const topic of ["C", "C++", "Java", "Python", "SQL", "DBMS"]) {
        expect(screen.getByRole("button", { name: topic })).toBeDefined();
      }

      fireEvent.click(screen.getByRole("button", { name: "Python" }));
      fireEvent.click(screen.getByRole("button", { name: /start technical assessment/i }));
      expect(screen.getByTestId("question-counter").textContent).toMatch(/Question 1 of 3/);
    }, 15000);
  });

  it("contains over 90 unique placement preparation questions in bank", () => {
    const ids = new Set(assessmentQuestionBank.map((q) => q.id));
    expect(ids.size).toBe(assessmentQuestionBank.length);
    expect(assessmentQuestionBank.length).toBeGreaterThanOrEqual(90);
  });
});
