import { useState } from 'react';

type PaletteRole = {
  key: string;
  label: string;
  value: string;
  contrastPair?: string;
  ratio?: number;
};

type Annotation = { against: string; ratio: number };

type Props = {
  isSignedIn: boolean;
  plan: string;
  teamId?: string | null;
  teamRole?: string | null;
  teamStatus?: string | null;
};

const ROLE_META: Record<string, { label: string; description: string }> = {
  primary: { label: 'Primary', description: 'Brand color' },
  primary_text: { label: 'On Primary', description: 'Text on primary' },
  secondary: { label: 'Secondary', description: 'Accent color' },
  secondary_text: { label: 'On Secondary', description: 'Text on secondary' },
  background: { label: 'Background', description: 'Page surface' },
  surface: { label: 'Surface', description: 'Cards / modals' },
  text_primary: { label: 'Text', description: 'Primary body text' },
  text_secondary: { label: 'Text 2', description: 'Secondary body text' },
};

const PREVIEW_PAIRS: Array<[string, string]> = [
  ['primary', 'primary_text'],
  ['secondary', 'secondary_text'],
  ['background', 'text_primary'],
  ['surface', 'text_primary'],
];

function wcagBadgeClass(ratio: number): string {
  if (ratio >= 7) return 'bg-green-100 text-green-800';
  if (ratio >= 4.5) return 'bg-blue-100 text-blue-800';
  if (ratio >= 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
}

function wcagLabel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export const AiPalette = ({ isSignedIn, plan, teamId = null, teamRole = null, teamStatus = null }: Props) => {
  const [open, setOpen] = useState(false);
  const [brandColor, setBrandColor] = useState('#1E40AF');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [palette, setPalette] = useState<Record<string, string> | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, Annotation> | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  const [paletteName, setPaletteName] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const isTeams = plan === 'teams';
  const canSaveToTeam = isTeams && !!teamId && teamRole === 'owner' && teamStatus !== 'frozen';

  const handleGenerate = async () => {
    if (!isSignedIn) {
      document.querySelector<HTMLButtonElement>('[data-clerk-sign-in]')?.click();
      return;
    }
    const hexRe = /^#[0-9A-Fa-f]{6}$/;
    if (!hexRe.test(brandColor)) {
      setError('Enter a valid hex color (e.g. #1E40AF)');
      return;
    }
    setLoading(true);
    setError(null);
    setPalette(null);
    setAnnotations(null);
    setShowSaveForm(false);
    setSavedMsg(null);
    try {
      const res = await fetch('/api/ai-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandColor }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to generate palette');
        return;
      }
      setPalette(data.palette);
      setAnnotations(data.annotations);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePalette = async (toTeam: boolean) => {
    if (!palette || !paletteName.trim()) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      const colors = Object.values(palette);
      const url = toTeam && canSaveToTeam ? `/api/teams/${teamId}/palettes` : '/api/palettes';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: paletteName.trim(), colors }),
      });
      if (res.ok) {
        setSavedMsg(toTeam ? 'Saved to team palettes' : 'Saved to personal palettes');
        setShowSaveForm(false);
        setPaletteName('');
      } else {
        const data = await res.json();
        setSavedMsg(`Error: ${data.error ?? 'Could not save'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const roleList: PaletteRole[] = palette
    ? Object.entries(palette).map(([key, value]) => ({
        key,
        label: ROLE_META[key]?.label ?? key,
        value,
        contrastPair: annotations?.[key]?.against,
        ratio: annotations?.[key]?.ratio,
      }))
    : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>🤖</span> AI Palette
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <p className="font-semibold text-gray-800">AI Palette Generator</p>
                <p className="text-xs text-gray-400 mt-0.5">Generate a full accessible color system from your brand color</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Sign-in gate */}
            {!isSignedIn && (
              <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="text-4xl mb-4">🎨</div>
                <p className="font-semibold text-gray-800 text-lg mb-1">Sign in to use AI Palette</p>
                <p className="text-sm text-gray-500 max-w-sm mb-5">
                  Generate a full accessible color system powered by AI — free for all signed-in users.
                </p>
                <button
                  onClick={() => {
                    setOpen(false);
                    document.querySelector<HTMLButtonElement>('[data-clerk-sign-in]')?.click();
                  }}
                  className="h-9 px-5 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] transition-colors"
                >
                  Sign in
                </button>
              </div>
            )}

            {/* Main content */}
            {isSignedIn && (
              <>
                {/* Input row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 flex-shrink-0">
                  <div className="relative flex items-center">
                    <div
                      className="w-9 h-9 rounded-lg border border-gray-200 flex-shrink-0 cursor-pointer"
                      style={{ backgroundColor: brandColor }}
                      onClick={() => document.getElementById('ai-palette-color-input')?.click()}
                    />
                    <input
                      id="ai-palette-color-input"
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                      className="sr-only"
                    />
                  </div>
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value.toUpperCase())}
                    placeholder="#1E40AF"
                    className="flex-1 text-sm font-mono border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                  />
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="h-9 px-4 rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1f2937] disabled:opacity-60 transition-colors whitespace-nowrap"
                  >
                    {loading ? 'Generating…' : 'Generate'}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-5 py-3 bg-red-50 border-b border-red-100 flex-shrink-0">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                {/* Skeleton loader */}
                {loading && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 gap-3">
                    <div className="flex gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse"
                          style={{ animationDelay: `${i * 80}ms` }}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-400">Generating accessible palette…</p>
                  </div>
                )}

                {/* Empty state */}
                {!loading && !palette && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-6">
                    <div className="text-3xl mb-3">🎨</div>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Enter your brand color and generate a full accessible palette — primary, secondary, backgrounds, and text colors, all WCAG-compliant.
                    </p>
                  </div>
                )}

                {/* Palette results */}
                {!loading && palette && (
                  <div className="overflow-y-auto flex-1">
                    {/* Color swatches grid */}
                    <div className="px-5 py-4 grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {roleList.map((role) => (
                        <div key={role.key} className="flex flex-col items-center gap-1">
                          <div
                            className="w-full aspect-square rounded-xl border border-black/10 shadow-sm"
                            style={{ backgroundColor: role.value }}
                            title={`${role.label}: ${role.value}`}
                          />
                          <p className="text-[10px] font-medium text-gray-600 text-center leading-tight">{role.label}</p>
                          <p className="text-[10px] font-mono text-gray-400">{role.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Preview pairs */}
                    <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                      {PREVIEW_PAIRS.map(([bg, fg]) => (
                        palette[bg] && palette[fg] && (
                          <div
                            key={`${bg}-${fg}`}
                            className="rounded-xl p-3 border border-black/10"
                            style={{ backgroundColor: palette[bg] }}
                          >
                            <p className="text-xs font-semibold mb-0.5" style={{ color: palette[fg] }}>
                              {ROLE_META[bg]?.label}
                            </p>
                            <p className="text-xs" style={{ color: palette[fg] }}>
                              {ROLE_META[bg]?.description}
                            </p>
                          </div>
                        )
                      ))}
                    </div>

                    {/* Contrast annotations */}
                    <div className="px-5 pb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">Contrast ratios</p>
                      <div className="space-y-1.5">
                        {roleList.filter((r) => r.ratio !== undefined).map((role) => (
                          <div key={role.key} className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 w-36 flex-shrink-0">
                              <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: role.value }} />
                              <div className="w-4 h-4 rounded border border-gray-200" style={{ backgroundColor: role.contrastPair }} />
                              <span className="text-xs text-gray-600">{role.label}</span>
                            </div>
                            <span className="text-xs font-mono text-gray-700">{role.ratio?.toFixed(2)}:1</span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${wcagBadgeClass(role.ratio!)}`}>
                              {wcagLabel(role.ratio!)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Save section */}
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      {savedMsg && (
                        <p className={`text-xs mb-3 font-medium ${savedMsg.startsWith('Error') ? 'text-red-600' : 'text-green-700'}`}>
                          {savedMsg}
                        </p>
                      )}
                      {!showSaveForm ? (
                        <button
                          onClick={() => setShowSaveForm(true)}
                          className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                        >
                          + Save palette
                        </button>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Palette name…"
                            value={paletteName}
                            onChange={(e) => setPaletteName(e.target.value)}
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleSavePalette(false)}
                              disabled={saving || !paletteName.trim()}
                              className="flex-1 text-xs py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                              Save to My Palettes
                            </button>
                            {canSaveToTeam && (
                              <button
                                onClick={() => handleSavePalette(true)}
                                disabled={saving || !paletteName.trim()}
                                className="flex-1 text-xs py-1.5 rounded-lg border border-indigo-300 text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 transition-colors"
                              >
                                Save to Team
                              </button>
                            )}
                            <button
                              onClick={() => { setShowSaveForm(false); setPaletteName(''); }}
                              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
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
