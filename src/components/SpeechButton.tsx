'use client';

import { speak } from '@/lib/speech';

export default function SpeechButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => speak(text)}
      className="btn-neon inline-flex items-center justify-center w-11 h-11 rounded-full bg-kcard border border-kpink/40 text-kpink active:bg-kpink active:text-white transition-colors"
      aria-label={`${text} を発音`}
      type="button"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    </button>
  );
}
