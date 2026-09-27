import { expect, test } from "@playwright/test";

for (const width of [1440, 393]) {
  test(`original Nissan annotations and close-ups at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 393 ? 852 : 960 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/");
    await page
      .getByRole("combobox", { name: "Choose your vehicle" })
      .selectOption("nissan");
    await expect(
      page.getByRole("button", { name: "10 annotations", exact: true }),
    ).toBeVisible();
    const markers = page.locator(".vehicle-annotation-marker");
    await expect(markers).toHaveCount(10);
    await expect(markers.nth(8)).toBeVisible();
    await page.screenshot({ path: `artifacts/annotations-${width}.png` });
    // Surface markers follow the animated model continuously.
    await markers.nth(8).click({ force: true });
    await expect(
      page.getByRole("heading", { name: "Where is the inside ?" }),
    ).toBeVisible();
    await expect(
      page.getByText("Am I asking you questions?", { exact: true }),
    ).toBeVisible();
    await page.waitForTimeout(2200);
    await page.screenshot({
      path: `artifacts/annotation-closeup-${width}.png`,
    });
    await page.getByRole("button", { name: "Next annotation" }).click();
    await expect(
      page.getByRole("heading", { name: "Where is the license plate ?" }),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("region", { name: "Model annotation", exact: true }),
    ).toHaveCount(0);
    await expect(
      page.getByRole("combobox", { name: "Choose your vehicle" }),
    ).toBeVisible();
    await page
      .getByRole("combobox", { name: "Choose your vehicle" })
      .selectOption("mclaren");
      await expect(page.getByText("Your journey, your ride.")).toBeVisible({ timeout: 20000 });
    await expect(markers).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("arrow keys move the vehicle, release stops it, and Escape restores scrolling", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Choose your vehicle" })
    .selectOption("nissan");
  await expect(
    page.getByRole("button", { name: "Move · arrow keys" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Move · arrow keys" }).click();
  const position = async () =>
    page.evaluate(
      () =>
        (
          performance
            .getEntriesByName("portfolio:render")
            .at(-1) as PerformanceMark
        )?.detail.shipPosition,
    );
  await page.waitForTimeout(2400);
  const before = await position();
  await page.keyboard.down("ArrowRight");
  await page.waitForTimeout(1500);
  await page.keyboard.up("ArrowRight");
  await page.waitForTimeout(2300);
  const moved = await position();
  expect(moved[0]).toBeGreaterThan(before[0] + 1);
  expect(await page.evaluate(() => scrollY)).toBe(0);
  await page.waitForTimeout(2300);
  const stopped = await position();
  expect(stopped[0]).toBeCloseTo(moved[0], 1);
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("region", { name: "Vehicle movement controls" }),
  ).toHaveCount(0);
  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(100);
});

test("touch controls release on pointer cancellation", async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.getByRole("button", { name: "Move · arrow keys" }).click();
  const right = page.getByRole("button", { name: "Move right", exact: true });
  const box = await right.boundingBox();
  await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(500);
  await right.dispatchEvent("pointercancel");
  await page.mouse.up();
  await page.getByRole("button", { name: "Stop driving" }).click();
  await expect(
    page.getByRole("button", { name: "Move · arrow keys" }),
  ).toBeFocused();
});
