import { useStore } from "@nanostores/react";

import { getContrastResults } from "../../helpers/contrast.helper";
import { backgroundStore, textStore } from "../../store/values.store";

function getBadgeStyle(value: string) {
  if (value === "AAA" || value === "AA") return "bg-green-100 text-green-700";
  return "bg-red-100 text-red-600";
}

function getBadgeLabel(value: string) {
  if (value === "AAA") return "AAA";
  if (value === "AA") return "AA";
  return "Fail";
}

function isPass(value: string) {
  return value === "AA" || value === "AAA";
}

export const ContrastResult = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  const { ratio, levels, classification } = getContrastResults({
    text: `#${$text}`,
    background: `#${$background}`,
  });

  const failing = ratio < 4.5;
  const ratioBg = failing ? "#FFF5F5" : "#F0FFF4";
  const ratioTextColor = failing ? "#DC2626" : "#16A34A";

  const uiLevel = ratio >= 3 ? "AA" : "A";
  const allLevels = [
    ...levels,
    { title: "UI Components", value: uiLevel },
  ];

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h2 className="text-sm font-semibold text-[#111827] mb-4">WCAG Results</h2>

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

      {/* Level rows */}
      <div className="flex flex-col gap-2 mb-4">
        {allLevels.map((level) => (
          <div
            key={level.title}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#F9FAFB] border border-[#F3F4F6]"
          >
            <div className="flex items-center gap-2.5">
              {isPass(level.value) ? (
                <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5 3.5-4" stroke="#16A34A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M3 3l4 4M7 3l-4 4" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
              <span className="text-sm font-medium text-[#374151]">{level.title}</span>
            </div>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getBadgeStyle(level.value)}`}>
              {getBadgeLabel(level.value)}
            </span>
          </div>
        ))}
      </div>

      {/* WCAG requirements */}
      <div className="pt-3 border-t border-[#F3F4F6]">
        <p className="text-xs font-semibold text-[#6B7280] mb-1.5">WCAG Requirements:</p>
        <ul className="text-xs text-[#9CA3AF] space-y-0.5">
          <li>• AA normal text: 4.5:1</li>
          <li>• AA large text: 3:1</li>
          <li>• AAA normal text: 7:1</li>
          <li>• AAA large text: 4.5:1</li>
        </ul>
      </div>
    </div>
  );
};
