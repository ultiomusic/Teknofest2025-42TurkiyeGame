import { describe, expect, it } from "vitest";
import { levelClearBonus, scoreCorrectMove, scoreWrongMove } from "../scoring";

describe("scoring", () => {
  it("dogru hamlede combo ve puan artirir", () => {
    const updated = scoreCorrectMove({ score: 0, combo: 0, bestCombo: 0 });
    expect(updated.combo).toBe(1);
    expect(updated.score).toBeGreaterThan(0);
  });

  it("yanlis hamlede combo sifirlar", () => {
    const updated = scoreWrongMove({ score: 200, combo: 3, bestCombo: 5 });
    expect(updated.combo).toBe(0);
    expect(updated.score).toBeLessThan(200);
    expect(updated.bestCombo).toBe(5);
  });

  it("par hamlesi varsa bonus ekler", () => {
    expect(levelClearBonus(5, 4)).toBeGreaterThan(levelClearBonus(undefined, 4));
  });
});
