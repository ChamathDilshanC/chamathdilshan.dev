import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const url = process.env.TEST_URL ?? "http://localhost:3000";
await page.goto(url);
await page.waitForFunction(
  () =>
    ["sorceress", "mango", "forest"].every(
      (name) =>
        performance.getEntriesByName(`portfolio:model:${name}`).length > 0,
    ),
  null,
  { timeout: 90000 },
);
await page.waitForTimeout(2500);
await mkdir("artifacts", { recursive: true });
await page.screenshot({ path: "artifacts/new-hero.png" });
const desktopStats = await page.evaluate(
  () => performance.getEntriesByName("portfolio:render").at(-1)?.detail,
);
await sharp(
  await page.locator("canvas").screenshot({
    style:
      ".experience > :not(.world-canvas), nextjs-portal { visibility: hidden !important; }",
  }),
)
  .resize({ width: 1600 })
  .webp({ quality: 82 })
  .toFile("public/assets/world-poster.webp");
await page
  .locator("#projects")
  .evaluate((element) => element.scrollIntoView({ block: "start" }));
await page.waitForFunction(
  () => performance.getEntriesByName("portfolio:model:necromancer").length > 0,
);
await page.waitForTimeout(2500);
await page.screenshot({ path: "artifacts/new-projects.png" });
await page
  .locator("#passage")
  .evaluate((element) =>
    window.scrollTo(0, element.offsetTop + element.clientHeight * 0.2),
  );
await page.waitForTimeout(2500);
await page.screenshot({ path: "artifacts/new-flight.png" });
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url);
await page.waitForFunction(
  () => performance.getEntriesByName("portfolio:model:sorceress").length > 0,
);
await page.waitForTimeout(6000);
await page.screenshot({ path: "artifacts/new-mobile.png" });
console.log(
  JSON.stringify({
    errors,
    desktopStats,
    stats: await page.evaluate(
      () => performance.getEntriesByName("portfolio:render").at(-1)?.detail,
    ),
    models: await page.evaluate(() =>
      performance
        .getEntriesByType("mark")
        .filter((m) => m.name.includes("model:"))
        .map((m) => m.name),
    ),
  }),
);
await browser.close();
