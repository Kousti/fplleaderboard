import { formatRiotId } from "@/lib/player-display";

interface PlayerNameDisplayProps {
  displayName: string;
  gameName: string;
  tagLine: string;
  small?: boolean;
}

export function PlayerNameDisplay({
  displayName,
  gameName,
  tagLine,
  small = false,
}: PlayerNameDisplayProps) {
  const showRiotId = displayName !== gameName;
  const className = `opgg-player-name${small ? " opgg-player-name--sm" : ""}`;

  if (showRiotId) {
    return (
      <span className={className}>
        <span className="opgg-player-display">{displayName}</span>
        <span className="opgg-player-riot-id">{formatRiotId(gameName, tagLine)}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      {gameName}
      <span className="opgg-player-tag">#{tagLine}</span>
    </span>
  );
}
