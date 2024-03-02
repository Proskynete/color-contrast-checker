"use client";

import { ContrastProvider, defaultContrast } from "@/contexts/contrast";

export function Provider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ContrastProvider values={defaultContrast}>{children}</ContrastProvider>
  );
}
