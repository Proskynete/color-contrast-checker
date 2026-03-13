import { useEffect, useState } from 'react';

import { backgroundStore, textStore } from '../../store/values.store';

type Check = {
  id: string;
  textColor: string;
  bgColor: string;
  ratio: number;
  wcagLevel: string;
  aiAssisted: boolean;
  createdAt: string;
};

type Props = {
  isSignedIn: boolean;
  plan: string;
};

export const CheckHistory = ({ isSignedIn, plan }: Props) => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/checks');
      const data = await res.json();
      if (res.ok) setChecks(data.checks ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && isSignedIn) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const applyCheck = (check: Check) => {
    textStore.set(check.textColor.replace('#', ''));
    backgroundStore.set(check.bgColor.replace('#', ''));
    setOpen(false);
  };

  if (!isSignedIn) return null;
  if (plan === 'free') return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors"
      >
        <span>🕐</span> History
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <p className="font-semibold text-gray-800">Check History</p>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
            </div>

            <div className="overflow-y-auto max-h-96">
              {loading && <p className="text-sm text-center text-gray-500 py-8">Loading…</p>}

              {!loading && checks.length === 0 && (
                <p className="text-sm text-center text-gray-500 py-8">No history yet</p>
              )}

              {!loading && checks.map((check) => (
                <button
                  key={check.id}
                  onClick={() => applyCheck(check)}
                  className="w-full flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
                >
                  <div className="flex gap-2 flex-shrink-0">
                    <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: check.textColor }} />
                    <div className="w-6 h-6 rounded-md border border-gray-200" style={{ backgroundColor: check.bgColor }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {check.textColor} / {check.bgColor}
                    </p>
                    <p className="text-xs text-gray-500">
                      {check.ratio.toFixed(2)}:1 · {check.wcagLevel}
                      {check.aiAssisted && ' · ✨ AI'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(check.createdAt).toLocaleDateString()}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
