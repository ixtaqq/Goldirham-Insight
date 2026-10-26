"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { AssetSearch, type SearchAsset } from "./AssetSearch";
import { BrandMark } from "./BrandMark";

const LINKS = [
  { href: "/#markets", label: "Research" },
  { href: "/#live", label: "Live desk" },
  { href: "/#approach", label: "Framework" },
  { href: "/compare", label: "Compare assets" },
];

export function Navbar({ assets }: { assets: SearchAsset[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  const links = LINKS.map((link) => ({ ...link, active: !link.href.startsWith("/#") && pathname.startsWith(link.href) }));

  return (
    <header className="site-header">
      <nav className="container-x nav-inner" aria-label="Main navigation">
        <Link href="/" className="brand" aria-label="Goldirham Insight home" onClick={() => setOpen(false)}>
          <BrandMark className="brand-mark" />
          <span>Goldirham Insight<span className="brand-period">.</span></span>
        </Link>

        <div className="nav-links">
          {links.map((l) => (
            <Link key={l.href} href={l.href} aria-current={l.active ? "page" : undefined} className="nav-link">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-actions">
          <AssetSearch assets={assets} shortcut />
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
        <div id="mobile-navigation" className="mobile-navigation container-x" onKeyDown={(event) => {
          if (event.key === "Escape") {
            setOpen(false);
            menuButton.current?.focus();
          }
        }}>
          <AssetSearch assets={assets} onNavigate={() => setOpen(false)} />
          <div className="mobile-nav-links">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                aria-current={l.active ? "page" : undefined}
                className="nav-link"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
