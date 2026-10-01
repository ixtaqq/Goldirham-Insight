import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { CardData } from "@/lib/card";
import { HeroShowcase } from "./HeroShowcase";

export function Hero({ assetCount, categoryCount, spotlight }: { assetCount: number; categoryCount: number; spotlight: CardData[] }) {
  return (
    <section className="design-hero" id="top">
      <div className="glow g1" aria-hidden="true" /><div className="glow g2" aria-hidden="true" /><div className="glow g3" aria-hidden="true" />
      <div className="container-x design-hero-grid">
        <div>
          <div className="pill-row"><span className="pill"><span className="dot" />Independent thinking</span><span className="pill soft">A wider perspective</span><span className="pill soft">Clearly sourced</span></div>
          <h1 className="display">Big ideas.<br /><span className="accent">Clear conviction.</span></h1>
          <p className="lede">Understand the companies powering what comes next. Deep research, clear scores, and a considered view of the AI economy — from the power grid to the endpoint.</p>
          <div className="cta-row"><Link href="#markets" className="btn btn-primary">Explore the research <ArrowRight size={16} /></Link><Link href="#approach" className="btn btn-secondary">How we score <ArrowUpRight size={16} /></Link></div>
          <p className="foot-note">From the power grid to the next generation of intelligence. Research first. Always.</p>
        </div>
        <HeroShowcase assets={spotlight} />
      </div>
      <div className="stats-band"><dl className="container-x stats-inner">
        {[{ value: assetCount, label: "Researched assets" }, { value: categoryCount, label: "Connected themes" }, { value: 3, label: "Factors — one lens" }, { value: "100%", label: "Independent. No advice." }].map((stat) => <div className="stat" key={stat.label}><dd className="v">{stat.value}</dd><dt className="l">{stat.label}</dt></div>)}
      </dl></div>
    </section>
  );
}
