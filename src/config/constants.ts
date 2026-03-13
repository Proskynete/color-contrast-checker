export const DEFAULT_VALUES = {
  BACKGROUND_COLOR: "FFFFFF",
  TEXT_COLOR: "383838",
};

export const TYPES = {
  small: "small",
  large: "large",
} as const;

export const LEVELS = {
  AAA: "AAA",
  AA: "AA",
  A: "A",
} as const;

export const CLASSIFY_CONTRAST = {
  EXCELLENT: {
    title: "Excellent 🤩",
    detail:
      "Colors accomplish the optimal contrast ratio (AAA) in all text sizes.",
    styles: "bg-green-600/30 text-green-900",
  },
  VERY_GOOD: {
    title: "Very Good 🥳",
    detail:
      "Colors accomplish the optimal contrast ratio (AAA) only in small texts (below 18pt) and large texts (above 18pt or bold above 14pt).",
    styles: "bg-green-600/30 text-green-900",
  },
  GOOD: {
    title: "Good 😊",
    detail:
      "Colors accomplish the minimal contrast ratio (AA) in all text sizes.",
    styles: "bg-yellow-600/30 text-yellow-900",
  },
  POOR: {
    title: "Poor 😞",
    detail:
      "Colors do not accomplish the minimal contrast ratio (AA) in small texts (below 18pt) and large texts (above 18pt or bold above 14pt).",
    styles: "bg-red-600/30 text-red-900",
  },
  VERY_POOR: {
    title: "Very Poor 😭",
    detail:
      "Colors do not accomplish the minimal contrast ratio (AA) in any text size.",
    styles: "bg-red-600/30 text-red-900",
  },
};

export const LEVEL_CLASSES = {
  [LEVELS.AAA]: {
    value: LEVELS.AAA,
    styles: "bg-green-600/30 text-green-900",
  },
  [LEVELS.AA]: {
    value: LEVELS.AA,
    styles: "bg-yellow-600/30 text-yellow-900",
  },
  [LEVELS.A]: {
    value: LEVELS.A,
    styles: "bg-red-600/30 text-red-900",
  },
};
