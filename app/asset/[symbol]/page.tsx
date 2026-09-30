import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Coins,
  Gauge,
  Target,
  Waypoints,
} from "lucide-react";
import { ASSETS, getAsset, getRelated } from "@/lib/assets";
import { getCategory } from "@/lib/categories";
import { toCardData } from "@/lib/card";
import { avgScore } from "@/lib/utils";
import { LivePrice } from "@/components/LivePrice";
import { LiveChart } from "@/components/LiveChart";
import { ScoreBars } from "@/components/ScoreBars";
import { ArticleBody } from "@/components/ArticleBody";
import { AssetCard } from "@/components/AssetCard";

export function generateStaticParams() {
  return ASSETS.map((a) => ({ symbol: a.symbol }));
}

export async function generateMetadata(
  props: {
    params: Promise<{ symbol: string }>;
  }
): Promise<Metadata> {
  const params = await props.params;
  const asset = getAsset(params.symbol);
  if (!asset) return { title: "Not found" };
  return {
    title: `${asset.name} (${asset.symbol})`,
    description: asset.tagline,
  };
}

const CLASS_LABEL: Record<string, string> = {
  stock: "Stock",
  etf: "ETF",
  crypto: "Crypto",
};

export default async function AssetPage(props: { params: Promise<{ symbol: string }> }) {
  const params = await props.params;
  const asset = getAsset(params.symbol);
  if (!asset) notFound();

  const cat = getCategory(asset.category);
  const accent = "#348361";
  const related = getRelated(asset).map(toCardData);
  const overall = avgScore(asset.scores);

  return (
    <div className="site-container research-page">
      {/* breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-ink-950">
          Home
        </Link>
        <span>/</span>
        {cat && (
          <>
            <Link href={`/category/${cat.slug}`} className="hover:text-ink-950">
              {cat.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-muted">{asset.symbol}</span>
      </div>

      {/* header */}
      <div className="surface p-6 sm:p-8">
        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="rounded-lg px-2 py-0.5 text-xs font-semibold uppercase tracking-wider"
                style={{ background: `${accent}1a`, color: accent }}
              >
                {CLASS_LABEL[asset.assetClass]}
              </span>
              {asset.tierLabel && (
                <span className="rounded-lg border border-line px-2 py-0.5 text-xs text-muted">
                  {asset.tierLabel}
                </span>
              )}
            </div>
            <h1 className="mt-3 flex flex-wrap items-baseline gap-x-3 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
              {asset.name}
              <span className="font-mono text-xl text-muted">{asset.symbol}</span>
            </h1>
            <p className="mt-2 max-w-xl text-base leading-relaxed text-muted">
              {asset.theme} — {asset.tagline}
            </p>
          </div>

          <div className="shrink-0 lg:text-right">
            <LivePrice symbol={asset.symbol} basePrice={asset.basePrice} />
          </div>
        </div>
      </div>

      {/* chart */}
      <div className="mt-6 rounded-3xl border border-line bg-white p-5 sm:p-6">
        <LiveChart key={asset.symbol} symbol={asset.symbol} accent={accent} />
      </div>

      {/* body grid */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* article */}
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-pine">
              <Waypoints size={14} />
              Investment thesis
            </div>
            <ArticleBody markdown={asset.article} />
          </div>
        </div>

        {/* sidebar */}
        <div className="space-y-6">
          {/* scores */}
          <div className="rounded-3xl border border-line bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink-950">
                <Gauge size={16} className="text-pine" />
                Score
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-2xl font-bold text-ink-950">
                  {overall.toFixed(1)}
                </span>
                <span className="text-xs text-muted">/10</span>
              </div>
            </div>
            <ScoreBars scores={asset.scores} />
          </div>

          {/* valuation */}
          <SidebarCard icon={<Coins size={16} />} title="Valuation & entry">
            <div
              className="mb-3 rounded-xl px-3 py-2 text-sm font-semibold"
              style={{ background: `${accent}14`, color: accent }}
            >
              {asset.entryRange}
            </div>
            <ul className="space-y-2">
              {asset.valuationNotes.map((n, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-muted">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted" />
                  {n}
                </li>
              ))}
            </ul>
          </SidebarCard>

          {/* why it wins */}
          <SidebarCard icon={<Check size={16} />} title="Why it wins">
            <ul className="space-y-2.5">
              {asset.whyItWins.map((w, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-gain" />
                  {w}
                </li>
              ))}
            </ul>
          </SidebarCard>

          {/* stage */}
          <SidebarCard icon={<Target size={16} />} title="Stage of the cycle">
            <p className="text-sm leading-relaxed text-muted">{asset.stage}</p>
          </SidebarCard>

          {/* risks */}
          <SidebarCard icon={<AlertTriangle size={16} />} title="Key risks">
            <ul className="space-y-2.5">
              {asset.risks.map((r, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-muted">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0 text-gold" />
                  {r}
                </li>
              ))}
            </ul>
          </SidebarCard>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="mt-14">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-bold tracking-tight text-ink-950">
              Related in {cat?.name}
            </h2>
            {cat && (
              <Link
                href={`/category/${cat.slug}`}
                className="flex items-center gap-1 text-sm text-pine hover:text-pine"
              >
                <ArrowLeft size={14} /> Back to {cat.name}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => (
              <AssetCard key={c.symbol} data={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SidebarCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-line bg-white p-6">
      <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-ink-950">
        <span className="text-pine">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
}
