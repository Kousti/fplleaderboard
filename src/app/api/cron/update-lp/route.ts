import { NextResponse } from "next/server";
import { buildLeaderboard } from "@/lib/leaderboard";
import { saveSnapshot } from "@/lib/db";

export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  return request.headers.get("x-cron-secret") === cronSecret;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const teams = await buildLeaderboard();
    const snapshot = await saveSnapshot(teams);

    return NextResponse.json({
      ok: true,
      snapshotId: snapshot.id,
      createdAt: snapshot.createdAt,
      teamCount: teams.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Update failed";
    const hint = message.includes("snapshots")
      ? "Run supabase/schema.sql in your Supabase SQL Editor first."
      : undefined;

    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
