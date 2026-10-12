import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { AssetMark } from "@/components/AssetMark";
import { ResearchRecord } from "@/components/ResearchRecord";
import { ASSETS } from "@/lib/assets";
import { getCategory } from "@/lib/categories";
import { comparisonHref, comparisonPreviewHref, MAX_COMPARISON_ASSETS, resolveComparison } from "@/lib/compare";
import { SHARE_IMAGE_SIZE } from "@/lib/share-image";

const DESCRIPTION = "Compare up to three assets by editorial scores, thesis, risks, and research review status.";

export async function generateMetadata({ searchParams }: {
  searchParams: Promise<{ symbols?: string | string[] }>;
}): Promise<Metadata> {
  const symbols = resolveComparison((await searchParams).symbols).assets.map((asset) => asset.symbol);
  if (!symbols.length) return { title: "Compare assets", description: DESCRIPTION };
  const title = symbols.join(" vs ");
  return {
    title,
    description: DESCRIPTION,
    openGraph: {
      title: `${title} · Goldirham Insight`,
      description: DESCRIPTION,
      images: [{ url: comparisonPreviewHref(symbols), ...SHARE_IMAGE_SIZE, alt: `${title}: editorial scores and review status` }],
    },
  };
}

const SCORE_ROWS = [
  { key: "upside", label: "Upside" },
  { key: "safety", label: "Safety" },
  { key: "aiExposure", label: "AI exposure" },
] as const;

export default async function ComparePage({ searchParams }: {
  searchParams: Promise<{ symbols?: string | string[] }>;
}) {
  const { assets, adjusted } = resolveComparison((await searchParams).symbols);
  const symbols = assets.map((asset) => asset.symbol);

  return (
    <div className="site-container compare-page">
      <header className="compare-intro">
        <p className="eyebrow">Research workspace</p>
        <h1>Compare assets.</h1>
        <p>Put up to three investment theses side by side. Look beyond the scores to the evidence and risks behind each one.</p>
      </header>

      <form action="/compare" method="get" className="compare-form" key={symbols.join(",")} aria-label="Choose assets to compare">
        <div className="compare-selectors">
          {Array.from({ length: MAX_COMPARISON_ASSETS }, (_, index) => (
            <div key={index}>
              <label htmlFor={`compare-asset-${index}`}>Asset {index + 1}</label>
              <select id={`compare-asset-${index}`} name="symbols" defaultValue={symbols[index] ?? ""}>
                <option value="">Choose an asset</option>
                {ASSETS.map((asset) => <option key={asset.symbol} value={asset.symbol}>{asset.symbol} — {asset.name}</option>)}
              </select>
            </div>
          ))}
        </div>
        <div className="compare-form-actions">
          <button type="submit" className="button button-dark">Compare assets</button>
          {assets.length > 0 && <Link href="/compare" className="compare-text-link">Clear comparison</Link>}
          <p>Selections are saved in the URL. Copy the address to share.</p>
        </div>
      </form>

      {adjusted && <p className="compare-notice" role="status">Only the first three distinct, available assets are shown. Duplicate, unknown, or extra selections were omitted.</p>}

      {assets.length === 0 ? (
        <section className="compare-empty" aria-labelledby="compare-empty-heading">
          <h2 id="compare-empty-heading">Start with an asset you know.</h2>
          <p>Choose two or three assets above to compare their research. You can also start a comparison from any asset page.</p>
          <Link href="/#markets" className="compare-text-link">Explore the research library</Link>
        </section>
      ) : (
        <section aria-labelledby="comparison-heading" className="compare-results">
          <div className="compare-results-heading">
            <h2 id="comparison-heading">Your comparison</h2>
            <p>{assets.length} of {MAX_COMPARISON_ASSETS} assets selected</p>
          </div>
          {assets.length === 1 && <p className="compare-hint">Choose another asset above to compare it with {assets[0].symbol}.</p>}
          <p className="compare-disclosure">Scores are editorial opinions on a 0–10 scale, not forecasts or investment advice. A higher safety score does not mean an asset is risk-free. Review status applies to the research, not to market prices.</p>
          <p id="comparison-scroll-hint" className="compare-hint">On smaller screens, scroll the table sideways to see every asset.</p>
          <div className="compare-scroll" role="region" aria-label="Asset research comparison" aria-describedby="comparison-scroll-hint" tabIndex={0}>
            <table className="compare-table" style={{ "--comparison-count": assets.length } as CSSProperties}>
              <caption className="sr-only">Asset research comparison: {symbols.join(", ")}</caption>
              <colgroup><col className="compare-label-column" />{assets.map((asset) => <col key={asset.symbol} />)}</colgroup>
              <thead>
                <tr>
                  <th scope="col">Research factor</th>
                  {assets.map((asset) => (
                    <th scope="col" key={asset.symbol}>
                      <div className="compare-asset-heading"><AssetMark symbol={asset.symbol} /><span>{asset.symbol}</span></div>
                      <Link href={`/asset/${asset.symbol}`} className="compare-asset-name">{asset.name}</Link>
                      <p className="compare-category">{getCategory(asset.category)?.name}</p>
                      <Link href={comparisonHref(symbols.filter((symbol) => symbol !== asset.symbol))} className="compare-remove" aria-label={`Remove ${asset.symbol}`}>Remove</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Review status</th>
                  {assets.map((asset) => <td key={asset.symbol}><ResearchRecord review={asset.research} headingId={`research-record-${asset.symbol}`} /></td>)}
                </tr>
                {SCORE_ROWS.map(({ key, label }) => (
                  <tr key={key}>
                    <th scope="row">{label}</th>
                    {assets.map((asset) => <td key={asset.symbol}><span className="compare-score">{asset.scores?.[key].toFixed(1) ?? "Not assessed"}</span>{asset.scores && <span className="compare-score-scale"> / 10</span>}</td>)}
                  </tr>
                ))}
                <tr>
                  <th scope="row">Thesis</th>
                  {assets.map((asset) => <td key={asset.symbol}><p className="compare-theme">{asset.theme}</p><p>{asset.tagline}</p></td>)}
                </tr>
                <tr>
                  <th scope="row">Why it could work</th>
                  {assets.map((asset) => <td key={asset.symbol}><ul>{asset.whyItWins.map((reason) => <li key={reason}>{reason}</li>)}</ul></td>)}
                </tr>
                <tr>
                  <th scope="row">Key risks</th>
                  {assets.map((asset) => <td key={asset.symbol}><ul>{asset.risks.map((risk) => <li key={risk}>{risk}</li>)}</ul></td>)}
                </tr>
                <tr>
                  <th scope="row">Cycle stage</th>
                  {assets.map((asset) => <td key={asset.symbol}>{asset.stage}</td>)}
                </tr>
                <tr>
                  <th scope="row">Full research</th>
                  {assets.map((asset) => <td key={asset.symbol}><Link href={`/asset/${asset.symbol}`} className="compare-text-link">Read {asset.symbol} research</Link></td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
