import type { Bounds, GridCell, Level, LevelRuntime, MoveResult, Point } from "../types/game";
import { directionToDelta, keyOf } from "./helpers";
import { flattenSequence } from "./sequence";

function deriveBounds(level: Level): Bounds {
  if (level.grid.length === 0) {
    return {
      minX: 0,
      maxX: Math.max(0, level.gridSize.x - 1),
      minY: 0,
      maxY: Math.max(0, level.gridSize.y - 1),
    };
  }

  const xs = level.grid.map((cell) => cell.x);
  const ys = level.grid.map((cell) => cell.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

export function wrapPoint(point: Point, bounds: Bounds): Point {
  let x = point.x;
  let y = point.y;

  if (x < bounds.minX) x = bounds.maxX;
  if (x > bounds.maxX) x = bounds.minX;
  if (y < bounds.minY) y = bounds.maxY;
  if (y > bounds.maxY) y = bounds.minY;

  return { x, y };
}

export function buildRuntime(levelNumber: number, level: Level): LevelRuntime {
  const moveSequence = flattenSequence(level.sequence);

  const pathBlocks: Point[] = [];
  const cellsByKey: Record<string, GridCell> = {};

  for (const cell of level.grid) {
    if (cell.type === "path") {
      pathBlocks.push({ x: cell.x, y: cell.y });
      continue;
    }
    cellsByKey[keyOf(cell)] = cell;
  }

  return {
    levelNumber,
    level,
    moveSequence,
    bounds: deriveBounds(level),
    pathBlocks,
    cellsByKey,
  };
}

export function getCellAt(runtime: LevelRuntime, point: Point): GridCell | undefined {
  return runtime.cellsByKey[keyOf(point)];
}

export function resolveMove(
  runtime: LevelRuntime,
  player: Point,
  pathBlocks: Point[],
  step: number,
  direction: "up" | "down" | "left" | "right",
): MoveResult {
  const expected = runtime.moveSequence[step];
  if (!expected) {
    return { kind: "noop" };
  }

  if (expected !== direction) {
    return { kind: "wrong", expected };
  }

  const delta = directionToDelta(direction);
  const nextPlayer = wrapPoint({ x: player.x + delta.x, y: player.y + delta.y }, runtime.bounds);

  let nextPathBlocks = pathBlocks;
  const currentCell = getCellAt(runtime, player);

  if (currentCell?.type === "blue" && pathBlocks.length > 0) {
    const movedPath = [...pathBlocks];
    const movableIndex = movedPath.length - 1;
    movedPath[movableIndex] = wrapPoint(
      {
        x: movedPath[movableIndex].x + delta.x,
        y: movedPath[movableIndex].y + delta.y,
      },
      runtime.bounds,
    );
    nextPathBlocks = movedPath;
  }

  return {
    kind: "correct",
    nextPlayer,
    nextPathBlocks,
    completedLevel: step + 1 >= runtime.moveSequence.length,
  };
}
