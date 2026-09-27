import { chromium } from "@playwright/test";
import lighthouse from "lighthouse";
import { mkdir, writeFile } from "node:fs/promises";
const url = process.env.TEST_URL ?? "http://127.0.0.1:3001";
await mkdir("artifacts", { recursive: true });
const browser = await chromium.launch({
  args: ["--remote-debugging-port=9223"],
});
try {
  for (const form of ["desktop", "mobile"]) {
    const result = await lighthouse(url, {
      port: 9223,
      output: "json",
      logLevel: "error",
      ...(form === "desktop" ? { preset: "desktop" } : {}),
    });
    await writeFile(`artifacts/lighthouse-${form}.json`, result.report);
    const report = result.lhr;
    console.log(
      form,
      JSON.stringify({
        scores: Object.fromEntries(
          Object.entries(report.categories).map(([key, value]) => [
            key,
            value.score,
          ]),
        ),
        metrics: Object.fromEntries(
          [
            "largest-contentful-paint",
            "cumulative-layout-shift",
            "total-blocking-time",
            "total-byte-weight",
          ].map((key) => [key, report.audits[key].displayValue]),
        ),
      }),
    );
  }
} finally {
  await browser.close();
}
