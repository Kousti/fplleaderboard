import { NextResponse } from "next/server";
import { getDailyMoversPayload } from "@/lib/db";
import type { MoverPeriod } from "@/lib/daily-movers";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "daily") as MoverPeriod;
    const day = searchParams.get("day");
    const week = searchParams.get("week");

    const payload = await getDailyMoversPayload({
      period: period === "weekly" ? "weekly" : "daily",
      day,
      week,
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load movers";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
