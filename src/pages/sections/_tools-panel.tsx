import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { backgroundStore, textStore } from '../../store/values.store';
import {
  generatePalette,
  lerpColor,
  type PaletteType,
  parseColorInput,
  rgbToHex,
} from '../../utils/color-convert.util';
import { contrastRatio } from '../../utils/contrast.util';

// ─── helpers ────────────────────────────────────────────────────────────────

function ratioLabel(r: number) {
  return r.toFixed(2) + ':1';
}

function ratioBadgeClass(r: number) {
  if (r >= 4.5) return 'bg-green-100 text-green-700';
  if (r >= 3) return 'bg-yellow-100 text-yellow-700';
  return 'bg-red-100 text-red-700';
}

function CopyIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="8" height="8" rx="1" />
      <path d="M3 11V4a1 1 0 011-1h7" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8l3 3 7-7" />
    </svg>
  );
}

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(text);
      setTimeout(() => setCopied(null), 1500);
    });
  }, []);
  return { copied, copy };
}

// ─── TAB 1: Paleta ──────────────────────────────────────────────────────────

const HARMONY_TYPES: { key: PaletteType; label: string }[] = [
  { key: 'complementarios', label: 'Complementary' },
  { key: 'analogos', label: 'Analogous' },
  { key: 'triadico', label: 'Triadic' },
  { key: 'complementarios-divididos', label: 'Split Comp.' },
  { key: 'tetradico', label: 'Tetradic' },
  { key: 'monocromatico', label: 'Monochromatic' },
];

function TabPaleta() {
  const $text = useStore(textStore);
  const $background = useStore(backgroundStore);
  const [harmonyType, setHarmonyType] = useState<PaletteType>('complementarios');
  const [tooltip, setTooltip] = useState<{ hex: string; x: number; y: number } | null>(null);
  const { copied, copy } = useCopy();

  const baseHex = $text.length === 6 ? $text : '374151';
  const palette = generatePalette(baseHex, harmonyType);

  return (
    <div>
      {/* Harmony type buttons */}
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">Harmony</p>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {HARMONY_TYPES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setHarmonyType(key)}
            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
              harmonyType === key
                ? 'border-[#374151] bg-[#374151] text-white font-semibold'
                : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#374151] hover:text-[#374151]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Large horizontal swatches */}
      <div className="relative flex rounded-lg overflow-hidden mb-4" style={{ height: '80px' }}>
        {palette.map((hex, i) => (
          <div
            key={i}
            className="flex-1 cursor-pointer transition-transform hover:scale-y-105 relative group"
            style={{ backgroundColor: `#${hex}` }}
            onClick={() => textStore.set(hex)}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setTooltip({ hex, x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
            title={`Click to use #${hex.toUpperCase()}`}
          />
        ))}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-[#111827] text-white text-xs px-2 py-1 rounded shadow-lg -translate-x-1/2 -translate-y-full -mt-1"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            Click to use #{tooltip.hex.toUpperCase()}
          </div>
        )}
      </div>

      {/* Small swatches row with details */}
      <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">Colors</p>
      <div className="flex flex-col gap-1.5">
        {palette.map((hex, i) => {
          const ratio = contrastRatio({ text: `#${hex}`, background: `#${$background}` });
          const shortHex = `#${hex.slice(0, 5)}..`;
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded border border-[#E5E7EB] shrink-0 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: `#${hex}` }}
                onClick={() => textStore.set(hex)}
              />
              <span className="text-xs text-[#374151] font-mono w-16 truncate" title={`#${hex.toUpperCase()}`}>
                {shortHex.toUpperCase()}
              </span>
              <button
                onClick={() => copy(`#${hex.toUpperCase()}`)}
                className="text-[#9CA3AF] hover:text-[#374151] transition-colors"
                title="Copy hex"
              >
                {copied === `#${hex.toUpperCase()}` ? <CheckIcon /> : <CopyIcon />}
              </button>
              <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded ${ratioBadgeClass(ratio)}`}>
                {ratioLabel(ratio)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── TAB 2: Multi ───────────────────────────────────────────────────────────

function TabMulti() {
  const $text = useStore(textStore);
  const [inputValue, setInputValue] = useState('');
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [error, setError] = useState('');
  const { copied, copy } = useCopy();

  const handleAdd = () => {
    const parsed = parseColorInput(inputValue);
    if (!parsed) {
      setError('Invalid color. Use #HEX, rgb(r,g,b) or hsl(h,s%,l%)');
      return;
    }
    if (backgrounds.includes(parsed)) {
      setError('This color is already in the list');
      return;
    }
    setBackgrounds(prev => [...prev, parsed]);
    setInputValue('');
    setError('');
  };

  const handleRemove = (hex: string) => {
    setBackgrounds(prev => prev.filter(b => b !== hex));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div>
      {/* Input row */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => { setInputValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          placeholder="Add background (#HEX, rgb, hsl)"
          className="flex-1 text-xs border border-[#E5E7EB] rounded-lg px-3 py-2 text-[#374151] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#374151] focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          className="px-3 py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] text-sm font-bold transition-colors"
        >
          +
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

      {backgrounds.length === 0 ? (
        <p className="text-xs text-[#9CA3AF] text-center py-8">Add backgrounds to compare against the current text color.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {backgrounds.map((bg) => {
            const ratio = contrastRatio({ text: `#${$text}`, background: `#${bg}` });
            return (
              <div key={bg} className="flex items-center gap-2 p-2 rounded-lg border border-[#E5E7EB]">
                {/* Preview */}
                <div
                  className="flex items-center justify-center rounded px-2 py-1 text-xs font-semibold flex-shrink-0 min-w-[90px]"
                  style={{ backgroundColor: `#${bg}`, color: `#${$text}` }}
                >
                  Sample text Aa
                </div>
                {/* Hex + copy */}
                <div className="flex items-center gap-1 flex-1 min-w-0">
                  <span className="text-xs font-mono text-[#374151] truncate">#{bg.toUpperCase()}</span>
                  <button
                    onClick={() => copy(`#${bg.toUpperCase()}`)}
                    className="text-[#9CA3AF] hover:text-[#374151] transition-colors shrink-0"
                  >
                    {copied === `#${bg.toUpperCase()}` ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
                {/* Ratio */}
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded shrink-0 ${ratioBadgeClass(ratio)}`}>
                  {ratioLabel(ratio)}
                </span>
                {/* Remove */}
                <button
                  onClick={() => handleRemove(bg)}
                  className="text-[#9CA3AF] hover:text-red-500 transition-colors shrink-0 text-sm leading-none"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TAB 3: Grad ────────────────────────────────────────────────────────────

const GRAD_SEGMENTS = 10;

function TabGrad() {
  const $text = useStore(textStore);
  const [startHex, setStartHex] = useState('3B82F6');
  const [endHex, setEndHex] = useState('8B5CF6');

  const segments = Array.from({ length: GRAD_SEGMENTS }, (_, i) => {
    const t = i / (GRAD_SEGMENTS - 1);
    const hex = lerpColor(startHex, endHex, t);
    const ratio = contrastRatio({ text: `#${$text}`, background: `#${hex}` });
    return { hex, ratio, t };
  });

  const minRatio = Math.min(...segments.map(s => s.ratio));
  const textColor = `#${$text}`;

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace('#', '').toUpperCase();
    if (v.length <= 6) setStartHex(v);
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace('#', '').toUpperCase();
    if (v.length <= 6) setEndHex(v);
  };

  return (
    <div>
      {/* Inputs */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <label className="text-xs text-[#6B7280] mb-1 block">Start</label>
          <div className="flex items-center gap-1.5 border border-[#E5E7EB] rounded-lg px-2 py-1.5">
            <div className="w-5 h-5 rounded border border-[#E5E7EB]" style={{ backgroundColor: `#${startHex}` }} />
            <span className="text-xs text-[#9CA3AF]">#</span>
            <input
              type="text"
              value={startHex}
              onChange={handleStartChange}
              maxLength={6}
              className="flex-1 text-xs text-[#374151] font-mono focus:outline-none bg-transparent uppercase"
            />
          </div>
        </div>
        <div className="flex-1">
          <label className="text-xs text-[#6B7280] mb-1 block">End</label>
          <div className="flex items-center gap-1.5 border border-[#E5E7EB] rounded-lg px-2 py-1.5">
            <div className="w-5 h-5 rounded border border-[#E5E7EB]" style={{ backgroundColor: `#${endHex}` }} />
            <span className="text-xs text-[#9CA3AF]">#</span>
            <input
              type="text"
              value={endHex}
              onChange={handleEndChange}
              maxLength={6}
              className="flex-1 text-xs text-[#374151] font-mono focus:outline-none bg-transparent uppercase"
            />
          </div>
        </div>
      </div>

      {/* Large preview */}
      <div
        className="rounded-lg flex items-center justify-center h-16 mb-1 relative"
        style={{
          background: `linear-gradient(to right, #${startHex}, #${endHex})`,
        }}
      >
        <span className="font-semibold text-sm" style={{ color: textColor }}>
          Text on gradient
        </span>
        <span className="absolute top-1 right-2 text-xs font-bold" style={{ color: textColor }}>
          Min: {minRatio.toFixed(2)}:1
        </span>
      </div>

      {/* Segments */}
      <div className="flex gap-0.5 mb-3">
        {segments.map((seg, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full rounded-sm"
              style={{ backgroundColor: `#${seg.hex}`, height: '28px' }}
            />
            <span className={`text-[9px] font-bold leading-none ${ratioBadgeClass(seg.ratio).split(' ')[1]}`}>
              {seg.ratio.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex gap-3 text-[10px] text-[#6B7280]">
        <span className="flex items-center gap-1">
          <span className="text-green-600">✓</span> AA Normal
        </span>
        <span className="flex items-center gap-1">
          <span className="text-yellow-500">✓</span> AA Large
        </span>
        <span className="flex items-center gap-1">
          <span className="text-red-500">△</span> Fail
        </span>
      </div>
    </div>
  );
}

// ─── TAB 4: Tipo ────────────────────────────────────────────────────────────

const SIZES = [12, 14, 16, 18, 24, 32];

type SizeStatus = 'fail' | 'acceptable' | 'optimal';

function getSizeStatus(px: number, ratio: number): SizeStatus {
  if (px < 18) {
    if (ratio >= 7) return 'optimal';
    if (ratio >= 4.5) return 'acceptable';
    return 'fail';
  }
  if (px < 24) {
    if (ratio >= 4.5) return 'optimal';
    if (ratio >= 3.0) return 'acceptable';
    return 'fail';
  }
  // >= 24
  if (ratio >= 3.0) return 'optimal';
  return 'fail';
}

const STATUS_CONFIG: Record<SizeStatus, { dot: string; label: string; text: string }> = {
  fail: { dot: 'bg-red-500', label: 'Not recommended', text: 'text-red-600' },
  acceptable: { dot: 'bg-yellow-400', label: 'Acceptable', text: 'text-yellow-600' },
  optimal: { dot: 'bg-green-500', label: 'Optimal', text: 'text-green-600' },
};

function TabTipo() {
  const $text = useStore(textStore);
  const $background = useStore(backgroundStore);
  const ratio = contrastRatio({ text: `#${$text}`, background: `#${$background}` });

  const sizes = SIZES.map(px => ({ px, status: getSizeStatus(px, ratio) }));

  // Recommended: largest with 'optimo', or smallest green/aceptable
  const optimos = sizes.filter(s => s.status === 'optimal');
  const recommended = optimos.length > 0 ? optimos[optimos.length - 1] : sizes.find(s => s.status === 'acceptable');

  // Minimum passing size
  const minPassing = sizes.find(s => s.status !== 'fail');

  return (
    <div>
      {/* Top recommendation */}
      {recommended && (
        <div className="bg-[#F0FDF4] border border-green-200 rounded-lg px-3 py-2 mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-green-700">{recommended.px}px recommended</span>
          <span className="text-[10px] text-green-600 bg-green-100 px-1.5 py-0.5 rounded font-semibold">optimal</span>
        </div>
      )}

      <p className="text-[10px] text-[#9CA3AF] mb-3 leading-relaxed">
        Only valid for large text (18px+ or 14px bold).{' '}
        {minPassing
          ? `Minimum size: ${minPassing.px}px`
          : 'No valid size with this contrast ratio.'}
      </p>

      {/* Size previews */}
      <div className="flex flex-col gap-3 mb-4">
        {sizes.map(({ px, status }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={px} className="flex items-baseline gap-2">
              <div className="flex items-center gap-1.5 w-28 shrink-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                <span className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</span>
              </div>
              <span
                className="text-[#374151] leading-tight truncate"
                style={{
                  fontSize: `${px}px`,
                  color: `#${$text}`,
                  lineHeight: 1.2,
                }}
              >
                Sample text
              </span>
              <span className="text-[10px] text-[#9CA3AF] ml-auto shrink-0">{px}px</span>
            </div>
          );
        })}
      </div>

      {/* WCAG rules */}
      <div className="border-t border-[#E5E7EB] pt-3">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">WCAG</p>
        <ul className="flex flex-col gap-1 text-[10px] text-[#6B7280]">
          <li>• AA Normal (&lt;18px): ratio ≥ 4.5:1</li>
          <li>• AA Large (≥18px o 14px bold): ratio ≥ 3.0:1</li>
          <li>• AAA Normal: ratio ≥ 7.0:1</li>
          <li>• AAA Large: ratio ≥ 4.5:1</li>
        </ul>
      </div>
    </div>
  );
}

// ─── TAB 5: Img ─────────────────────────────────────────────────────────────

interface ExtractedColor {
  hex: string;
  percent: number;
}

function extractColors(imageEl: HTMLImageElement, maxColors = 8): ExtractedColor[] {
  const canvas = document.createElement('canvas');
  const size = 64;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  ctx.drawImage(imageEl, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;

  const bins: Record<string, number> = {};
  const quantize = (v: number) => Math.round(v / 8) * 8;

  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 128) continue;
    const r = quantize(data[i]);
    const g = quantize(data[i + 1]);
    const b = quantize(data[i + 2]);
    const key = `${r},${g},${b}`;
    bins[key] = (bins[key] || 0) + 1;
  }

  const total = Object.values(bins).reduce((a, b) => a + b, 0) || 1;
  return Object.entries(bins)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxColors)
    .map(([key, count]) => {
      const [r, g, b] = key.split(',').map(Number);
      return { hex: rgbToHex(r, g, b), percent: Math.round((count / total) * 100) };
    });
}

function TabImg() {
  const $background = useStore(backgroundStore);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { copied, copy } = useCopy();

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImgSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => {
      const extracted = extractColors(img);
      setColors(extracted);
    };
    img.src = imgSrc;
  }, [imgSrc]);

  return (
    <div>
      {/* Drop zone */}
      <div
        className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-4 ${
          dragging
            ? 'border-[#374151] bg-[#F9FAFB]'
            : 'border-[#D1D5DB] bg-white hover:border-[#374151] hover:bg-[#F9FAFB]'
        }`}
        style={{ minHeight: imgSrc ? undefined : '100px', padding: imgSrc ? '8px' : '20px' }}
        onClick={() => {
          const inp = document.createElement('input');
          inp.type = 'file';
          inp.accept = 'image/*';
          inp.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) processFile(file);
          };
          inp.click();
        }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files[0];
          if (file) processFile(file);
        }}
      >
        {imgSrc ? (
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Preview"
            className="max-h-32 rounded-lg object-contain"
          />
        ) : (
          <>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-xs font-semibold text-[#374151]">Upload an image</p>
            <p className="text-[10px] text-[#9CA3AF]">to extract dominant colors</p>
          </>
        )}
      </div>

      {/* Extracted colors */}
      {colors.length > 0 && (
        <div>
          <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">Dominant colors</p>
          <div className="grid grid-cols-2 gap-1.5">
            {colors.map((c, i) => {
              const ratio = contrastRatio({ text: `#${c.hex}`, background: `#${$background}` });
              return (
                <div key={i} className="flex items-center gap-1.5 p-1.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                  <div
                    className="w-6 h-6 rounded shrink-0 border border-[#E5E7EB]"
                    style={{ backgroundColor: `#${c.hex}` }}
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-[#374151] truncate">#{c.hex.toUpperCase()}</span>
                    <span className="text-[9px] text-[#9CA3AF]">{c.percent}%</span>
                  </div>
                  <span className={`text-[9px] font-bold px-1 py-0.5 rounded ${ratioBadgeClass(ratio)}`}>
                    {ratio.toFixed(1)}
                  </span>
                  <button
                    onClick={() => copy(`#${c.hex.toUpperCase()}`)}
                    className="text-[#9CA3AF] hover:text-[#374151] transition-colors shrink-0"
                  >
                    {copied === `#${c.hex.toUpperCase()}` ? <CheckIcon /> : <CopyIcon />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────────────────────

type TabKey = 'paleta' | 'multi' | 'grad' | 'tipo' | 'img';

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  {
    key: 'paleta',
    label: 'Palette',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="6" />
        <circle cx="5.5" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="10.5" cy="6" r="1" fill="currentColor" stroke="none" />
        <circle cx="8" cy="10" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    key: 'multi',
    label: 'Multi',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    key: 'grad',
    label: 'Grad',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="14" height="8" rx="2" />
        <line x1="5" y1="4" x2="5" y2="12" />
        <line x1="11" y1="4" x2="11" y2="12" />
      </svg>
    ),
  },
  {
    key: 'tipo',
    label: 'Type',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 4h12M6 4v8M10 4v8" />
      </svg>
    ),
  },
  {
    key: 'img',
    label: 'Img',
    icon: (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="2" width="14" height="12" rx="2" />
        <circle cx="5.5" cy="6.5" r="1.5" />
        <path d="M1 11l4-4 3 3 2-2 5 5" />
      </svg>
    ),
  },
];

// ─── Main export ─────────────────────────────────────────────────────────────

export function ToolsPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>('paleta');

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      {/* Tab bar */}
      <div className="flex gap-1 mb-5 p-1 bg-[#F3F4F6] rounded-lg">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === key
                ? 'border border-[#E5E7EB] bg-white text-[#111827] shadow-sm'
                : 'text-[#6B7280] hover:text-[#374151]'
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'paleta' && <TabPaleta />}
      {activeTab === 'multi' && <TabMulti />}
      {activeTab === 'grad' && <TabGrad />}
      {activeTab === 'tipo' && <TabTipo />}
      {activeTab === 'img' && <TabImg />}
    </div>
  );
}
