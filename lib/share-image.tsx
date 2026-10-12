/* eslint-disable @next/next/no-img-element -- ImageResponse renders plain img elements, not next/image. */
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactNode } from "react";
import { ImageResponse } from "next/og";
import { toReviewStatus } from "@/lib/card";
import { getCategory } from "@/lib/categories";
import { FACTORS } from "@/lib/explorer";
import type { Asset } from "@/lib/types";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

const INK = "#101510";
const MUTED = "#5b6b60";
const GREEN = "#1f8a4c";
const LINE = "#dfe6dc";

async function logo(symbol: string) {
  const data = await readFile(join(process.cwd(), "public/logos", symbol.toLowerCase() + ".png"), "base64");
  return "data:image/png;base64," + data;
}

function render(body: ReactNode) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "56px 64px", background: "#f5f8f4", color: INK }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 28, letterSpacing: -0.5 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9, background: GREEN }} />
          Goldirham Insight
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>{body}</div>
        {/* Previews are cached images, so they show editorial scores only and never a price that could be stale or simulated. */}
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: `2px solid ${LINE}`, paddingTop: 20, fontSize: 22, color: MUTED }}>
          <span>Editorial scores · educational research, not advice</span>
          <span>goldirham-insight.vercel.app</span>
        </div>
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}

function ReviewBadge({ asset }: { asset: Asset }) {
  const review = toReviewStatus(asset.research);
  return (
    <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 14px", borderRadius: 999, border: `2px solid ${LINE}`, background: "#ffffff", fontSize: 20, color: MUTED }}>
      {review.status === "reviewed" ? `Reviewed ${review.reviewedAt}` : "Not reviewed"}
    </div>
  );
}

export function renderSiteImage(assetCount: number, themeCount: number) {
  return render(
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ fontSize: 76, letterSpacing: -2.5, lineHeight: 1.05 }}>AI-era investment research</div>
      <div style={{ fontSize: 32, color: MUTED }}>{`${assetCount} assets · ${themeCount} themes · scored on upside, safety, and AI exposure`}</div>
    </div>,
  );
}

export async function renderAssetImage(asset: Asset) {
  const category = getCategory(asset.category);
  const mark = await logo(asset.symbol);
  return render(
    <div style={{ display: "flex", gap: 64, alignItems: "center" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 520 }}>
        <img src={mark} alt="" width={96} height={96} style={{ borderRadius: 22 }} />
        <div style={{ fontSize: 60, letterSpacing: -2, lineHeight: 1.05 }}>{asset.name}</div>
        <div style={{ fontSize: 28, color: MUTED }}>{`${asset.symbol} · ${category?.name ?? asset.category}`}</div>
        <ReviewBadge asset={asset} />
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 28 }}>
        {FACTORS.map((factor) => (
          <div key={factor.key} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
              <span style={{ color: MUTED }}>{factor.label}</span>
              <span>{asset.scores?.[factor.key].toFixed(1) ?? "Pending"}</span>
            </div>
            <div style={{ display: "flex", height: 14, borderRadius: 7, background: LINE }}>
              <div style={{ width: `${(asset.scores?.[factor.key] ?? 0) * 10}%`, borderRadius: 7, background: GREEN }} />
            </div>
          </div>
        ))}
      </div>
    </div>,
  );
}

export async function renderComparisonImage(assets: readonly Asset[]) {
  const logos = await Promise.all(assets.map((asset) => logo(asset.symbol)));
  return render(
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      <div style={{ fontSize: 56, letterSpacing: -2 }}>{assets.map((asset) => asset.symbol).join(" vs ")}</div>
      <div style={{ display: "flex", gap: 24 }}>
        {assets.map((asset, index) => (
          <div key={asset.symbol} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, padding: 24, borderRadius: 20, border: `2px solid ${LINE}`, background: "#ffffff" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <img src={logos[index]} alt="" width={56} height={56} style={{ borderRadius: 14 }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 30 }}>{asset.symbol}</span>
                <span style={{ fontSize: 20, color: MUTED }}>{asset.name.length > 24 ? asset.name.slice(0, 23) + "…" : asset.name}</span>
              </div>
            </div>
            {FACTORS.map((factor) => (
              <div key={factor.key} style={{ display: "flex", justifyContent: "space-between", fontSize: 24 }}>
                <span style={{ color: MUTED }}>{factor.label}</span>
                <span>{asset.scores?.[factor.key].toFixed(1) ?? "Pending"}</span>
              </div>
            ))}
            <ReviewBadge asset={asset} />
          </div>
        ))}
      </div>
    </div>,
  );
}
