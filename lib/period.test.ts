import { describe, expect, it } from "vitest";
import {
  addMonths,
  addWeeks,
  formatMonthLabel,
  formatWeekLabel,
  getDefaultWeekAnchor,
  getMonthRange,
  getPreviousPeriodRange,
  getWeekRange,
  isDateInRange,
} from "./period";

describe("getWeekRange", () => {
  it("spans two months when the week crosses a month boundary", () => {
    // Oct 1, 2026 is a Thursday -> week is Sun Sep 27 - Sat Oct 3
    expect(getWeekRange(new Date(2026, 9, 1))).toEqual({
      start: "2026-09-27",
      end: "2026-10-03",
    });
  });

  it("spans two years when the week crosses a year boundary", () => {
    // Dec 31, 2026 is a Thursday -> week is Sun Dec 27 2026 - Sat Jan 2 2027
    expect(getWeekRange(new Date(2026, 11, 31))).toEqual({
      start: "2026-12-27",
      end: "2027-01-02",
    });
  });

  it("treats a Sunday as the first day of its own week", () => {
    // Oct 4, 2026 is a Sunday
    expect(getWeekRange(new Date(2026, 9, 4))).toEqual({
      start: "2026-10-04",
      end: "2026-10-10",
    });
  });

  it("treats a Saturday as the last day of its own week", () => {
    // Oct 3, 2026 is a Saturday
    expect(getWeekRange(new Date(2026, 9, 3))).toEqual({
      start: "2026-09-27",
      end: "2026-10-03",
    });
  });
});

describe("isDateInRange", () => {
  const range = { start: "2026-09-27", end: "2026-10-03" };

  it("includes both boundary dates", () => {
    expect(isDateInRange("2026-09-27", range)).toBe(true);
    expect(isDateInRange("2026-10-03", range)).toBe(true);
  });

  it("excludes dates just outside the range", () => {
    expect(isDateInRange("2026-09-26", range)).toBe(false);
    expect(isDateInRange("2026-10-04", range)).toBe(false);
  });
});

describe("getMonthRange", () => {
  it("returns the first and last day of the month", () => {
    expect(getMonthRange(new Date(2026, 9, 15))).toEqual({
      start: "2026-10-01",
      end: "2026-10-31",
    });
  });

  it("handles February in a leap year", () => {
    expect(getMonthRange(new Date(2028, 1, 10))).toEqual({
      start: "2028-02-01",
      end: "2028-02-29",
    });
  });
});

describe("addMonths / addWeeks", () => {
  it("rolls over into the next year", () => {
    const next = addMonths(new Date(2026, 11, 15), 1);
    expect(next.getFullYear()).toBe(2027);
    expect(next.getMonth()).toBe(0);
  });

  it("rolls back into the previous year", () => {
    const prev = addMonths(new Date(2026, 0, 15), -1);
    expect(prev.getFullYear()).toBe(2025);
    expect(prev.getMonth()).toBe(11);
  });

  it("moves a week forward across a month boundary", () => {
    const next = addWeeks(new Date(2026, 9, 1), 1);
    expect(getWeekRange(next)).toEqual({ start: "2026-10-04", end: "2026-10-10" });
  });
});

describe("formatMonthLabel / formatWeekLabel", () => {
  it("formats a Hebrew month and year", () => {
    expect(formatMonthLabel(new Date(2026, 9, 15))).toBe("אוקטובר 2026");
  });

  it("formats a week crossing two months with both month names", () => {
    expect(formatWeekLabel(new Date(2026, 9, 1))).toBe("27 בספט׳ – 3 באוק׳");
  });

  it("formats a week within a single month with one month name", () => {
    // Oct 11, 2026 is within the week of Oct 11-17 (Sunday Oct 11 - Saturday Oct 17)
    expect(formatWeekLabel(new Date(2026, 9, 11))).toBe("11–17 באוק׳");
  });
});

describe("getDefaultWeekAnchor", () => {
  it("returns today when today is inside the selected month", () => {
    const monthAnchor = new Date(2026, 9, 1);
    const today = new Date(2026, 9, 20);
    expect(getDefaultWeekAnchor(monthAnchor, today)).toBe(today);
  });

  it("returns the first day of the month when today is outside it", () => {
    const monthAnchor = new Date(2026, 9, 1);
    const today = new Date(2026, 10, 5);
    const result = getDefaultWeekAnchor(monthAnchor, today);
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(9);
    expect(result.getDate()).toBe(1);
  });
});

describe("getPreviousPeriodRange", () => {
  it("returns the previous month's range", () => {
    expect(getPreviousPeriodRange("month", new Date(2026, 9, 15))).toEqual({
      start: "2026-09-01",
      end: "2026-09-30",
    });
  });

  it("returns the previous week's range", () => {
    expect(getPreviousPeriodRange("week", new Date(2026, 9, 4))).toEqual({
      start: "2026-09-27",
      end: "2026-10-03",
    });
  });
});
