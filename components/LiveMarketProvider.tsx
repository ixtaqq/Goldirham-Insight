"use client";

import {
  createContext,
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
}

const MarketContext = createContext<MarketState>({
  quotes: {},
  ready: false,
  error: false,
  dir: {},
});

const POLL_MS = 6000;

export function LiveMarketProvider({ children }: { children: ReactNode }) {
  const [quotes, setQuotes] = useState<QuoteMap>({});
  const [dir, setDir] = useState<Record<string, "up" | "down" | "flat">>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  const prev = useRef<QuoteMap>({});

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | null = null;
    let generation = 0;
    let hidden = document.hidden;

    const load = async () => {
      if (!active || hidden || controller) return;
      clearTimeout(timer);
      const request = new AbortController();
      controller = request;
      const currentGeneration = ++generation;
      const timeout = setTimeout(() => request.abort(), 15_000);
      try {
        const res = await fetch("/api/quotes", {
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

    const onVisibilityChange = () => {
      if (hidden === document.hidden) return;
      hidden = document.hidden;
      if (hidden) {
        clearTimeout(timer);
        generation++;
        controller?.abort();
        controller = null;
      } else {
        void load();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    void load();
    return () => {
      active = false;
      generation++;
      clearTimeout(timer);
      controller?.abort();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <MarketContext.Provider value={{ quotes, ready, error, dir }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useQuote(symbol: string): Quote | undefined {
  return useContext(MarketContext).quotes[symbol];
}

export function useMarket(): MarketState {
  return useContext(MarketContext);
}
