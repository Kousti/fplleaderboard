"use client";

import Image from "next/image";
import { useState } from "react";
import { ROLE_ICON_URL, ROLE_SHORT_LABEL, type PlayerRole } from "@/lib/roles";

interface PlayerRoleBadgeProps {
  role: PlayerRole | null | undefined;
  small?: boolean;
}

export function PlayerRoleBadge({ role, small = false }: PlayerRoleBadgeProps) {
  const [useTextFallback, setUseTextFallback] = useState(false);

  if (!role) {
    return null;
  }

  const size = small ? 16 : 18;
  const className = `player-role-badge${small ? " player-role-badge--sm" : ""}${
    useTextFallback ? " player-role-badge--text" : ""
  }`;

  if (useTextFallback) {
    return (
      <span className={className} title={role}>
        {ROLE_SHORT_LABEL[role]}
      </span>
    );
  }

  return (
    <span className={className} title={role}>
      <Image
        className="player-role-icon"
        src={ROLE_ICON_URL[role]}
        alt={role}
        width={size}
        height={size}
        onError={() => setUseTextFallback(true)}
      />
    </span>
  );
}
