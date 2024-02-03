export type Contrast = "good" | "warning" | "error";

interface TextMapping {
  [key: string]: {
    title: string;
    description: string;
    label: Contrast;
  };
}

export const textMapping: TextMapping = {
  good_good: {
    title: "🤩 Excellent",
    description: "This color combination is accessible to all users",
    label: "good",
  },
  warning_good: {
    title: "Good 🥳",
    description: "Good contrast for all text sizes, but it could be better",
    label: "good",
  },
  good_warning: {
    title: "Good 🥳",
    description: "Good contrast for all text sizes, but it could be better",
    label: "good",
  },
  error_good: {
    title: "Fair 😕",
    description: "",
    label: "warning",
  },
  warning_warning: {
    title: "Fair 😕",
    description:
      "Fair contrast for all text sizes. It is accessible, but it could be better",
    label: "warning",
  },
  good_error: {
    title: "Fair 😕",
    description: "",
    label: "warning",
  },
  error_warning: {
    title: "Poor 😞",
    description:
      "Poor contrast for small text sizes and normal contrast for large text sizes.",
    label: "error",
  },
  warning_error: {
    title: "Poor 😞",
    description:
      "Poor contrast for large text sizes and normal contrast for small text sizes.",
    label: "error",
  },
  error_error: {
    title: "Very Poor 😭",
    description:
      "Poor contrast for all text sizes. This color combination is not accessible to almost anyone.",
    label: "error",
  },
};

interface TextToShowParams {
  largeText: string;
  smallText: string;
}

export const textToShow = ({ largeText, smallText }: TextToShowParams) =>
  textMapping[`${largeText!}_${smallText!}`] || "";
