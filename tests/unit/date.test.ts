import { describe, expect, it } from "vitest";
import { daysBetween, formatDateInputValue, formatDateLabel, getTogetherDays } from "@/lib/date";

describe("date utilities", () => {
  it("calculates inclusive together days from a start date", () => {
    expect(
      getTogetherDays(
        new Date("2024-05-20T00:00:00+08:00"),
        new Date("2024-05-20T23:00:00+08:00")
      )
    ).toBe(1);
    expect(
      getTogetherDays(
        new Date("2024-05-20T00:00:00+08:00"),
        new Date("2024-05-22T08:00:00+08:00")
      )
    ).toBe(3);
  });

  it("calculates absolute day difference", () => {
    expect(daysBetween(new Date("2024-01-01T00:00:00Z"), new Date("2024-01-04T00:00:00Z"))).toBe(3);
    expect(daysBetween(new Date("2024-01-04T00:00:00Z"), new Date("2024-01-01T00:00:00Z"))).toBe(3);
  });

  it("formats stable Chinese date labels", () => {
    expect(formatDateLabel(new Date("2024-05-20T12:00:00+08:00"))).toBe("2024.05.20");
  });

  it("formats dates for HTML date inputs", () => {
    expect(formatDateInputValue(new Date("2024-05-20T12:00:00+08:00"))).toBe("2024-05-20");
  });
});
