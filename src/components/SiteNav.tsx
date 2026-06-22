import Link from "next/link";

export function SiteNav() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link className="site-brand" href="/">
          FPL Leaderboard
        </Link>
      </div>
    </header>
  );
}
