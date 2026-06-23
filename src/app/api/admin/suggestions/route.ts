import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin";
import { listSuggestions } from "@/lib/suggestions";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const suggestions = await listSuggestions();
    return NextResponse.json({ suggestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load suggestions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
