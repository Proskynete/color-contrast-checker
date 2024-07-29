export const CONSTANTS = {
  COLORS: {
    DEFAULT: "383838",
    TEXT: "383838",
    BACKGROUND: "ffffff",
  },
  ID: {
    TEXT: "textColor",
    BACKGROUND: "backgroundColor",
  },
} as const;

export const contrastColors = {
  good: "bg-green-600/30 text-green-900",
  warning: "bg-yellow-600/30 text-yellow-900",
  error: "bg-red-600/30 text-red-900",
};
