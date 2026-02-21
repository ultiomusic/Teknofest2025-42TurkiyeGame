import { describe, expect, it } from "vitest";
import type { Level } from "../../types/game";
import { buildRuntime, resolveMove, wrapPoint } from "../runtime";

const level: Level = {
  name: "test",
  startPosition: { x: 0, y: 0 },
  sequence: ["left", "end"],
  algorithm: ["sol();"],
  gridSize: { x: 3, y: 3 },
  grid: [
    { type: "normal", x: 0, y: 0 },
    { type: "normal", x: 1, y: 0 },
    { type: "normal", x: 2, y: 0 },
  ],
};

describe("runtime movement", () => {
  it("sinir disina cikinca wrap yapar", () => {
    expect(
      wrapPoint(
        { x: -1, y: 0 },
        { minX: 0, maxX: 2, minY: 0, maxY: 2 },
      ),
    ).toEqual({ x: 2, y: 0 });
  });

  it("beklenen hamleyi dogru degerlendirir", () => {
    const runtime = buildRuntime(1, level);
    const result = resolveMove(runtime, { x: 0, y: 0 }, [], 0, "left");

    expect(result.kind).toBe("correct");
    if (result.kind === "correct") {
      expect(result.nextPlayer).toEqual({ x: 2, y: 0 });
      expect(result.completedLevel).toBe(true);
    }
  });
});
