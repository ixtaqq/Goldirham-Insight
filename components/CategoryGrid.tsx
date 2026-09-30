import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryGrid({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="theme-grid">
      {CATEGORIES.map((category) => (
        <Link key={category.slug} href={`/category/${category.slug}`} className="theme-card">
          <div className="theme-card-top"><span><CategoryIcon name={category.icon} /></span><ArrowUpRight size={15} /></div>
          <h3>{category.name}</h3><p>{category.short}</p>
          <div className="theme-card-foot"><strong>{counts[category.slug] ?? 0}</strong><span>assets</span></div>
        </Link>
      ))}
    </div>
  );
}