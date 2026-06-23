import type { Metadata } from "next";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginGate } from "@/components/AdminLoginGate";
import { isAdminAuthenticated } from "@/lib/admin";
import { getAdminTeamRosters } from "@/lib/roster";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";
import { listSuggestions } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin — FPL Leaderboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <main className="page">
        <section className="hero">
          <div>
            <h1>Admin</h1>
            <p>Review player suggestions before they are applied to team rosters.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Sign in</h2>
          </div>
          <div className="panel-body panel-body--form">
            <AdminLoginGate />
          </div>
        </section>
      </main>
    );
  }

  let suggestions: Awaited<ReturnType<typeof listSuggestions>> = [];
  let rosters: Awaited<ReturnType<typeof getAdminTeamRosters>> = [];
  let error: string | null = null;

  try {
    [suggestions, rosters] = await Promise.all([listSuggestions(), getAdminTeamRosters()]);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load admin data";
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Admin</h1>
          <p>
            Review player suggestions and set each team&apos;s active roster of{" "}
            {TEAM_ROSTER_LIMIT} players for scoring.
          </p>
        </div>
      </section>

      {error ? (
        <section className="panel">
          <div className="empty-state">{error}</div>
        </section>
      ) : (
        <AdminDashboard initialSuggestions={suggestions} initialRosters={rosters} />
      )}
    </main>
  );
}
