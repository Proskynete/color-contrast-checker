import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { addToHistory, clearHistory, colorHistoryStore, type HistoryEntry } from '../../store/history.store';
import { backgroundStore, textStore } from '../../store/values.store';
import { formatRgbHsl } from '../../utils/color-convert.util';
import { contrastRatio } from '../../utils/contrast.util';
import { ColorPickerSection } from './_color-picker-modal';

type ViewMode = 'default' | 'history' | 'export';
type ExportFormat = 'css' | 'scss' | 'json' | 'tailwind';

function generateExport(format: ExportFormat, text: string, bg: string, ratio: number): string {
  if (format === 'css') {
    return `:root {\n  --color-text: #${text};\n  --color-background: #${bg};\n  --contrast-ratio: ${ratio.toFixed(2)};\n}`;
  }
  if (format === 'scss') {
    return `$color-text: #${text};\n$color-background: #${bg};\n$contrast-ratio: ${ratio.toFixed(2)};`;
  }
  if (format === 'json') {
    return JSON.stringify(
      { textColor: `#${text}`, backgroundColor: `#${bg}`, contrastRatio: parseFloat(ratio.toFixed(2)), wcag: { aa: ratio >= 4.5, aaa: ratio >= 7 } },
      null, 2,
    );
  }
  return `{/* Tailwind utility classes */}\n<div className="text-[#${text}] bg-[#${bg}]">\n  {/* Your content */}\n</div>`;
}

export const Form = () => {
  const $background = useStore(backgroundStore);
  const $text = useStore(textStore);
  const history = useStore(colorHistoryStore);

  const [mode, setMode] = useState<ViewMode>('default');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('css');
  const [copied, setCopied] = useState(false);

  const ratio = contrastRatio({ text: `#${$text}`, background: `#${$background}` });

  // Pre-fill from URL query params (?text=RRGGBB&bg=RRGGBB)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const text = params.get('text');
    const bg = params.get('bg');
    const hexRe = /^[0-9A-Fa-f]{6}$/;
    if (text && hexRe.test(text)) textStore.set(text.toUpperCase());
    if (bg && hexRe.test(bg)) backgroundStore.set(bg.toUpperCase());
  }, []);

  // Auto-save to history with debounce
  useEffect(() => {
    if ($text.length === 6 && $background.length === 6) {
      const timer = setTimeout(() => {
        addToHistory({ text: $text, background: $background, ratio });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [$text, $background, ratio]);

  const handleChange = (field: 'text' | 'background') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 6) {
      if (field === 'background') backgroundStore.set(value);
      else textStore.set(value);
    }
  };

  const handleSetValue = (field: 'text' | 'background') => (value: string) => {
    if (field === 'background') backgroundStore.set(value);
    else textStore.set(value);
  };

  const handleSwap = () => {
    const currentText = textStore.get();
    const currentBg = backgroundStore.get();
    textStore.set(currentBg);
    backgroundStore.set(currentText);
  };

  const restoreHistory = (entry: HistoryEntry) => {
    textStore.set(entry.text);
    backgroundStore.set(entry.background);
    setMode('default');
  };

  const exportContent = generateExport(exportFormat, $text, $background, ratio);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions: Record<ExportFormat, string> = { css: 'css', scss: 'scss', json: 'json', tailwind: 'jsx' };
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `palette.${extensions[exportFormat]}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleMode = (newMode: ViewMode) => {
    setMode(mode === newMode ? 'default' : newMode);
  };

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#111827]">Colors</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => toggleMode('history')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              mode === 'history'
                ? 'bg-[#111827] text-white border-[#111827]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" />
              <path d="M8 5v3l2 2" />
            </svg>
            History
          </button>
          <button
            onClick={() => toggleMode('export')}
            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
              mode === 'export'
                ? 'bg-[#111827] text-white border-[#111827]'
                : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB] hover:border-[#D1D5DB]'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h8M8 2v8M5 7l3 3 3-3" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* Default: color pickers */}
      {mode === 'default' && (
        <div className="flex flex-col gap-3">
          <div>
            <ColorPickerSection
              id="text-color"
              label="Text (Foreground)"
              fieldName="text"
              value={$text}
              setValue={handleSetValue('text')}
              onChange={handleChange('text')}
            />
            {$text.length === 6 && (
              <p className="text-xs text-[#9CA3AF] mt-1.5 ml-[48px]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                {formatRgbHsl($text)}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <button
              onClick={handleSwap}
              className="flex items-center gap-1.5 text-xs text-[#6B7280] hover:text-[#374151] border border-[#E5E7EB] rounded-lg px-3 py-1.5 bg-white hover:bg-[#F9FAFB] hover:border-[#D1D5DB] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 3l-3 3 3 3M1 6h10M12 13l3-3-3-3M15 10H5" />
              </svg>
              Swap
            </button>
          </div>

          <div>
            <ColorPickerSection
              id="background-color"
              label="Background"
              fieldName="background"
              value={$background}
              setValue={handleSetValue('background')}
              onChange={handleChange('background')}
            />
            {$background.length === 6 && (
              <p className="text-xs text-[#9CA3AF] mt-1.5 ml-[48px]" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                {formatRgbHsl($background)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* History view */}
      {mode === 'history' && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-[#6B7280]">Recent combinations</p>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-xs text-[#9CA3AF] hover:text-[#374151] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <p className="text-xs text-[#9CA3AF] py-6 text-center">No saved combinations yet.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {history.map((entry, i) => (
                <button
                  key={i}
                  onClick={() => restoreHistory(entry)}
                  className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-[#F9FAFB] transition-colors text-left w-full"
                >
                  <div className="w-6 h-6 rounded border border-[#E5E7EB] shrink-0" style={{ backgroundColor: `#${entry.text}` }} />
                  <div className="w-6 h-6 rounded border border-[#E5E7EB] shrink-0" style={{ backgroundColor: `#${entry.background}` }} />
                  <span className="text-xs text-[#374151] flex-1 truncate" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
                    #{entry.text} / #{entry.background}
                  </span>
                  <span className={`text-xs font-bold shrink-0 ${entry.ratio >= 4.5 ? 'text-green-600' : 'text-red-500'}`}>
                    {entry.ratio.toFixed(2)}:1
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Export view */}
      {mode === 'export' && (
        <div>
          {/* Format tabs */}
          <div className="flex gap-1 mb-3 p-1 bg-[#F3F4F6] rounded-lg">
            {(['css', 'scss', 'json', 'tailwind'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setExportFormat(fmt)}
                className={`flex-1 text-xs py-1.5 rounded-md font-semibold transition-colors ${
                  exportFormat === fmt
                    ? 'bg-white text-[#111827] shadow-sm'
                    : 'text-[#6B7280] hover:text-[#374151]'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Code preview */}
          <pre
            className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg p-3 text-xs text-[#374151] overflow-auto mb-3 whitespace-pre-wrap leading-relaxed"
            style={{ fontFamily: 'var(--font-mono, monospace)' }}
          >
            {exportContent}
          </pre>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8l3 3 7-7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="5" width="8" height="8" rx="1" />
                    <path d="M3 11V4a1 1 0 011-1h7" />
                  </svg>
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] font-semibold transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h8M8 2v8M5 7l3 3 3-3" />
              </svg>
              Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
