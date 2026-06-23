interface RosterStatusBadgeProps {
  isActive: boolean;
}

export function RosterStatusBadge({ isActive }: RosterStatusBadgeProps) {
  if (isActive) {
    return null;
  }

  return <span className="roster-status roster-status--substitute">Sub</span>;
}
