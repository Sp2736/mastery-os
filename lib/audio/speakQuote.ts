/**
 * Audio synthesis helper to read quotes using a heavy, resonant male voice
 * via the native Web Speech API.
 */

export function getHeavyMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
  if (englishVoices.length === 0) return voices[0] || null;

  // Preferred deep/heavy male voices in priority order
  const priorityPatterns = [
    /christopher/i,
    /guy/i,
    /ryan/i,
    /david/i,
    /george/i,
    /daniel/i,
    /james/i,
    /oliver/i,
    /alex/i,
    /uk english male/i,
    /male/i,
  ];

  for (const pattern of priorityPatterns) {
    const match = englishVoices.find(v => pattern.test(v.name));
    if (match) return match;
  }

  // Filter out known female voices if possible
  const nonFemale = englishVoices.find(
    v => !/(female|zira|hazel|susan|catherine|jenny|aria|sonia|samantha|victoria|karen)/i.test(v.name)
  );

  return nonFemale || englishVoices[0];
}

export function speakQuote({
  text,
  author,
  onEnd,
}: {
  text: string;
  author: string;
  onEnd?: () => void;
}): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return () => {};
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const fullTextToRead = `${text}. ${author}.`;
  const utterance = new SpeechSynthesisUtterance(fullTextToRead);

  // Heavy, deep, calm voice calibration
  utterance.pitch = 0.82; // Lower pitch for deep baritone resonance
  utterance.rate = 0.84;  // Measured, composed pacing
  utterance.volume = 1.0;

  const selectedVoice = getHeavyMaleVoice();
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  if (onEnd) {
    utterance.onend = () => onEnd();
  }

  // Speak
  window.speechSynthesis.speak(utterance);

  // Return cancel function
  return () => {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cleanup error
    }
  };
}
