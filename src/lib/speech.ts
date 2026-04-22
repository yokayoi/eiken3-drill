let cachedVoice: SpeechSynthesisVoice | null = null;

function getNativeVoice(): SpeechSynthesisVoice | null {
  if (cachedVoice) return cachedVoice;
  const voices = window.speechSynthesis.getVoices();
  // Prefer high-quality native en-US voices
  const preferred = [
    'Samantha', 'Alex', 'Daniel', 'Karen', 'Moira',
    'Google US English', 'Microsoft Zira', 'Microsoft David',
  ];
  for (const name of preferred) {
    const v = voices.find(v => v.name.includes(name) && v.lang.startsWith('en'));
    if (v) { cachedVoice = v; return v; }
  }
  // Fallback: any en-US voice that isn't "compact" or low-quality
  const enUS = voices.find(v => v.lang === 'en-US' && !v.name.toLowerCase().includes('compact'));
  if (enUS) { cachedVoice = enUS; return enUS; }
  // Last resort: any English voice
  const en = voices.find(v => v.lang.startsWith('en'));
  if (en) { cachedVoice = en; return en; }
  return null;
}

export function speak(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.85;
  u.pitch = 1.0;
  const voice = getNativeVoice();
  if (voice) u.voice = voice;
  window.speechSynthesis.speak(u);
}

// Pre-load voices (some browsers load asynchronously)
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoice = null;
    getNativeVoice();
  };
}
