import type { ContrastRatio } from "../types";
import {
  classifyContrastRatio,
  contrastRatio,
  getAccessibilityLevels,
} from "../utils/contrast.util";

export const getContrastResults = ({ text, background }: ContrastRatio) => {
  const ratio = contrastRatio(text, background);
  const classification = classifyContrastRatio(ratio);
  const levels = getAccessibilityLevels(text, background);

  return {
    ratio,
    classification,
    levels: [levels.largeText, levels.smallText],
  };
};
