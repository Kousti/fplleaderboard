import { type RankedEntry } from "./rank";
import { type Player } from "./teams";

const REGIONAL_ROUTING = "europe";
const PLATFORM = "euw1";

// Production keys: 20/s burst, 100 per 2 minutes
const MAX_REQUESTS_PER_SECOND = 20;
const MAX_REQUESTS_PER_TWO_MINUTES = 100;
const TWO_MINUTES_MS = 120_000;

interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface RiotSummoner {
  puuid: string;
  profileIconId: number;
}

interface RiotLeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface PlayerRankResult {
  player: Player;
  ranked: RankedEntry | null;
  profileIconId: number | null;
  error?: string;
}

const requestTimestamps: number[] = [];

function getApiKey(): string {
  const key = process.env.RIOT_API_KEY;
  if (!key) {
    throw new Error("RIOT_API_KEY is not configured");
  }
  return key;
}

function pruneTimestamps(now: number): void {
  while (requestTimestamps.length > 0 && now - requestTimestamps[0] >= TWO_MINUTES_MS) {
    requestTimestamps.shift();
  }
}

async function waitForRateLimit(): Promise<void> {
  while (true) {
    const now = Date.now();
    pruneTimestamps(now);

    const recentSecond = requestTimestamps.filter((timestamp) => now - timestamp < 1000).length;
    const recentTwoMinutes = requestTimestamps.length;

    if (
      recentSecond < MAX_REQUESTS_PER_SECOND &&
      recentTwoMinutes < MAX_REQUESTS_PER_TWO_MINUTES
    ) {
      requestTimestamps.push(now);
      return;
    }

    const waitMs = recentTwoMinutes >= MAX_REQUESTS_PER_TWO_MINUTES
      ? TWO_MINUTES_MS - (now - requestTimestamps[0]) + 50
      : 100;

    await new Promise((resolve) => setTimeout(resolve, Math.max(waitMs, 50)));
  }
}

async function riotFetch<T>(url: string, attempt = 0): Promise<T> {
  await waitForRateLimit();

  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": getApiKey(),
    },
    cache: "no-store",
  });

  if (response.status === 404) {
    throw new Error("NOT_FOUND");
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "RIOT_AUTH_FAILED: Riot API key is invalid or rejected. Check the key in developer.riotgames.com and update RIOT_API_KEY."
    );
  }

  if (response.status === 429) {
    if (attempt >= 5) {
      throw new Error("RIOT_RATE_LIMIT: Riot API rate limit hit too many times.");
    }

    const retryAfter = Number(response.headers.get("retry-after") ?? "2");
    await new Promise((resolve) => setTimeout(resolve, Math.max(retryAfter, 1) * 1000));
    return riotFetch<T>(url, attempt + 1);
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Riot API ${response.status}: ${body}`);
  }

  return response.json() as Promise<T>;
}

function encodeRiotIdPart(value: string): string {
  return encodeURIComponent(value);
}

async function getAccount(player: Player): Promise<RiotAccount> {
  const url = `https://${REGIONAL_ROUTING}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeRiotIdPart(player.gameName)}/${encodeRiotIdPart(player.tagLine)}`;
  return riotFetch<RiotAccount>(url);
}

async function getLeagueEntriesByPuuid(puuid: string): Promise<RiotLeagueEntry[]> {
  const url = `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  return riotFetch<RiotLeagueEntry[]>(url);
}

async function getSummonerByPuuid(puuid: string): Promise<RiotSummoner> {
  const url = `https://${PLATFORM}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  return riotFetch<RiotSummoner>(url);
}

function toRankedEntry(entry: RiotLeagueEntry | undefined): RankedEntry | null {
  if (!entry) {
    return null;
  }

  return {
    tier: entry.tier,
    rank: entry.rank,
    leaguePoints: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
  };
}

export async function fetchPlayerRank(player: Player): Promise<PlayerRankResult> {
  try {
    const account = await getAccount(player);
    const [entries, summoner] = await Promise.all([
      getLeagueEntriesByPuuid(account.puuid),
      getSummonerByPuuid(account.puuid),
    ]);
    const solo = entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5");

    return {
      player,
      ranked: toRankedEntry(solo),
      profileIconId: summoner.profileIconId,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    if (message === "NOT_FOUND") {
      return {
        player,
        ranked: null,
        profileIconId: null,
        error: "Account not found",
      };
    }

    if (message.startsWith("RIOT_AUTH_FAILED:")) {
      throw new Error(message.replace("RIOT_AUTH_FAILED: ", ""));
    }

    if (message.startsWith("RIOT_RATE_LIMIT:")) {
      throw new Error(message.replace("RIOT_RATE_LIMIT: ", ""));
    }

    return {
      player,
      ranked: null,
      profileIconId: null,
      error: message,
    };
  }
}

export async function fetchAllPlayerRanks(players: Player[]): Promise<PlayerRankResult[]> {
  const results: PlayerRankResult[] = [];

  for (const player of players) {
    results.push(await fetchPlayerRank(player));
  }

  return results;
}
