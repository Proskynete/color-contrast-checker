import { useStore } from "@nanostores/react";
import { useState } from "react";

import { getContrastResults } from "../../helpers/contrast.helper";
import { backgroundStore, textStore } from "../../store/values.store";

const SIZES = [12, 14, 16, 18, 24, 32];

type SizeStatus = 'fail' | 'acceptable' | 'optimal';

function getSizeStatus(px: number, ratio: number): SizeStatus {
  if (px < 18) {
    if (ratio >= 7) return 'optimal';
    if (ratio >= 4.5) return 'acceptable';
    return 'fail';
  }
  if (px < 24) {
    if (ratio >= 4.5) return 'optimal';
    if (ratio >= 3.0) return 'acceptable';
    return 'fail';
  }
  if (ratio >= 3.0) return 'optimal';
  return 'fail';
}

const STATUS_CONFIG: Record<SizeStatus, { dot: string; label: string; text: string }> = {
  fail: { dot: 'bg-red-500', label: 'Fail', text: 'text-red-600' },
  acceptable: { dot: 'bg-yellow-400', label: 'Acceptable', text: 'text-yellow-600' },
  optimal: { dot: 'bg-green-500', label: 'Optimal', text: 'text-green-600' },
};

type Props = {
  isSignedIn: boolean;
};

export const ContrastResult = ({ isSignedIn }: Props) => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);
  const [shareState, setShareState] = useState<'idle' | 'loading' | 'copied'>('idle');

  const { ratio, classification } = getContrastResults({
    text: `#${$text}`,
    background: `#${$background}`,
  });

  const handleShare = async () => {
    if (!isSignedIn) {
      document.querySelector<HTMLButtonElement>('[data-clerk-sign-in]')?.click();
      return;
    }
    setShareState('loading');
    try {
      const wcagLevel = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'A' : 'fail';
      const res = await fetch('/api/checks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textColor: `#${$text}`,
          bgColor: `#${$background}`,
          ratio,
          textType: 'small',
          wcagLevel,
          createShareLink: true,
        }),
      });
      const data = await res.json();
      if (res.ok && data.shareUrl) {
        await navigator.clipboard.writeText(`${window.location.origin}${data.shareUrl}`);
        setShareState('copied');
        setTimeout(() => setShareState('idle'), 2500);
      } else {
        setShareState('idle');
      }
    } catch {
      setShareState('idle');
    }
  };

  const failing = ratio < 4.5;
  const ratioBg = failing ? "#FFF5F5" : "#F0FFF4";
  const ratioTextColor = failing ? "#DC2626" : "#16A34A";

  const sizes = SIZES.map(px => ({ px, status: getSizeStatus(px, ratio) }));
  const optimal = sizes.filter(s => s.status === 'optimal');
  const recommended = optimal.length > 0 ? optimal[optimal.length - 1] : sizes.find(s => s.status === 'acceptable');
  const minPassing = sizes.find(s => s.status !== 'fail');

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#111827]">WCAG Results</h2>
        <button
          onClick={handleShare}
          disabled={shareState === 'loading'}
          className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors disabled:opacity-50 ${
            shareState === 'copied'
              ? 'bg-green-50 border-green-200 text-green-700'
              : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
          }`}
        >
          {shareState === 'copied' ? (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8l3 3 7-7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v1a1 1 0 001 1h6a1 1 0 001-1V5a1 1 0 00-1-1h-1M4 12H3a1 1 0 01-1-1V4a1 1 0 011-1h6a1 1 0 011 1v1" />
              </svg>
              {shareState === 'loading' ? 'Sharing…' : 'Share'}
            </>
          )}
        </button>
      </div>

      {/* Ratio display */}
      <div className="rounded-lg p-4 mb-4 text-center" style={{ backgroundColor: ratioBg }}>
        <p
          className="text-5xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-mono, monospace)', color: ratioTextColor }}
        >
          {ratio.toFixed(2)}:1
        </p>
        <p className="text-sm mt-1 font-medium" style={{ color: ratioTextColor }}>
          {failing ? "Does not meet minimum requirements" : classification.title}
        </p>
      </div>

      {/* Recommended size */}
      {recommended ? (
        <div className="bg-[#F0FDF4] border border-green-200 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-green-700">{recommended.px}px recommended</span>
          <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-semibold">optimal</span>
        </div>
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3">
          <span className="text-xs font-bold text-red-700">No size passes with this contrast ratio</span>
        </div>
      )}

      <p className="text-[10px] text-[#9CA3AF] mb-3 leading-relaxed">
        Only valid for large text (18px+ or 14px bold).{' '}
        {minPassing ? `Minimum passing size: ${minPassing.px}px` : 'None pass at this ratio.'}
      </p>

      {/* Size previews */}
      <div className="flex flex-col gap-3 mb-4">
        {sizes.map(({ px, status }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={px} className="flex items-baseline gap-2">
              <div className="flex items-center gap-1.5 w-24 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
              <span
                className="leading-tight truncate flex-1"
                style={{ fontSize: `${px}px`, color: `#${$text}`, lineHeight: 1.2 }}
              >
                Sample text
              </span>
              <span className="text-[10px] text-[#9CA3AF] shrink-0">{px}px</span>
            </div>
          );
        })}
      </div>

      {/* WCAG requirements */}
      <div className="pt-3 border-t border-[#F3F4F6]">
        <p className="text-xs font-semibold text-[#6B7280] mb-1.5">WCAG Requirements:</p>
        <ul className="text-xs text-[#9CA3AF] space-y-0.5">
          <li>• AA normal text (&lt;18px): 4.5:1</li>
          <li>• AA large text (≥18px or 14px bold): 3:1</li>
          <li>• AAA normal text: 7:1</li>
          <li>• AAA large text: 4.5:1</li>
        </ul>
      </div>
    </div>
  );
};
