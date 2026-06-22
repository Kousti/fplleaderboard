import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile(path) {
  const content = readFileSync(path, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq === -1) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEAMS = [
  {
    id: "eclipse",
    name: "Eclipse",
    players: [
      { gameName: "Crow", tagLine: "SHOW" },
      { gameName: "Voluxa", tagLine: "EUW" },
      { gameName: "kuolonsyöjä", tagLine: "EUW" },
      { gameName: "Yllätykseen", tagLine: "ECL" },
      { gameName: "Seijun", tagLine: "EUW" },
    ],
  },
  {
    id: "ea",
    name: "EA",
    players: [
      { gameName: "Karlos", tagLine: "Gnome" },
      { gameName: "röyhkeä", tagLine: "121" },
      { gameName: "vuorineuvos", tagLine: "KONGO" },
      { gameName: "oivallus", tagLine: "OWA" },
      { gameName: "VLツ", tagLine: "KONGO" },
    ],
  },
  {
    id: "ae",
    name: "AE",
    players: [
      { gameName: "Euphoria", tagLine: "1554" },
      { gameName: "MKR", tagLine: "Eva" },
      { gameName: "Zergy", tagLine: "8826" },
      { gameName: "Anto", tagLine: "TTT" },
      { gameName: "Fraze", tagLine: "Sigma" },
    ],
  },
  {
    id: "lar",
    name: "LAR",
    players: [
      { gameName: "Techmovement", tagLine: "EUW" },
      { gameName: "iivo", tagLine: "iivo" },
      { gameName: "Woo bujang", tagLine: "CN1" },
      { gameName: "jonkun", tagLine: "EUW" },
      { gameName: "Ckyane", tagLine: "HAHA" },
    ],
  },
  {
    id: "frm",
    name: "FRM",
    players: [
      { gameName: "Deezy", tagLine: "zzzzz" },
      { gameName: "KTM", tagLine: "FMF" },
      { gameName: "Hobbi", tagLine: "123" },
      { gameName: "Roni", tagLine: "ZAMN" },
      { gameName: "WhiteLiquorice", tagLine: "FRM" },
    ],
  },
  {
    id: "rgf",
    name: "RGF",
    players: [
      { gameName: "Tyran", tagLine: "1475" },
      { gameName: "Fruityfresh", tagLine: "EUW" },
      { gameName: "puppe", tagLine: "1111" },
      { gameName: "Megobeepboop", tagLine: "EUW" },
      { gameName: "mentalist çayır", tagLine: "podex" },
    ],
  },
  {
    id: "bw",
    name: "BW",
    players: [
      { gameName: "Snurmi", tagLine: "EUW" },
      { gameName: "Yones", tagLine: "kongo" },
      { gameName: "karwox", tagLine: "kongo" },
      { gameName: "merzapapi", tagLine: "KONGO" },
      { gameName: "petoska", tagLine: "0000" },
    ],
  },
  {
    id: "b5",
    name: "B5",
    players: [
      { gameName: "JNBN", tagLine: "JAANI" },
      { gameName: "apetski", tagLine: "moro" },
      { gameName: "deehoo", tagLine: "3333" },
      { gameName: "Selfway", tagLine: "EUW" },
      { gameName: "azitorr", tagLine: "EUW" },
    ],
  },
  {
    id: "ziwi",
    name: "Ziwi",
    players: [
      { gameName: "Naksu", tagLine: "snsei" },
      { gameName: "lamb", tagLine: "EUW" },
      { gameName: "tobbe", tagLine: "jorgo" },
      { gameName: "baum", tagLine: "EUW2" },
      { gameName: "puuhamies", tagLine: "EUW" },
      { gameName: "Iamb", tagLine: "EUW" },
    ],
  },
  {
    id: "igz",
    name: "IGZ",
    players: [
      { gameName: "ukko2000", tagLine: "EUW" },
      { gameName: "Koust1", tagLine: "EUW" },
      { gameName: "Jésu", tagLine: "EUW" },
      { gameName: "Juicebox", tagLine: "Ulyse" },
      { gameName: "AAWEE", tagLine: "EUW" },
    ],
  },
];

const SNAPSHOT_COUNT = 48;
const HOURS_BETWEEN = 7;
const DAYS_BACK = 14;
const TEAM_ROSTER_LIMIT = 5;

const TIERS = ["PLATINUM", "EMERALD", "DIAMOND"];
const RANKS = ["IV", "III", "II", "I"];

const TIER_SCORE_BASE = {
  IRON: 0,
  BRONZE: 400,
  SILVER: 800,
  GOLD: 1200,
  PLATINUM: 1600,
  EMERALD: 2000,
  DIAMOND: 2400,
  MASTER: 2800,
  GRANDMASTER: 2800,
  CHALLENGER: 2800,
};

const RANK_OFFSET = {
  IV: 0,
  III: 100,
  II: 200,
  I: 300,
};

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function rankToScore(tier, rank, leaguePoints) {
  const tierBase = TIER_SCORE_BASE[tier];
  if (tierBase == null) {
    return 0;
  }

  if (["MASTER", "GRANDMASTER", "CHALLENGER"].includes(tier)) {
    return TIER_SCORE_BASE.MASTER + leaguePoints;
  }

  return tierBase + (RANK_OFFSET[rank] ?? 0) + leaguePoints;
}

function mockPlayerRank(playerKey, snapshotIndex) {
  const baseRng = seededRandom(hashString(playerKey));
  const tier = TIERS[Math.floor(baseRng() * TIERS.length)];
  const rank = RANKS[Math.floor(baseRng() * RANKS.length)];
  const baseLp = Math.floor(baseRng() * 100);

  const driftRng = seededRandom(hashString(playerKey) + snapshotIndex * 9973);
  const lpDrift = Math.floor(driftRng() * 25) - 8;
  const leaguePoints = Math.max(0, Math.min(99, baseLp + lpDrift));

  const statRng = seededRandom(hashString(playerKey) + snapshotIndex * 41);
  const wins = 40 + Math.floor(statRng() * 80);
  const losses = 35 + Math.floor(statRng() * 70);

  return {
    tier,
    rank,
    leaguePoints,
    wins,
    losses,
    score: rankToScore(tier, rank, leaguePoints),
  };
}

function buildTeamSnapshot(team, snapshotIndex) {
  const players = team.players.map((player) => {
    const playerKey = `${player.gameName}#${player.tagLine}`;
    const rank = mockPlayerRank(playerKey, snapshotIndex);

    return {
      gameName: player.gameName,
      tagLine: player.tagLine,
      ...rank,
    };
  });

  const roster = [...players]
    .sort((a, b) => b.score - a.score)
    .slice(0, TEAM_ROSTER_LIMIT);

  const totalScore = roster.reduce((sum, player) => sum + player.score, 0);

  return {
    roster,
    totalScore,
    averageScore: roster.length ? Math.round(totalScore / roster.length) : 0,
  };
}

function buildTeamRows(snapshotId, teamSnapshots) {
  const sorted = [...teamSnapshots].sort((a, b) => b.totalScore - a.totalScore);

  return sorted.map((team, index) => ({
    snapshot_id: snapshotId,
    team_id: team.teamId,
    team_name: team.teamName,
    total_score: team.totalScore,
    average_score: team.averageScore,
    position: index + 1,
  }));
}

function buildPlayerRows(snapshotId, teamId, roster) {
  return roster.map((player) => ({
    snapshot_id: snapshotId,
    team_id: teamId,
    game_name: player.gameName,
    tag_line: player.tagLine,
    tier: player.tier,
    rank: player.rank,
    league_points: player.leaguePoints,
    wins: player.wins,
    losses: player.losses,
    score: player.score,
    error: null,
    profile_icon_id: 1 + (hashString(`${player.gameName}#${player.tagLine}`) % 28),
  }));
}

async function clearSnapshots() {
  const { error } = await supabase.from("snapshots").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (error) {
    throw new Error(`Failed to clear snapshots: ${error.message}`);
  }
}

async function main() {
  const clear = process.argv.includes("--clear");

  if (clear) {
    console.log("Clearing existing snapshots...");
    await clearSnapshots();
  }

  const now = Date.now();
  const startMs = now - DAYS_BACK * 24 * 60 * 60 * 1000;

  console.log(`Seeding ${SNAPSHOT_COUNT} snapshots over the last ${DAYS_BACK} days...`);

  for (let i = 0; i < SNAPSHOT_COUNT; i++) {
    const createdAt = new Date(startMs + i * HOURS_BETWEEN * 60 * 60 * 1000).toISOString();

    const teamSnapshots = TEAMS.map((team) => {
      const snapshot = buildTeamSnapshot(team, i);
      return {
        teamId: team.id,
        teamName: team.name,
        totalScore: snapshot.totalScore,
        averageScore: snapshot.averageScore,
        roster: snapshot.roster,
      };
    });

    const { data: snapshot, error: snapshotError } = await supabase
      .from("snapshots")
      .insert({ created_at: createdAt })
      .select("id, created_at")
      .single();

    if (snapshotError || !snapshot) {
      throw new Error(snapshotError?.message ?? "Failed to create snapshot");
    }

    const teamRows = buildTeamRows(snapshot.id, teamSnapshots);
    const { error: teamError } = await supabase.from("team_results").insert(teamRows);
    if (teamError) {
      throw new Error(teamError.message);
    }

    const playerRows = teamSnapshots.flatMap((team) =>
      buildPlayerRows(snapshot.id, team.teamId, team.roster)
    );

    const { error: playerError } = await supabase.from("player_results").insert(playerRows);
    if (playerError) {
      throw new Error(playerError.message);
    }

    console.log(`  [${i + 1}/${SNAPSHOT_COUNT}] ${snapshot.created_at}`);
  }

  console.log("Done. Refresh the app to see the history chart.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
