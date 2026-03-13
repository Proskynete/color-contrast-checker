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
  AAA: 'bg-green-100 text-green-700',
  AA:  'bg-green-100 text-green-700',
  A:   'bg-yellow-100 text-yellow-700',
  fail:'bg-red-100 text-red-600',
};

export const AiSuggest = ({ isSignedIn, plan, creditsUsed }: Props) => {
  const $text = useStore(textStore);
  const $background = useStore(backgroundStore);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const ratio = contrastRatio({ text: `#${$text}`, background: `#${$background}` });
  const fails = ratio < 4.5;
  const freeCreditsLeft = plan === 'free' ? Math.max(0, 3 - creditsUsed) : null;

  const handleSuggest = async () => {
    if (!isSignedIn) {
      document.querySelector<HTMLButtonElement>('[data-clerk-sign-in]')?.click();
      return;
    }

    setLoading(true);
    setError(null);
    setFetched(false);

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
      setFetched(true);
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
    setSuggestions([]);
    setFetched(false);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#111827]">AI Suggestions</h2>

        {fails && (
          <button
            onClick={handleSuggest}
            disabled={loading}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#111827] hover:bg-[#1F2937] disabled:opacity-50 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <span>✨</span>
            {loading ? 'Analyzing…' : 'Get suggestions'}
            {freeCreditsLeft !== null && !loading && (
              <span className="text-white/50 ml-0.5">{freeCreditsLeft}/3</span>
            )}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="mt-4">
        {!fails && (
          <div className="flex items-center gap-2 text-sm text-[#6B7280]">
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path d="M2 5l2.5 2.5 3.5-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            Colors meet WCAG requirements.
          </div>
        )}

        {fails && !fetched && !loading && !error && (
          <p className="text-xs text-[#9CA3AF]">
            {!isSignedIn
              ? 'Sign in to use AI suggestions · 3 free per month'
              : 'Click "Get suggestions" to receive accessible colors.'}
          </p>
        )}

        {loading && (
          <p className="text-sm text-[#9CA3AF] py-2">Analyzing color combinations…</p>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        {!loading && !error && suggestions.length > 0 && (
          <div className="flex flex-col gap-2">
            {suggestions.map((s) => (
              <div
                key={s.label}
                className="flex items-center justify-between p-3 rounded-lg border border-[#F3F4F6] bg-[#F9FAFB] hover:bg-[#F3F4F6] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg border border-[#E5E7EB] shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-[#111827]">{s.label}</p>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE_STYLES[s.wcagLevel] ?? BADGE_STYLES.fail}`}>
                        {s.wcagLevel}
                      </span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                      {s.color} · {s.ratio.toFixed(2)}:1
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => applySuggestion(s)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6] font-semibold transition-colors"
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
