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

  return (
    <div className="site-container research-page">
      <Link href="/#markets" className="inline-flex items-center gap-2 text-xs text-muted hover:text-pine"><ArrowLeft size={13} /> All research</Link>
      <header className="category-page-header">
        <div className="category-page-heading"><span><CategoryIcon name={category.icon} size={26} /></span><div><p className="eyebrow">FOLLOW THE VALUE CHAIN</p><h1>{category.name}</h1><p>{category.blurb}</p></div></div>
        <div className="category-summary"><span>{cards.length} researched {cards.length === 1 ? "asset" : "assets"}</span><span>·</span><span>{category.short}</span><span>·</span><span>Three factors. A consistent perspective.</span></div>
      </header>
      {tiers.map((tier) => (
        <section key={tier} className="tier-section">
          <div className="tier-header"><h2>Tier {tier}</h2><p>{TIER_BLURB[tier]}</p></div>
          <div className="research-grid">{cards.filter((card) => card.tier === tier).map((card) => <AssetCard key={card.symbol} data={card} />)}</div>
        </section>
      ))}
      {untiered.length > 0 && <section className="tier-section">{tiers.length > 0 && <div className="tier-header"><h2>More in {category.name}</h2></div>}<div className="research-grid">{untiered.map((card) => <AssetCard key={card.symbol} data={card} />)}</div></section>}
    </div>
  );
}