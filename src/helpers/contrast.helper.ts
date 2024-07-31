import { CLASSIFY_CONTRAST, LEVEL_CLASSES, TYPES } from "../config/constants";
import type {
  ColorsToContrast,
  GetAccessibilityLevel,
  GetLevel,
} from "../types";
import { contrastRatio } from "../utils/contrast.util";

export const getContrastResults = ({ text, background }: ColorsToContrast) => {
  const ratio = contrastRatio({ text, background });
  const classification = classifyContrastRatio(ratio);
  const levels = getAccessibilityLevels({ text, background });

  return {
    ratio,
    classification,
    levels: [levels.largeText, levels.smallText],
  };
};

const getAccessibilityLevel = ({ ratio, type }: GetAccessibilityLevel) => {
  const thresholds =
    type === TYPES.small ? { AAA: 7, AA: 4.5 } : { AAA: 4.5, AA: 3 };
  return getLevel({ ratio, thresholds });
};

const getLevel = ({ ratio, thresholds }: GetLevel) => {
  if (ratio >= thresholds.AAA) return LEVEL_CLASSES.AAA;
  else if (ratio >= thresholds.AA) return LEVEL_CLASSES.AA;
  else return LEVEL_CLASSES.A;
};

const getAccessibilityLevels = ({ text, background }: ColorsToContrast) => {
  const ratio = contrastRatio({ text, background });
  return {
    smallText: {
      title: "Small Text",
      key: TYPES.small,
      ...getAccessibilityLevel({ ratio, type: TYPES.small }),
    },
    largeText: {
      title: "Large Text",
      key: TYPES.large,
      ...getAccessibilityLevel({ ratio, type: TYPES.large }),
    },
  };
};

const classifyContrastRatio = (ratio: number) => {
  if (ratio >= 11) return CLASSIFY_CONTRAST.EXCELLENT;
  else if (ratio >= 7) return CLASSIFY_CONTRAST.VERY_GOOD;
  else if (ratio >= 4.5) return CLASSIFY_CONTRAST.GOOD;
  else if (ratio >= 3) return CLASSIFY_CONTRAST.POOR;
  else return CLASSIFY_CONTRAST.VERY_POOR;
};
