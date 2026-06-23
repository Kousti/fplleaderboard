import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { getAdminTeamRosters, setActiveRoster } from "@/lib/roster";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rosters = await getAdminTeamRosters();
    return NextResponse.json({ rosters });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load rosters";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      teamId?: string;
      activePlayers?: { gameName: string; tagLine: string }[];
    };

    if (!body.teamId || !body.activePlayers?.length) {
      return NextResponse.json({ error: "teamId and activePlayers are required" }, { status: 400 });
    }

    await setActiveRoster(body.teamId, body.activePlayers);
    const rosters = await getAdminTeamRosters();

    return NextResponse.json({ ok: true, rosters });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update roster";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
