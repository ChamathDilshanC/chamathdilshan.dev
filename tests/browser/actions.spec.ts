import { test, expect } from "@playwright/test";

test("IP preview hydrates and all four model actions finish", async ({
  page,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== "edge",
    "Exercise WebGL action choreography in Edge.",
  );
  const url = new URL(baseURL!);
  url.hostname = "127.0.0.1";
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.goto(url.href);
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-hydrated",
    "true",
    { timeout: 15000 },
  );
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:sorceress").length,
  );
  await page.getByRole("button", { name: "Auto actions on" }).click();
  for (const [label, kind] of [
    ["Cast spell", "cast"],
    ["Phase dodge", "dodge"],
  ] as const) {
    const button = page.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(page.locator(".model-controls")).toHaveAttribute(
      "data-action",
      kind,
    );
    await expect(button).toBeEnabled({ timeout: 6000 });
  }
  await page
    .locator("#passage")
    .evaluate((e) =>
      window.scrollTo(0, (e as HTMLElement).offsetTop + e.clientHeight * 0.3),
    );
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:fighter").length,
  );
  for (const [label, kind] of [
    ["Fire cannons", "fire"],
    ["Barrel roll", "roll"],
  ] as const) {
    const button = page.getByRole("button", { name: label, exact: true });
    await button.click();
    await expect(page.locator(".model-controls")).toHaveAttribute(
      "data-action",
      kind,
    );
    await page.waitForTimeout(800);
    await page.screenshot({ path: `artifacts/action-${kind}.png` });
    await expect(button).toBeEnabled({ timeout: 6000 });
  }
  expect(errors).toEqual([]);
});

test("mobile exposes touch action controls and reduced motion disables them", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "edge",
    "Use a portrait WebGL viewport for this check.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:sorceress").length,
  );
  await page.getByRole("button", { name: "Auto actions on" }).click();
  const cast = page.getByRole("button", { name: "Cast spell", exact: true });
  await expect(cast).toBeVisible();
  await cast.click();
  await expect(page.locator(".model-controls")).toHaveAttribute(
    "data-action",
    "cast",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(cast).toBeDisabled();
  await expect(page.locator(".model-controls")).toHaveAttribute(
    "data-action",
    "idle",
  );
  await page.screenshot({ path: "artifacts/action-mobile.png" });
});
