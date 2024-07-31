export function hexToRgb(hex: string): [number, number, number] {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

export function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((value) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function contrastRatio(color1: string, color2: string): number {
  const luminance1 = relativeLuminance(hexToRgb(color1));
  const luminance2 = relativeLuminance(hexToRgb(color2));
  return (
    (Math.max(luminance1, luminance2) + 0.05) /
    (Math.min(luminance1, luminance2) + 0.05)
  );
}

export function getAccessibilityLevel(
  ratio: number,
  textType: "small" | "large"
): { value: string; style: string } {
  if (textType === "small") {
    if (ratio >= 7) {
      return {
        value: "AAA",
        style: "bg-green-600/30 text-green-900",
      };
    } else if (ratio >= 4.5) {
      return {
        value: "AA",
        style: "bg-yellow-600/30 text-yellow-900",
      };
    } else {
      return {
        value: "A",
        style: "bg-red-600/30 text-red-900",
      };
    }
  } else {
    if (ratio >= 4.5) {
      return {
        value: "AAA",
        style: "bg-green-600/30 text-green-900",
      };
    } else if (ratio >= 3) {
      return {
        value: "AA",
        style: "bg-yellow-600/30 text-yellow-900",
      };
    } else {
      return {
        value: "A",
        style: "bg-red-600/30 text-red-900",
      };
    }
  }
}

export function getAccessibilityLevels(
  textColor: string,
  backgroundColor: string
): {
  smallText: { title: string; key: string; value: string; style: string };
  largeText: { title: string; key: string; value: string; style: string };
} {
  const ratio = contrastRatio(textColor, backgroundColor);
  return {
    smallText: {
      title: "Small Text",
      key: "small",
      ...getAccessibilityLevel(ratio, "small"),
    },
    largeText: {
      title: "Large Text",
      key: "large",
      ...getAccessibilityLevel(ratio, "large"),
    },
  };
}

export function classifyContrastRatio(ratio: number): string {
  if (ratio >= 7) {
    return "Excellent 🤩";
  } else if (ratio >= 4.5) {
    return "Very Good 🥳";
  } else if (ratio >= 3) {
    return "Good 😊";
  } else if (ratio >= 1.5) {
    return "Poor 😞";
  } else {
    return "Very Poor 😭";
  }
}
