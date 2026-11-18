import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, className, to }: { children: ReactNode; className?: string; to?: string }) => (
    <a href={to ?? "#"} className={className}>
      {children}
    </a>
  ),
}));

import { CommunicationModule } from "@/components/modules/CommunicationModule";
import { InterviewMentorModule } from "@/components/modules/InterviewMentorModule";
import { getInterviewSessions } from "@/lib/data";

class MockSpeechRecognition {
  static instances: MockSpeechRecognition[] = [];

  continuous = false;
  interimResults = false;
  lang = "en-US";
  onstart: (() => void) | null = null;
  onresult:
    | ((event: {
        results: {
          length: number;
          [index: number]:
            | {
                isFinal?: boolean;
                length: number;
                [idx: number]: { transcript: string };
              }
            | undefined;
        };
      }) => void)
    | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onend: (() => void) | null = null;

  started = false;
  stopped = false;
  aborted = false;

  constructor() {
    MockSpeechRecognition.instances.push(this);
  }

  start() {
    this.started = true;
    this.onstart?.();
  }

  stop() {
    this.stopped = true;
    this.onend?.();
  }

  abort() {
    this.aborted = true;
  }

  emitSpeech(transcripts: Array<{ text: string; isFinal?: boolean }>) {
    const resultsObj: {
      length: number;
      [index: number]: {
        isFinal?: boolean;
        length: number;
        [idx: number]: { transcript: string };
      };
    } = { length: transcripts.length };

    transcripts.forEach((item, idx) => {
      resultsObj[idx] = {
        length: 1,
        isFinal: item.isFinal ?? true,
        0: { transcript: item.text },
      };
    });

    this.onresult?.({ results: resultsObj });
  }

  emitError(error: string) {
    this.onerror?.({ error });
    this.onend?.();
  }
}

function setupMicAndSpeech({
  grantMic = true,
  micErrorName = "NotAllowedError",
  speechSupported = true,
}: {
  grantMic?: boolean;
  micErrorName?: string;
  speechSupported?: boolean;
} = {}) {
  const trackStop = vi.fn();
  const getUserMedia = vi.fn().mockImplementation(async () => {
    if (!grantMic) {
      const err = new Error("Permission denied");
      (err as { name: string }).name = micErrorName;
      throw err;
    }
    return {
      getTracks: () => [{ stop: trackStop }],
    };
  });

  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia },
  });

  Object.defineProperty(window, "isSecureContext", {
    configurable: true,
    value: true,
  });

  if (speechSupported) {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      writable: true,
      value: MockSpeechRecognition,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  } else {
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    Object.defineProperty(window, "webkitSpeechRecognition", {
      configurable: true,
      writable: true,
      value: undefined,
    });
  }

  return { getUserMedia, trackStop };
}

describe("Speech recording and transcription in Communication Coach & Interview Mentor", () => {
  beforeEach(() => {
    localStorage.clear();
    MockSpeechRecognition.instances = [];
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("CommunicationModule (Communication Coach)", () => {
    it("requests mic permission, records speech, displays transcription immediately on stop, allows editing, and calculates accurate WPM", async () => {
      let currentNow = 1_000_000;
      vi.spyOn(Date, "now").mockImplementation(() => currentNow);
      const { getUserMedia, trackStop } = setupMicAndSpeech({ grantMic: true });

      render(<CommunicationModule />);

      const startBtn = screen.getByRole("button", { name: /start recording/i });
      await act(async () => {
        fireEvent.click(startBtn);
      });

      expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
      expect(trackStop).toHaveBeenCalledTimes(1);
      expect(MockSpeechRecognition.instances).toHaveLength(1);

      const rec = MockSpeechRecognition.instances[0]!;
      expect(rec.started).toBe(true);
      expect(screen.getByTestId("comm-recording-status").textContent).toMatch(/recording/i);

      // Simulate 5 seconds of speaking 12 words (12 / (5/60) = 144 WPM)
      act(() => {
        currentNow += 5000;
        rec.emitSpeech([
          {
            text: "Hello I am a final year computer science student passionate about systems",
            isFinal: true,
          },
        ]);
      });

      const textarea = screen.getByRole("textbox", {
        name: /speech transcription and response/i,
      }) as HTMLTextAreaElement;
      expect(textarea.value).toBe(
        "Hello I am a final year computer science student passionate about systems",
      );

      // Click Stop Recording
      const stopBtn = screen.getByRole("button", { name: /stop recording/i });
      act(() => {
        fireEvent.click(stopBtn);
      });

      expect(rec.stopped).toBe(true);
      expect(screen.getByTestId("comm-recording-status").textContent).toMatch(
        /transcription ready/i,
      );

      // Edit transcription before submission (add 3 words -> 15 words in 5s = 180 WPM, including a filler "um")
      fireEvent.change(textarea, {
        target: {
          value:
            "Hello I am um a final year computer science student passionate about distributed systems engineering",
        },
      });
      expect(textarea.value).toContain("distributed systems engineering");

      const analyzeBtn = screen.getByRole("button", { name: /analyze cadence & fillers/i });
      fireEvent.click(analyzeBtn);

      // Verify evaluation used actual edited transcript (15 words in 5s = 180 WPM, 1 filler)
      expect(screen.getByText("Speech Coach Evaluation:")).toBeDefined();
      expect(screen.getByText("180 WPM")).toBeDefined();
      expect(screen.getByText("15 words")).toBeDefined();
      expect(screen.getByText("1")).toBeDefined(); // 1 filler ("um")
    });

    it("shows clear error when microphone permission is denied and preserves typed fallback", async () => {
      setupMicAndSpeech({ grantMic: false, micErrorName: "NotAllowedError" });
      render(<CommunicationModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toMatch(/microphone access was denied/i);

      // Typed fallback still works
      const textarea = screen.getByRole("textbox", {
        name: /speech transcription and response/i,
      }) as HTMLTextAreaElement;
      fireEvent.change(textarea, {
        target: { value: "I am a dedicated software engineering student with strong DSA skills." },
      });

      const analyzeBtn = screen.getByRole("button", { name: /analyze cadence & fillers/i });
      fireEvent.click(analyzeBtn);

      expect(screen.getByText("Speech Coach Evaluation:")).toBeDefined();
      expect(screen.getByText("Typed")).toBeDefined();
      expect(screen.getByText("11 words")).toBeDefined();
    });

    it("shows clear error when speech recognition is unavailable in browser", async () => {
      setupMicAndSpeech({ speechSupported: false });
      render(<CommunicationModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toMatch(/speech recognition is not supported/i);
    });

    it("handles empty recordings properly without allowing empty evaluation", async () => {
      setupMicAndSpeech({ grantMic: true });
      render(<CommunicationModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      // Stop without emitting any speech
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /stop recording/i }));
      });

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toMatch(/no speech was captured/i);

      const analyzeBtn = screen.getByRole("button", {
        name: /analyze cadence & fillers/i,
      }) as HTMLButtonElement;
      expect(analyzeBtn.disabled).toBe(true);
    });

    it("prevents duplicate recording sessions on rapid double clicks", async () => {
      let resolveMic!: (stream: { getTracks: () => Array<{ stop: () => void }> }) => void;
      const getUserMedia = vi.fn(
        () =>
          new Promise<{ getTracks: () => Array<{ stop: () => void }> }>((res) => {
            resolveMic = res;
          }),
      );
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: { getUserMedia },
      });
      Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
      Object.defineProperty(window, "SpeechRecognition", {
        configurable: true,
        writable: true,
        value: MockSpeechRecognition,
      });

      render(<CommunicationModule />);

      const startBtn = screen.getByRole("button", { name: /start recording/i });
      // Click twice rapidly before permission resolves
      fireEvent.click(startBtn);
      fireEvent.click(startBtn);

      expect(getUserMedia).toHaveBeenCalledTimes(1);

      await act(async () => {
        resolveMic({ getTracks: () => [{ stop: vi.fn() }] });
      });

      await waitFor(() => {
        expect(MockSpeechRecognition.instances).toHaveLength(1);
      });
    });
  });

  describe("InterviewMentorModule (Weekly AI Interview Mentor)", () => {
    it("records speech, renders editable transcript, evaluates actual text, and calculates accurate WPM for short recordings", async () => {
      let currentNow = 2_000_000;
      vi.spyOn(Date, "now").mockImplementation(() => currentNow);
      setupMicAndSpeech({ grantMic: true });

      render(<InterviewMentorModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      const rec = MockSpeechRecognition.instances[0]!;
      expect(screen.getByTestId("interview-recording-status").textContent).toMatch(/listening/i);

      // Speak 20 words in 8 seconds -> 20 / (8/60) = 150 WPM (verifies no 10s artificial clamp!)
      act(() => {
        currentNow += 8000;
        rec.emitSpeech([
          {
            text: "During our project I designed a Base62 URL shortener with Redis LRU caching and database read replicas to handle traffic",
            isFinal: true,
          },
        ]);
      });

      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /stop recording/i }));
      });

      expect(screen.getByTestId("interview-recording-status").textContent).toMatch(
        /transcription ready/i,
      );

      const textarea = screen.getByRole("textbox", {
        name: /interview answer transcription and response/i,
      }) as HTMLTextAreaElement;
      expect(textarea.value).toContain("Base62 URL shortener");

      // Edit the transcript before submitting (still 20 words, fix a word)
      const editedText =
        "During our project I designed a Base62 URL shortener with Redis LRU caching and database sharding replicas to handle traffic";
      fireEvent.change(textarea, { target: { value: editedText } });

      const submitBtn = screen.getByRole("button", { name: /submit answer for ai evaluation/i });
      fireEvent.click(submitBtn);

      expect(screen.getByText("Simulated Interview AI Evaluation")).toBeDefined();
      expect(screen.getAllByText("150 WPM").length).toBeGreaterThanOrEqual(2);

      // Verify saved session stored the exact edited transcript and accurate duration
      const sessions = getInterviewSessions();
      expect(sessions[0]?.answerText).toBe(editedText);
      expect(sessions[0]?.isSpoken).toBe(true);
      expect(sessions[0]?.durationSec).toBe(8);
    });

    it("handles speech recognition error and preserves typed fallback in Interview Mentor", async () => {
      setupMicAndSpeech({ grantMic: true });
      render(<InterviewMentorModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      const rec = MockSpeechRecognition.instances[0]!;
      act(() => {
        rec.emitError("not-allowed");
      });

      const alert = screen.getByRole("alert");
      expect(alert.textContent).toMatch(/microphone permission was denied/i);

      // Fallback to typing answer
      const textarea = screen.getByRole("textbox", {
        name: /interview answer transcription and response/i,
      }) as HTMLTextAreaElement;
      const typedAnswer =
        "I would design the URL shortener using Base62 encoding, Redis caching with LRU eviction, and database read replicas for high read traffic.";
      fireEvent.change(textarea, { target: { value: typedAnswer } });

      fireEvent.click(screen.getByRole("button", { name: /submit answer for ai evaluation/i }));
      expect(screen.getByText("Simulated Interview AI Evaluation")).toBeDefined();

      const sessions = getInterviewSessions();
      expect(sessions[0]?.answerText).toBe(typedAnswer);
      expect(sessions[0]?.isSpoken).toBe(false);
    });
  });

  describe("Independent microphone state across both sections", () => {
    it("operates independently in Communication Coach and Interview Mentor without cross-talk", async () => {
      setupMicAndSpeech({ grantMic: true });

      render(
        <div>
          <section data-testid="comm-section">
            <CommunicationModule />
          </section>
          <section data-testid="interview-section">
            <InterviewMentorModule />
          </section>
        </div>,
      );

      const startButtons = screen.getAllByRole("button", { name: /start recording/i });
      expect(startButtons).toHaveLength(2);

      // Start recording ONLY in Communication Coach
      await act(async () => {
        fireEvent.click(startButtons[0]!);
      });

      expect(MockSpeechRecognition.instances).toHaveLength(1);
      expect(screen.getByTestId("comm-recording-status").textContent).toMatch(/recording/i);
      expect(screen.queryByTestId("interview-recording-status")).toBeNull();

      act(() => {
        MockSpeechRecognition.instances[0]!.emitSpeech([
          { text: "Communication coach transcript only", isFinal: true },
        ]);
      });

      const commTextarea = screen.getByRole("textbox", {
        name: /speech transcription and response/i,
      }) as HTMLTextAreaElement;
      const interviewTextarea = screen.getByRole("textbox", {
        name: /interview answer transcription and response/i,
      }) as HTMLTextAreaElement;

      expect(commTextarea.value).toBe("Communication coach transcript only");
      expect(interviewTextarea.value).toBe("");

      // Stop Communication Coach, then start Interview Mentor independently
      act(() => {
        fireEvent.click(screen.getByRole("button", { name: /stop recording/i }));
      });

      const interviewStartBtn = screen.getAllByRole("button", { name: /start recording/i })[1]!;
      await act(async () => {
        fireEvent.click(interviewStartBtn);
      });

      expect(MockSpeechRecognition.instances).toHaveLength(2);
      expect(screen.getByTestId("interview-recording-status").textContent).toMatch(/listening/i);

      act(() => {
        MockSpeechRecognition.instances[1]!.emitSpeech([
          { text: "Interview mentor transcript only", isFinal: true },
        ]);
      });

      expect(interviewTextarea.value).toBe("Interview mentor transcript only");
      expect(commTextarea.value).toBe("Communication coach transcript only");
    });

    it("handles missing navigator.mediaDevices and permission denial in Interview Mentor cleanly", async () => {
      setupMicAndSpeech({ grantMic: false, micErrorName: "NotAllowedError" });
      const { unmount } = render(<InterviewMentorModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      expect(screen.getByRole("alert").textContent).toMatch(/microphone access was denied/i);
      unmount();

      // Verify unavailable navigator.mediaDevices handling in Speech Coach
      Object.defineProperty(navigator, "mediaDevices", {
        configurable: true,
        value: undefined,
      });
      render(<CommunicationModule />);

      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: /start recording/i }));
      });

      expect(screen.getByRole("alert").textContent).toMatch(/navigator\.mediaDevices/i);
    });
  });
});
