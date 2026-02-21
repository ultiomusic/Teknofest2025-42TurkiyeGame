import { useMemo } from "react";
import { keyOf } from "../game/helpers";
import type { Direction, LevelRuntime, Point } from "../types/game";

interface BoardProps {
  runtime: LevelRuntime;
  player: Point;
  pathBlocks: Point[];
  onMove: (direction: Direction) => void;
}

function toTransform(point: Point): string {
  return `translate(calc(${point.x} * (var(--cell-size) + var(--cell-gap)) + var(--cell-gap)), calc(${point.y} * (var(--cell-size) + var(--cell-gap)) + var(--cell-gap)))`;
}

export function Board({ runtime, player, pathBlocks, onMove }: BoardProps) {
  const cells = useMemo(() => {
    const list: Array<{ key: string; type: string }> = [];
    for (let y = 0; y < runtime.level.gridSize.y; y += 1) {
      for (let x = 0; x < runtime.level.gridSize.x; x += 1) {
        const cell = runtime.cellsByKey[keyOf({ x, y })];
        const type = cell?.type ?? "empty";
        list.push({ key: `${x}-${y}`, type });
      }
    }
    return list;
  }, [runtime]);

  return (
    <section className="board-section" aria-label="Oyun tahtası">
      <div
        className="board"
        style={{
          ["--grid-cols" as string]: runtime.level.gridSize.x,
          ["--grid-rows" as string]: runtime.level.gridSize.y,
        }}
      >
        {cells.map((cell) => (
          <div className={`cell cell--${cell.type}`} key={cell.key} />
        ))}

        {pathBlocks.map((block, index) => (
          <div
            className="path-block"
            key={`path-${index}`}
            style={{ transform: toTransform(block) }}
            aria-hidden="true"
          />
        ))}

        <div className="player" style={{ transform: toTransform(player) }} aria-label="Oyuncu" />
      </div>

      <div className="touch-controls" aria-label="Dokunmatik kontroller">
        <button className="btn btn--icon" onClick={() => onMove("up")}>
          ↑
        </button>
        <div className="touch-row">
          <button className="btn btn--icon" onClick={() => onMove("left")}>
            ←
          </button>
          <button className="btn btn--icon" onClick={() => onMove("down")}>
            ↓
          </button>
          <button className="btn btn--icon" onClick={() => onMove("right")}>
            →
          </button>
        </div>
      </div>
    </section>
  );
}
