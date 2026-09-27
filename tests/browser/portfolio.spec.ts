import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("all chapters are accessible and project panels restore focus", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "ChamathDilshan.",
  );
  await expect(page.locator("main section.chapter")).toHaveCount(7);
  const open = page.getByRole("button", { name: "Explore project" }).first();
  await open.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.screenshot({
    path: `artifacts/${info.project.name}-project-panel.png`,
  });
  await expect(
    page
      .getByRole("dialog")
      .getByRole("heading", { name: "DevResume", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("dialog")).toContainText("The problem");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(open).toBeFocused();
  await page.screenshot({
    path: `artifacts/${info.project.name}-projects.png`,
  });
  expect(errors).toEqual([]);
});

test("desktop rendering, audio, exploration and context-loss recovery", async ({
  page,
}, info) => {
  test.skip(
    !["edge", "chromium"].includes(info.project.name),
    "Hardware rendering is verified in Chromium and Edge.",
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.locator(".world-canvas.is-ready")).toBeVisible();
  await page.getByRole("button", { name: "Sound off", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sound on", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Sound on", exact: true }).click();
  await page.getByRole("button", { name: "Experience settings" }).click();
  await page.getByLabel("Render quality").selectOption("ULTRA");
  await page.getByRole("button", { name: "Close settings" }).click();
  await page.getByRole("button", { name: "Linger at the summit" }).click();
  await expect(
    page.getByRole("region", { name: "Explore controls" }),
  ).toBeVisible();
  await page.keyboard.down("w");
  await page.waitForTimeout(300);
  await page.keyboard.up("w");
  await page.keyboard.press("e");
  await expect(page.getByRole("dialog")).toContainText("Ember");
  await page.keyboard.press("Escape");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Explore controls" }),
  ).not.toBeVisible();
  await page
    .locator("canvas")
    .evaluate((canvas: HTMLCanvasElement) =>
      canvas.dispatchEvent(new Event("webglcontextlost", { cancelable: true })),
    );
  await expect(page.locator(".experience")).toHaveClass(/is-flat/);
  await expect(
    page.getByRole("heading", { name: "Every great story starts somewhere." }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("deep links, skill keyboard controls, settings and contact work", async ({
  page,
}) => {
  await page.goto("/#skills");
  await expect(page.locator(".experience")).toHaveAttribute(
    "data-hydrated",
    "true",
  );
  const frontend = page.getByRole("tab", { name: "Frontend" });
  await frontend.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Backend" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText("FastAPI");
  await page.getByRole("button", { name: "Experience settings" }).click();
  await page.getByLabel("Still landscape").check();
  await page.getByLabel("Reduced motion", { exact: true }).check();
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(page.locator(".experience")).toHaveClass(/is-flat/);
  await page.getByRole("button", { name: "Start a conversation" }).click();
  await expect(page.getByRole("status")).toContainText("awaiting its owner");
  await page.reload();
  await expect(page.locator(".experience")).toHaveClass(/is-flat/);
});

test("reduced-motion and WebGL failure preserve the full portfolio", async ({
  page,
}, info) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      type: string,
      ...args: unknown[]
    ) {
      if (type.includes("webgl")) return null;
      return original.apply(this, [type, ...args] as Parameters<
        typeof original
      >);
    } as typeof original;
  });
  await page.goto("/");
  await expect(page.locator(".experience")).toHaveClass(/is-flat/);
  await expect(page.locator("canvas")).toHaveCount(0);
  await page.screenshot({
    path: `artifacts/${info.project.name}-fallback.png`,
  });
  const audit = await new AxeBuilder({ page }).analyze();
  expect(audit.violations).toEqual([]);
  const dimensions = await page.evaluate(() => ({
    content: document.documentElement.scrollWidth,
    viewport: innerWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
});
