import { writeFileSync } from "node:fs";

const blobUrl = "https://www.challengermode.com/_arenablob/20260622.8/DPLF9gWF.js";
const js = await fetch(blobUrl).then((r) => r.text());
writeFileSync("scripts/cm-arena.js", js);
console.log("bytes", js.length);

const pathMatches = [...js.matchAll(/["'`](\/[^"'`]{3,120})["'`]/g)].map((m) => m[1]);
const interesting = [...new Set(pathMatches)].filter((p) =>
  /tournament|participant|team|registration|attendant|logo|image/i.test(p)
);
console.log("paths:\n", interesting.slice(0, 80).join("\n"));

const gql = [...js.matchAll(/query\s+[A-Za-z0-9_]+|mutation\s+[A-Za-z0-9_]+/g)].map((m) => m[0]);
console.log("graphql ops:", [...new Set(gql)].slice(0, 30));

for (const term of ["participants", "TournamentTeam", "teamLogo", "LogoUrl", "ImageId"]) {
  const idx = js.indexOf(term);
  if (idx >= 0) console.log(term, "at", idx, js.slice(idx, idx + 200));
}
