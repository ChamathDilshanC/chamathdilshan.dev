import { expect, test } from "@playwright/test";
import { scrollProgressForRoute } from "../../animation/gunship-flight";

for (const viewport of [
  { width: 393, height: 852 },
  { width: 1440, height: 960 },
]) {
  test(`flight and Cybertron arrival at ${viewport.width}px`, async ({
    page,
  }) => {
    test.setTimeout(65000);
    await page.setViewportSize(viewport);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (
        ["error", "warning"].includes(message.type()) &&
        !message.text().startsWith("THREE.Clock:")
      )
        errors.push(message.text());
    });
    // Reproduce the extension attributes reported by the user before hydration.
    await page.addInitScript(() => {
      const inject = () => {
        if (!document.documentElement) return false;
        document.documentElement.setAttribute("data-qb-installed", "true");
        document.documentElement.setAttribute(
          "suppresshydrationwarning",
          "true",
        );
        return true;
      };
      if (!inject()) {
        const observer = new MutationObserver(() => {
          if (inject()) observer.disconnect();
        });
        observer.observe(document, { childList: true });
      }
    });
    await page.goto("/");
    await page.waitForFunction(
      () => performance.getEntriesByName("portfolio:model:fighter").length > 0,
    );
    await expect(page.locator(".experience")).not.toHaveClass(/is-flat/);
    const canvas = await page.locator("canvas").boundingBox();
    expect(canvas?.height).toBe(viewport.height);
    expect(canvas?.width).toBe(viewport.width);
    for (const chapter of await page.locator(".chapter:not(.hero)").all()) {
      await expect(chapter).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    }
    // Each authored chapter must produce a different pose, including depth.
    const originalStops = [
      { id: "projects", offset: 0, progress: 0.15, stage: "orbit" },
      { id: "passage", offset: 0, progress: 0.35, stage: "flyby-approach" },
      { id: "experience", offset: -0.2, progress: 0.67, stage: "approach" },
      { id: "experience", offset: 0.5, progress: 0.76, stage: "side-pass" },
    ];
    const stops = originalStops.map((stop) => ({
      ...stop,
      progress: scrollProgressForRoute(stop.progress),
    }));
    const poses: number[][] = [];
    for (const stop of stops) {
      await page.evaluate(
        ({ id, offset }) =>
          window.scrollTo(
            0,
            document.getElementById(id)!.offsetTop + innerHeight * offset,
          ),
        stop,
      );
      await page.waitForFunction(({ progress, stage }) => {
        const mark = performance.getEntriesByName("portfolio:render").at(-1) as
          PerformanceMark | undefined;
        return (
          Math.abs((mark?.detail.visualProgress ?? -1) - progress) < 0.002 &&
          mark?.detail.flight?.stage === stage
        );
      }, stop);
      poses.push(
        await page.evaluate(
          () =>
            (
              performance
                .getEntriesByName("portfolio:render")
                .at(-1) as PerformanceMark
            ).detail.shipPosition,
        ),
      );
      await page.screenshot({
        path: `artifacts/scroll-${viewport.width}-${stop.progress}.png`,
      });
    }
    expect(Math.abs(poses[0]![0]! - poses[1]![0]!)).toBeGreaterThan(0.2);
    const depths = poses.map((pose) => pose[2]!);
    expect(Math.max(...depths) - Math.min(...depths)).toBeGreaterThan(1);
    const flybyPoses: {
      position: number[];
      scale: number;
      camera: number[];
    }[] = [];
    for (const progress of [0.351, 0.412, 0.452]) {
      const offset = (progress - 0.35) / (scrollProgressForRoute(0.55) - 0.35);
      await page.evaluate((offset) => {
        const section = document.getElementById("passage")!;
        window.scrollTo(0, section.offsetTop + section.clientHeight * offset);
      }, offset);
      await page.waitForFunction((progress) => {
        const mark = performance.getEntriesByName("portfolio:render").at(-1) as
          PerformanceMark | undefined;
        return Math.abs((mark?.detail.visualProgress ?? -1) - progress) < 0.001;
      }, progress);
      flybyPoses.push(
        await page.evaluate(() => {
          const detail = (
            performance
              .getEntriesByName("portfolio:render")
              .at(-1) as PerformanceMark
          ).detail;
          return {
            position: detail.shipPosition,
            scale: detail.shipScale,
            camera: detail.camera,
          };
        }),
      );
      await page.screenshot({
        path: `artifacts/flyby-${viewport.width}-${progress}.png`,
      });
    }
    const [entry, close, climb] = flybyPoses;
    const apparentScale = (pose: typeof entry) =>
      pose!.scale / (pose!.camera[2]! - pose!.position[2]!);
    expect(apparentScale(close) / apparentScale(entry)).toBeGreaterThan(1.3);
    expect(climb!.position[1]! - close!.position[1]!).toBeGreaterThan(1.5);
    await page.evaluate(() =>
      window.scrollTo(0, document.getElementById("projects")!.offsetTop),
    );
    await page.waitForFunction(() => {
      const mark = performance.getEntriesByName("portfolio:render").at(-1) as
        PerformanceMark | undefined;
      return Math.abs((mark?.detail.visualProgress ?? -1) - 0.15) < 0.0001;
    });
    const returned = await page.evaluate(
      () =>
        (
          performance
            .getEntriesByName("portfolio:render")
            .at(-1) as PerformanceMark
        ).detail.shipPosition,
    );
    returned.forEach((value: number, i: number) =>
      expect(Math.abs(value - poses[0]![i]!)).toBeLessThan(0.08),
    );
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await page.waitForFunction(
      () => {
        const mark = performance.getEntriesByName("portfolio:render").at(-1) as
          PerformanceMark | undefined;
        return mark?.detail.flight?.dock === 1 && mark?.detail.planet > 1;
      },
      null,
      { timeout: 30000 },
    );
    await page.screenshot({
      path: `artifacts/verified-arrival-${viewport.width}.png`,
    });
    // Arrival reaches its target before the final camera/vertical damping settles.
    await page.waitForTimeout(2200);
    const parked = await page.evaluate(
      () =>
        (
          performance
            .getEntriesByName("portfolio:render")
            .at(-1) as PerformanceMark
        ).detail.shipPosition,
    );
    await page.waitForTimeout(2400);
    const after = await page.evaluate(
      () =>
        (
          performance
            .getEntriesByName("portfolio:render")
            .at(-1) as PerformanceMark
        ).detail.shipPosition,
    );
    after.forEach((value: number, index: number) =>
      expect(value).toBeCloseTo(parked[index], 2),
    );
    expect(errors).toEqual([]);
  });
}

test("reduced motion keeps a still ship and can reach Cybertron", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 393, height: 852 });
  await page.goto("/");
  await page.waitForFunction(
    () => performance.getEntriesByName("portfolio:model:fighter").length > 0,
  );
  await page.waitForTimeout(2000);
  const first = await page.locator("canvas").screenshot();
  await page.waitForTimeout(500);
  expect((await page.locator("canvas").screenshot()).equals(first)).toBe(true);
  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );
  await page.waitForTimeout(2000);
  const last = await page.locator("canvas").screenshot();
  expect(last.equals(first)).toBe(false);
  await page.waitForTimeout(500);
  expect((await page.locator("canvas").screenshot()).equals(last)).toBe(true);
});
