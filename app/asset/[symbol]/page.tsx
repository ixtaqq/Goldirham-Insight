import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Coins,
  Target,
  Waypoints,
} from "lucide-react";
import { ASSETS, getAsset, getRelated } from "@/lib/assets";
import { getCategory } from "@/lib/categories";
import { toCardData } from "@/lib/card";
import { comparisonHref } from "@/lib/compare";
import { avgScore } from "@/lib/utils";
import { LivePrice } from "@/components/LivePrice";
import { LiveChart } from "@/components/LiveChart";
import { ScoreBars } from "@/components/ScoreBars";
import { ArticleBody } from "@/components/ArticleBody";
import { AssetCard } from "@/components/AssetCard";
import { AssetMark } from "@/components/AssetMark";
import { ResearchRecord } from "@/components/ResearchRecord";

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
  const related = getRelated(asset).map(toCardData);
  const overall = asset.scores ? avgScore(asset.scores) : null;

  return (
    <div className="asset-page" data-denom={asset.category}>
      <div className="container-x">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          {cat && (
            <>
              <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
              <span aria-hidden="true">/</span>
            </>
          )}
          <span className="ticker" aria-current="page">{asset.symbol}</span>
        </nav>

        <header className="asset-header">
          <div className="min-w-0">
            <div className="asset-tags">
              <span className="tag">{CLASS_LABEL[asset.assetClass]}</span>
              {asset.tierLabel && <span className="tag">{asset.tierLabel}</span>}
              {cat && <Link href={`/category/${cat.slug}`} className="tag tag-denom">{cat.name}</Link>}
            </div>
            <div className="asset-heading">
              <AssetMark symbol={asset.symbol} className="asset-mark-large" />
              <h1>
                {asset.name}
                <span className="ticker">{asset.symbol}</span>
              </h1>
            </div>
            <p className="asset-lede">{asset.theme} — {asset.tagline}</p>
            <div className="asset-links"><Link href={comparisonHref([asset.symbol])} className="text-link">Compare this asset</Link></div>
            {asset.catalog && <p className="asset-catalog">{asset.catalog.marketCap ? `Reference market cap: ${asset.catalog.marketCap} · 12 Oct 2026 · supplied list, not independently verified.` : "ETF theme list · not ranked by AUM; fund size and fees not assessed."}{asset.catalog.country ? ` Country: ${asset.catalog.country}.` : ""}</p>}
          </div>
          <div className="asset-quote">
            <LivePrice symbol={asset.symbol} basePrice={asset.basePrice} />
          </div>
        </header>

        <section className="score-band" aria-label="Editorial scores">
          {overall !== null && <div className="score-total"><span className="score-big">{overall.toFixed(1)}</span><span className="score-of">/10 composite</span></div>}
          <ScoreBars scores={asset.scores} variant="triad" size="lg" />
        </section>

        <section className="chart-panel" aria-label="Price history">
          <LiveChart key={asset.symbol} symbol={asset.symbol} />
        </section>

        <div className="asset-body">
          <article className="thesis">
            <ResearchRecord review={asset.research} />
            <h2 className="thesis-title"><Waypoints size={20} aria-hidden="true" />{asset.scores ? "Investment thesis" : "Catalog reference"}</h2>
            <ArticleBody markdown={asset.article} />
          </article>

          <aside className="asset-rail" aria-label="Research notes">
            <RailSection icon={<Coins size={16} aria-hidden="true" />} title="Valuation & entry">
              <p className="entry-range">{asset.entryRange}</p>
              <ul className="rail-list rail-list-dots">
                {asset.valuationNotes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </RailSection>
            <RailSection icon={<Check size={16} aria-hidden="true" />} title="Why it wins">
              <ul className="rail-list">
                {asset.whyItWins.map((w, i) => <li key={i}><Check size={15} className="icon-gain" aria-hidden="true" />{w}</li>)}
              </ul>
            </RailSection>
            <RailSection icon={<Target size={16} aria-hidden="true" />} title="Stage of the cycle">
              <p>{asset.stage}</p>
            </RailSection>
            <RailSection icon={<AlertTriangle size={16} aria-hidden="true" />} title="Key risks">
              <ul className="rail-list">
                {asset.risks.map((r, i) => <li key={i}><AlertTriangle size={15} className="icon-warn" aria-hidden="true" />{r}</li>)}
              </ul>
            </RailSection>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="related" aria-labelledby="related-heading">
            <div className="section-head">
              <h2 id="related-heading">Related in {cat?.name}</h2>
              {cat && <Link href={`/category/${cat.slug}`} className="text-link"><ArrowLeft size={14} aria-hidden="true" /> Back to {cat.name}</Link>}
            </div>
            <div className="asset-grid">
              {related.map((c) => <AssetCard key={c.symbol} data={c} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function RailSection({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rail-section">
      <h2>{icon}{title}</h2>
      {children}
    </section>
  );
}
