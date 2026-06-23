import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { reviewSuggestion } from "@/lib/suggestions";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as {
      decision?: "approved" | "rejected";
      adminNote?: string;
    };

    if (body.decision !== "approved" && body.decision !== "rejected") {
      return NextResponse.json({ error: "Invalid decision" }, { status: 400 });
    }

    const suggestion = await reviewSuggestion(id, body.decision, body.adminNote ?? null);
    return NextResponse.json({ ok: true, suggestion });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Review failed";
    const status =
      message.includes("not found") || message.includes("already been reviewed") ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
