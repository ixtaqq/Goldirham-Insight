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

// The chart library parses only hex and rgb() colours, so theme tokens (oklch) are resolved through a canvas.
function tokenColors(element: Element) {
  const styles = getComputedStyle(element);
  const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  const rgb = (name: string, fallback: string) => {
    if (!context) return fallback;
    context.clearRect(0, 0, 1, 1);
    context.fillStyle = fallback;
    context.fillStyle = styles.getPropertyValue(name).trim() || fallback;
    context.fillRect(0, 0, 1, 1);
    const [r, g, b] = context.getImageData(0, 0, 1, 1).data;
    return [r, g, b].join(", ");
  };
  return {
    line: rgb("--denom", "#41514c"),
    text: rgb("--ink-3", "#596762"),
    grid: rgb("--rule", "#d2dcd8"),
    ink: rgb("--ink", "#0e231c"),
  };
}

function applyTheme(element: Element, chart: IChartApi, series: ISeriesApi<"Area">) {
  const color = tokenColors(element);
  chart.applyOptions({
    layout: { textColor: `rgb(${color.text})` },
    grid: { vertLines: { color: `rgba(${color.grid}, 0.45)` }, horzLines: { color: `rgb(${color.grid})` } },
    rightPriceScale: { borderColor: `rgb(${color.grid})` },
    timeScale: { borderColor: `rgb(${color.grid})` },
    crosshair: {
      vertLine: { color: `rgba(${color.text}, 0.7)`, labelBackgroundColor: `rgb(${color.ink})` },
      horzLine: { color: `rgba(${color.text}, 0.7)`, labelBackgroundColor: `rgb(${color.ink})` },
    },
  });
  series.applyOptions({
    lineColor: `rgb(${color.line})`,
    topColor: `rgba(${color.line}, 0.26)`,
    bottomColor: `rgba(${color.line}, 0.01)`,
    crosshairMarkerBorderColor: `rgb(${color.line})`,
    crosshairMarkerBackgroundColor: `rgb(${color.line})`,
  });
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

export function LiveChart({ symbol }: { symbol: string }) {
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
  const requestKey = `${symbol}:${range}:${attempt}`;
  const current = result?.key === requestKey ? result : null;
  const loading = current === null;

  // Create the chart once; colours follow the page's theme tokens, including light/dark switches.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        fontFamily: "var(--font-sans), system-ui, sans-serif",
        fontSize: 11,
      },
      timeScale: { secondsVisible: false },
      crosshair: { mode: 1 },
      handleScale: { mouseWheel: false },
    });

    const series = chart.addAreaSeries({
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: true,
    });
    applyTheme(el, chart, series);

    chartRef.current = chart;
    seriesRef.current = series;

    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    const retheme = () => applyTheme(el, chart, series);
    scheme.addEventListener("change", retheme);

    return () => {
      scheme.removeEventListener("change", retheme);
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

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
      <div className="chart-head">
        <div className="chart-status" role="status">
          <span className="live-dot" data-state={current?.source === "simulated" ? "simulated" : current?.source ? "observed" : undefined} aria-hidden="true" />
          {loading
            ? "Loading chart…"
            : current.source
              ? `${sourceLabel(current.source)} · Price history`
              : "Chart unavailable"}
        </div>

        <div className="chart-ranges" role="group" aria-label="Chart time range">
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
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-stage" aria-busy={loading}>
        <div
          ref={containerRef}
          className={cn("chart-canvas", current?.status !== "ready" && "is-hidden")}
          data-source={current?.status === "ready" ? current.source : undefined}
          role="img"
          aria-label={`${symbol} ${range} price history${current?.source === "simulated" ? " (simulated)" : ""}`}
        />
        {loading && <div className="chart-skeleton" aria-hidden="true" />}
        {current && current.status !== "ready" && (
          <div className="chart-message">
            <p role="status">
              {current.status === "empty"
                ? "No price history available for this range."
                : "Unable to load price history. Please try again."}
            </p>
            <button onClick={() => setAttempt((value) => value + 1)} className="btn btn-quiet btn-sm">
              Retry chart
            </button>
          </div>
        )}
      </div>
      {current?.source === "simulated" && (
        <p className="chart-note">
          Illustrative data, not actual historical prices.
        </p>
      )}
    </div>
  );
}
