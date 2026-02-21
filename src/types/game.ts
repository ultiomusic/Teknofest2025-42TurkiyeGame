export type Direction = "up" | "down" | "left" | "right";

export type CellType = "normal" | "yellow" | "blue" | "red" | "green" | "path";

export interface Point {
  x: number;
  y: number;
}

export interface GridCell extends Point {
  type: CellType;
}

export type RawSequenceToken = Direction | "end" | LoopToken;

export interface LoopToken {
  loop: {
    iteration: number;
    sequence: RawSequenceToken[];
  };
}

export interface Level {
  name: string;
  startPosition: Point;
  sequence: RawSequenceToken[];
  algorithm: string[];
  gridSize: Point;
  grid: GridCell[];
  uiHint?: string;
  parMoves?: number;
  tags?: string[];
}

export interface LevelConfig {
  levels: Record<string, Level>;
}

export interface SessionStats {
  score: number;
  combo: number;
  bestCombo: number;
  moves: number;
  highestLevelCompleted: number;
  startTime: number;
}

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface LevelRuntime {
  levelNumber: number;
  level: Level;
  moveSequence: Direction[];
  bounds: Bounds;
  pathBlocks: Point[];
  cellsByKey: Record<string, GridCell>;
}

export interface Feedback {
  tone: "error" | "info" | "success";
  text: string;
}

export type Phase =
  | "loading"
  | "running"
  | "levelComplete"
  | "sessionSuccess"
  | "sessionTimeout"
  | "error";

export interface UndoSnapshot {
  player: Point;
  step: number;
  pathBlocks: Point[];
  score: number;
  combo: number;
  bestCombo: number;
  moves: number;
}

export interface FinalDialog {
  title: string;
  message: string;
  detail?: string;
  highlight?: boolean;
}

export interface GameState {
  phase: Phase;
  levels: Record<number, Level>;
  levelNumbers: number[];
  runtime: LevelRuntime | null;
  currentLevel: number;
  player: Point;
  pathBlocks: Point[];
  step: number;
  session: SessionStats;
  undoStack: UndoSnapshot[];
  remainingMs: number;
  theme: "light" | "dark";
  feedback: Feedback | null;
  finalDialog: FinalDialog | null;
  loadingError: string | null;
}

export type MoveResult =
  | { kind: "noop" }
  | { kind: "wrong"; expected: Direction }
  | {
      kind: "correct";
      nextPlayer: Point;
      nextPathBlocks: Point[];
      completedLevel: boolean;
    };
