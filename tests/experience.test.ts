import { describe, expect, it } from "vitest";

import { formatDuration, monthLabel, monthsBetween, roleRange, tenure, thisMonth, yearRange } from "../lib/experience";

const role = (start: string, end: string | null) => ({
  title: "Engineer",
  employmentType: "Full-time",
  start,
  end,
  summary: "",
  highlights: [],
  skills: [],
});

describe("experience dates", () => {
  it("labels months in English regardless of locale", () => {
    expect(monthLabel("2024-07")).toBe("Jul 2024");
    expect(monthLabel("2023-12")).toBe("Dec 2023");
    expect(thisMonth(new Date(Date.UTC(2026, 10, 5)))).toBe("2026-11");
  });

  it("counts both the first and the last month, like LinkedIn", () => {
    expect(monthsBetween("2023-01", "2024-06")).toBe(18);
    expect(monthsBetween("2024-03", "2024-03")).toBe(1);
    expect(monthsBetween("2025-01", null, "2026-11")).toBe(23);
    // A start month in the future still reads as one month, never zero or negative.
    expect(monthsBetween("2027-01", null, "2026-11")).toBe(1);
  });

  it("formats durations", () => {
    expect(formatDuration(18)).toBe("1 yr 6 mos");
    expect(formatDuration(12)).toBe("1 yr");
    expect(formatDuration(25)).toBe("2 yrs 1 mo");
    expect(formatDuration(1)).toBe("1 mo");
  });

  it("describes role and company ranges", () => {
    expect(roleRange(role("2024-07", null))).toBe("Jul 2024 – Present");
    expect(roleRange(role("2022-06", "2022-12"))).toBe("Jun 2022 – Dec 2022");

    const promoted = { roles: [role("2024-07", null), role("2023-01", "2024-06"), role("2022-06", "2022-12")] };
    expect(tenure(promoted)).toEqual({ start: "2022-06", end: null });
    expect(yearRange(tenure(promoted))).toBe("2022 – Present");

    const left = { roles: [role("2021-04", "2023-03"), role("2019-01", "2021-03")] };
    expect(tenure(left)).toEqual({ start: "2019-01", end: "2023-03" });
    expect(yearRange(tenure(left))).toBe("2019 – 2023");
    expect(yearRange({ start: "2022-02", end: "2022-09" })).toBe("2022");
  });
});
