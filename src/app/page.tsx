"use client";

import "../assets/styles/base.css";
import "../assets/styles/components.css";
import "../assets/styles/utilities.css";

import { FormSection } from "@/sections/form";
import { ResultSection } from "@/sections/result";
import { Provider } from "./provider";

export default function Page() {
  return (
    <Provider>
      <FormSection />
      <ResultSection />
    </Provider>
  );
}
