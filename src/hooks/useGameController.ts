import { useCallback, useMemo, useEffect, useReducer } from "react";
import type { Direction } from "../types/game";
import { STORAGE_KEYS } from "../game/constants";
import { getUrlLevel, setUrlLevel } from "../game/helpers";
import { createInitialState, gameReducer } from "../game/reducer";
import { loadLevels } from "../game/validation";

function readStoredNumber(key: string): number | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function getTheme(): "light" | "dark" {
  const stored = localStorage.getItem(STORAGE_KEYS.THEME);
  return stored === "light" ? "light" : "dark";
}

function getSessionStartTime(now: number): number {
  const stored = readStoredNumber(STORAGE_KEYS.START_TIME);
  if (stored === null) {
    localStorage.setItem(STORAGE_KEYS.START_TIME, String(now));
    localStorage.setItem(STORAGE_KEYS.HIGHEST_LEVEL, "0");
    return now;
  }
  return stored;
}

export function useGameController() {
  const [state, dispatch] = useReducer(gameReducer, createInitialState(getTheme()));

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const now = Date.now();
        const startTime = getSessionStartTime(now);
        const highestLevelCompleted = readStoredNumber(STORAGE_KEYS.HIGHEST_LEVEL) ?? 0;
        const { levels, levelNumbers } = await loadLevels();
        const initialLevel = getUrlLevel();

        if (!mounted) return;

        dispatch({
          type: "BOOTSTRAP_SUCCESS",
          payload: {
            levels,
            levelNumbers,
            initialLevel,
            startTime,
            highestLevelCompleted,
            now,
          },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Oyun başlatılırken hata oluştu.";
        dispatch({ type: "BOOTSTRAP_ERROR", message });
      }
    };

    void bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!state.levelNumbers.length) return;
    setUrlLevel(state.currentLevel);
  }, [state.currentLevel, state.levelNumbers.length]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, state.theme);
    document.body.classList.toggle("light", state.theme === "light");
  }, [state.theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HIGHEST_LEVEL, String(state.session.highestLevelCompleted));
  }, [state.session.highestLevelCompleted]);

  useEffect(() => {
    if (state.phase === "sessionSuccess" || state.phase === "sessionTimeout") {
      localStorage.removeItem(STORAGE_KEYS.START_TIME);
      localStorage.removeItem(STORAGE_KEYS.HIGHEST_LEVEL);
    }
  }, [state.phase]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      dispatch({ type: "TICK", now: Date.now() });
    }, 250);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (state.phase !== "levelComplete") return;

    const timeout = window.setTimeout(() => {
      dispatch({ type: "ADVANCE_LEVEL" });
    }, 1400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.phase]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
        event.preventDefault();
      }

      if (key === "z" || key === "Z") {
        dispatch({ type: "UNDO" });
        return;
      }

      if (key === "r" || key === "R") {
        dispatch({ type: "RESTART_LEVEL" });
        return;
      }

      const moveMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };

      if (moveMap[key]) {
        dispatch({ type: "MOVE", direction: moveMap[key] });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const move = useCallback((direction: Direction) => {
    dispatch({ type: "MOVE", direction });
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const restartLevel = useCallback(() => {
    dispatch({ type: "RESTART_LEVEL" });
  }, []);

  const restartSession = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(STORAGE_KEYS.START_TIME, String(now));
    localStorage.setItem(STORAGE_KEYS.HIGHEST_LEVEL, "0");
    dispatch({ type: "RESTART_SESSION", startTime: now, now });
  }, []);

  const toggleTheme = useCallback(() => {
    dispatch({
      type: "SET_THEME",
      theme: state.theme === "dark" ? "light" : "dark",
    });
  }, [state.theme]);

  const clearFeedback = useCallback(() => {
    dispatch({ type: "CLEAR_FEEDBACK" });
  }, []);

  const actions = useMemo(
    () => ({
      move,
      undo,
      restartLevel,
      restartSession,
      toggleTheme,
      clearFeedback,
    }),
    [clearFeedback, move, restartLevel, restartSession, toggleTheme, undo],
  );

  return { state, actions };
}
