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
    description: "This color combination is accessible to most users",
    label: "good",
  },
  good_warning: {
    title: "Good 🥳",
    description: "This color combination is accessible to most users",
    label: "good",
  },
  error_good: {
    title: "Fair 😕",
    description: "This color combination is accessible to some users",
    label: "warning",
  },
  warning_warning: {
    title: "Fair 😕",
    description: "This color combination is accessible to some users",
    label: "warning",
  },
  good_error: {
    title: "Fair 😕",
    description: "This color combination is accessible to some users",
    label: "warning",
  },
  error_warning: {
    title: "Poor 😞",
    description: "This color combination is not accessible to most users",
    label: "error",
  },
  warning_error: {
    title: "Poor 😞",
    description: "This color combination is not accessible to most users",
    label: "error",
  },
  error_error: {
    title: "Poor 😞",
    description: "Please don't use this color combination",
    label: "error",
  },
};

interface TextToShowParams {
  largeText: string;
  smallText: string;
}

export const textToShow = ({ largeText, smallText }: TextToShowParams) =>
  textMapping[`${largeText!}_${smallText!}`] || "";
