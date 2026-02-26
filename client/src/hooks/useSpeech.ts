import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type RecognitionConstructor = new () => SpeechRecognitionInstance;

type SpeechRecognitionErrorEvent = Event & {
  error: string;
};

type SpeechRecognitionResultLike = {
  0: { transcript: string };
  isFinal: boolean;
};

type SpeechRecognitionEvent = Event & {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

declare global {
  interface Window {
    webkitSpeechRecognition?: RecognitionConstructor;
    SpeechRecognition?: RecognitionConstructor;
  }
}

interface SpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

interface SpeechRecognitionState {
  text: string;
  interimText: string;
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetText: () => void;
}

interface SpeechSynthesisState {
  isSpeaking: boolean;
  error: string | null;
  isSupported: boolean;
  availableVoices: SpeechSynthesisVoice[];
  speak: (text: string, language?: string) => Promise<boolean>;
  stop: () => void;
}

function getRecognitionCtor(): RecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function cleanForSpeech(raw: string): string {
  return raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/^\s*[-*•]\s+/gm, '')
    .replace(/^\s*\d+[.)]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionState {
  const { language = 'ru-RU', continuous = false, interimResults = true } = options;
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldKeepListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [text, setText] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported = useMemo(() => Boolean(getRecognitionCtor()), []);

  useEffect(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = language;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;

    recognition.onresult = (event) => {
      let finalText = '';
      let interim = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          finalText += transcript;
        } else {
          interim += transcript;
        }
      }

      if (finalText.trim()) {
        setText((prev) => `${prev} ${finalText}`.trim());
      }
      setInterimText(interim.trim());
    };

    recognition.onerror = (event) => {
      setError(event.error || 'speech-recognition-error');
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldKeepListeningRef.current = false;
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      if (shouldKeepListeningRef.current) {
        if (restartTimerRef.current) {
          clearTimeout(restartTimerRef.current);
        }
        restartTimerRef.current = setTimeout(() => {
          try {
            recognition.start();
            setIsListening(true);
          } catch {
            setIsListening(false);
          }
        }, 180);
        return;
      }

      setIsListening(false);
      setInterimText('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      shouldKeepListeningRef.current = false;
      if (restartTimerRef.current) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [continuous, interimResults, language]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError('speech-not-supported');
      return;
    }

    setError(null);
    setInterimText('');
    shouldKeepListeningRef.current = true;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      shouldKeepListeningRef.current = false;
      setError('speech-start-failed');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    shouldKeepListeningRef.current = false;
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const resetText = useCallback(() => {
    setText('');
    setInterimText('');
    setError(null);
  }, []);

  return {
    text,
    interimText,
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
    resetText,
  };
}

async function synthesizeWithElevenLabs(text: string): Promise<string | null> {
  const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
  const apiKey = (env.VITE_ELEVENLABS_API_KEY || '').trim();
  if (!apiKey) return null;

  const voiceId = (env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL').trim();
  const modelId = (env.VITE_ELEVENLABS_MODEL_ID || 'eleven_multilingual_v2').trim();
  const stability = Number.parseFloat(env.VITE_ELEVENLABS_STABILITY || '0.58');
  const similarityBoost = Number.parseFloat(env.VITE_ELEVENLABS_SIMILARITY || '0.82');
  const style = Number.parseFloat(env.VITE_ELEVENLABS_STYLE || '0.22');
  const useSpeakerBoost = (env.VITE_ELEVENLABS_SPEAKER_BOOST || 'true').toLowerCase() !== 'false';

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: modelId,
      voice_settings: {
        stability: Number.isFinite(stability) ? stability : 0.58,
        similarity_boost: Number.isFinite(similarityBoost) ? similarityBoost : 0.82,
        style: Number.isFinite(style) ? style : 0.22,
        use_speaker_boost: useSpeakerBoost,
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

function pickBrowserVoice(voices: SpeechSynthesisVoice[], language: string): SpeechSynthesisVoice | undefined {
  if (!voices.length) return undefined;

  const langPrefix = language.toLowerCase().slice(0, 2);
  const inLanguage = voices.filter((voice) => voice.lang.toLowerCase().startsWith(langPrefix));
  const candidates = inLanguage.length ? inLanguage : voices;

  const preferredPatterns = [
    /natural/i,
    /neural/i,
    /premium/i,
    /google/i,
    /microsoft/i,
    /enhanced/i,
    /alek|irina|milena|daria|anna|yana|olga|elena|alina/i,
  ];

  for (const pattern of preferredPatterns) {
    const match = candidates.find((voice) => pattern.test(`${voice.name} ${voice.voiceURI}`));
    if (match) return match;
  }

  return candidates[0];
}

export function useSpeechSynthesis(): SpeechSynthesisState {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices() || [];
      setAvailableVoices(voices);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    try {
      window.speechSynthesis?.cancel();
      if (audioRef.current) {
        const source = audioRef.current.src;
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
        if (source.startsWith('blob:')) {
          URL.revokeObjectURL(source);
        }
      }
    } finally {
      setIsSpeaking(false);
    }
  }, []);

  const speak = useCallback(async (text: string, language = 'ru-RU') => {
    const prepared = cleanForSpeech(text);
    if (!prepared) return false;

    stop();
    setError(null);

    try {
      const elevenUrl = await synthesizeWithElevenLabs(prepared);
      if (elevenUrl) {
        const audio = new Audio(elevenUrl);
        audioRef.current = audio;
        setIsSpeaking(true);
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(elevenUrl);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
        };
        audio.onerror = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(elevenUrl);
          if (audioRef.current === audio) {
            audioRef.current = null;
          }
        };
        await audio.play();
        return true;
      }
    } catch {
      setError('elevenlabs-failed');
    }

    if (!isSupported) {
      setError('speech-synthesis-not-supported');
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(prepared);
    utterance.lang = language;

    const voice = pickBrowserVoice(availableVoices, language);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setError('speech-synthesis-failed');
      setIsSpeaking(false);
    };

    try {
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
      return true;
    } catch {
      setError('speech-synthesis-failed');
      setIsSpeaking(false);
      return false;
    }
  }, [availableVoices, isSupported, stop]);

  return {
    isSpeaking,
    error,
    isSupported,
    availableVoices,
    speak,
    stop,
  };
}
