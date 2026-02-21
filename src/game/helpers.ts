import type { Direction, Point } from "../types/game";

export function keyOf(point: Point): string {
  return `${point.x},${point.y}`;
}

export function directionToDelta(direction: Direction): Point {
  switch (direction) {
    case "up":
      return { x: 0, y: -1 };
    case "down":
      return { x: 0, y: 1 };
    case "left":
      return { x: -1, y: 0 };
    case "right":
      return { x: 1, y: 0 };
  }
}

export function getUrlLevel(): number {
  const params = new URLSearchParams(window.location.search);
  const raw = Number(params.get("level"));
  if (!Number.isFinite(raw) || raw <= 0) return 1;
  return Math.floor(raw);
}

export function setUrlLevel(level: number): void {
  const url = new URL(window.location.href);
  url.searchParams.set("level", String(level));
  window.history.replaceState({}, "", url);
}

export function formatTime(ms: number): string {
  const safeMs = Math.max(0, ms);
  const totalSeconds = Math.floor(safeMs / 1000);
  const min = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const sec = (totalSeconds % 60).toString().padStart(2, "0");
  return `${min}:${sec}`;
}
