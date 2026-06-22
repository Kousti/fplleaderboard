import { readFileSync } from "node:fs";

const html = readFileSync(
  "scripts/Finnish Pro League _ KESÄ 2026 - Participants - Tournament _ Challengermode.html",
  "utf8"
);

const teamNames = [
  "Eclipse",
  "EA",
  "AE",
  "LAR",
  "FRM",
  "RGF",
  "BW",
  "B5",
  "Ziwi",
];

for (const name of teamNames) {
  const index = html.indexOf(name);
  if (index < 0) {
    console.log(name, "NOT FOUND");
    continue;
  }

  const slice = html.slice(Math.max(0, index - 800), index + 400);
  const images = [
    ...slice.matchAll(/https:\/\/image1\.challengermode\.com\/([a-f0-9-]+)(?:_\d+_\d+)?/gi),
  ].map((m) => m[1]);

  console.log(name, [...new Set(images)]);
}

console.log("\n--- All CM image IDs near team blocks ---");
const allImages = [
  ...html.matchAll(/https:\/\/image1\.challengermode\.com\/([a-f0-9-]+)_64_64/gi),
].map((m) => m[1]);

console.log("64x64 count:", allImages.length);
console.log([...new Set(allImages)].join("\n"));

// Parse img src patterns in rendered content
const imgBlocks = [...html.matchAll(/<img[^>]+>/gi)].map((m) => m[0]);
const teamImgs = imgBlocks.filter((tag) => tag.includes("image1.challengermode.com"));
console.log("\nimg tags with CM:", teamImgs.length);
for (const tag of teamImgs.slice(0, 20)) {
  console.log(tag.slice(0, 200));
}
