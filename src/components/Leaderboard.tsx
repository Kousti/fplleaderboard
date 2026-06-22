import { LeaderboardTabs } from "@/components/LeaderboardTabs";

export interface LeaderboardPlayer {
  gameName: string;
  tagLine: string;
  tier: string | null;
  rank: string | null;
  leaguePoints: number | null;
  wins: number | null;
  losses: number | null;
  score: number;
  error: string | null;
  profileIconId: number | null;
}

export interface LeaderboardTeam {
  teamId: string;
  teamName: string;
  fullName: string;
  logoUrl: string;
  opggUrl: string;
  position: number;
  totalScore: number;
  averageScore: number;
  players: LeaderboardPlayer[];
}

interface LeaderboardProps {
  teams: LeaderboardTeam[];
}

export function Leaderboard({ teams }: LeaderboardProps) {
  return <LeaderboardTabs teams={teams} />;
}
