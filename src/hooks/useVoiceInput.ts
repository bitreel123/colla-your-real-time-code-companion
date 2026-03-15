import { useState, useRef, useCallback, useEffect } from "react";

interface UseVoiceInputOptions {
  onTranscriptUpdate?: (transcript: string) => void;
  debounceMs?: number;
}

export function useVoiceInput(options?: UseVoiceInputOptions) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef("");

  // Debounced callback for real-time transcript updates
  useEffect(() => {
    if (!transcript || !isListening || !options?.onTranscriptUpdate) return;
    if (transcript === lastSentRef.current) return;

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      if (transcript && transcript !== lastSentRef.current) {
        lastSentRef.current = transcript;
        options.onTranscriptUpdate!(transcript);
      }
    }, options?.debounceMs ?? 3000);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [transcript, isListening, options?.onTranscriptUpdate, options?.debounceMs]);

  const checkPermission = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
      setHasPermission(true);
      return true;
    } catch {
      setHasPermission(false);
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    // Check mic permission first
    const permitted = await checkPermission();
    if (!permitted) {
      console.error("Microphone permission denied");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    lastSentRef.current = "";
  }, [checkPermission]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    lastSentRef.current = "";
  }, []);

  return { isListening, transcript, hasPermission, startListening, stopListening, clearTranscript };
}
