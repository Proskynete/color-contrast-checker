import { useStore } from "@nanostores/react";

import { getContrastResults } from "../../helpers/contrast.helper";
import { backgroundStore, textStore } from "../../store/values.store";

const PASS_STYLES = "bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]";
const FAIL_STYLES = "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]";
const WARN_STYLES = "bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]";

function getBadgeStyle(value: string) {
  if (value === "AAA" || value === "AA") return PASS_STYLES;
  if (value === "A") return WARN_STYLES;
  return FAIL_STYLES;
}

function getRatioColor(ratio: number) {
  if (ratio >= 7) return "#16A34A";
  if (ratio >= 4.5) return "#2563EB";
  if (ratio >= 3) return "#D97706";
  return "#DC2626";
}

export const ContrastResult = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);

  const { ratio, levels, classification } = getContrastResults({
    text: `#${$text}`,
    background: `#${$background}`,
  });

  return (
    <div className="bg-white border border-[#E2E0DA] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span
            className="text-5xl font-bold tracking-tight"
            style={{ fontFamily: 'var(--font-mono, monospace)', color: getRatioColor(ratio) }}
          >
            {ratio.toFixed(2)}
          </span>
          <span className="text-sm text-[#9C9A93]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>:1</span>
        </div>
        <p className="text-sm font-medium text-[#1A1917]">{classification.title}</p>
        <p className="text-xs text-[#9C9A93] max-w-64">{classification.detail}</p>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        {levels.map((level) => (
          <div key={level.title} className="flex items-center justify-between gap-8">
            <span className="text-xs text-[#6B6860] font-medium">{level.title}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${getBadgeStyle(level.value)}`}>
              {level.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
