import { NextResponse } from "next/server";
import { getHistory } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") ?? "100");

    const history = await getHistory(Number.isFinite(limit) ? limit : 100);

    return NextResponse.json({ history });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load history";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
