import type { ColorsToContrast, RGB } from "../types";

const hexToRgb = (hex: string) => {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b] as RGB;
};

const relativeLuminance = ([r, g, b]: RGB) => {
  const [rs, gs, bs] = [r, g, b].map((value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

export const contrastRatio = ({ text, background }: ColorsToContrast) => {
  const _text = relativeLuminance(hexToRgb(text));
  const _background = relativeLuminance(hexToRgb(background));

  return (
    (Math.max(_text, _background) + 0.05) /
    (Math.min(_text, _background) + 0.05)
  );
};
