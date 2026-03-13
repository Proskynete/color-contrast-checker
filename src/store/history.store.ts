import { atom } from 'nanostores';

export type HistoryEntry = {
  text: string;
  background: string;
  ratio: number;
};

export const colorHistoryStore = atom<HistoryEntry[]>([]);

export function addToHistory(entry: HistoryEntry) {
  const current = colorHistoryStore.get();
  if (current.length > 0) {
    const last = current[0];
    if (last.text === entry.text && last.background === entry.background) return;
  }
  colorHistoryStore.set([entry, ...current].slice(0, 10));
}

export function clearHistory() {
  colorHistoryStore.set([]);
}
