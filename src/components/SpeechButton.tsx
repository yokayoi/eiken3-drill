'use client';

import { speak } from '@/lib/speech';
import { PixelSpeaker } from './PixelIcons';

export default function SpeechButton({ text }: { text: string }) {
  return (
    <button
      onClick={() => speak(text)}
      className="btn-pixel inline-flex items-center justify-center w-11 h-11 rounded-none bg-kcard"
      aria-label={`${text} を発音`}
      type="button"
    >
      <PixelSpeaker size={18} color="#FF2D78" />
    </button>
  );
}
