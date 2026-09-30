import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Layers, ScanLine } from "lucide-react";
import type { CardData } from "@/lib/card";
import { HeroShowcase } from "./HeroShowcase";

export function Hero({
  assetCount,
  categoryCount,
  spotlight,
}: {
  assetCount: number;
  categoryCount: number;
  spotlight: CardData[];
}) {
  return (
    <section className="hero">
      <div className="site-container hero-grid">
        <div className="hero-copy">
          <div className="eyebrow"><span className="status-dot" /> Independent thinking. A wider perspective.</div>
          <h1>Big ideas.<br /><span>Clear conviction.</span></h1>
          <p className="hero-description">
            Understand the companies powering what comes next. Deep research,
            clear scores, and a considered view of the AI economy.
          </p>
          <div className="hero-actions">
            <Link href="#markets" className="button button-dark">Explore the research <ArrowRight size={17} /></Link>
            <Link href="#approach" className="button button-white">How we score <ArrowUpRight size={17} /></Link>
          </div>
          <p className="hero-note">From the power grid to the next generation of intelligence.</p>
          <dl className="hero-stats">
            <div><dt>Researched assets</dt><dd><ChartNoAxesCombined size={20} aria-hidden="true" />{assetCount}</dd></div>
            <div><dt>Connected themes</dt><dd><Layers size={20} aria-hidden="true" />{categoryCount}</dd></div>
            <div><dt>A consistent lens</dt><dd><ScanLine size={20} aria-hidden="true" />3 factors</dd></div>
          </dl>
        </div>
        <HeroShowcase assets={spotlight} />
      </div>
      <div className="site-container hero-bottom"><span>Ideas worth understanding.</span><span>Research first. Always.</span></div>
    </section>
  );
}
