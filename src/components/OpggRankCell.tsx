import Image from "next/image";
import { getTierIconUrl } from "@/lib/tier-icons";

interface OpggRankCellProps {
  tier: string | null;
  rank?: string | null;
  leaguePoints?: number | null;
  showDivision?: boolean;
  emblemSize?: number;
  muted?: boolean;
}

function capitalize(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

export function OpggRankCell({
  tier,
  rank = null,
  leaguePoints = null,
  showDivision = true,
  emblemSize = 48,
  muted = false,
}: OpggRankCellProps) {
  if (!tier) {
    return <span className="opgg-unranked">Unranked</span>;
  }

  const iconUrl = getTierIconUrl(tier);
  const tierUpper = tier.toUpperCase();
  const isMasterPlus = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tierUpper);

  return (
    <div className={`opgg-rank-cell${muted ? " opgg-rank-cell--muted" : ""}`}>
      {iconUrl ? (
        <Image
          className="opgg-rank-emblem"
          src={iconUrl}
          alt={tier}
          width={emblemSize}
          height={emblemSize}
        />
      ) : null}
      <div className="opgg-rank-text">
        {showDivision && !isMasterPlus && rank ? (
          <span className="opgg-rank-tier">
            {capitalize(tier)} {rank}
          </span>
        ) : !showDivision ? (
          <span className="opgg-rank-tier">{capitalize(tier)}</span>
        ) : null}
        <span className="opgg-rank-lp">{leaguePoints ?? 0} LP</span>
      </div>
    </div>
  );
}
