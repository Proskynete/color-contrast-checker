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
