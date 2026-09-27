import { test, expect } from "@playwright/test";

test("the authored models load, the camera travels, and the fighter enters on scroll", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "edge",
    "Verify the WebGL journey in the installed desktop browser.",
  );
  const errors: string[] = [];
  const loaded = new Set<string>();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("response", (response) => {
    if (
      response.url().includes("/models/") &&
      response.url().endsWith(".glb") &&
      response.ok()
    )
      loaded.add(response.url().split("/").at(-1)!);
  });
  await page.goto("/");
  await page.waitForFunction(
    () =>
      ["sorceress", "mango", "forest"].every(
        (name) =>
          performance.getEntriesByName(`portfolio:model:${name}`).length,
      ),
    { timeout: 30000 },
  );
  await expect(page.locator(".experience")).not.toHaveClass(/is-flat/);
  await page.getByRole("link", { name: "Enter my world" }).click();
  await page.waitForFunction(() =>
    ["necromancer", "fighter"].every(
      (name) => performance.getEntriesByName(`portfolio:model:${name}`).length,
    ),
  );
  await expect(page.locator(".world-label-title")).toHaveText(
    "The shadow keeper",
  );
  await page
    .locator("#passage")
    .evaluate((element) =>
      window.scrollTo(
        0,
        (element as HTMLElement).offsetTop + element.clientHeight * 0.35,
      ),
    );
  await expect(page.locator(".world-label-title")).toHaveText(
    "Decepticon flight",
  );
  await page.waitForFunction(() => {
    const mark = performance.getEntriesByName("portfolio:render").at(-1) as
      PerformanceMark | undefined;
    return (
      !!mark &&
      mark.detail.progress > 0.38 &&
      mark.detail.progress < 0.55 &&
      mark.detail.camera[1] > 3.4
    );
  });
  await page.screenshot({ path: "artifacts/verified-flight.png" });
  expect([...loaded].sort()).toEqual([
    "fighter.glb",
    "forest.glb",
    "mango.glb",
    "necromancer.glb",
    "sorceress.glb",
  ]);
  expect(errors).toEqual([]);
});

test("reduced motion holds the 3D view still while keeping chapter navigation", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "edge",
    "Check demand rendering in the installed desktop browser.",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForFunction(() =>
    ["sorceress", "mango", "forest"].every(
      (name) => performance.getEntriesByName(`portfolio:model:${name}`).length,
    ),
  );
  await expect(page.locator(".model-loading")).toHaveCount(0);
  // Element screenshots include overlaid HTML (including the animated dev
  // indicator). Isolate the renderer so this checks motion in the 3D scene.
  const stillFrame = () =>
    page.locator("canvas").screenshot({
      style:
        ".experience > :not(.world-canvas), nextjs-portal { visibility: hidden !important; }",
    });
  const first = await stillFrame();
  await page.waitForTimeout(600);
  expect(
    (await stillFrame()).equals(first),
    "Reduced-motion 3D frames should be identical",
  ).toBe(true);
  await page.getByRole("link", { name: "Enter my world" }).click();
  await expect(page.locator(".world-label-title")).toHaveText(
    "The shadow keeper",
  );
  await page.waitForFunction(
    () =>
      performance.getEntriesByName("portfolio:model:necromancer").length > 0,
  );
  await expect(page.locator(".experience")).not.toHaveClass(/is-flat/);
});

test("a failed model preserves the world and portfolio controls", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "edge",
    "One desktop failure-injection check is sufficient.",
  );
  await page.route("**/models/sorceress.glb", (route) =>
    route.fulfill({ status: 404, body: "Missing model" }),
  );
  await page.goto("/");
  await expect(page.getByRole("status")).toContainText(
    "Some scenery could not load",
  );
  await expect(page.locator(".experience")).not.toHaveClass(/is-flat/);
  await page.getByRole("button", { name: "Explore project" }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
