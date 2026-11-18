import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { InterviewMentorModule } from "@/components/modules/InterviewMentorModule";
import {
  INTERVIEW_CATEGORIES,
  evaluateInterviewAnswer,
  generateNextInterviewQuestion,
  getInterviewProgressSummary,
  getInterviewSessions,
  getInterviewQuestionsByCategory,
  getSmartPracticeRecommendations,
  selectInitialQuestion,
} from "@/lib/data";

describe("AI Placement Mock Interview System", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Engine: Categories, Real Evaluation, Dynamic Follow-ups & Difficulty Adaptation", () => {
    it("provides all 5 required interview categories with substantial non-placeholder questions", () => {
      const labels = INTERVIEW_CATEGORIES.map((c) => c.label);
      expect(labels).toEqual([
        "HR Interview",
        "Technical Interview",
        "Full Stack Developer Interview",
        "Core Computer Science Interview",
        "General Placement Interview",
      ]);

      for (const cat of labels) {
        const questions = getInterviewQuestionsByCategory(cat);
        expect(questions.length).toBeGreaterThanOrEqual(8);
        const difficulties = new Set(questions.map((q) => q.difficulty));
        expect(difficulties.has("Easy")).toBe(true);
        expect(difficulties.has("Medium")).toBe(true);
        expect(difficulties.has("Hard")).toBe(true);
      }
    });

    it("starts with clean empty history (no fake seeded scores)", () => {
      expect(getInterviewSessions()).toEqual([]);
      const summary = getInterviewProgressSummary();
      expect(summary.totalInterviews).toBe(0);
      expect(summary.averageScoreTen).toBe(0);
    });

    it("evaluates actual answer content out of 10 across 5 dimensions (strong vs off-topic)", () => {
      const urlQuestion = selectInitialQuestion("Technical Interview", [], "Medium");

      const strongAnswer =
        "Specifically, I designed a URL shortener using Base62 encoding over a Snowflake 64-bit unique ID generator so we avoid hash collisions entirely without expensive retries. Because read traffic dominates writes by 100x, I placed a Redis cluster with LRU eviction in front of the database for hot URLs. For persistence, I used read replicas and horizontal sharding by short-code hash. The trade-off is maintaining Redis consistency on expiration, which reduces P99 latency to under 10ms.";

      const strongEval = evaluateInterviewAnswer(urlQuestion, strongAnswer, 45, true);
      expect(strongEval.overallScoreTen).toBeGreaterThanOrEqual(7.5);
      expect(strongEval.verdict).toBe("Correct");
      expect(strongEval.dimensions.technicalCorrectness).toBeGreaterThanOrEqual(7.5);
      expect(strongEval.dimensions.communicationSkills).toBeGreaterThanOrEqual(7);
      expect(strongEval.dimensions.confidence).toBeGreaterThanOrEqual(7);
      expect(strongEval.dimensions.relevance).toBeGreaterThanOrEqual(7.5);
      expect(strongEval.dimensions.answerStructure).toBeGreaterThanOrEqual(6.5);
      expect(strongEval.detectedConcepts.length).toBeGreaterThanOrEqual(3);

      const weakIrrelevantAnswer =
        "Um, like, I guess I am not sure, maybe just use a normal website with colorful buttons and good weather today.";
      const weakEval = evaluateInterviewAnswer(urlQuestion, weakIrrelevantAnswer, 20, true);

      expect(weakEval.overallScoreTen).toBeLessThan(4.5);
      expect(weakEval.verdict).toBe("Needs Improvement");
      expect(weakEval.dimensions.technicalCorrectness).toBeLessThan(4);
      expect(weakEval.dimensions.relevance).toBeLessThan(4);
      expect(weakEval.missedConcepts.length).toBeGreaterThanOrEqual(3);
      expect(weakEval.improvements.length).toBeGreaterThanOrEqual(2);
    });

    it("generates contextual follow-up questions, adapts difficulty, and avoids repeating questions", () => {
      const q1 = selectInitialQuestion("Technical Interview", [], "Medium");
      const answerMentioningRedis =
        "I designed the URL shortener with Base62 encoding to eliminate hash collisions, added Redis caching with LRU eviction for viral links, and used PostgreSQL read replicas and horizontal sharding.";
      const eval1 = evaluateInterviewAnswer(q1, answerMentioningRedis, 40, false);

      // Turn 2: triggers contextual Redis cache follow-up & difficulty increases Medium -> Hard
      const turn2 = generateNextInterviewQuestion({
        category: "Technical Interview",
        currentQuestion: q1,
        answerText: answerMentioningRedis,
        evaluation: eval1,
        askedQuestionIds: [q1.id],
        askedFollowUpIds: [],
        consecutiveFollowUps: 0,
        currentDifficulty: "Medium",
      });

      expect(turn2.isFollowUp).toBe(true);
      expect(turn2.nextDifficulty).toBe("Hard");
      expect(turn2.nextQuestion.question.toLowerCase()).toContain("redis");

      // Turn 3 after weak follow-up answer -> steps difficulty down and never repeats q1
      const weakFollowUpEval = evaluateInterviewAnswer(
        turn2.nextQuestion,
        "I guess I don't know maybe just restart the cache server.",
        15,
        false,
      );
      const turn3 = generateNextInterviewQuestion({
        category: "Technical Interview",
        currentQuestion: turn2.nextQuestion,
        answerText: "I guess I don't know maybe just restart the cache server.",
        evaluation: weakFollowUpEval,
        askedQuestionIds: [q1.id],
        askedFollowUpIds: [turn2.nextQuestion.id],
        consecutiveFollowUps: 1,
        currentDifficulty: "Hard",
      });

      expect(turn3.isFollowUp).toBe(false);
      expect(turn3.nextQuestion.id).not.toBe(q1.id);
      expect(["Easy", "Medium"]).toContain(turn3.nextDifficulty);
    });
  });

  describe("Component UI Workflow, Multi-Turn Interview, Progress & Smart Practice", () => {
    it(
      "supports Start Interview, one-question-at-a-time gating, Submit Answer, Next Question, End Interview & full Results report",
      { timeout: 15000 },
      () => {
        render(<InterviewMentorModule />);

        // Verify all 5 category buttons are rendered
        for (const cat of INTERVIEW_CATEGORIES) {
          expect(screen.getByRole("button", { name: new RegExp(cat.label, "i") })).toBeDefined();
        }

        // Select HR Interview and 3 Qs, then Start Interview
        fireEvent.click(screen.getByRole("button", { name: /HR Interview/i }));
        fireEvent.change(screen.getByLabelText(/Number of interview questions/i), {
          target: { value: "3" },
        });
        fireEvent.click(screen.getByRole("button", { name: /^Start Interview$/i }));

        expect(screen.getByText(/Question 1 of 3/i)).toBeDefined();

        // Next Question is disabled until the user answers Question 1
        const nextBtnInitial = screen.getByRole("button", {
          name: /next question/i,
        }) as HTMLButtonElement;
        expect(nextBtnInitial.disabled).toBe(true);

        // Type and submit Question 1 answer
        const textarea = screen.getByRole("textbox", {
          name: /interview answer transcription and response/i,
        }) as HTMLTextAreaElement;

        fireEvent.change(textarea, {
          target: {
            value:
              "I am a Computer Science student who built a campus project platform in React and Node.js serving 300 users, reducing query latency by 45%. My strength is structured debugging and I am excited to join your engineering team.",
          },
        });
        fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));

        // Per-question 5-dimension evaluation appears
        expect(screen.getByText("Simulated Interview AI Evaluation")).toBeDefined();
        expect(screen.getByText("Technical Correctness")).toBeDefined();
        expect(screen.getByText("Communication Skills")).toBeDefined();
        expect(screen.getByText("Confidence")).toBeDefined();
        expect(screen.getByText("Relevance")).toBeDefined();
        expect(screen.getByText("Answer Structure")).toBeDefined();

        // Now Next Question is unlocked -> move to Q2 (should generate contextual follow-up)
        const nextBtnEnabled = screen.getByRole("button", {
          name: /next question/i,
        }) as HTMLButtonElement;
        expect(nextBtnEnabled.disabled).toBe(false);
        fireEvent.click(nextBtnEnabled);

        expect(screen.getByText(/Question 2 of 3/i)).toBeDefined();

        // Answer Q2 weakly, then click End Interview early -> check "Ended Early" status & Report
        const textarea2 = screen.getByRole("textbox", {
          name: /interview answer transcription and response/i,
        }) as HTMLTextAreaElement;
        fireEvent.change(textarea2, {
          target: {
            value: "Um like maybe I chose React because it was simple and I guess it worked.",
          },
        });
        fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
        fireEvent.click(screen.getByRole("button", { name: /end interview/i }));

        const report = screen.getByTestId("interview-results-report");
        expect(report).toBeDefined();
        expect(within(report).getByText("Ended Early")).toBeDefined();
        expect(within(report).getByText("Interview Performance Results")).toBeDefined();
        expect(within(report).getByText("Strong Areas")).toBeDefined();
        expect(within(report).getByText(/Weak Areas & Improvement Focus/i)).toBeDefined();
        expect(within(report).getByText(/Areas Requiring Improvement/i)).toBeDefined();
        expect(within(report).getByText(/Personalized Recommendations/i)).toBeDefined();

        // Switch to Interview Progress tab and verify recorded history
        fireEvent.click(screen.getByRole("button", { name: /Interview Progress \(1\)/i }));
        expect(screen.getByText(/Total Interviews/i)).toBeDefined();
        expect(screen.getByText(/Score Improvement/i)).toBeDefined();
        expect(screen.getByText(/Areas Where You Repeatedly Struggle/i)).toBeDefined();

        // Switch to Smart Practice tab and verify all 4 recommendation categories
        fireEvent.click(screen.getByRole("button", { name: /Smart Practice/i }));
        expect(screen.getByText("Topics to Revise")).toBeDefined();
        expect(screen.getByText("Technical Questions to Practise")).toBeDefined();
        expect(screen.getByText("HR Questions to Prepare")).toBeDefined();
        expect(screen.getByText("Communication Improvement Exercises")).toBeDefined();
      },
    );

    it(
      "tracks score improvement delta and repeated struggles across multiple interviews",
      { timeout: 15000 },
      () => {
        render(<InterviewMentorModule />);

        // Interview 1: Weak answer in Core CS
        fireEvent.click(screen.getByRole("button", { name: /Core Computer Science Interview/i }));
        fireEvent.click(screen.getByRole("button", { name: /^Start Interview$/i }));

        const ta1 = screen.getByRole("textbox", {
          name: /interview answer transcription and response/i,
        }) as HTMLTextAreaElement;
        fireEvent.change(ta1, {
          target: {
            value: "Um I guess processes and threads are basically kind of similar tasks maybe.",
          },
        });
        fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
        fireEvent.click(screen.getByRole("button", { name: /end interview/i }));

        // Start Interview 2: Strong answer in Core CS -> expect positive score delta
        fireEvent.click(
          screen.getByRole("button", { name: /Start Another Core Computer Science Interview/i }),
        );
        const ta2 = screen.getByRole("textbox", {
          name: /interview answer transcription and response/i,
        }) as HTMLTextAreaElement;
        fireEvent.change(ta2, {
          target: {
            value:
              "Specifically, deadlock occurs when four Coffman conditions hold: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. In practice, I prevent circular wait by enforcing a global lock acquisition order, and databases use wait-for graph detection to abort and rollback cyclic transactions or apply lock timeouts.",
          },
        });
        fireEvent.click(screen.getByRole("button", { name: /submit answer/i }));
        fireEvent.click(screen.getByRole("button", { name: /end interview/i }));

        const sessions = getInterviewSessions();
        expect(sessions).toHaveLength(2);
        const progress = getInterviewProgressSummary(sessions);
        expect(progress.totalInterviews).toBe(2);
        expect(progress.improvementDeltaTen).not.toBeNull();
        expect(progress.improvementDeltaTen!).toBeGreaterThan(2);

        const recs = getSmartPracticeRecommendations(sessions, "Core Computer Science Interview");
        expect(recs.topicsToRevise.length).toBeGreaterThan(0);
        expect(recs.technicalQuestionsToPractice.length).toBeGreaterThan(0);
        expect(recs.hrQuestionsToPrepare.length).toBeGreaterThan(0);
        expect(recs.communicationExercises.length).toBeGreaterThan(0);
      },
    );
  });
});
