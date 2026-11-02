"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Quote } from "@/lib/types";
import { isQuoteTimestamp } from "@/lib/quote-time";

type QuoteMap = Record<string, Quote>;

interface MarketState {
  quotes: QuoteMap;
  ready: boolean;
  error: boolean;
  /** last tick direction per symbol, for flash animations */
  dir: Record<string, "up" | "down" | "flat">;
  /** When the latest quotes arrived, for showing their age. */
  asOf: number | null;
  /** Registers symbols to poll while the caller is mounted; returns the release function. */
  subscribe: (symbols: readonly string[]) => () => void;
}

const MarketContext = createContext<MarketState>({
  quotes: {},
  ready: false,
  error: false,
  dir: {},
  asOf: null,
  subscribe: () => () => {},
});

const POLL_MS = 6000;

// Each poll requests only the symbols mounted components show, so an asset page asks for a handful
// and the provider budget goes to what is on screen.
export function LiveMarketProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [dir, setDir] = useState<Record<string, "up" | "down" | "flat">>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const [asOf, setAsOf] = useState<number | null>(null);
  const prev = useRef<QuoteMap>({});
  const watched = useRef(new Map<string, number>());
  const onWatchedChange = useRef(() => {});

  const subscribe = useCallback((symbols: readonly string[]) => {
    for (const symbol of symbols) watched.current.set(symbol, (watched.current.get(symbol) ?? 0) + 1);
    onWatchedChange.current();
    return () => {
      for (const symbol of symbols) {
        const count = watched.current.get(symbol) ?? 0;
        if (count > 1) watched.current.set(symbol, count - 1);
        else watched.current.delete(symbol);
      }
      onWatchedChange.current();
    };
  }, []);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let generation = 0;
    let hidden = document.hidden;
    let requestedKey = "";
    let changeQueued = false;
    const watchedKey = () => [...watched.current.keys()].sort().join(",");

    const load = async () => {
      if (!active || hidden || controller) return;
      clearTimeout(timer);
      // Insertion order keeps the first-mounted symbols first when the provider budget runs short.
      const symbols = [...watched.current.keys()];
      requestedKey = watchedKey();
      if (!symbols.length) return;
      const request = new AbortController();
      controller = request;
      const currentGeneration = ++generation;
      const timeout = setTimeout(() => request.abort(), 15_000);
      try {
        const res = await fetch("/api/quotes?" + new URLSearchParams({ symbols: symbols.join(",") }), {
          cache: "no-store",
          signal: request.signal,
        });
        if (!res.ok) throw new Error(`Quote request failed: ${res.status}`);
        const json = (await res.json()) as { quotes: Quote[] };
        if (!Array.isArray(json.quotes) || json.quotes.length === 0) {
          throw new Error("No quotes available");
        }
        if (json.quotes.some((q) =>
          !q || typeof q.symbol !== "string" || !q.symbol ||
          !Number.isFinite(q.price) || q.price <= 0 ||
          !Number.isFinite(q.change) || !Number.isFinite(q.changePct) ||
          !isQuoteTimestamp(q.updatedAt) ||
          !["coingecko", "finnhub", "simulated"].includes(q.source)
        )) {
          throw new Error("Invalid quote response");
        }
        if (!active || currentGeneration !== generation) return;

        const map: QuoteMap = {};
        const nextDir: Record<string, "up" | "down" | "flat"> = {};
        for (const q of json.quotes) {
          map[q.symbol] = q;
          const before = prev.current[q.symbol]?.price;
          nextDir[q.symbol] =
            before === undefined || before === q.price
              ? "flat"
              : q.price > before
                ? "up"
                : "down";
        }
        prev.current = map;
        setQuotes(map);
        setDir(nextDir);
        setAsOf(Date.now());
        setReady(true);
        setError(false);
      } catch {
        if (active && currentGeneration === generation) setError(true);
      } finally {
        clearTimeout(timeout);
        if (active && currentGeneration === generation) {
          controller = null;
          if (!hidden) timer = setTimeout(load, POLL_MS);
        }
      }
    };

    const restart = () => {
      clearTimeout(timer);
      generation++;
      controller?.abort();
      controller = null;
    };

    const onVisibilityChange = () => {
      if (hidden === document.hidden) return;
      hidden = document.hidden;
      if (hidden) restart();
      else void load();
    };

    // A navigation unmounts one page's subscribers and mounts the next in the same commit, so changes
    // are settled after the commit and fetched at once rather than on the next poll.
    onWatchedChange.current = () => {
      if (changeQueued) return;
      changeQueued = true;
      setTimeout(() => {
        changeQueued = false;
        if (!active || hidden || watchedKey() === requestedKey) return;
        restart();
        void load();
      });
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    void load();
    return () => {
      active = false;
      onWatchedChange.current = () => {};
      restart();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <MarketContext.Provider value={{ quotes, ready, error, dir, asOf, subscribe }}>
      {children}
    </MarketContext.Provider>
  );
}

/** Market state with the given symbols kept in the poll while the caller is mounted. */
export function useMarket(symbols: readonly string[] = []): MarketState {
  const market = useContext(MarketContext);
  const { subscribe } = market;
  const key = symbols.join(",");
  useEffect(() => (key ? subscribe(key.split(",")) : undefined), [subscribe, key]);
  return market;
}

export function useQuote(symbol: string): Quote | undefined {
  return useMarket([symbol]).quotes[symbol];
}

/**
 * Direction of the latest move in an observed quote, with a count that changes on every move so a keyed
 * element can replay its flash. Simulated quotes wander on their own and never tick.
 */
export function usePriceTick(symbol: string, quote: Quote | undefined) {
  const price = quote && quote.source !== "simulated" ? quote.price : undefined;
  const [tick, setTick] = useState<{ symbol: string; price?: number; dir?: "up" | "down"; count: number }>({ symbol, price, count: 0 });
  if (tick.symbol !== symbol || tick.price !== price) {
    const previous = tick.symbol === symbol ? tick.price : undefined;
    const dir = previous === undefined || price === undefined ? undefined : price > previous ? "up" : "down";
    setTick({ symbol, price, dir, count: dir ? tick.count + 1 : tick.count });
  }
  return tick;
}
