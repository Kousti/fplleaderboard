const tid = "e5174a3a-f609-470f-6b7c-08dec7091c3f";
const pageUrl = `https://www.challengermode.com/s/Finnhouse/tournaments/${tid}/participants`;

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  Referer: "https://www.challengermode.com/",
};

const boot = await fetch("https://www.challengermode.com/arena/boot", { headers }).then((r) =>
  r.json()
);

const token = boot.ApiProxyToken.access_token;
const apiBase = boot.ArenaParameters.publicApiProxyUrl;
const authHeaders = { ...headers, Authorization: `Bearer ${token}` };

const html = await fetch(pageUrl, { headers }).then((r) => r.text());
console.log("HTML length:", html.length);

const imageUrls = [...new Set([...html.matchAll(/https:\/\/image1\.challengermode\.com\/[a-f0-9-]+/gi)].map((m) => m[0]))];
console.log("Images in HTML:", imageUrls);

const scriptSrcs = [...html.matchAll(/src="([^"]+\.js[^"]*)"/g)].map((match) => match[1]);
console.log("Script count:", scriptSrcs.length);

for (const src of scriptSrcs.slice(0, 5)) {
  const url = src.startsWith("http") ? src : `https://www.challengermode.com${src}`;
  const js = await fetch(url, { headers }).then((r) => r.text());
  const hits = ["participants", "tournament", "Team", "logo", "image1.challengermode"]
    .flatMap((term) => {
      const index = js.indexOf(term);
      return index >= 0 ? [`${term}@${index}`] : [];
    });
  console.log(url.split("/").pop(), hits.join(", "));
  if (js.includes("participants")) {
    const snippets = [...js.matchAll(/["'`]([^"'`]{0,80}participants[^"'`]{0,80})["'`]/g)].slice(0, 10);
    for (const snippet of snippets) console.log(" ", snippet[1]);
  }
}

// Try grain / entity endpoints
const grainPaths = [
  `/grain/arena/tournament/${tid}`,
  `/grain/tournaments/${tid}`,
  `/grain/entity/tournament/${tid}`,
  `/entity/tournament/${tid}`,
  `/entities/tournament/${tid}`,
  `/odata/Tournaments(${tid})`,
  `/odata/Tournaments(guid'${tid}')`,
];

for (const path of grainPaths) {
  for (const base of [apiBase, boot.ArenaParameters.apiProxyUrl]) {
    const res = await fetch(`${base}${path}`, { headers: authHeaders });
    if (res.status !== 404) {
      const text = await res.text();
      console.log("\nHIT", res.status, base + path);
      console.log(text.slice(0, 1200));
    }
  }
}
