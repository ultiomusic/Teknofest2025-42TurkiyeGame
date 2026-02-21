import type {
  CellType,
  Direction,
  GridCell,
  Level,
  LevelConfig,
  LoopToken,
  Point,
  RawSequenceToken,
} from "../types/game";

const directionValues: Direction[] = ["up", "down", "left", "right"];
const cellTypeValues: CellType[] = ["normal", "yellow", "blue", "red", "green", "path"];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asPoint(value: unknown, label: string): Point {
  if (!isObject(value) || typeof value.x !== "number" || typeof value.y !== "number") {
    throw new Error(`${label} alanı geçersiz.`);
  }
  return { x: Math.floor(value.x), y: Math.floor(value.y) };
}

function asGridCell(value: unknown): GridCell {
  if (!isObject(value) || typeof value.type !== "string") {
    throw new Error("grid hücrelerinden biri geçersiz.");
  }
  if (!cellTypeValues.includes(value.type as CellType)) {
    throw new Error(`Bilinmeyen hücre tipi: ${value.type}`);
  }
  const point = asPoint(value, "grid hücresi koordinatı");
  return { ...point, type: value.type as CellType };
}

function asLoopToken(value: unknown): LoopToken {
  if (!isObject(value) || !isObject(value.loop)) {
    throw new Error("Loop öğesi geçersiz.");
  }
  const iteration = value.loop.iteration;
  const sequence = value.loop.sequence;
  if (typeof iteration !== "number" || !Array.isArray(sequence)) {
    throw new Error("Loop alanları geçersiz.");
  }
  return {
    loop: {
      iteration: Math.max(0, Math.floor(iteration)),
      sequence: sequence.map(asSequenceToken),
    },
  };
}

function asSequenceToken(value: unknown): RawSequenceToken {
  if (typeof value === "string") {
    if (value === "end") return value;
    if (directionValues.includes(value as Direction)) return value as Direction;
    throw new Error(`Geçersiz hareket token: ${value}`);
  }
  return asLoopToken(value);
}

function asStringArray(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} alanı dizi olmalı.`);
  }
  return value.map((item) => {
    if (typeof item !== "string") {
      throw new Error(`${label} içinde metin olmayan öğe var.`);
    }
    return item;
  });
}

function asLevel(value: unknown): Level {
  if (!isObject(value)) {
    throw new Error("Seviye nesnesi geçersiz.");
  }
  if (typeof value.name !== "string") {
    throw new Error("Seviye adı eksik.");
  }

  const startPosition = asPoint(value.startPosition, "startPosition");
  const sequence = asStringOrLoopArray(value.sequence);
  const algorithm = asStringArray(value.algorithm, "algorithm");
  const gridSize = asPoint(value.gridSize, "gridSize");

  if (!Array.isArray(value.grid)) {
    throw new Error("grid alanı dizi olmalı.");
  }

  const grid = value.grid.map(asGridCell);
  const uiHint = typeof value.uiHint === "string" ? value.uiHint : undefined;
  const parMoves = typeof value.parMoves === "number" ? Math.max(1, Math.floor(value.parMoves)) : undefined;
  const tags = Array.isArray(value.tags)
    ? value.tags.filter((item): item is string => typeof item === "string")
    : undefined;

  return {
    name: value.name,
    startPosition,
    sequence,
    algorithm,
    gridSize,
    grid,
    uiHint,
    parMoves,
    tags,
  };
}

function asStringOrLoopArray(value: unknown): RawSequenceToken[] {
  if (!Array.isArray(value)) {
    throw new Error("sequence alanı dizi olmalı.");
  }
  return value.map(asSequenceToken);
}

function normalize(raw: LevelConfig): { levels: Record<number, Level>; levelNumbers: number[] } {
  if (!isObject(raw) || !isObject(raw.levels)) {
    throw new Error("levels.json içeriğinde 'levels' objesi bulunamadı.");
  }

  const parsed: Record<number, Level> = {};

  for (const [key, levelValue] of Object.entries(raw.levels)) {
    const levelNumber = Number(key);
    if (!Number.isFinite(levelNumber)) {
      continue;
    }

    try {
      parsed[levelNumber] = asLevel(levelValue);
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Bilinmeyen hata";
      console.warn(`Seviye ${key} yüklenemedi: ${reason}`);
    }
  }

  const levelNumbers = Object.keys(parsed)
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item))
    .sort((a, b) => a - b);

  if (levelNumbers.length === 0) {
    throw new Error("Geçerli seviye bulunamadı.");
  }

  return { levels: parsed, levelNumbers };
}

export async function loadLevels(path = "/data/levels.json") {
  const response = await fetch(path, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Seviye dosyası yüklenemedi.");
  }

  const data = (await response.json()) as LevelConfig;
  return normalize(data);
}
