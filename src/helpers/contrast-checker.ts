"use client";

interface ContrastCheckerParams {
  firstColor: number;
  secondColor: number;
}

export const contrastChecker = ({
  firstColor,
  secondColor,
}: ContrastCheckerParams) =>
  firstColor > secondColor
    ? (secondColor + 0.05) / (firstColor + 0.05)
    : (firstColor + 0.05) / (secondColor + 0.05);

export const evaluateResult = (total: number, num1: number, num2: number) =>
  total < num1 ? "good" : total < num2 ? "warning" : "error";
