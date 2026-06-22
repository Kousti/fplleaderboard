const tid = "e5174a3a-f609-470f-6b7c-08dec7091c3f";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  Referer: "https://www.challengermode.com/",
};

const boot = await fetch("https://www.challengermode.com/arena/boot", { headers }).then((r) =>
  r.json()
);

const token = boot.ApiProxyToken.access_token;
const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

const bases = [boot.ArenaParameters.apiProxyUrl, boot.ArenaParameters.publicApiProxyUrl];

const paths = [
  `/tournament/${tid}/page_data`,
  `/tournament/${tid}/page-data`,
  `/tournaments/${tid}/page_data`,
  `/arena/tournament/${tid}/page_data`,
  `/page/tournament/${tid}`,
  `/pages/tournament/${tid}`,
  `/tournament/${tid}`,
  `/tournaments/${tid}`,
  `/tournament/${tid}/registrations?take=50`,
  `/tournament/${tid}/teams?take=50`,
  `/tournament/${tid}/attendants?take=50`,
  `/tournament/${tid}/participants?take=50`,
  `/spaces/Finnhouse/tournaments/${tid}`,
  `/space/Finnhouse/tournament/${tid}`,
];

for (const base of bases) {
  for (const path of paths) {
    const res = await fetch(`${base}${path}`, { headers: authHeaders });
    if (res.status === 200) {
      const text = await res.text();
      if (text.startsWith("{") || text.startsWith("[")) {
        console.log("OK", base + path);
        console.log(text.slice(0, 3000));
      }
    }
  }
}

const html = await fetch(
  `https://www.challengermode.com/s/Finnhouse/tournaments/${tid}/participants`,
  { headers }
).then((r) => r.text());

const imageIds = [
  ...new Set(
    [...html.matchAll(/image1\.challengermode\.com\/([a-f0-9-]+)(?:_\d+_\d+)?/gi)].map((m) => m[1])
  ),
];
console.log("\nImage IDs in HTML:", imageIds);
