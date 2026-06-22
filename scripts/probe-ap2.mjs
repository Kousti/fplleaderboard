const tid = "e5174a3a-f609-470f-6b7c-08dec7091c3f";

const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
  Referer: "https://www.challengermode.com/",
};

const boot = await fetch("https://www.challengermode.com/arena/boot", { headers }).then((r) =>
  r.json()
);

const authHeaders = {
  ...headers,
  Authorization: `Bearer ${boot.ApiProxyToken.access_token}`,
};

const api = boot.ArenaParameters.apiProxyUrl;

const attempts = [
  `${api}/tournament/${tid}`,
  `${api}/tournaments/${tid}`,
  `${api}/tournament/${tid}/registrations?skip=0&take=50`,
  `${api}/tournament/${tid}/teams?skip=0&take=50`,
  `${api}/tournament/${tid}/attendants?skip=0&take=50`,
  `${api}/tournament/${tid}/participants?skip=0&take=50`,
  `${api}/tournament/${tid}/lineup?skip=0&take=50`,
  `${api}/tournament/${tid}/slots?skip=0&take=50`,
];

for (const url of attempts) {
  const res = await fetch(url, { headers: authHeaders });
  const text = await res.text();
  console.log(res.status, url);
  if (res.status === 200) {
    console.log(text.slice(0, 4000));
  }
}

const html = await fetch(
  `https://www.challengermode.com/s/Finnhouse/tournaments/${tid}/participants`,
  { headers }
).then((r) => r.text());

const uuids = [
  ...new Set(
    [...html.matchAll(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi)].map(
      (m) => m[0]
    )
  ),
];

console.log("\nAll UUIDs in page:", uuids.length);
for (const id of uuids) {
  if (id === tid) continue;
  console.log(`https://image1.challengermode.com/${id}_64_64`);
}
