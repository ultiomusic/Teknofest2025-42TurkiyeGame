import { describe, expect, it } from "vitest";
import { createInitialState, gameReducer } from "../reducer";
import type { Level } from "../../types/game";

const sampleLevel: Level = {
  name: "Undo Test",
  startPosition: { x: 1, y: 1 },
  sequence: ["right", "right", "end"],
  algorithm: ["sağ();", "sağ();"],
  gridSize: { x: 4, y: 3 },
  grid: [
    { type: "normal", x: 1, y: 1 },
    { type: "normal", x: 2, y: 1 },
    { type: "normal", x: 3, y: 1 },
  ],
};

describe("gameReducer undo", () => {
  it("dogru hamleden sonra undo ile geri alir", () => {
    const base = createInitialState("dark");
    const bootstrapped = gameReducer(base, {
      type: "BOOTSTRAP_SUCCESS",
      payload: {
        levels: { 1: sampleLevel },
        levelNumbers: [1],
        initialLevel: 1,
        startTime: Date.now(),
        highestLevelCompleted: 0,
        now: Date.now(),
      },
    });

    const moved = gameReducer(bootstrapped, { type: "MOVE", direction: "right" });
    const undone = gameReducer(moved, { type: "UNDO" });

    expect(undone.player).toEqual(sampleLevel.startPosition);
    expect(undone.step).toBe(0);
  });
});
