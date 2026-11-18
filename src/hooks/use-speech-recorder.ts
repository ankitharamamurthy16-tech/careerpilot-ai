import { useCallback, useEffect, useRef, useState } from "react";

export type RecordingStatus =
  "idle" | "requesting-permission" | "recording" | "processing" | "stopped" | "error";

export interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence?: number;
}

export interface SpeechRecognitionResultLike {
  isFinal?: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike | undefined;
}

export interface SpeechRecognitionEventLike {
  resultIndex?: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike | undefined;
  };
}

export interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

export interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
}

export type SpeechRecognitionConstructor = new () => ISpeechRecognition;

export interface UseSpeechRecorderOptions {
  lang?: string | undefined;
  onTranscriptChange: (transcript: string) => void;
  onRecordingStart?: (() => void) | undefined;
  onRecordingComplete?:
    ((result: { transcript: string; durationMs: number; durationSec: number }) => void) | undefined;
  onEmptyRecording?: (() => void) | undefined;
  onError?: ((message: string) => void) | undefined;
}

export function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const win = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

export function mapMicrophonePermissionError(err: unknown): string {
  const name =
    err && typeof err === "object" && "name" in err ? String((err as { name: unknown }).name) : "";
  const message =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : "";

  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Microphone access was denied. Please allow microphone permission in your browser settings and try again, or type your response below.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "No microphone was found on this device. Connect a microphone and try again, or type your response below.";
    case "NotReadableError":
    case "TrackStartError":
      return "Your microphone is currently in use by another app or unavailable. Close other audio apps and try again, or type your response below.";
    case "SecurityError":
      return "Microphone access requires a secure connection (HTTPS or localhost). Please type your response below.";
    case "AbortError":
      return "Microphone initialization was interrupted. Please try recording again.";
    default:
      if (
        message.toLowerCase().includes("denied") ||
        message.toLowerCase().includes("permission") ||
        message.toLowerCase().includes("policy")
      ) {
        return "Microphone access was denied or blocked by browser permissions. Please allow microphone permission in your browser settings and reload, or type your response below.";
      }
      return "Unable to access microphone. Please check your device permissions or type your response below.";
  }
}

export function mapSpeechRecognitionError(errorCode: string): string {
  switch (errorCode) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone permission was denied. Please allow microphone access in your browser settings, or type your response below.";
    case "audio-capture":
      return "No microphone was detected or audio capture failed. Check your mic connection, or type your response below.";
    case "no-speech":
      return "No speech was detected. Please speak clearly into your microphone and try again, or type your response below.";
    case "network":
      return "Speech recognition network error occurred. Check your internet connection, or type your response below.";
    case "language-not-supported":
      return "Selected speech language is not supported in this browser. Please type your response below.";
    default:
      return `Speech recognition stopped (${errorCode}). You can try again or type your response below.`;
  }
}

function joinTranscriptParts(...parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .join(" ");
}

export function useSpeechRecorder(options: UseSpeechRecorderOptions) {
  const {
    lang = "en-US",
    onTranscriptChange,
    onRecordingStart,
    onRecordingComplete,
    onEmptyRecording,
    onError,
  } = options;

  const [status, setStatus] = useState<RecordingStatus>("idle");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hasRecordedSpeech, setHasRecordedSpeech] = useState(false);

  const isSpeechSupported =
    typeof window !== "undefined" ? Boolean(getSpeechRecognitionConstructor()) : true;

  // Refs for race-free lifecycle & duplicate session prevention
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stopFallbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isBusyRef = useRef(false);
  const sessionTokenRef = useRef(0);
  const recordingStartMsRef = useRef<number | null>(null);
  const accumulatedDurationMsRef = useRef(0);
  const baseTextRef = useRef("");
  const capturedSessionTextRef = useRef("");
  const latestCombinedTextRef = useRef("");
  const hadErrorRef = useRef(false);
  const userStoppedRef = useRef(false);
  const finalizedTokenRef = useRef(0);

  // Keep latest callbacks in refs so unmount/handlers never see stale closures
  const callbacksRef = useRef({
    onTranscriptChange,
    onRecordingStart,
    onRecordingComplete,
    onEmptyRecording,
    onError,
  });
  callbacksRef.current = {
    onTranscriptChange,
    onRecordingStart,
    onRecordingComplete,
    onEmptyRecording,
    onError,
  };

  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (stopFallbackTimerRef.current) {
      clearTimeout(stopFallbackTimerRef.current);
      stopFallbackTimerRef.current = null;
    }
  }, []);

  const finalizeSession = useCallback(
    (token: number) => {
      if (finalizedTokenRef.current === token) return;
      finalizedTokenRef.current = token;

      clearTimers();
      isBusyRef.current = false;
      recognitionRef.current = null;

      const sessionElapsedMs =
        recordingStartMsRef.current !== null
          ? Math.max(0, Date.now() - recordingStartMsRef.current)
          : 0;
      recordingStartMsRef.current = null;

      const captured = capturedSessionTextRef.current.trim();
      setInterimTranscript("");

      if (hadErrorRef.current) {
        return;
      }

      if (!captured) {
        // Empty recording: do not add empty wait duration or mark as valid spoken text
        const prevDurationMs = accumulatedDurationMsRef.current;
        setDurationMs(prevDurationMs);
        setElapsedSec(prevDurationMs > 0 ? Math.max(1, Math.round(prevDurationMs / 1000)) : 0);

        const emptyMsg =
          "No speech was captured in this recording. Please check your microphone, speak clearly, and try again — or type your response below.";
        setStatus("error");
        setError(emptyMsg);
        callbacksRef.current.onEmptyRecording?.();
        return;
      }

      const effectiveSessionMs = Math.max(sessionElapsedMs, 1000);
      const totalMs = accumulatedDurationMsRef.current + effectiveSessionMs;
      accumulatedDurationMsRef.current = totalMs;

      const totalSec = Math.max(1, Math.round(totalMs / 1000));
      setDurationMs(totalMs);
      setElapsedSec(totalSec);
      setHasRecordedSpeech(true);
      setStatus("stopped");
      setError(null);

      // Push finalized editable transcript immediately
      const finalText = latestCombinedTextRef.current.trim();
      callbacksRef.current.onTranscriptChange(finalText);
      callbacksRef.current.onRecordingComplete?.({
        transcript: finalText,
        durationMs: totalMs,
        durationSec: totalMs / 1000,
      });
    },
    [clearTimers],
  );

  const startRecording = useCallback(
    async (existingText = "") => {
      // Prevent duplicate recording sessions synchronously
      if (isBusyRef.current) {
        return;
      }

      isBusyRef.current = true;
      const myToken = ++sessionTokenRef.current;
      hadErrorRef.current = false;
      userStoppedRef.current = false;
      capturedSessionTextRef.current = "";
      baseTextRef.current = existingText.trim();
      latestCombinedTextRef.current = baseTextRef.current;
      setInterimTranscript("");
      setError(null);

      // Check secure context when explicitly false
      if (typeof window !== "undefined" && window.isSecureContext === false) {
        const msg =
          "Microphone access requires a secure connection (HTTPS or localhost). Please type your response below.";
        isBusyRef.current = false;
        setStatus("error");
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      const SpeechRecognitionClass = getSpeechRecognitionConstructor();
      if (!SpeechRecognitionClass) {
        const msg =
          "Speech Recognition is not supported in this browser. Please use Chrome/Edge or type your response below.";
        isBusyRef.current = false;
        setStatus("error");
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      // Request / verify microphone permission via navigator.mediaDevices before starting recognition
      if (
        typeof navigator === "undefined" ||
        !navigator.mediaDevices ||
        typeof navigator.mediaDevices.getUserMedia !== "function"
      ) {
        const msg =
          "Microphone access (navigator.mediaDevices) is unavailable in this browser or blocked by site permissions. Please use a supported browser over HTTPS or type your response below.";
        isBusyRef.current = false;
        hadErrorRef.current = true;
        setStatus("error");
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      setStatus("requesting-permission");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Stop probe stream tracks immediately so SpeechRecognition has exclusive mic access
        if (stream && typeof stream.getTracks === "function") {
          stream.getTracks().forEach((track) => {
            try {
              track.stop();
            } catch {
              // ignore
            }
          });
        }
      } catch (err) {
        if (sessionTokenRef.current !== myToken) return;
        const msg = mapMicrophonePermissionError(err);
        isBusyRef.current = false;
        hadErrorRef.current = true;
        setStatus("error");
        setError(msg);
        callbacksRef.current.onError?.(msg);
        return;
      }

      // Bail out if user stopped or unmounted while waiting for permission
      if (sessionTokenRef.current !== myToken) {
        isBusyRef.current = false;
        return;
      }

      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognitionRef.current = recognition;

        const beginTimer = () => {
          if (recordingStartMsRef.current !== null) return;
          recordingStartMsRef.current = Date.now();
          const priorSec = Math.round(accumulatedDurationMsRef.current / 1000);
          setElapsedSec(priorSec);
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            if (recordingStartMsRef.current === null) return;
            const totalElapsed =
              accumulatedDurationMsRef.current + (Date.now() - recordingStartMsRef.current);
            setDurationMs(totalElapsed);
            setElapsedSec(Math.floor(totalElapsed / 1000));
          }, 250);
        };

        recognition.onstart = () => {
          if (sessionTokenRef.current !== myToken) {
            try {
              recognition.abort?.();
              recognition.stop();
            } catch {
              // ignore
            }
            return;
          }
          setStatus("recording");
          beginTimer();
          callbacksRef.current.onRecordingStart?.();
        };

        recognition.onresult = (event) => {
          if (sessionTokenRef.current !== myToken) return;
          // Ensure timer starts if a browser/mock skips onstart
          if (recordingStartMsRef.current === null) {
            setStatus("recording");
            beginTimer();
          }

          let sessionFinal = "";
          let sessionInterim = "";

          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i];
            const transcriptPiece = result?.[0]?.transcript ?? "";
            if (!transcriptPiece) continue;
            if (result?.isFinal === false) {
              sessionInterim += transcriptPiece + " ";
            } else {
              sessionFinal += transcriptPiece + " ";
            }
          }

          const cleanFinal = sessionFinal.trim();
          const cleanInterim = sessionInterim.trim();
          const sessionText = joinTranscriptParts(cleanFinal, cleanInterim);
          capturedSessionTextRef.current = sessionText;

          const combined = joinTranscriptParts(baseTextRef.current, sessionText);
          latestCombinedTextRef.current = combined;
          setInterimTranscript(cleanInterim);

          if (sessionText) {
            setHasRecordedSpeech(true);
            callbacksRef.current.onTranscriptChange(combined);
          }
        };

        recognition.onerror = (event) => {
          if (sessionTokenRef.current !== myToken) return;
          const errorCode = event?.error || "unknown";

          // Ignore "aborted" if triggered intentionally by user stop/reset
          if (errorCode === "aborted" && userStoppedRef.current) {
            return;
          }

          // If user clicked Stop and browser emitted no-speech when speech was already captured, ignore error
          if (errorCode === "no-speech" && capturedSessionTextRef.current.trim()) {
            return;
          }

          hadErrorRef.current = true;
          clearTimers();
          isBusyRef.current = false;
          recordingStartMsRef.current = null;
          recognitionRef.current = null;
          setInterimTranscript("");

          const msg = mapSpeechRecognitionError(errorCode);
          setStatus("error");
          setError(msg);
          callbacksRef.current.onError?.(msg);
        };

        recognition.onend = () => {
          if (sessionTokenRef.current !== myToken) return;
          finalizeSession(myToken);
        };

        recognition.start();
      } catch (err) {
        if (sessionTokenRef.current !== myToken) return;
        const msg =
          err instanceof Error && err.message
            ? `Failed to start voice recording: ${err.message}. You can type your response below.`
            : "Failed to start audio input. You can type your response below.";
        clearTimers();
        isBusyRef.current = false;
        hadErrorRef.current = true;
        recognitionRef.current = null;
        recordingStartMsRef.current = null;
        setStatus("error");
        setError(msg);
        callbacksRef.current.onError?.(msg);
      }
    },
    [clearTimers, finalizeSession, lang],
  );

  const stopRecording = useCallback(() => {
    const activeToken = sessionTokenRef.current;

    // If still awaiting microphone permission, cancel cleanly
    if (status === "requesting-permission" && !recognitionRef.current) {
      sessionTokenRef.current += 1;
      isBusyRef.current = false;
      clearTimers();
      setStatus("idle");
      return;
    }

    if (!recognitionRef.current && !isBusyRef.current) {
      return;
    }

    userStoppedRef.current = true;
    clearTimers();

    if (recognitionRef.current) {
      setStatus("processing");
      try {
        recognitionRef.current.stop();
      } catch {
        finalizeSession(activeToken);
        return;
      }

      // Fallback in case browser does not fire onend promptly after stop()
      if (finalizedTokenRef.current !== activeToken) {
        stopFallbackTimerRef.current = setTimeout(() => {
          if (
            sessionTokenRef.current === activeToken &&
            finalizedTokenRef.current !== activeToken
          ) {
            finalizeSession(activeToken);
          }
        }, 500);
      }
    } else {
      finalizeSession(activeToken);
    }
  }, [clearTimers, finalizeSession, status]);

  const resetRecording = useCallback(() => {
    sessionTokenRef.current += 1;
    userStoppedRef.current = true;
    hadErrorRef.current = false;
    isBusyRef.current = false;
    clearTimers();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort?.();
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    recordingStartMsRef.current = null;
    accumulatedDurationMsRef.current = 0;
    baseTextRef.current = "";
    capturedSessionTextRef.current = "";
    latestCombinedTextRef.current = "";

    setStatus("idle");
    setElapsedSec(0);
    setDurationMs(0);
    setInterimTranscript("");
    setError(null);
    setHasRecordedSpeech(false);
  }, [clearTimers]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus((prev) => (prev === "error" ? (hasRecordedSpeech ? "stopped" : "idle") : prev));
  }, [hasRecordedSpeech]);

  // Cleanup on unmount so microphone & timers are never leaked
  useEffect(() => {
    return () => {
      sessionTokenRef.current += 1;
      isBusyRef.current = false;
      clearTimers();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onstart = null;
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.abort?.();
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, [clearTimers]);

  return {
    status,
    isRecording: status === "recording",
    isRequestingPermission: status === "requesting-permission",
    isProcessing: status === "processing",
    isSpeechSupported,
    elapsedSec,
    durationMs,
    interimTranscript,
    error,
    hasRecordedSpeech,
    startRecording,
    stopRecording,
    resetRecording,
    clearError,
  };
}
