import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HeartPulse } from "@/components/public/home-motion";

describe("public home motion", () => {
  it("bursts heart particles when the central heart is clicked", () => {
    render(<HeartPulse />);

    const heart = screen.getByRole("button", { name: "heart animation" });

    expect(screen.queryByTestId("heart-burst")).not.toBeInTheDocument();

    fireEvent.click(heart);

    expect(screen.getByTestId("heart-burst")).toBeInTheDocument();
    expect(screen.getAllByTestId("heart-particle")).toHaveLength(8);
  });
});
