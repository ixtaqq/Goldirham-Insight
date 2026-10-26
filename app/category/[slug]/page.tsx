import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAssetsByCategory } from "@/lib/assets";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { toCardData } from "@/lib/card";
import type { CategorySlug } from "@/lib/types";
import { AssetCard } from "@/components/AssetCard";
import { CategoryIcon } from "@/components/CategoryIcon";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const category = getCategory(params.slug);
  if (!category) return { title: "Not found" };
  return { title: category.name, description: category.blurb };
}

const TIER_BLURB: Record<number, string> = {
  1: "Core holdings — the best blend of safety and structural growth.",
  2: "Higher upside, moderate safety — more reward, more to watch.",
  3: "High upside, high volatility — small, high-conviction positions only.",
};

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const category = getCategory(params.slug);
  if (!category) notFound();
  const cards = getAssetsByCategory(params.slug as CategorySlug).map(toCardData);
  const tiers = Array.from(new Set(cards.map((card) => card.tier).filter((tier): tier is 1 | 2 | 3 => Boolean(tier)))).sort();
  const untiered = cards.filter((card) => !card.tier);
  const scored = cards.filter((card) => card.scores).length;

  return (
    <div className="category-page" data-denom={category.slug}>
      <header className="category-hero">
        <div className="container-x">
          <Link href="/#markets" className="back-link"><ArrowLeft size={14} aria-hidden="true" /> All research</Link>
          <div className="category-heading">
            <span className="category-icon"><CategoryIcon name={category.icon} size={26} /></span>
            <div><h1>{category.name}</h1><p>{category.blurb}</p></div>
          </div>
          <p className="category-summary"><span>{cards.length} {cards.length === 1 ? "asset" : "assets"}</span><span>{scored} with editorial scores</span><span>{category.short}</span></p>
        </div>
      </header>
      <div className="container-x category-body">
        {tiers.map((tier) => (
          <section key={tier} className="tier-section" aria-labelledby={`tier-${tier}`}>
            <div className="tier-header"><h2 id={`tier-${tier}`}>Tier {tier}</h2><p>{TIER_BLURB[tier]}</p></div>
            <div className="asset-grid">{cards.filter((card) => card.tier === tier).map((card) => <AssetCard key={card.symbol} data={card} />)}</div>
          </section>
        ))}
        {untiered.length > 0 && <section className="tier-section" aria-label={`More in ${category.name}`}>{tiers.length > 0 && <div className="tier-header"><h2>More in {category.name}</h2><p>Catalog entries awaiting research scores.</p></div>}<div className="asset-grid">{untiered.map((card) => <AssetCard key={card.symbol} data={card} />)}</div></section>}
      </div>
    </div>
  );
}
