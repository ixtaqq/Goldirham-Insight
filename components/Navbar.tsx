"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetSearch, type SearchAsset } from "./AssetSearch";
import { BrandMark } from "./BrandMark";

export function Navbar({ assets }: { assets: SearchAsset[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const links = [
    { href: "/", label: "Overview" },
    { href: "/#markets", label: "Explore" },
    { href: "/category/ai-utilities", label: "AI Utilities" },
    { href: "/category/crypto", label: "Crypto" },
    { href: "/#approach", label: "Our approach" },
  ];

  return (
    <header className="site-header">
      <nav className="site-container nav-inner" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Goldirham home" onClick={() => setOpen(false)}>
          <BrandMark className="brand-mark" />
          <span>Goldirham<span className="brand-period">.</span></span>
        </Link>

        <div className="nav-links">
          {links.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "nav-link",
                  active && "is-active"
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        <div className="nav-actions">
          <AssetSearch assets={assets} />
          <Link href="/#markets" className="button button-dark button-small">Explore assets <ArrowUpRight size={15} /></Link>
        </div>

        <button
          ref={menuButton}
          onClick={() => setOpen((v) => !v)}
          className="menu-toggle"
          aria-label="Toggle menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div id="mobile-navigation" className="mobile-navigation site-container" onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}>
          <AssetSearch assets={assets} onNavigate={() => setOpen(false)} />
          <div className="mobile-nav-links">
            {links.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "nav-link",
                    active && "is-active"
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
