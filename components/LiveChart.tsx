"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import type { ChartRange, ChartResponse, LinePoint } from "@/lib/types";
import { cn, sourceLabel } from "@/lib/utils";

const RANGES: ChartRange[] = ["1D", "1W", "1M", "3M", "1Y"];

function rgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function dedupe(points: LinePoint[]): LinePoint[] {
  const out: LinePoint[] = [];
  let last = -Infinity;
  for (const p of [...points].sort((a, b) => a.time - b.time)) {
    if (!Number.isInteger(p.time) || !Number.isFinite(p.value) || p.value <= 0) {
      throw new Error("Invalid chart point");
    }
    if (p.time > last) {
      out.push(p);
      last = p.time;
    }
  }
  return out;
}

export function LiveChart({
  symbol,
  accent = "#008138",
}: {
  symbol: string;
  accent?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Area"> | null>(null);
  const [range, setRange] = useState<ChartRange>("3M");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    key: string;
    status: "ready" | "empty" | "error";
    source?: ChartResponse["source"];
  } | null>(null);
  const requestKey = `${symbol}:${range}:${accent}:${attempt}`;
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;

  // Recreate the chart when its accent changes.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#626979",
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#f3f4f7" },
        horzLines: { color: "#e6e8ec" },
      },
      rightPriceScale: { borderColor: "#e6e8ec" },
      timeScale: {
        borderColor: "#e6e8ec",
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "#8a8f9c", labelBackgroundColor: "#0b0c10" },
        horzLine: { color: "#8a8f9c", labelBackgroundColor: "#0b0c10" },
      },
      handleScale: { mouseWheel: false },
    });

    const series = chart.addAreaSeries({
      lineColor: accent,
      topColor: rgba(accent, 0.32),
      bottomColor: rgba(accent, 0.01),
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
      crosshairMarkerBorderColor: accent,
      crosshairMarkerBackgroundColor: accent,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [accent]);

  // Load / reload data when symbol or range changes.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    seriesRef.current?.setData([]);

    fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`Chart request failed: ${r.status}`);
        return r.json();
      })
      .then((d: ChartResponse) => {
        if (!active || !seriesRef.current || !chartRef.current) return;
        if (
          d.symbol !== symbol ||
          d.range !== range ||
          !["coingecko", "finnhub", "simulated"].includes(d.source) ||
          !Array.isArray(d.points)
        ) {
          throw new Error("Invalid chart response");
        }
        const pts = dedupe(d.points).map((p) => ({
          time: p.time as UTCTimestamp,
          value: p.value,
        }));
        if (pts.length < 2) {
          setResult({ key: requestKey, status: "empty" });
          return;
        }
        seriesRef.current.setData(pts);
        chartRef.current.timeScale().fitContent();
        chartRef.current.applyOptions({
          timeScale: { timeVisible: range === "1D" || range === "1W" },
        });
        setResult({ key: requestKey, status: "ready", source: d.source });
      })
      .catch(() => {
        if (active) setResult({ key: requestKey, status: "error" });
      })
      .finally(() => clearTimeout(timeout));

    return () => {
      active = false;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [symbol, range, requestKey]);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-muted" role="status">
          <span
            className={cn(
              "inline-block h-1.5 w-1.5 rounded-full",
              current?.source === "simulated" ? "bg-gold" : "bg-line"
            )}
          />
          {loading
            ? "Loading chart…"
            : current.source
              ? `${sourceLabel(current.source)} · Price history`
              : "Chart unavailable"}
        </div>

        <div className="inline-flex rounded-lg border border-line bg-white p-0.5" role="group" aria-label="Chart time range">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => {
                if (range !== r) {
                  setRange(r);
                  setAttempt((value) => value + 1);
                }
              }}
              aria-pressed={range === r}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine",
                range === r
                  ? "bg-mint text-ink-950"
                  : "text-muted hover:text-muted"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative" aria-busy={loading}>
        <div
          ref={containerRef}
          className={cn("h-[340px] w-full sm:h-[380px]", current?.status !== "ready" && "invisible")}
          role="img"
          aria-label={`${symbol} ${range} price history${current?.source === "simulated" ? " (simulated)" : ""}`}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white backdrop-blur-[1px]">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-pine" />
          </div>
        )}
        {current && current.status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm text-muted" role="status">
              {current.status === "empty"
                ? "No price history available for this range."
                : "Unable to load price history. Please try again."}
            </p>
            <button
              onClick={() => setAttempt((value) => value + 1)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-ink-950 hover:bg-canvas focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine"
            >
              Retry chart
            </button>
          </div>
        )}
      </div>
      {current?.source === "simulated" && (
        <p className="mt-2 text-xs text-muted">
          Illustrative data, not actual historical prices.
        </p>
      )}
    </div>
  );
}
