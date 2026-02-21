import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "../App";

const mockLevels = {
  levels: {
    1: {
      name: "Test Seviye",
      startPosition: { x: 1, y: 1 },
      sequence: ["right", "end"],
      algorithm: ["sağ();"],
      gridSize: { x: 3, y: 3 },
      grid: [
        { type: "normal", x: 1, y: 1 },
        { type: "normal", x: 2, y: 1 },
      ],
    },
  },
};

describe("App integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockLevels,
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("klavye hamlesi ile seviyeyi bitirir", async () => {
    const user = userEvent.setup();
    render(<App />);

    await screen.findByText("Seviye 1/1");

    await user.keyboard("{ArrowRight}");

    expect(await screen.findByRole("heading", { name: "🎉 Tebrikler!" })).toBeInTheDocument();
  });
});
