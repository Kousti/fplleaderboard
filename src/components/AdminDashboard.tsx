"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AdminPanel } from "@/components/AdminPanel";
import { AdminRosterPanel } from "@/components/AdminRosterPanel";
import type { AdminTeamRoster } from "@/lib/roster";
import type { PlayerSuggestion } from "@/lib/suggestions";

type AdminTab = "suggestions" | "rosters";

interface AdminDashboardProps {
  initialSuggestions: PlayerSuggestion[];
  initialRosters: AdminTeamRoster[];
}

const TABS: { id: AdminTab; label: string }[] = [
  { id: "suggestions", label: "Suggestions" },
  { id: "rosters", label: "Active rosters" },
];

export function AdminDashboard({ initialSuggestions, initialRosters }: AdminDashboardProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("suggestions");

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-toolbar">
        <div className="chart-segmented">
          {TABS.map((item) => (
            <button
              key={item.id}
              className={`chart-segment ${tab === item.id ? "chart-segment--active" : ""}`}
              type="button"
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className="admin-logout" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </div>

      {tab === "suggestions" ? (
        <AdminPanel initialSuggestions={initialSuggestions} />
      ) : (
        <AdminRosterPanel initialRosters={initialRosters} />
      )}
    </div>
  );
}
