export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (hex.length !== 6) return null;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  return { r, g, b };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
    else if (max === gn) h = ((bn - rn) / d + 2) / 6;
    else h = ((rn - gn) / d + 4) / 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function formatRgbHsl(hex: string): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return '';
  const { r, g, b } = rgb;
  const { h, s, l } = rgbToHsl(r, g, b);
  return `rgb(${r}, ${g}, ${b})  hsl(${h}, ${s}%, ${l}%)`;
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

export function rgbToHex(r: number, g: number, b: number): string {
  return [r, g, b].map(v => clamp(v).toString(16).padStart(2, '0')).join('');
}

export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100, ln = l / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = ln - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

export function hslToHex(h: number, s: number, l: number): string {
  const { r, g, b } = hslToRgb(h, s, l);
  return rgbToHex(r, g, b);
}

export type PaletteType = 'complementarios' | 'analogos' | 'triadico' | 'complementarios-divididos' | 'tetradico' | 'monocromatico';

export function generatePalette(hex: string, type: PaletteType): string[] {
  const rgb = hexToRgb(hex);
  if (!rgb) return [hex];
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);
  if (type === 'complementarios') return [hex, hslToHex((h + 180) % 360, s, l)];
  if (type === 'analogos') return [hslToHex((h - 30 + 360) % 360, s, l), hex, hslToHex((h + 30) % 360, s, l)];
  if (type === 'triadico') return [hex, hslToHex((h + 120) % 360, s, l), hslToHex((h + 240) % 360, s, l)];
  if (type === 'complementarios-divididos') return [hex, hslToHex((h + 150) % 360, s, l), hslToHex((h + 210) % 360, s, l)];
  if (type === 'tetradico') return [hex, hslToHex((h + 90) % 360, s, l), hslToHex((h + 180) % 360, s, l), hslToHex((h + 270) % 360, s, l)];
  // monocromatico
  return [
    hslToHex(h, s, Math.min(l + 40, 95)),
    hslToHex(h, s, Math.min(l + 20, 95)),
    hex,
    hslToHex(h, s, Math.max(l - 20, 5)),
    hslToHex(h, s, Math.max(l - 40, 5)),
  ];
}

export function parseColorInput(input: string): string | null {
  const t = input.trim();
  const hexMatch = t.match(/^#?([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
  if (hexMatch) {
    const hex = hexMatch[1].toLowerCase();
    return hex.length === 3 ? hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2] : hex;
  }
  const rgbMatch = t.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) return rgbToHex(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);
  const hslMatch = t.match(/hsl\s*\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)/i);
  if (hslMatch) return hslToHex(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
  return null;
}

export function lerpColor(hex1: string, hex2: string, t: number): string {
  const c1 = hexToRgb(hex1), c2 = hexToRgb(hex2);
  if (!c1 || !c2) return hex1;
  return rgbToHex(
    Math.round(c1.r + (c2.r - c1.r) * t),
    Math.round(c1.g + (c2.g - c1.g) * t),
    Math.round(c1.b + (c2.b - c1.b) * t),
  );
}

export type DaltonismType = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function simulateDaltonism(hex: string, type: DaltonismType): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const { r, g, b } = rgb;
  let sr: number, sg: number, sb: number;

  if (type === 'protanopia') {
    sr = 0.567 * r + 0.433 * g;
    sg = 0.558 * r + 0.442 * g;
    sb = 0.242 * g + 0.758 * b;
  } else if (type === 'deuteranopia') {
    sr = 0.625 * r + 0.375 * g;
    sg = 0.700 * r + 0.300 * g;
    sb = 0.300 * g + 0.700 * b;
  } else if (type === 'tritanopia') {
    sr = 0.950 * r + 0.050 * g;
    sg = 0.433 * g + 0.567 * b;
    sb = 0.475 * g + 0.525 * b;
  } else {
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sr = sg = sb = gray;
  }

  return rgbToHex(sr, sg, sb);
}
