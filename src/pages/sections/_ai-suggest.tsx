import { useStore } from '@nanostores/react';
import { useState } from 'react';

import { backgroundStore, textStore } from '../../store/values.store';
import { contrastRatio } from '../../utils/contrast.util';

type Suggestion = {
  label: string;
  color: string;
  ratio: number;
  wcagLevel: string;
  adjusts: 'text' | 'bg';
};

type Props = {
  isSignedIn: boolean;
  plan: string;
  creditsUsed: number;
};

const BADGE_STYLES: Record<string, string> = {
  AAA: 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]',
  AA:  'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
  A:   'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
  fail:'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
};

export const AiSuggest = ({ isSignedIn, plan, creditsUsed }: Props) => {
  const $text = useStore(textStore);
  const $background = useStore(backgroundStore);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const ratio = contrastRatio({ text: `#${$text}`, background: `#${$background}` });
  const fails = ratio < 4.5;
  const freeCreditsLeft = plan === 'free' ? Math.max(0, 3 - creditsUsed) : null;

  if (!fails) return null;

  const handleSuggest = async () => {
    if (!isSignedIn) {
      document.querySelector<HTMLButtonElement>('[data-clerk-sign-in]')?.click();
      return;
    }

    setLoading(true);
    setError(null);
    setOpen(true);

    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textColor: `#${$text}`, bgColor: `#${$background}` }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong');
        return;
      }

      setSuggestions(data.suggestions);
    } catch {
      setError('Failed to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = (suggestion: Suggestion) => {
    const hex = suggestion.color.replace('#', '');
    if (suggestion.adjusts === 'text') textStore.set(hex);
    else backgroundStore.set(hex);
    setOpen(false);
    setSuggestions([]);
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-[#1A1917] hover:bg-[#2C2B28] disabled:opacity-50 text-white text-sm font-medium transition-colors"
      >
        <span className="text-base">✨</span>
        {loading ? 'Analyzing colors…' : 'Suggest accessible colors with AI'}
        {freeCreditsLeft !== null && !loading && (
          <span className="ml-1 text-xs text-white/50">{freeCreditsLeft}/3 left</span>
        )}
      </button>

      {!isSignedIn && (
        <p className="text-xs text-center text-[#9C9A93]">Sign in to use AI suggestions · 3 free per month</p>
      )}

      {open && (
        <div className="bg-white border border-[#E2E0DA] rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E0DA]">
            <p className="text-xs font-semibold text-[#1A1917] uppercase tracking-wider">AI Suggestions</p>
            <button
              onClick={() => { setOpen(false); setSuggestions([]); }}
              className="text-[#9C9A93] hover:text-[#1A1917] transition-colors text-lg leading-none"
            >×</button>
          </div>

          {error && (
            <div className="px-5 py-4 text-sm text-red-600 bg-red-50">{error}</div>
          )}

          {loading && (
            <div className="px-5 py-8 text-sm text-center text-[#9C9A93]">
              Analyzing color combinations…
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="divide-y divide-[#F3F2EF]">
              {suggestions.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-5 py-3.5 hover:bg-[#FAFAF9] transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg border border-[#E2E0DA] shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-[#1A1917]">{s.label}</p>
                        <span className={`text-xs font-semibold px-1.5 py-px rounded ${BADGE_STYLES[s.wcagLevel] ?? BADGE_STYLES.fail}`}>
                          {s.wcagLevel}
                        </span>
                      </div>
                      <p className="text-xs text-[#9C9A93]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                        {s.color} · {s.ratio.toFixed(2)}:1
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => applySuggestion(s)}
                    className="text-xs px-3 py-1.5 rounded-md border border-[#E2E0DA] bg-white text-[#1A1917] hover:bg-[#F7F6F3] font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
