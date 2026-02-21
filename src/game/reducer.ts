import type { Direction, GameState, Level, LevelRuntime } from "../types/game";
import { GAME_DURATION_MS } from "./constants";
import { wrongMoveMessage, successMessage, timeoutDialog } from "./messages";
import { resolveMove, buildRuntime } from "./runtime";
import { levelClearBonus, scoreCorrectMove, scoreWrongMove } from "./scoring";

function setupLevel(levelNumber: number, level: Level): Pick<GameState, "runtime" | "player" | "pathBlocks" | "step" | "undoStack"> {
  const runtime = buildRuntime(levelNumber, level);
  return {
    runtime,
    player: { ...level.startPosition },
    pathBlocks: runtime.pathBlocks.map((item) => ({ ...item })),
    step: 0,
    undoStack: [],
  };
}

function firstLevel(levelNumbers: number[]): number {
  return levelNumbers[0] ?? 1;
}

function nextLevel(currentLevel: number, levelNumbers: number[]): number {
  const currentIndex = levelNumbers.indexOf(currentLevel);
  const nextIndex = currentIndex + 1;
  return levelNumbers[nextIndex] ?? currentLevel;
}

function deriveRemaining(startTime: number, now: number): number {
  return Math.max(0, GAME_DURATION_MS - (now - startTime));
}

export function createInitialState(theme: "light" | "dark"): GameState {
  return {
    phase: "loading",
    levels: {},
    levelNumbers: [],
    runtime: null,
    currentLevel: 1,
    player: { x: 0, y: 0 },
    pathBlocks: [],
    step: 0,
    session: {
      score: 0,
      combo: 0,
      bestCombo: 0,
      moves: 0,
      highestLevelCompleted: 0,
      startTime: Date.now(),
    },
    undoStack: [],
    remainingMs: GAME_DURATION_MS,
    theme,
    feedback: null,
    finalDialog: null,
    loadingError: null,
  };
}

export type GameAction =
  | {
      type: "BOOTSTRAP_SUCCESS";
      payload: {
        levels: Record<number, Level>;
        levelNumbers: number[];
        initialLevel: number;
        startTime: number;
        highestLevelCompleted: number;
        now: number;
      };
    }
  | { type: "BOOTSTRAP_ERROR"; message: string }
  | { type: "MOVE"; direction: Direction }
  | { type: "UNDO" }
  | { type: "RESTART_LEVEL" }
  | { type: "ADVANCE_LEVEL" }
  | { type: "RESTART_SESSION"; startTime: number; now: number }
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "CLEAR_FEEDBACK" }
  | { type: "TICK"; now: number };

function toTimeoutState(state: GameState, runtime: LevelRuntime | null): GameState {
  const dialog = timeoutDialog(state.session.highestLevelCompleted, state.levelNumbers.length);
  return {
    ...state,
    phase: "sessionTimeout",
    finalDialog: dialog,
    feedback: null,
    runtime,
    remainingMs: 0,
  };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "BOOTSTRAP_SUCCESS": {
      const { levels, levelNumbers, initialLevel, startTime, highestLevelCompleted, now } = action.payload;
      const hasInitial = levelNumbers.includes(initialLevel);
      const selectedLevel = hasInitial ? initialLevel : firstLevel(levelNumbers);
      const selectedData = levels[selectedLevel];
      const levelState = setupLevel(selectedLevel, selectedData);

      const baseState: GameState = {
        ...state,
        ...levelState,
        phase: "running",
        levels,
        levelNumbers,
        currentLevel: selectedLevel,
        session: {
          score: 0,
          combo: 0,
          bestCombo: 0,
          moves: 0,
          highestLevelCompleted,
          startTime,
        },
        remainingMs: deriveRemaining(startTime, now),
        feedback: selectedData.uiHint
          ? { tone: "info", text: selectedData.uiHint }
          : { tone: "info", text: "Hedef: Hamleleri doğru sırayla tamamla." },
        finalDialog: null,
        loadingError: null,
      };

      if (baseState.remainingMs <= 0) {
        return toTimeoutState(baseState, levelState.runtime);
      }

      return baseState;
    }

    case "BOOTSTRAP_ERROR":
      return {
        ...state,
        phase: "error",
        loadingError: action.message,
      };

    case "MOVE": {
      if (state.phase !== "running" || !state.runtime) {
        return state;
      }

      const move = resolveMove(state.runtime, state.player, state.pathBlocks, state.step, action.direction);
      if (move.kind === "noop") {
        return state;
      }

      if (move.kind === "wrong") {
        const scoreState = scoreWrongMove(state.session);

        return {
          ...state,
          player: { ...state.runtime.level.startPosition },
          pathBlocks: state.runtime.pathBlocks.map((item) => ({ ...item })),
          step: 0,
          undoStack: [],
          session: {
            ...state.session,
            ...scoreState,
            moves: state.session.moves + 1,
          },
          feedback: {
            tone: "error",
            text: wrongMoveMessage(move.expected, action.direction),
          },
        };
      }

      const snapshot = {
        player: state.player,
        step: state.step,
        pathBlocks: state.pathBlocks,
        score: state.session.score,
        combo: state.session.combo,
        bestCombo: state.session.bestCombo,
        moves: state.session.moves,
      };

      const scoreState = scoreCorrectMove(state.session);
      const nextStep = state.step + 1;
      const completed = move.completedLevel;

      const updatedSession = {
        ...state.session,
        ...scoreState,
        moves: state.session.moves + 1,
      };

      if (!completed) {
        return {
          ...state,
          player: move.nextPlayer,
          pathBlocks: move.nextPathBlocks,
          step: nextStep,
          undoStack: [...state.undoStack, snapshot],
          session: updatedSession,
          feedback: null,
        };
      }

      const bonus = levelClearBonus(state.runtime.level.parMoves, nextStep);
      const highestLevelCompleted = Math.max(state.session.highestLevelCompleted, state.currentLevel);
      const isLastLevel = state.currentLevel === state.levelNumbers[state.levelNumbers.length - 1];

      if (isLastLevel) {
        return {
          ...state,
          phase: "sessionSuccess",
          player: move.nextPlayer,
          pathBlocks: move.nextPathBlocks,
          step: nextStep,
          undoStack: [...state.undoStack, snapshot],
          session: {
            ...updatedSession,
            score: updatedSession.score + bonus,
            highestLevelCompleted,
          },
          feedback: null,
          finalDialog: {
            title: "🎉 Tebrikler!",
            message: "Tebrikler seni de yazılım dünyasına bekliyoruz",
            detail: "Tüm seviyeleri başarıyla tamamladın!",
            highlight: true,
          },
        };
      }

      return {
        ...state,
        phase: "levelComplete",
        player: move.nextPlayer,
        pathBlocks: move.nextPathBlocks,
        step: nextStep,
        undoStack: [...state.undoStack, snapshot],
        session: {
          ...updatedSession,
          score: updatedSession.score + bonus,
          highestLevelCompleted,
        },
        feedback: {
          tone: "success",
          text: successMessage(state.runtime.level.name),
        },
      };
    }

    case "UNDO": {
      if (state.phase !== "running") {
        return state;
      }
      const lastSnapshot = state.undoStack[state.undoStack.length - 1];
      if (!lastSnapshot) {
        return state;
      }

      return {
        ...state,
        player: lastSnapshot.player,
        pathBlocks: lastSnapshot.pathBlocks,
        step: lastSnapshot.step,
        undoStack: state.undoStack.slice(0, -1),
        session: {
          ...state.session,
          score: lastSnapshot.score,
          combo: lastSnapshot.combo,
          bestCombo: lastSnapshot.bestCombo,
          moves: lastSnapshot.moves,
        },
        feedback: { tone: "info", text: "Son doğru hamle geri alındı." },
      };
    }

    case "RESTART_LEVEL": {
      if (!state.runtime) return state;
      const setup = setupLevel(state.currentLevel, state.runtime.level);
      return {
        ...state,
        ...setup,
        phase: "running",
        feedback: { tone: "info", text: "Seviye baştan başlatıldı." },
        session: {
          ...state.session,
          combo: 0,
        },
      };
    }

    case "ADVANCE_LEVEL": {
      if (state.phase !== "levelComplete") return state;
      const candidate = nextLevel(state.currentLevel, state.levelNumbers);
      const levelData = state.levels[candidate];
      if (!levelData) {
        return state;
      }
      const setup = setupLevel(candidate, levelData);
      return {
        ...state,
        ...setup,
        phase: "running",
        currentLevel: candidate,
        feedback: levelData.uiHint
          ? { tone: "info", text: levelData.uiHint }
          : { tone: "info", text: `${candidate}. seviyeye geçildi.` },
        session: {
          ...state.session,
          combo: 0,
        },
      };
    }

    case "RESTART_SESSION": {
      const levelNumber = firstLevel(state.levelNumbers);
      const levelData = state.levels[levelNumber];
      if (!levelData) return state;
      const setup = setupLevel(levelNumber, levelData);
      return {
        ...state,
        ...setup,
        phase: "running",
        currentLevel: levelNumber,
        finalDialog: null,
        feedback: { tone: "info", text: "Yeni oturum başladı." },
        remainingMs: deriveRemaining(action.startTime, action.now),
        session: {
          score: 0,
          combo: 0,
          bestCombo: 0,
          moves: 0,
          highestLevelCompleted: 0,
          startTime: action.startTime,
        },
      };
    }

    case "SET_THEME":
      return {
        ...state,
        theme: action.theme,
      };

    case "CLEAR_FEEDBACK":
      return {
        ...state,
        feedback: null,
      };

    case "TICK": {
      if (state.phase === "loading" || state.phase === "error") {
        return state;
      }

      const remaining = deriveRemaining(state.session.startTime, action.now);
      if (remaining <= 0 && state.phase !== "sessionSuccess" && state.phase !== "sessionTimeout") {
        return toTimeoutState(state, state.runtime);
      }

      return {
        ...state,
        remainingMs: remaining,
      };
    }

    default:
      return state;
  }
}
