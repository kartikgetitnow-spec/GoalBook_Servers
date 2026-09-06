import { useState, useCallback, useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useAppStore } from '../store';

export function useTextToSpeech(text: string) {
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0);
  const wordsRef = useRef<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const settings = useAppStore((state) => state.settings);
  const setIsPlayingAudio = useAppStore((state) => state.setIsPlayingAudio);

  useEffect(() => {
    wordsRef.current = text.trim().split(/\s+/).filter(Boolean);
    setCurrentWordIndex(0);
  }, [text]);

  const stop = useCallback(async () => {
    await Speech.stop();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSpeaking(false);
    setIsPlayingAudio(false);
    setCurrentWordIndex(0);
  }, [setIsPlayingAudio]);

  const speak = useCallback(async () => {
    if (!text.trim()) return;

    await stop();
    setIsSpeaking(true);
    setIsPlayingAudio(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const words = wordsRef.current;
    // Calculate approximate ms per word based on reading speed WPM
    const msPerWord = Math.max(100, Math.round(60000 / (settings.readingSpeedWpm || 250)));

    let currentIndex = 0;
    setCurrentWordIndex(0);

    intervalRef.current = setInterval(() => {
      currentIndex += 1;
      if (currentIndex >= words.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      } else {
        setCurrentWordIndex(currentIndex);
      }
    }, msPerWord);

    Speech.speak(text, {
      rate: settings.ttsRate,
      pitch: settings.ttsPitch,
      onDone: () => {
        stop();
      },
      onError: () => {
        stop();
      },
    });
  }, [text, settings.readingSpeedWpm, settings.ttsRate, settings.ttsPitch, stop, setIsPlayingAudio]);

  const toggle = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else {
      speak();
    }
  }, [isSpeaking, speak, stop]);

  useEffect(() => {
    return () => {
      Speech.stop();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isSpeaking,
    currentWordIndex,
    words: wordsRef.current,
    speak,
    stop,
    toggle,
  };
}
