import { NextResponse } from "next/server";
import { createSuggestion } from "@/lib/suggestions";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      teamId?: string;
      gameName?: string;
      tagLine?: string;
      displayName?: string;
      role?: string;
      suggestionType?: "add" | "replace" | "change_role" | "set_active_roster";
      replacesGameName?: string;
      replacesTagLine?: string;
      activePlayers?: { gameName: string; tagLine: string }[];
      submitterNote?: string;
      website?: string;
    };

    const suggestion = await createSuggestion({
      teamId: body.teamId ?? "",
      gameName: body.gameName,
      tagLine: body.tagLine,
      displayName: body.displayName ?? null,
      role: body.role ?? null,
      suggestionType: body.suggestionType ?? "add",
      replacesGameName: body.replacesGameName ?? null,
      replacesTagLine: body.replacesTagLine ?? null,
      activePlayers: body.activePlayers ?? null,
      submitterNote: body.submitterNote ?? null,
      website: body.website,
    });

    return NextResponse.json({ ok: true, suggestion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Submission failed";
    const status = message.includes("not found") || message.includes("required") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
