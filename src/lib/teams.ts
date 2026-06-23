import type { PlayerRole } from "@/lib/roles";
import { TEAM_ROSTER_LIMIT } from "@/lib/rank";

export interface Player {
  gameName: string;
  tagLine: string;
  displayName?: string;
  role?: PlayerRole | null;
  isActive?: boolean;
}

export interface Team {
  id: string;
  name: string;
  fullName: string;
  logoImageId: string;
  opggUrl: string;
  players: Player[];
}

export const TEAMS: Team[] = [
  {
    id: "eclipse",
    name: "Eclipse",
    fullName: "EclipseLOL",
    logoImageId: "7ebf134d-315e-4815-e522-08dec9cba017",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Crow%23SHOW%2CVoluxa%23EUW%2Ckuolonsy%C3%B6j%C3%A4%23EUW%2CYll%C3%A4tykseen%23ECL%2CSeijun%23EUW",
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
    fullName: "Epic Avalanche FPL",
    logoImageId: "23509c3b-ae0e-4dc3-f8db-08dc108bc0b5",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Karlos%23Gnome%2Cr%C3%B6yhke%C3%A4%23121%2Cvuorineuvos%23KONGO%2Coivallus%23OWA%2CVL%E3%83%84%23KONGO",
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
    fullName: "Arcane Enigma",
    logoImageId: "7c288f31-1df7-47ba-d85f-08dec9cba017",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Euphoria%231554%2CMKR%23Eva%2CZergy%238826%2CAnto%2355555%2CFraze%23Sigma",
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
    fullName: "LAR",
    logoImageId: "1ea8380b-2340-4846-94e5-08dec44abcf2",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Techmovement%23EUW%2Ciivo%23iivo%2CWoo+bujang%23CN1%2Cjonkun%23EUW%2CCkyane%23HAHA",
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
    fullName: "Finnish Red Mafia",
    logoImageId: "ed6a4bc5-b015-4e7c-621e-08dd5c26da0b",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Deezy%23zzzzz%2CKTM%23FMF%2CHobbi%23123%2CRoni%23ZAMN%2CWhiteLiquorice%23FRM",
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
    fullName: "Rich Gang Finland",
    logoImageId: "5f7ea667-1a0d-414a-94d4-08dec44abcf2",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Tyran%231475%2CFruityfresh%23EUW%2Cpuppe%231111%2CMegobeepboop%23EUW%2Cmentalist+%C3%A7ay%C4%B1r%23podex",
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
    fullName: "BlueWhites FPL",
    logoImageId: "6fa288ff-940c-4111-5695-08dd03ea6a3a",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Snurmi%23EUW%2CYones%23kongo%2Ckarwox%23kongo%2Cmerzapapi%23KONGO%2Cpetoska%230000",
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
    fullName: "bastu 5",
    logoImageId: "9ca9a2f6-face-49bc-7ca8-08decc78ad60",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=JNBN%23JAANI%2Capetski%23moro%2Cdeehoo%233333%2CSelfway%23EUW%2Cazitorr%23EUW",
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
    fullName: "ZiWi Gaming",
    logoImageId: "b96c7c2d-439e-48c1-acc0-08dec961f60c",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=Naksu%23snsei%2Clamb%23EUW%2Ctobbe%23jorgo%2Cbaum%23EUW2%2Cpuuhamies%23EUW%2CIamb%23EUW",
    players: [
      { gameName: "Naksu", tagLine: "snsei" },
      { gameName: "lamb", tagLine: "EUW" },
      { gameName: "tobbe", tagLine: "jorgo" },
      { gameName: "baum", tagLine: "EUW2" },
      { gameName: "puuhamies", tagLine: "EUW" },
      { gameName: "Iamb", tagLine: "EUW", isActive: false },
    ],
  },
  {
    id: "igz",
    name: "IGZ",
    fullName: "IGZ Esports",
    logoImageId: "1e57c08b-5288-4e79-975f-08dec44abcf2",
    opggUrl:
      "https://op.gg/fi/lol/multisearch/euw?summoners=ukko2000%23EUW%2CKoust1%23EUW%2CJ%C3%A9su%23EUW%2CJuicebox%23Ulyse%2CAAWEE%23EUW",
    players: [
      { gameName: "ukko2000", tagLine: "EUW" },
      { gameName: "Koust1", tagLine: "EUW" },
      { gameName: "Jésu", tagLine: "EUW" },
      { gameName: "Juicebox", tagLine: "Ulyse" },
      { gameName: "AAWEE", tagLine: "EUW" },
    ],
  },
];

export function getTeamById(id: string): Team | undefined {
  return TEAMS.find((team) => team.id === id);
}

export function resolvePlayerActive(player: Player, index: number, rosterSize: number): boolean {
  if (player.isActive !== undefined) {
    return player.isActive;
  }

  return rosterSize <= TEAM_ROSTER_LIMIT || index < TEAM_ROSTER_LIMIT;
}

export function withResolvedActiveFlags(players: Player[]): Player[] {
  return players.map((player, index) => ({
    ...player,
    isActive: resolvePlayerActive(player, index, players.length),
  }));
}
