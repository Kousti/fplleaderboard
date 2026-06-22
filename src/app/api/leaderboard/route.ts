import { NextResponse } from "next/server";
import { getLatestSnapshot } from "@/lib/db";
import { teamLogoUrl } from "@/lib/logos";
import { TEAMS } from "@/lib/teams";

export async function GET() {
  try {
    const snapshot = await getLatestSnapshot();

    if (!snapshot) {
      return NextResponse.json({
        snapshot: null,
        message: "No snapshots yet. Trigger /api/cron/update-lp to fetch data.",
      });
    }

    const teamMetaById = new Map(
      TEAMS.map((team) => [
        team.id,
        {
          opggUrl: team.opggUrl,
          logoUrl: teamLogoUrl(team.logoImageId),
          fullName: team.fullName,
        },
      ])
    );

    return NextResponse.json({
      snapshot: {
        ...snapshot,
        teams: snapshot.teams.map((team) => {
          const meta = teamMetaById.get(team.teamId);
          return {
            ...team,
            opggUrl: meta?.opggUrl ?? "",
            logoUrl: meta?.logoUrl ?? "",
            fullName: meta?.fullName ?? team.teamName,
          };
        }),
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load leaderboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
