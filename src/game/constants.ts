export const GAME_DURATION_MS = 3 * 60 * 1000;

export const STORAGE_KEYS = {
  START_TIME: "gameStartTime",
  HIGHEST_LEVEL: "gameSessionHighestLevel",
  THEME: "theme",
} as const;

export const SCORE_RULES = {
  BASE_MOVE: 100,
  COMBO_MULTIPLIER: 20,
  WRONG_MOVE_PENALTY: 40,
  LEVEL_CLEAR_BONUS: 300,
  PAR_MOVE_BONUS: 50,
} as const;

export const SWIPE_THRESHOLD = 30;
