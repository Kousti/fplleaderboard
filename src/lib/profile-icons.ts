const DDRAGON_VERSION = "16.12.1";
export const DEFAULT_PROFILE_ICON_ID = 29;

export function profileIconUrl(profileIconId: number | null | undefined): string {
  const id = profileIconId ?? DEFAULT_PROFILE_ICON_ID;
  return `https://ddragon.leagueoflegends.com/cdn/${DDRAGON_VERSION}/img/profileicon/${id}.png`;
}
