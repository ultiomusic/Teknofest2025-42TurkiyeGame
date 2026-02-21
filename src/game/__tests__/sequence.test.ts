import { describe, expect, it } from "vitest";
import { flattenSequence } from "../sequence";

describe("flattenSequence", () => {
  it("loop tokenlarini duzlestirir", () => {
    const result = flattenSequence([
      "down",
      {
        loop: {
          iteration: 2,
          sequence: ["right", "up"],
        },
      },
      "left",
      "end",
    ]);

    expect(result).toEqual(["down", "right", "up", "right", "up", "left"]);
  });
});
