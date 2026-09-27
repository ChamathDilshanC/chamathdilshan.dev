import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const browser = await chromium.launch({ channel: "msedge" });
await mkdir("artifacts", { recursive: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(process.env.TEST_URL ?? "http://127.0.0.1:3001");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:render").length > 0,
  );
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Performance.enable");
  const before = await cdp.send("Performance.getMetrics");
  const frames = await page.evaluate(
    () =>
      new Promise((resolve) => {
        const durations = [];
        let last = performance.now();
        const start = last;
        function frame(now) {
          durations.push(now - last);
          last = now;
          if (now - start < 8000) requestAnimationFrame(frame);
          else resolve(durations);
        }
        requestAnimationFrame(frame);
      }),
  );
  const after = await cdp.send("Performance.getMetrics");
  const task = (metrics) =>
    metrics.metrics.find((m) => m.name === "TaskDuration").value;
  const render = await page.evaluate(
    () => performance.getEntriesByName("portfolio:render").at(-1).detail,
  );
  const resources = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((r) => r.name.includes(".js"))
      .map((r) => ({
        name: r.name.split("/").at(-1),
        encoded: r.encodedBodySize,
        decoded: r.decodedBodySize,
      })),
  );
  await page.screenshot({ path: "artifacts/production-desktop.png" });
  await page.getByRole("button", { name: "Experience settings" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.waitForTimeout(1200);
  const vitals = await page.evaluate(() =>
    Object.fromEntries(
      performance
        .getEntriesByType("mark")
        .filter((m) => /^portfolio:(LCP|INP|CLS)$/.test(m.name))
        .map((m) => [m.name, m.detail]),
    ),
  );
  const sorted = [...frames].sort((a, b) => a - b);
  const report = {
    viewport: "1440x1000",
    browser: "Headless Microsoft Edge",
    ...render,
    sampledFps: frames.length / (frames.reduce((a, b) => a + b, 0) / 1000),
    frameIntervalMedianMs: sorted[Math.floor(sorted.length * 0.5)],
    frameIntervalP95Ms: sorted[Math.floor(sorted.length * 0.95)],
    rendererTaskMsPerFrame:
      ((task(after) - task(before)) * 1000) / frames.length,
    vitals,
    javascriptEncodedBytes: resources.reduce((sum, r) => sum + r.encoded, 0),
    javascriptDecodedBytes: resources.reduce((sum, r) => sum + r.decoded, 0),
    resources,
    errors,
  };
  await writeFile(
    "artifacts/runtime-metrics.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify({ ...report, resources: undefined }, null, 2));
} finally {
  await browser.close();
}
