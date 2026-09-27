import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";

// Bake reflection filtering once, keeping PMREM shader compilation off phones.
const browser = await chromium.launch({ channel: "msedge" });
try {
  const page = await browser.newPage();
  const modules = {
    "/three.js": "node_modules/three/build/three.module.js",
    "/three.core.js": "node_modules/three/build/three.core.js",
    "/room.js":
      "node_modules/three/examples/jsm/environments/RoomEnvironment.js",
  };
  await page.route("http://studio.local/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill(
      modules[path]
        ? {
            contentType: "text/javascript",
            body: await readFile(modules[path], "utf8"),
          }
        : {
            contentType: "text/html",
            body: '<script type="importmap">{"imports":{"three":"/three.js"}}</script>',
          },
    );
  });
  await page.goto("http://studio.local/");
  const result = await page.evaluate(async () => {
    const { WebGLRenderer, PMREMGenerator } = await import("/three.js");
    const { RoomEnvironment } = await import("/room.js");
    const renderer = new WebGLRenderer();
    const room = new RoomEnvironment();
    const generator = new PMREMGenerator(renderer);
    const map = generator.fromScene(room, 0, 0.1, 100, { size: 128 });
    const pixels = new Uint16Array(map.width * map.height * 4);
    renderer.readRenderTargetPixels(map, 0, 0, map.width, map.height, pixels);
    const bytes = new Uint8Array(pixels.buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    const result = { width: map.width, height: map.height, data: btoa(binary) };
    map.dispose();
    room.dispose();
    generator.dispose();
    renderer.dispose();
    return result;
  });
  await mkdir("public/assets", { recursive: true });
  await writeFile(
    "public/assets/studio-env.bin",
    Buffer.from(result.data, "base64"),
  );
  await writeFile(
    "public/assets/studio-env.json",
    JSON.stringify({ width: result.width, height: result.height }),
  );
  console.log(`Baked studio reflections: ${result.width} × ${result.height}`);
} finally {
  await browser.close();
}
