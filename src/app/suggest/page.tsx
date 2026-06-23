import type { Metadata } from "next";
import { SuggestionForm } from "@/components/SuggestionForm";
import { getTeamOptions } from "@/lib/suggestions";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Suggest a player — FPL Leaderboard",
  description: "Suggest a Riot account to add or replace on an FPL team roster",
};

export default async function SuggestPage() {
  const teams = await getTeamOptions();

  return (
    <main className="page">
      <section className="hero">
        <div>
          <h1>Suggest a player</h1>
          <p>
            Propose an account to add or replace on a team roster. Suggestions are checked against
            the Riot API and reviewed before they go live on the leaderboard.
          </p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Submission</h2>
        </div>
        <div className="panel-body panel-body--form">
          <SuggestionForm teams={teams} />
        </div>
      </section>
    </main>
  );
}
