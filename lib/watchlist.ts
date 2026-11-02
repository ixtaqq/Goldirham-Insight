import { useCallback, useSyncExternalStore } from "react";
import type { CardData } from "@/lib/card";

/** Research-change notices are opt-in. `enabledAt` is the baseline: only later revisions raise a notice. */
export interface NoticeSettings {
  enabledAt: string | null;
  seen: Record<string, string>;
}

export interface ResearchNotice {
  symbol: string;
  name: string;
  date: string;
  summary: string;
}

const NO_SYMBOLS: string[] = [];
const NOTICES_OFF: NoticeSettings = { enabledAt: null, seen: {} };
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseJson(raw: string | null): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function parseWatchlist(raw: string | null): string[] {
  const value = parseJson(raw);
  if (!Array.isArray(value)) return NO_SYMBOLS;
  return [...new Set(value.filter((item): item is string => typeof item === "string" && item.length > 0))];
}

export function parseNoticeSettings(raw: string | null): NoticeSettings {
  const value = parseJson(raw) as Partial<NoticeSettings> | null;
  if (!value || typeof value !== "object" || typeof value.enabledAt !== "string" || !ISO_DATE.test(value.enabledAt)) return NOTICES_OFF;
  const seen = Object.entries(value.seen ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === "string" && ISO_DATE.test(entry[1]));
  return { enabledAt: value.enabledAt, seen: Object.fromEntries(seen) };
}

export function toggleSymbol(symbols: readonly string[], symbol: string): string[] {
  return symbols.includes(symbol) ? symbols.filter((item) => item !== symbol) : [...symbols, symbol];
}

/** Saved assets whose latest recorded revision is newer than the baseline or the last dismissal. Prices never raise a notice. */
export function pendingNotices(cards: readonly CardData[], saved: readonly string[], settings: NoticeSettings): ResearchNotice[] {
  if (!settings.enabledAt) return [];
  return cards.flatMap((card) => {
    const latest = card.latestRevision;
    if (!latest || !saved.includes(card.symbol) || latest.date <= (settings.seen[card.symbol] ?? settings.enabledAt!)) return [];
    return [{ symbol: card.symbol, name: card.name, date: latest.date, summary: latest.summary }];
  });
}

// Storage can be missing or blocked, so a failed read or write leaves the choice in memory for this page view.
function localStore<T>(key: string, parse: (raw: string | null) => T, empty: T) {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  const read = () => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    value = parse(event.newValue);
    listeners.forEach((listener) => listener());
  };
  return {
    empty,
    get: () => (value ??= parse(read())),
    set(next: T) {
      value = next;
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Kept in memory only.
      }
      listeners.forEach((listener) => listener());
    },
    subscribe(listener: () => void) {
      if (!listeners.size) window.addEventListener("storage", onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (!listeners.size) window.removeEventListener("storage", onStorage);
      };
    },
  };
}

const watchlist = localStore("goldirham:watchlist", parseWatchlist, NO_SYMBOLS);
const notices = localStore("goldirham:research-notices", parseNoticeSettings, NOTICES_OFF);

export function useWatchlist() {
  const symbols = useSyncExternalStore(watchlist.subscribe, watchlist.get, () => watchlist.empty);
  const toggle = useCallback((symbol: string) => watchlist.set(toggleSymbol(watchlist.get(), symbol)), []);
  return { symbols, toggle };
}

export function useNoticeSettings() {
  const settings = useSyncExternalStore(notices.subscribe, notices.get, () => notices.empty);
  const setEnabled = useCallback((enabled: boolean) => notices.set(enabled ? { enabledAt: new Date().toISOString().slice(0, 10), seen: {} } : NOTICES_OFF), []);
  const dismiss = useCallback((symbol: string, date: string) => {
    const current = notices.get();
    notices.set({ ...current, seen: { ...current.seen, [symbol]: date } });
  }, []);
  return { settings, setEnabled, dismiss };
}
