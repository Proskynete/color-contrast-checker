import { useStore } from '@nanostores/react';
import { useCallback, useRef, useState } from 'react';

import { textStore } from '../../store/values.store';
import {
  generatePalette,
  lerpColor,
  type PaletteType,
  parseColorInput,
  randomPaletteColor,
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

function ShuffleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4h2a4 4 0 014 4 4 4 0 004 4h2M11 2l3 2-3 2M11 10l3 2-3 2M1 12h2a4 4 0 003.4-1.9" />
    </svg>
  );
}

function TabPaleta() {
  const [baseHex, setBaseHex] = useState<string>(() => randomPaletteColor());
  const [harmonyType, setHarmonyType] = useState<PaletteType>('complementarios');
  const [count, setCount] = useState<3 | 4 | 5>(3);
  const [tooltip, setTooltip] = useState<{ hex: string; x: number; y: number } | null>(null);
  const { copied, copy } = useCopy();

  const allColors = generatePalette(baseHex, harmonyType); // always 5
  const palette = allColors.slice(0, count);

  return (
    <div>
      {/* Base color + shuffle */}
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg border border-[#E5E7EB] shrink-0"
          style={{ backgroundColor: `#${baseHex}` }}
        />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider leading-none mb-0.5">Base color</span>
          <span className="text-xs font-mono text-[#374151] font-semibold">#{baseHex.toUpperCase()}</span>
        </div>
        <button
          onClick={() => setBaseHex(randomPaletteColor())}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:border-[#374151] hover:text-[#374151] transition-colors shrink-0"
          title="Generate new random color"
        >
          <ShuffleIcon />
          Shuffle
        </button>
      </div>

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

      {/* Count selector */}
      <div className="flex items-center gap-2 mb-4">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Colors</p>
        <div className="flex gap-1 ml-auto">
          {([3, 4, 5] as const).map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className={`w-7 h-7 text-xs rounded-md border font-semibold transition-colors ${
                count === n
                  ? 'border-[#374151] bg-[#374151] text-white'
                  : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#374151] hover:text-[#374151]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Large horizontal swatches */}
      <div className="relative flex rounded-lg overflow-hidden mb-4" style={{ height: '80px' }}>
        {palette.map((hex, i) => (
          <div
            key={i}
            className="flex-1 cursor-pointer transition-transform hover:scale-y-105"
            style={{ backgroundColor: `#${hex}` }}
            onClick={() => copy(`#${hex.toUpperCase()}`)}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
              setTooltip({ hex, x: rect.left + rect.width / 2, y: rect.top });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
        {tooltip && (
          <div
            className="fixed z-50 pointer-events-none bg-[#111827] text-white text-xs px-2 py-1 rounded shadow-lg -translate-x-1/2 -translate-y-full -mt-1"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            #{tooltip.hex.toUpperCase()}
          </div>
        )}
      </div>

      {/* Color list */}
      <div className="flex flex-col gap-1.5">
        {palette.map((hex, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded border border-[#E5E7EB] shrink-0"
              style={{ backgroundColor: `#${hex}` }}
            />
            <span className="text-xs text-[#374151] font-mono flex-1" title={`#${hex.toUpperCase()}`}>
              #{hex.toUpperCase()}
            </span>
            <button
              onClick={() => copy(`#${hex.toUpperCase()}`)}
              className="text-[#9CA3AF] hover:text-[#374151] transition-colors"
              title="Copy hex"
            >
              {copied === `#${hex.toUpperCase()}` ? <CheckIcon /> : <CopyIcon />}
            </button>
          </div>
        ))}
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

// ─── TAB 4: Img ─────────────────────────────────────────────────────────────

type Marker = { x: number; y: number; hex: string }; // x/y: % of displayed container

/**
 * Converts a position expressed as % of the displayed container to canvas pixel
 * coordinates, compensating for the object-cover crop offset.
 */
function getCanvasCoords(
  pctX: number, pctY: number,
  cW: number, cH: number,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const nW = canvas.width, nH = canvas.height;
  const scale = Math.max(cW / nW, cH / nH);
  const offX = (nW * scale - cW) / 2;
  const offY = (nH * scale - cH) / 2;
  return {
    x: Math.max(0, Math.min(nW - 1, Math.round((pctX / 100 * cW + offX) / scale))),
    y: Math.max(0, Math.min(nH - 1, Math.round((pctY / 100 * cH + offY) / scale))),
  };
}

function pickColor(pctX: number, pctY: number, cW: number, cH: number, canvas: HTMLCanvasElement): string {
  const { x, y } = getCanvasCoords(pctX, pctY, cW, cH, canvas);
  const d = canvas.getContext('2d')!.getImageData(x, y, 1, 1).data;
  return rgbToHex(d[0], d[1], d[2]);
}

/**
 * Finds dominant colors in the canvas and places each marker at the centroid
 * of where that color appears, expressed as % of the displayed container.
 */
function extractMarkersFromCanvas(
  canvas: HTMLCanvasElement, count: number,
  cW: number, cH: number,
): Marker[] {
  const S = 80;
  const tmp = document.createElement('canvas');
  tmp.width = S; tmp.height = S;
  tmp.getContext('2d')!.drawImage(canvas, 0, 0, S, S);
  const data = tmp.getContext('2d')!.getImageData(0, 0, S, S).data;

  const q = (v: number) => Math.round(v / 20) * 20;
  const bins: Record<string, { n: number; sx: number; sy: number }> = {};
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    const key = `${q(data[i])},${q(data[i + 1])},${q(data[i + 2])}`;
    const pi = i / 4;
    if (!bins[key]) bins[key] = { n: 0, sx: 0, sy: 0 };
    bins[key].n++;
    bins[key].sx += (pi % S) / S * 100;  // centroid in natural image %
    bins[key].sy += Math.floor(pi / S) / S * 100;
  }

  const nW = canvas.width, nH = canvas.height;
  const scale = Math.max(cW / nW, cH / nH);
  const offX = (nW * scale - cW) / 2;
  const offY = (nH * scale - cH) / 2;

  const sorted = Object.entries(bins).sort((a, b) => b[1].n - a[1].n);
  const result: Marker[] = [];

  for (const [key, { n, sx, sy }] of sorted) {
    if (result.length >= count) break;
    const [r, g, b] = key.split(',').map(Number);
    const hex = rgbToHex(r, g, b);

    // Skip colors too visually similar to ones already selected (Euclidean RGB distance)
    const tooClose = result.some(m => {
      const r2 = parseInt(m.hex.slice(0, 2), 16);
      const g2 = parseInt(m.hex.slice(2, 4), 16);
      const b2 = parseInt(m.hex.slice(4, 6), 16);
      return Math.sqrt((r - r2) ** 2 + (g - g2) ** 2 + (b - b2) ** 2) < 40;
    });
    if (tooClose) continue;

    const dispX = Math.max(2, Math.min(98, (sx / n / 100 * nW * scale - offX) / cW * 100));
    const dispY = Math.max(2, Math.min(98, (sy / n / 100 * nH * scale - offY) / cH * 100));
    result.push({ hex, x: dispX, y: dispY });
  }

  return result;
}

function TabImg() {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [maxColors, setMaxColors] = useState(5);
  const [fileDragging, setFileDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [exportCopied, setExportCopied] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragMovedRef = useRef(false);

  const openFilePicker = () => {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'image/*';
    inp.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) processFile(file);
    };
    inp.click();
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setCanvasReady(false);
      setMarkers([]);
      setImgSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImgLoad = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    setCanvasReady(true);
    const { width: cW, height: cH } = container.getBoundingClientRect();
    setMarkers(extractMarkersFromCanvas(canvas, Math.min(maxColors, 5), cW, cH));
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasReady || !canvasRef.current || !containerRef.current) return;
    if (markers.length >= maxColors || draggingIndex !== null || dragMovedRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pctX = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
    const pctY = Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100));
    const hex = pickColor(pctX, pctY, rect.width, rect.height, canvasRef.current);
    setMarkers(prev => [...prev, { x: pctX, y: pctY, hex }]);
  };

  // Pointer events on markers — pointer capture keeps tracking even outside the container
  const handleMarkerPointerDown = (e: React.PointerEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    dragMovedRef.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingIndex(index);
  };

  const handleMarkerPointerMove = (e: React.PointerEvent, index: number) => {
    if (draggingIndex !== index || !containerRef.current || !canvasRef.current) return;
    dragMovedRef.current = true;
    const rect = containerRef.current.getBoundingClientRect();
    const pctX = Math.max(0, Math.min(100, (e.clientX - rect.left) / rect.width * 100));
    const pctY = Math.max(0, Math.min(100, (e.clientY - rect.top) / rect.height * 100));
    const hex = pickColor(pctX, pctY, rect.width, rect.height, canvasRef.current);
    setMarkers(prev => prev.map((m, j) => j === index ? { x: pctX, y: pctY, hex } : m));
  };

  const handleMarkerPointerUp = (e: React.PointerEvent, index: number) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    if (!dragMovedRef.current) {
      // Short tap without movement → remove the marker
      setMarkers(prev => prev.filter((_, j) => j !== index));
    }
    setDraggingIndex(null);
  };

  const removeLastMarker = () => setMarkers(prev => prev.slice(0, -1));

  const handleExport = () => {
    const text = markers.map(m => `#${m.hex.toUpperCase()}`).join(', ');
    navigator.clipboard.writeText(text).then(() => {
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 1500);
    });
  };

  return (
    <div>
      <canvas ref={canvasRef} className="hidden" />

      {/* Image area */}
      {imgSrc ? (
        <div
          ref={containerRef}
          className={`relative rounded-lg overflow-hidden mb-3 select-none ${
            draggingIndex !== null ? 'cursor-grabbing' :
            markers.length < maxColors ? 'cursor-crosshair' : 'cursor-default'
          }`}
          style={{ aspectRatio: '16/9' }}
          onClick={handleContainerClick}
          onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
          onDragLeave={() => setFileDragging(false)}
          onDrop={(e) => { e.preventDefault(); setFileDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        >
          <img
            ref={imgRef}
            src={imgSrc}
            alt="Color picker"
            className="w-full h-full object-cover pointer-events-none"
            draggable={false}
            onLoad={handleImgLoad}
          />
          {markers.map((m, i) => (
            <div
              key={i}
              className={`absolute -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-[3px] border-white shadow-lg ${
                draggingIndex === i
                  ? 'scale-125 cursor-grabbing'
                  : 'cursor-grab hover:scale-110'
              }`}
              style={{
                left: `${m.x}%`, top: `${m.y}%`,
                backgroundColor: `#${m.hex}`,
                touchAction: 'none',
                transition: draggingIndex === i ? 'none' : 'transform 0.1s',
              }}
              onPointerDown={(e) => handleMarkerPointerDown(e, i)}
              onPointerMove={(e) => handleMarkerPointerMove(e, i)}
              onPointerUp={(e) => handleMarkerPointerUp(e, i)}
              title={`#${m.hex.toUpperCase()} · drag to reposition · tap to remove`}
            />
          ))}
          <div className="absolute bottom-1.5 right-2 text-[9px] text-white/60 pointer-events-none">
            {markers.length < maxColors ? 'click to pick · drag to reposition' : 'drag to reposition · tap to remove'}
          </div>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors mb-3 ${
            fileDragging ? 'border-[#374151] bg-[#F9FAFB]' : 'border-[#D1D5DB] bg-white hover:border-[#374151] hover:bg-[#F9FAFB]'
          }`}
          style={{ height: '160px' }}
          onClick={openFilePicker}
          onDragOver={(e) => { e.preventDefault(); setFileDragging(true); }}
          onDragLeave={() => setFileDragging(false)}
          onDrop={(e) => { e.preventDefault(); setFileDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <p className="text-xs font-semibold text-[#374151]">Browse image</p>
          <p className="text-[10px] text-[#9CA3AF]">or drag & drop · click image to pick colors</p>
        </div>
      )}

      {/* Picked palettes slider */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-bold text-[#374151] uppercase tracking-wider">Picked palettes</p>
          <span className="text-[10px] text-[#9CA3AF] font-mono">{markers.length} / {maxColors}</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={maxColors}
          onChange={(e) => {
            const v = +e.target.value;
            setMaxColors(v);
            if (markers.length > v) setMarkers(prev => prev.slice(0, v));
          }}
          className="w-full h-1.5 accent-[#374151] cursor-pointer"
        />
      </div>

      {/* Palette strip */}
      <div className="mb-3">
        <p className="text-xs font-bold text-[#374151] uppercase tracking-wider mb-2">Palette</p>
        <div className="flex items-center gap-2">
          <div
            className="flex rounded-lg overflow-hidden flex-1 border border-[#E5E7EB]"
            style={{ height: '52px' }}
          >
            {markers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center bg-[#F9FAFB]">
                <span className="text-[10px] text-[#9CA3AF]">No colors picked yet</span>
              </div>
            ) : (
              markers.map((m, i) => (
                <div
                  key={i}
                  className="flex-1 relative group cursor-pointer"
                  style={{ backgroundColor: `#${m.hex}` }}
                  onClick={() => setMarkers(prev => prev.filter((_, j) => j !== i))}
                  title={`#${m.hex.toUpperCase()} — click to remove`}
                >
                  {i === markers.length - 1 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white/70 shadow" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="flex flex-col gap-1 shrink-0">
            <button
              onClick={() => setMaxColors(c => Math.min(8, c + 1))}
              className="w-7 h-7 rounded border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-base leading-none transition-colors"
            >
              +
            </button>
            <button
              onClick={() => { removeLastMarker(); setMaxColors(c => Math.max(1, c - 1)); }}
              disabled={markers.length === 0 && maxColors === 1}
              className="w-7 h-7 rounded border border-[#E5E7EB] text-[#374151] hover:bg-[#F3F4F6] flex items-center justify-center font-bold text-base leading-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>
          </div>
        </div>
      </div>

      {/* Browse image */}
      <button
        onClick={openFilePicker}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] text-sm font-semibold text-[#374151] hover:bg-[#F3F4F6] transition-colors mb-2"
      >
        Browse image
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </button>

      {/* Export palette */}
      <button
        onClick={handleExport}
        disabled={markers.length === 0}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-semibold hover:bg-[#1D4ED8] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {exportCopied ? 'Copied!' : 'Export palette'}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
    </div>
  );
}

// ─── Tab bar ────────────────────────────────────────────────────────────────

type TabKey = 'paleta' | 'multi' | 'grad' | 'img';

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
      {activeTab === 'img' && <TabImg />}
    </div>
  );
}
