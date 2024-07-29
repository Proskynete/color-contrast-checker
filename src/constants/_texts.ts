import { ResultSectionState } from "@/sections/result";

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
