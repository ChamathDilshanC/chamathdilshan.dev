import { expect, test } from "@playwright/test";

test("selects every vehicle, preserves scroll, and remembers the choice", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 960 });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:fighter").length > 0,
  );
  const picker = page.getByRole("combobox", { name: "Choose your vehicle" });
  const action = await page
    .getByRole("link", { name: "Explore my work" })
    .boundingBox();
  const control = await picker.boundingBox();
  expect(control!.x).toBeGreaterThan(1000);
  expect(Math.abs(control!.y - action!.y)).toBeLessThan(30);
  for (const id of ["mclaren", "bugatti", "ssc", "nissan", "fighter"]) {
    await picker.selectOption(id);
    await page.waitForFunction(
      (id) => performance.getEntriesByName(`portfolio:model:${id}`).length > 0,
      id,
    );
    await expect(page.getByText("Your journey, your ride.")).toBeVisible();
    await page.waitForTimeout(700);
    await page.screenshot({ path: `artifacts/vehicle-${id}.png` });
    await expect(page.locator(".experience")).not.toHaveClass(/is-flat/);
    expect(await page.evaluate(() => scrollY)).toBe(0);
  }
  await picker.selectOption("mclaren");
  await page.reload();
  await expect(picker).toHaveValue("mclaren");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:mclaren").length > 0,
  );
  await page.getByText("Model details", { exact: true }).click();
  await expect(page.getByText("3D model by VTX.")).toBeVisible();
  expect(errors).toEqual([]);
});

test("mobile selector fits the CTA row and switches models", async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  const picker = page.getByRole("combobox", { name: "Choose your vehicle" });
  await picker.selectOption("nissan");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:nissan").length > 0,
  );
  await expect(page.getByText("Your journey, your ride.")).toBeVisible();
  await page.waitForTimeout(1000);
  const control = await picker.boundingBox();
  expect(control!.x + control!.width).toBeLessThanOrEqual(393);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    393,
  );
  await page.screenshot({ path: "artifacts/vehicle-mobile.png" });
});

test("a failed selection keeps the current vehicle and permits recovery", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:fighter").length > 0,
  );
  await page.route("**/models/bugatti.glb", (route) =>
    route.fulfill({ status: 404, body: "Missing test asset" }),
  );
  const picker = page.getByRole("combobox", { name: "Choose your vehicle" });
  await picker.selectOption("bugatti");
  await expect(
    page.getByText("Model unavailable. Choose another ride."),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => performance.getEntriesByName("portfolio:model:fighter").length,
    ),
  ).toBe(1);
  await picker.selectOption("mclaren");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:mclaren").length > 0,
  );
  await expect(page.getByText("Your journey, your ride.")).toBeVisible();
});
