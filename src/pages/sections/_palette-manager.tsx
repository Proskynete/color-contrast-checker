import { useStore } from '@nanostores/react';
import { useEffect, useState } from 'react';

import { backgroundStore, textStore } from '../../store/values.store';

type Palette = {
  id: string;
  name: string;
  colors: string[];
  createdAt: string;
};

type Props = {
  isSignedIn: boolean;
  plan: string;
  teamId?: string | null;
  teamRole?: string | null;
  teamStatus?: string | null;
};

export const PaletteManager = ({ isSignedIn, plan, teamId = null, teamRole = null, teamStatus = null }: Props) => {
  const currentText = useStore(textStore);
  const currentBg = useStore(backgroundStore);
  const [tab, setTab] = useState<'personal' | 'team'>('personal');
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [teamPalettes, setTeamPalettes] = useState<Palette[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);

  const isPro = plan === 'pro' || plan === 'teams';
  const hasTeam = !!teamId;
  const isTeamOwner = teamRole === 'owner';
  const isTeamFrozen = teamStatus === 'frozen';

  const fetchPalettes = async () => {
    setLoading(true);
    try {
      const [personalRes, teamRes] = await Promise.all([
        fetch('/api/palettes'),
        hasTeam ? fetch(`/api/teams/${teamId}/palettes`) : Promise.resolve(null),
      ]);
      const personalData = await personalRes.json();
      if (personalRes.ok) setPalettes(personalData.palettes ?? []);
      if (teamRes) {
        const teamData = await teamRes.json();
        if (teamRes.ok) setTeamPalettes(teamData.palettes ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isSignedIn && isPro) fetchPalettes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const savePalette = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const isTeamTab = tab === 'team' && hasTeam && isTeamOwner && !isTeamFrozen;
      const url = isTeamTab ? `/api/teams/${teamId}/palettes` : '/api/palettes';
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), colors: [`#${currentText}`, `#${currentBg}`] }),
      });
      if (res.ok) {
        const palette = await res.json();
        if (isTeamTab) setTeamPalettes((prev) => [palette, ...prev]);
        else setPalettes((prev) => [palette, ...prev]);
        setNewName('');
      }
    } finally {
      setSaving(false);
    }
  };

  const deletePalette = async (id: string) => {
    if (tab === 'team' && hasTeam) {
      await fetch(`/api/teams/${teamId}/palettes/${id}`, { method: 'DELETE' });
      setTeamPalettes((prev) => prev.filter((p) => p.id !== id));
    } else {
      await fetch(`/api/palettes/${id}`, { method: 'DELETE' });
      setPalettes((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const applyPalette = (palette: Palette) => {
    if (palette.colors[0]) textStore.set(palette.colors[0].replace('#', ''));
    if (palette.colors[1]) backgroundStore.set(palette.colors[1].replace('#', ''));
    setOpen(false);
  };

  if (!isSignedIn || !isPro) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>🎨</span> Palettes
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Saved Palettes</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            {/* Tabs — only shown when user has a team */}
            {hasTeam && (
              <div className="flex border-b border-gray-100">
                {(['personal', 'team'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setNewName(''); }}
                    className={`flex-1 py-2.5 text-xs font-semibold transition-colors capitalize ${
                      tab === t
                        ? 'text-[#111827] border-b-2 border-[#111827]'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {t === 'team' ? `Team` : 'Personal'}
                  </button>
                ))}
              </div>
            )}

            {/* Frozen warning */}
            {tab === 'team' && isTeamFrozen && (
              <div className="px-5 py-2 bg-amber-50 border-b border-amber-100">
                <p className="text-xs text-amber-700">Team is frozen — palettes are read-only.</p>
              </div>
            )}

            {/* Save current colors */}
            {(tab === 'personal' || (tab === 'team' && isTeamOwner && !isTeamFrozen)) && (
              <div className="px-5 py-3 border-b border-gray-100 flex gap-2">
                <div className="flex gap-1 items-center flex-shrink-0">
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: `#${currentText}` }} />
                  <div className="w-5 h-5 rounded border border-gray-200" style={{ backgroundColor: `#${currentBg}` }} />
                </div>
                <input
                  type="text"
                  placeholder="Palette name…"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && savePalette()}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={savePalette}
                  disabled={saving || !newName.trim()}
                  className="text-sm px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Save
                </button>
              </div>
            )}

            <div className="overflow-y-auto max-h-80">
              {loading && <p className="text-sm text-center text-gray-500 py-6">Loading…</p>}

              {!loading && tab === 'personal' && palettes.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-6">No palettes saved yet</p>
              )}

              {!loading && tab === 'team' && teamPalettes.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-6">No team palettes yet</p>
              )}

              {!loading && (tab === 'personal' ? palettes : teamPalettes).map((palette) => (
                <div key={palette.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <button onClick={() => applyPalette(palette)} className="flex items-center gap-3 flex-1 text-left">
                    <div className="flex gap-1 flex-shrink-0">
                      {palette.colors.map((color, i) => (
                        <div key={i} className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                    <p className="text-sm font-medium text-gray-800">{palette.name}</p>
                  </button>
                  {(tab === 'personal' || (isTeamOwner && !isTeamFrozen)) && (
                    <button
                      onClick={() => deletePalette(palette.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none flex-shrink-0"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
