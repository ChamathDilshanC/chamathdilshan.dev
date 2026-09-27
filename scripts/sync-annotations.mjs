import { readFile, writeFile } from "node:fs/promises";

// Annotations are Sketchfab viewer data, not GLB animation clips. Keep the
// author's original text and camera views alongside our local model assets.
const config = await readFile("config/vehicles.ts", "utf8");
const models = [
  ...config.matchAll(/id:\s*"([^"]+)"[\s\S]*?source:\s*"[^"]*-([a-f\d]{32})"/g),
];
const annotations = {};
const decode = (value) =>
  value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replaceAll("&quot;", '"')
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
// Sketchfab uses Z-up; the downloaded GLB root converts to glTF Y-up.
const toGltf = ([x, y, z]) => [x, z, -y];
for (const [, id, uid] of models) {
  const response = await fetch(`https://sketchfab.com/models/${uid}/embed`);
  if (!response.ok) throw new Error(`${id}: HTTP ${response.status}`);
  const html = await response.text();
  const match = html.match(
    /id="js-dom-data-prefetched-data">\s*<!--([\s\S]*?)-->/,
  );
  if (!match) throw new Error(`${id}: missing viewer data`);
  const data = JSON.parse(decode(match[1]));
  const hotspots = data[`/i/models/${uid}/hotspots?optimized=1`];
  if (!hotspots) throw new Error(`${id}: missing annotation response`);
  annotations[id] = hotspots.results.map((point) => ({
    id: point.uid,
    title: point.name,
    body: point.content.raw,
    position: toGltf(point.position),
    eye: toGltf(point.eye),
    target: toGltf(point.target),
  }));
  console.log(`${id}: ${annotations[id].length} original annotations`);
}
await writeFile(
  "config/vehicle-annotations.json",
  JSON.stringify(annotations, null, 2) + "\n",
);
