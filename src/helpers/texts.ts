"use client";

export type Contrast = "good" | "warning" | "error";

interface TextMapping {
  [key: string]: {
    title: string;
    description: string;
    suggestion?: string[];
    label: Contrast;
  };
}

export const textMapping: TextMapping = {
  good_good: {
    title: "🤩 Excellent",
    description:
      "Colors accomplish optimal contrast ratio (AAA) at all text sizes",
    label: "good",
  },
  warning_good: {
    title: "Good 🥳",
    description:
      "Colors accomplish the optimal contrast ratio (AAA) only in texts below 18pt",
    suggestion: ["You can still improve the contrast of text above 18pt."],
    label: "good",
  },
  good_warning: {
    title: "Good 🥳",
    description:
      "The colors accomplish the optimal contrast ratio (AAA) only in texts above 18pt",
    suggestion: ["You can still improve the contrast of text below 18pt."],
    label: "good",
  },
  warning_warning: {
    title: "Fair 😕",
    description:
      "Colors accomplish the minimum contrast ratio (AA) at all text sizes",
    suggestion: [
      "You can still enhance the contrast to accomplish the optimal contrast ratio (AAA).",
    ],
    label: "warning",
  },
  error_good: {
    title: "Fair 😕",
    description:
      "Colors only have an optimal contrast ratio (AAA) in texts below 18pt",
    suggestion: ["You need to improve contrast for text above 18pt."],
    label: "warning",
  },
  good_error: {
    title: "Fair 😕",
    description:
      "Colors only have an optimal contrast ratio (AAA) in texts above 18pt",
    suggestion: ["You need to improve the contrast for texts below 18pt."],
    label: "warning",
  },
  error_warning: {
    title: "Poor 😞",
    description:
      "Colors only have a minimum contrast ratio (AA) in texts below 18pt",
    suggestion: [
      "Contrast can still be improved for texts below 18pt to go from a minimum contrast ratio (AA) to an optimal contrast ratio (AAA).",
      "Contrast must be improved for text above 18pt to meet the minimum contrast ratio (AA).",
    ],
    label: "error",
  },
  warning_error: {
    title: "Poor 😞",
    description:
      "Colors only have a minimum contrast ratio (AA) in texts above 18pt",
    suggestion: [
      "Contrast can still be improved for texts above 18pt to go from a minimum contrast ratio (AA) to an optimal contrast ratio (AAA).",
      "Contrast must be improved for text below 18pt to meet the minimum contrast ratio (AA).",
    ],
    label: "error",
  },
  error_error: {
    title: "Very Poor 😭",
    description:
      "Colors do not meet the minimum contrast ratio (AA) at all text sizes",
    suggestion: ["It is recommended to review the colors to improve contrast."],
    label: "error",
  },
};

interface TextToShowParams {
  largeText: string;
  smallText: string;
}

export const textToShow = ({ largeText, smallText }: TextToShowParams) =>
  textMapping[`${largeText!}_${smallText!}`] || "";
