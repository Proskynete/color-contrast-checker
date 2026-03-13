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
      window.location.href = '/sign-in';
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
    <div className="w-full flex flex-col gap-3">
      <button
        onClick={handleSuggest}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
      >
        <span>✨</span>
        {loading ? 'Getting suggestions…' : 'Suggest with AI'}
        {freeCreditsLeft !== null && (
          <span className="ml-1 text-xs opacity-75">({freeCreditsLeft} left)</span>
        )}
      </button>

      {!isSignedIn && (
        <p className="text-xs text-center text-gray-500">Sign in to use AI suggestions (3 free/month)</p>
      )}

      {open && (
        <div className="w-full rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-800">AI Suggestions</p>
            <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
          </div>

          {error && (
            <div className="px-4 py-3 text-sm text-red-600 bg-red-50">{error}</div>
          )}

          {loading && (
            <div className="px-4 py-6 text-sm text-center text-gray-500">Analyzing colors…</div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="divide-y divide-gray-100">
              {suggestions.map((s) => (
                <div key={s.label} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-md border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: s.color }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{s.label}</p>
                      <p className="text-xs text-gray-500">{s.color} · {s.ratio.toFixed(2)}:1 · {s.wcagLevel}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => applySuggestion(s)}
                    className="text-xs px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-medium transition-colors"
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
