"use client";

import "../assets/styles/base.css";
import "../assets/styles/components.css";
import "../assets/styles/utilities.css";

import { FormSection } from "@/sections/form";
import { ResultSection } from "@/sections/result";
import { ContrastProvider, defaultContrast } from "@/contexts/contrast";

export default function Page() {
  return (
    <ContrastProvider values={defaultContrast}>
      <FormSection />
      <ResultSection />
    </ContrastProvider>
  );
}
