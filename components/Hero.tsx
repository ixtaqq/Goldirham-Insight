import Link from "next/link";
import { ArrowDown } from "lucide-react";
import type { CardData } from "@/lib/card";
import { GuillocheField } from "./GuillocheField";
import { HeroShowcase } from "./HeroShowcase";

export function Hero({ assetCount, scoredCount, categoryCount, spotlight }: { assetCount: number; scoredCount: number; categoryCount: number; spotlight: CardData[] }) {
  return (
    <section className="hero" id="top" aria-labelledby="hero-heading">
      <GuillocheField />
      <div className="container-x hero-grid">
        <div>
          <h1 id="hero-heading" className="hero-title">The AI <span className="whitespace-nowrap">build-out,</span> scored and sourced.</h1>
          <p className="hero-lede">Upside, safety and AI exposure, rated 0 to 10 the same way on every scored asset, from the power grid and the chip to platforms, funds and tokens. Every price names its source. Every thesis says whether a person has reviewed it.</p>
          <div className="hero-actions">
            <Link href="#markets" className="btn btn-primary">Explore the research <ArrowDown size={16} aria-hidden="true" /></Link>
            <Link href="#approach" className="btn btn-quiet">How we score</Link>
          </div>
          <p className="hero-facts">
            <span><strong>{assetCount}</strong> assets</span>
            <span><strong>{scoredCount}</strong> with editorial scores</span>
            <span><strong>{categoryCount}</strong> themes</span>
            <span>Educational research, not advice</span>
          </p>
        </div>
        <HeroShowcase assets={spotlight} />
      </div>
    </section>
  );
}
