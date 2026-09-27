import { mkdir, stat, writeFile, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import {
  dedup,
  prune,
  weld,
  simplify,
  textureCompress,
  draco,
  getBounds,
  metalRough,
} from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
import draco3d from "draco3dgltf";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "draco3d.encoder": await draco3d.createEncoderModule(),
    "draco3d.decoder": await draco3d.createDecoderModule(),
  });
await MeshoptSimplifier.ready;
const models = [
  ["dark_fantasy_sorceress_crystal_staff", "sorceress", 0.075],
  ["dark_necromancer_-_corrupted_staff__skulls", "necromancer", 0.075],
  ["decepticon_fighter_transformers", "fighter", 0.65],
  ["mango_tree", "mango", 0.3],
  ["more_realistic_trees_free", "forest", 0.08],
  ["transformers-_the_planet_cybertron", "cybertron", 0.7],
  ["bugati_divo", "bugatti", 0.6],
  ["mclaren_ultimate_vision_gt", "mclaren", 0.6],
  ["exmods_ssc_tuatara_aggressor", "ssc", 0.5],
  ["nissan_super_snowland_sdc_performancetm", "nissan", 0.5],
];
const selected = process.argv.slice(2);
await mkdir(new URL("public/assets/models/", root), { recursive: true });
const report = [];
for (const [source, name, ratio] of models) {
  if (selected.length && !selected.includes(name)) continue;
  const input = fileURLToPath(new URL(`3D Models/${source}.glb`, root));
  const output = fileURLToPath(
    new URL(`public/assets/models/${name}.glb`, root),
  );
  const document = await io.read(input);
  // Three can derive the tangent basis for normal maps; exporting tangents costs
  // several MB on these dense source meshes and is unnecessary for this viewer.
  for (const mesh of document.getRoot().listMeshes()) {
    for (const primitive of mesh.listPrimitives())
      primitive.setAttribute("TANGENT", null);
  }
  await document.transform(metalRough(), dedup());
  // Source exports repeat identical UV sets. Reuse channel 0 only when every
  // primitive using the material has the exact same deduplicated accessor.
  const primitives = document
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives());
  for (const material of document.getRoot().listMaterials()) {
    const users = primitives.filter((p) => p.getMaterial() === material);
    for (const info of [
      material.getBaseColorTextureInfo(),
      material.getNormalTextureInfo(),
      material.getOcclusionTextureInfo(),
      material.getEmissiveTextureInfo(),
      material.getMetallicRoughnessTextureInfo(),
    ]) {
      if (
        info &&
        info.getTexCoord() > 0 &&
        users.length &&
        users.every(
          (p) =>
            p.getAttribute(`TEXCOORD_${info.getTexCoord()}`) ===
            p.getAttribute("TEXCOORD_0"),
        )
      )
        info.setTexCoord(0);
    }
  }
  await document.transform(
    dedup(),
    weld(),
    simplify({ simplifier: MeshoptSimplifier, ratio, error: 0.01 }),
    prune(),
    textureCompress({
      encoder: sharp,
      targetFormat: "webp",
      resize: [1024, 1024],
      quality: 82,
    }),
    draco(),
  );
  await io.write(output, document);
  const row = {
    name,
    source: `${source}.glb`,
    originalBytes: (await stat(input)).size,
    bytes: (await stat(output)).size,
    bounds: getBounds(document.getRoot().listScenes()[0]),
    animations: document.getRoot().listAnimations().length,
    vertices: document
      .getRoot()
      .listMeshes()
      .reduce(
        (n, m) =>
          n +
          m
            .listPrimitives()
            .reduce((n, p) => n + p.getAttribute("POSITION").getCount(), 0),
        0,
      ),
  };
  report.push(row);
  console.log(JSON.stringify(row));
}
const previous = selected.length
  ? JSON.parse(
      await readFile(
        new URL("public/assets/models/manifest.json", root),
        "utf8",
      ),
    )
  : [];
await writeFile(
  new URL("public/assets/models/manifest.json", root),
  JSON.stringify(
    [...previous.filter((row) => !selected.includes(row.name)), ...report],
    null,
    2,
  ) + "\n",
);
