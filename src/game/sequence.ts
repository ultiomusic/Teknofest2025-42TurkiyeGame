import type { Direction, RawSequenceToken } from "../types/game";

const DIRECTION_SET: Direction[] = ["up", "down", "left", "right"];

function isDirection(value: unknown): value is Direction {
  return typeof value === "string" && DIRECTION_SET.includes(value as Direction);
}

function isLoopToken(value: unknown): value is { loop: { iteration: number; sequence: RawSequenceToken[] } } {
  if (!value || typeof value !== "object" || !("loop" in value)) return false;
  const loop = (value as { loop?: unknown }).loop;
  if (!loop || typeof loop !== "object") return false;
  const candidate = loop as { iteration?: unknown; sequence?: unknown };
  return typeof candidate.iteration === "number" && Array.isArray(candidate.sequence);
}

export function flattenSequence(tokens: RawSequenceToken[]): Direction[] {
  const result: Direction[] = [];

  const visit = (list: RawSequenceToken[]) => {
    for (const token of list) {
      if (token === "end") {
        continue;
      }
      if (isDirection(token)) {
        result.push(token);
        continue;
      }
      if (isLoopToken(token)) {
        const loopCount = Math.max(0, Math.floor(token.loop.iteration));
        for (let i = 0; i < loopCount; i += 1) {
          visit(token.loop.sequence);
        }
      }
    }
  };

  visit(tokens);
  return result;
}

export function directionLabel(direction: Direction): string {
  switch (direction) {
    case "up":
      return "Yukarı";
    case "down":
      return "Aşağı";
    case "left":
      return "Sol";
    case "right":
      return "Sağ";
  }
}

export function directionIcon(direction: Direction): string {
  switch (direction) {
    case "up":
      return "↑";
    case "down":
      return "↓";
    case "left":
      return "←";
    case "right":
      return "→";
  }
}
