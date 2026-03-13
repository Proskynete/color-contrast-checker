import { useRef, useState } from 'react';

import { contrastRatio } from '../../utils/contrast.util';

type BulkRow = {
  index: number;
  textColor: string;
  bgColor: string;
  ratio: number;
  wcagLevel: string;
  valid: true;
} | {
  index: number;
  raw: string;
  error: string;
  valid: false;
};

type Props = {
  isSignedIn: boolean;
  plan: string;
};

const PAGE_SIZE = 50;

const hexRe = /^#?([0-9A-Fa-f]{6})$/;

function normalizeHex(raw: string): string | null {
  const m = raw.trim().match(hexRe);
  if (!m) return null;
  return `#${m[1].toUpperCase()}`;
}

function getWcagLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

function parseCSV(content: string): BulkRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  const rows: BulkRow[] = [];
  let validIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // skip header row if it looks like a header
    if (i === 0 && /text|color|fg|bg/i.test(line) && !/^#?[0-9A-Fa-f]/.test(line.trim())) {
      continue;
    }
    const parts = line.split(',');
    if (parts.length < 2) {
      rows.push({ index: i, raw: line, error: 'Expected two comma-separated values', valid: false });
      continue;
    }
    const textHex = normalizeHex(parts[0]);
    const bgHex = normalizeHex(parts[1]);
    if (!textHex || !bgHex) {
      rows.push({ index: i, raw: line, error: `Invalid hex: "${parts[0].trim()}", "${parts[1].trim()}"`, valid: false });
      continue;
    }
    const ratio = contrastRatio({ text: textHex, background: bgHex });
    rows.push({
      index: validIndex++,
      textColor: textHex,
      bgColor: bgHex,
      ratio,
      wcagLevel: getWcagLevel(ratio),
      valid: true,
    });
  }
  return rows;
}

export const BulkChecker = ({ plan }: Props) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<BulkRow[]>([]);
  const [page, setPage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isTeams = plan === 'teams';

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseCSV(content);
      setRows(parsed);
      setPage(0);
    };
    reader.readAsText(file);
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      alert('Please upload a .csv file');
      return;
    }
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const validRows = rows.filter((r): r is Extract<BulkRow, { valid: true }> => r.valid);
  const invalidRows = rows.filter((r): r is Extract<BulkRow, { valid: false }> => !r.valid);
  const totalPages = Math.ceil(validRows.length / PAGE_SIZE);
  const pageRows = validRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const passCount = validRows.filter((r) => r.wcagLevel !== 'Fail').length;
  const failCount = validRows.filter((r) => r.wcagLevel === 'Fail').length;

  const handleExportPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF({ orientation: 'landscape' });
    const now = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

    doc.setFontSize(16);
    doc.text('Bulk Contrast Check Report', 14, 16);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${now} · ${fileName ?? 'unknown.csv'} · ${validRows.length} pairs checked`, 14, 24);
    doc.text(`Pass: ${passCount}  Fail: ${failCount}`, 14, 30);

    autoTable(doc, {
      startY: 36,
      head: [['#', 'Text Color', 'Background', 'Ratio', 'WCAG Level']],
      body: validRows.map((r, i) => [i + 1, r.textColor, r.bgColor, `${r.ratio.toFixed(2)}:1`, r.wcagLevel]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 24, 39] },
    });

    doc.save(`bulk-contrast-report-${Date.now()}.pdf`);
  };

  const badgeClass = (level: string) => {
    if (level === 'AAA') return 'bg-green-100 text-green-800';
    if (level === 'AA') return 'bg-blue-100 text-blue-800';
    if (level === 'AA Large') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>📊</span> Bulk
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <p className="font-semibold text-gray-800">Bulk Contrast Checker</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Teams gate */}
            {!isTeams && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-4xl mb-4">📊</div>
                <p className="font-semibold text-gray-800 text-lg mb-1">Bulk Checker — Teams Only</p>
                <p className="text-sm text-gray-500 max-w-sm">
                  Upload a CSV with multiple color pairs and check them all at once. Available on the Teams plan.
                </p>
                <a
                  href="/pricing"
                  className="mt-5 h-9 px-5 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors inline-flex items-center"
                >
                  Upgrade to Teams
                </a>
              </div>
            )}

            {/* Upload area */}
            {isTeams && rows.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-10 px-6">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full max-w-md border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
                    dragging ? 'border-indigo-400 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-3">📂</div>
                  <p className="text-sm font-medium text-gray-700">Drop a CSV file here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Format: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">text_color,bg_color</code> per row</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                  />
                </div>

                <div className="mt-4 text-xs text-gray-400 text-center">
                  <p>Example CSV:</p>
                  <pre className="mt-1 font-mono bg-gray-50 border border-gray-100 rounded px-3 py-2 text-left">
{`text_color,bg_color
#111827,#FFFFFF
#FFFFFF,#1E40AF
FF6B6B,4ECDC4`}
                  </pre>
                </div>
              </div>
            )}

            {/* Results */}
            {isTeams && rows.length > 0 && (
              <>
                {/* Stats bar */}
                <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 flex-shrink-0 flex-wrap">
                  <span className="text-xs text-gray-500">{fileName}</span>
                  <span className="text-xs font-medium text-gray-700">{validRows.length} pairs</span>
                  <span className="text-xs text-green-700 font-medium">✓ {passCount} pass</span>
                  <span className="text-xs text-red-600 font-medium">✗ {failCount} fail</span>
                  {invalidRows.length > 0 && (
                    <span className="text-xs text-yellow-700">{invalidRows.length} invalid rows</span>
                  )}
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => { setRows([]); setFileName(null); setPage(0); }}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Upload new
                    </button>
                    <button
                      onClick={handleExportPDF}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[#111827] text-white hover:bg-[#1f2937] transition-colors"
                    >
                      Export PDF
                    </button>
                  </div>
                </div>

                {/* Invalid row warnings */}
                {invalidRows.length > 0 && (
                  <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-100 flex-shrink-0">
                    {invalidRows.slice(0, 3).map((r) => (
                      <p key={r.index} className="text-xs text-yellow-700">
                        Row {r.index + 1}: {r.error}
                      </p>
                    ))}
                    {invalidRows.length > 3 && (
                      <p className="text-xs text-yellow-600">…and {invalidRows.length - 3} more invalid rows</p>
                    )}
                  </div>
                )}

                {/* Table */}
                <div className="overflow-y-auto flex-1">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 w-10">#</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Text</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Background</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Preview</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">Ratio</th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500">WCAG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageRows.map((row) => (
                        <tr key={row.index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2.5 text-xs text-gray-400">{row.index + 1}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: row.textColor }} />
                              <span className="text-xs font-mono text-gray-700">{row.textColor}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded border border-gray-200 flex-shrink-0" style={{ backgroundColor: row.bgColor }} />
                              <span className="text-xs font-mono text-gray-700">{row.bgColor}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <div
                              className="px-2 py-0.5 rounded text-xs font-medium w-fit"
                              style={{ backgroundColor: row.bgColor, color: row.textColor, border: '1px solid rgba(0,0,0,0.08)' }}
                            >
                              Aa
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-700">{row.ratio.toFixed(2)}:1</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${badgeClass(row.wcagLevel)}`}>
                              {row.wcagLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 flex-shrink-0">
                    <span className="text-xs text-gray-500">
                      Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, validRows.length)} of {validRows.length}
                    </span>
                    <div className="flex gap-2">
                      <button
                        disabled={page === 0}
                        onClick={() => setPage((p) => p - 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      >
                        ← Prev
                      </button>
                      <button
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};
