import { winrate } from "@/lib/stats";

interface WinratePillsProps {
  wins: number | null;
  losses: number | null;
}

export function WinratePills({ wins, losses }: WinratePillsProps) {
  const w = wins ?? 0;
  const l = losses ?? 0;
  const rate = winrate(w, l);

  if (!w && !l) {
    return <span className="opgg-muted">—</span>;
  }

  return (
    <div className="opgg-winrate">
      <span className="opgg-pill opgg-pill--record">
        {w}W - {l}L
      </span>
      <span className="opgg-pill opgg-pill--percent">{rate}%</span>
    </div>
  );
}
