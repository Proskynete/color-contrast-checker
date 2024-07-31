import type { TYPES } from "../config/constants";

export type RGB = [number, number, number];
export type TextTypesAllowed = keyof typeof TYPES;

export interface ColorsToContrast {
  text: string;
  background: string;
}

export interface GetAccessibilityLevel {
  ratio: number;
  type: TextTypesAllowed;
}

export interface AccessibilityStructure {
  title: string;
  key: string;
  value: string;
  style: string;
}

export interface GetLevel {
  ratio: number;
  thresholds: { AAA: number; AA: number };
}
