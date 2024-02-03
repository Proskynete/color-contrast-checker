import { ResultSectionState } from "../views/sections/result";

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
};

export const contrastColors = {
  good: "bg-green-600/30 text-green-900",
  warning: "bg-yellow-600/30 text-yellow-900",
  error: "bg-red-600/30 text-red-900",
};

interface TextSizes {
  title: string;
  assessment: keyof ResultSectionState;
  customStyles: string;
}

export const textSizes: TextSizes[] = [
  {
    title: "Small Text",
    assessment: "smallText",
    customStyles:
      "rounded-xl lg:rounded-tr-xl lg:rounded-l-none lg:rounded-br-none",
  },
  {
    title: "Large Text",
    assessment: "largeText",
    customStyles:
      "rounded-xl lg:rounded-br-xl lg:rounded-l-none lg:rounded-tr-none",
  },
];
