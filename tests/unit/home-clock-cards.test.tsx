import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HomeClockCards } from "@/components/public/home-clock-cards";

describe("HomeClockCards", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("refreshes the visible time every second", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-20T10:20:30"));

    render(<HomeClockCards initialTime="2026-05-20T10:20:30" />);

    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("31")).toBeInTheDocument();
  });
});
