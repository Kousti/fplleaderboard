"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/">
          FPL Leaderboard
        </Link>
        <nav className="site-nav">
          <Link
            className={`site-nav-link${pathname === "/" ? " site-nav-link--active" : ""}`}
            href="/"
          >
            Leaderboard
          </Link>
          <Link
            className={`site-nav-link${pathname === "/suggest" ? " site-nav-link--active" : ""}`}
            href="/suggest"
          >
            Suggest player
          </Link>
        </nav>
      </div>
    </header>
  );
}
