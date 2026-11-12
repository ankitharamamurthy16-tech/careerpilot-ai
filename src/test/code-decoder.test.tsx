import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CodeDecoderModule } from "@/components/modules/CodeDecoderModule";
import { decoderQuestions, getDecoderStats, saveDecoderProgress } from "@/lib/data";

describe("CodeDecoderModule functionality", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps both Answer and Explanation hidden by default", () => {
    render(<CodeDecoderModule />);

    // Buttons should be rendered
    const viewAnswerBtn = screen.getByRole("button", { name: /view answer/i });
    const viewExplBtn = screen.getByRole("button", { name: /view explanation/i });
    expect(viewAnswerBtn).toBeDefined();
    expect(viewExplBtn).toBeDefined();

    // Solution code heading and explanation container should NOT be visible
    expect(screen.queryByText(/corrected solution/i)).toBeNull();
    expect(screen.queryByText(/step-by-step bug breakdown/i)).toBeNull();
  });

  it("reveals and toggles the corrected code when 'View Answer' is clicked", () => {
    render(<CodeDecoderModule />);

    const viewAnswerBtn = screen.getByRole("button", { name: /view answer/i });
    fireEvent.click(viewAnswerBtn);

    // Should reveal Corrected Solution heading and first question's correct code
    expect(screen.getByText(/corrected solution/i)).toBeDefined();
    expect(screen.getByText(/range\(len\(nums\)\):/)).toBeDefined();
    expect(screen.getByRole("button", { name: /hide correct answer/i })).toBeDefined();

    // Explanation should remain hidden (independent buttons)
    expect(screen.queryByText(/step-by-step bug breakdown/i)).toBeNull();

    // Click again to toggle back to hidden
    const hideAnswerBtn = screen.getByRole("button", { name: /hide correct answer/i });
    fireEvent.click(hideAnswerBtn);
    expect(screen.queryByText(/corrected solution/i)).toBeNull();
  });

  it("reveals and toggles the explanation when 'View Explanation' is clicked", () => {
    render(<CodeDecoderModule />);

    const firstQuestion = decoderQuestions[0]!;

    const viewExplBtn = screen.getByRole("button", { name: /view explanation/i });
    fireEvent.click(viewExplBtn);

    // Should reveal explanation header, root cause, and howToFix
    expect(screen.getByText(/step-by-step bug breakdown/i)).toBeDefined();
    expect(screen.getByText(firstQuestion.explanation.rootCause)).toBeDefined();
    expect(screen.getByText(firstQuestion.explanation.howToFix)).toBeDefined();
    expect(screen.getByRole("button", { name: /hide explanation/i })).toBeDefined();

    // Answer code section should remain hidden (independent buttons)
    expect(screen.queryByText(/corrected solution/i)).toBeNull();

    // Click again to toggle back to hidden
    const hideExplBtn = screen.getByRole("button", { name: /hide explanation/i });
    fireEvent.click(hideExplBtn);
    expect(screen.queryByText(/step-by-step bug breakdown/i)).toBeNull();
  });

  it("allows both Answer and Explanation to be open independently at the same time", () => {
    render(<CodeDecoderModule />);

    const viewAnswerBtn = screen.getByRole("button", { name: /view answer/i });
    const viewExplBtn = screen.getByRole("button", { name: /view explanation/i });

    fireEvent.click(viewAnswerBtn);
    fireEvent.click(viewExplBtn);

    expect(screen.getByText(/corrected solution/i)).toBeDefined();
    expect(screen.getByText(/step-by-step bug breakdown/i)).toBeDefined();
  });

  it("hides both sections when navigating to Next Question, and displays the new question's content when clicked", () => {
    render(<CodeDecoderModule />);

    // Reveal both on Question 1
    const viewAnswerBtn = screen.getByRole("button", { name: /view answer/i });
    const viewExplBtn = screen.getByRole("button", { name: /view explanation/i });
    fireEvent.click(viewAnswerBtn);
    fireEvent.click(viewExplBtn);

    expect(screen.getByText(/corrected solution/i)).toBeDefined();
    expect(screen.getByText(/step-by-step bug breakdown/i)).toBeDefined();

    // Click Next Question
    const nextBtn = screen.getByTitle("Next Question");
    fireEvent.click(nextBtn);

    // Both sections must now be hidden again
    expect(screen.queryByText(/corrected solution/i)).toBeNull();
    expect(screen.queryByText(/step-by-step bug breakdown/i)).toBeNull();

    // Now reveal on Question 2
    const viewAnswerBtnQ2 = screen.getByRole("button", { name: /view answer/i });
    fireEvent.click(viewAnswerBtnQ2);

    expect(screen.getByText(/counts\.get\(ch, 0\)/)).toBeDefined();
  });

  it("disables Previous Question on first question and enables it on next question", () => {
    render(<CodeDecoderModule />);

    const prevBtn = screen.getByTitle("Previous Question") as HTMLButtonElement;
    expect(prevBtn.disabled).toBe(true);

    const nextBtn = screen.getByTitle("Next Question");
    fireEvent.click(nextBtn);

    expect(prevBtn.disabled).toBe(false);
  });

  it("restores student code and preserves submission status when clicking Previous Question", () => {
    render(<CodeDecoderModule />);

    const textarea = screen.getByRole("textbox", {
      name: /interactive code editor/i,
    }) as HTMLTextAreaElement;

    // Student modifies code on Question 1
    const myCustomCode =
      "def sum_positives(nums):\n    # Student edited custom fix\n    return sum(x for x in nums if x > 0)";
    fireEvent.change(textarea, { target: { value: myCustomCode } });
    expect(textarea.value).toBe(myCustomCode);

    // Student navigates to Question 2
    const nextBtn = screen.getByTitle("Next Question");
    fireEvent.click(nextBtn);

    // In Question 2, textarea should have Question 2's code
    const textareaQ2 = screen.getByRole("textbox", {
      name: /interactive code editor/i,
    }) as HTMLTextAreaElement;
    expect(textareaQ2.value).not.toBe(myCustomCode);

    // Click Previous Question to return to Question 1
    const prevBtn = screen.getByTitle("Previous Question");
    fireEvent.click(prevBtn);

    // Question 1 code must be restored exactly as entered by student
    const textareaRestored = screen.getByRole("textbox", {
      name: /interactive code editor/i,
    }) as HTMLTextAreaElement;
    expect(textareaRestored.value).toBe(myCustomCode);

    // Answer and explanation must be hidden by default on return
    expect(screen.queryByText(/corrected solution/i)).toBeNull();
    expect(screen.queryByText(/step-by-step bug breakdown/i)).toBeNull();
  });

  it("renders functional progress dashboard with all 8 metrics and topic performance", () => {
    render(<CodeDecoderModule />);

    // Click Progress Dashboard tab
    const dashboardTab = screen.getAllByRole("button", { name: /progress dashboard/i })[0]!;
    fireEvent.click(dashboardTab);

    // Verify main headings and student sync badge
    expect(
      screen.getByRole("heading", { name: /code decoder performance dashboard/i }),
    ).toBeDefined();
    expect(screen.getByText(/progress auto-saved per student/i)).toBeDefined();

    // 1. Total questions attempted metric
    expect(screen.getByText(/questions attempted/i)).toBeDefined();
    // 2. Total questions solved correctly metric
    expect(screen.getByText(/solved correctly/i)).toBeDefined();
    // 3. Total questions answered incorrectly metric
    expect(screen.getByText(/answered incorrectly/i)).toBeDefined();
    // 4. Overall accuracy percentage metric
    expect(screen.getByText(/overall accuracy/i)).toBeDefined();
    // 5. Completed & Remaining metric
    expect(screen.getByText(/completed & remaining/i)).toBeDefined();

    // 6. Language breakdown (Python 3, Java 17, C GCC)
    expect(screen.getByText(/language mastery breakdown/i)).toBeDefined();
    expect(screen.getAllByText("Python 3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Java 17").length).toBeGreaterThan(0);
    expect(screen.getAllByText("C (GCC)").length).toBeGreaterThan(0);

    // 7. Difficulty breakdown (Easy, Medium, Hard)
    expect(screen.getByText(/progress by difficulty level/i)).toBeDefined();
    expect(screen.getByText(/easy level/i)).toBeDefined();
    expect(screen.getByText(/medium level/i)).toBeDefined();
    expect(screen.getByText(/hard level/i)).toBeDefined();

    // 8. Topic-wise performance matrix
    expect(screen.getByText(/topic-wise placement performance/i)).toBeDefined();
    expect(screen.getByText("Loops & Range Boundaries")).toBeDefined();
    expect(screen.getByText("Hash Maps & Key Initialization")).toBeDefined();
  });

  it("updates progress immediately after each submission without duplicate counting", () => {
    render(<CodeDecoderModule />);

    // Initially 0 attempted
    const statsInitial = getDecoderStats();
    expect(statsInitial.totalAttempted).toBe(0);
    expect(statsInitial.totalSolved).toBe(0);
    expect(statsInitial.totalIncorrect).toBe(0);

    // Submit correct answer on Question 1
    const textarea = screen.getByRole("textbox", {
      name: /interactive code editor/i,
    }) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: {
        value: `def sum_positives(nums):\n    total = 0\n    for i in range(len(nums)):\n        if nums[i] > 0:\n            total += nums[i]\n    return total`,
      },
    });

    const submitBtn = screen.getByRole("button", { name: /submit answer/i });
    fireEvent.click(submitBtn);

    // Check stats immediately updated
    const statsAfter1 = getDecoderStats();
    expect(statsAfter1.totalAttempted).toBe(1);
    expect(statsAfter1.totalSolved).toBe(1);
    expect(statsAfter1.totalIncorrect).toBe(0);
    expect(statsAfter1.overallAccuracy).toBe(100);

    // Re-submitting the same question should NOT increment totalAttempted (no duplicate counting)
    fireEvent.click(submitBtn);
    const statsAfterReSubmit = getDecoderStats();
    expect(statsAfterReSubmit.totalAttempted).toBe(1);
    expect(statsAfterReSubmit.totalSolved).toBe(1);
  });

  it("saves progress separately for each student email and preserves state", () => {
    // Save progress for student A
    saveDecoderProgress(
      "py-easy-offbyone",
      "python",
      "Easy",
      "valid code",
      true,
      false,
      false,
      false,
      "studentA@careerpilot.ai",
    );

    // Save progress for student B with incorrect status
    saveDecoderProgress(
      "py-easy-dictlookup",
      "python",
      "Easy",
      "broken code",
      false,
      false,
      false,
      false,
      "studentB@careerpilot.ai",
    );

    const statsA = getDecoderStats("studentA@careerpilot.ai");
    const statsB = getDecoderStats("studentB@careerpilot.ai");

    // Student A has 1 solved, 0 incorrect, 100% accuracy
    expect(statsA.totalSolved).toBe(1);
    expect(statsA.totalIncorrect).toBe(0);
    expect(statsA.overallAccuracy).toBe(100);

    // Student B has 0 solved, 1 incorrect, 0% accuracy
    expect(statsB.totalSolved).toBe(0);
    expect(statsB.totalIncorrect).toBe(1);
    expect(statsB.overallAccuracy).toBe(0);
  });
});
