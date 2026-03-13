import { useStore } from '@nanostores/react';
import { useState } from 'react';

import { backgroundStore, textStore } from '../../store/values.store';
import { type DaltonismType,simulateDaltonism } from '../../utils/color-convert.util';
import { contrastRatio } from '../../utils/contrast.util';

const DALTONISM_TYPES: { type: DaltonismType; label: string; sub: string }[] = [
  { type: 'protanopia', label: 'Protanopia', sub: 'red' },
  { type: 'deuteranopia', label: 'Deuteranopia', sub: 'green' },
  { type: 'tritanopia', label: 'Tritanopia', sub: 'blue' },
  { type: 'achromatopsia', label: 'Achromatopsia', sub: 'total' },
];

export const Preview = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);
  const [showDaltonism, setShowDaltonism] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <p className="text-xs font-semibold text-[#6B7280] mb-3">Preview</p>

      {/* Live preview */}
      <div
        className="rounded-lg p-5 mb-4"
        style={{ color: `#${$text}`, backgroundColor: `#${$background}` }}
      >
        <p className="text-2xl font-bold mb-2 leading-tight">Example Heading</p>
        <p className="text-sm mb-4 leading-relaxed opacity-90">
          This is a sample paragraph to visualize how the text looks with this color combination. Readability is fundamental for web accessibility.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ backgroundColor: `#${$text}`, color: `#${$background}` }}
          >
            Primary button
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-semibold border"
            style={{ borderColor: `#${$text}`, color: `#${$text}`, backgroundColor: 'transparent' }}
          >
            Secondary button
          </button>
        </div>
      </div>

      {/* Daltonism section */}
      <div className="border-t border-[#F3F4F6] pt-3">
        <button
          onClick={() => setShowDaltonism(!showDaltonism)}
          className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#374151] transition-colors"
        >
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="8" r="3" />
            <path d="M2 8s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" />
          </svg>
          <span className="font-medium">Color blindness simulation</span>
          <span className="text-[#9CA3AF]">({showDaltonism ? 'hide' : 'show'})</span>
        </button>

        {showDaltonism && (
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            {DALTONISM_TYPES.map(({ type, label, sub }) => {
              const simText = simulateDaltonism($text, type);
              const simBg = simulateDaltonism($background, type);
              const simRatio = contrastRatio({ text: `#${simText}`, background: `#${simBg}` });
              const ratioColor = simRatio >= 4.5 ? '#16A34A' : '#D97706';

              return (
                <div key={type} className="rounded-lg border border-[#E5E7EB] overflow-hidden">
                  <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F9FAFB] border-b border-[#E5E7EB]">
                    <span className="text-xs text-[#374151] font-medium">
                      {label} <span className="text-[#9CA3AF] font-normal">({sub})</span>
                    </span>
                    <span className="text-xs font-bold" style={{ color: ratioColor }}>
                      {simRatio.toFixed(2)}:1
                    </span>
                  </div>
                  <div
                    className="px-2.5 py-2 text-sm font-medium"
                    style={{ color: `#${simText}`, backgroundColor: `#${simBg}` }}
                  >
                    Sample text
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
