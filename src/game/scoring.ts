import { SCORE_RULES } from "./constants";

export interface ScoreState {
  score: number;
  combo: number;
  bestCombo: number;
}

export function scoreCorrectMove(current: ScoreState): ScoreState {
  const nextCombo = current.combo + 1;
  const moveScore = SCORE_RULES.BASE_MOVE + nextCombo * SCORE_RULES.COMBO_MULTIPLIER;

  return {
    score: current.score + moveScore,
    combo: nextCombo,
    bestCombo: Math.max(current.bestCombo, nextCombo),
  };
}

export function scoreWrongMove(current: ScoreState): ScoreState {
  return {
    score: Math.max(0, current.score - SCORE_RULES.WRONG_MOVE_PENALTY),
    combo: 0,
    bestCombo: current.bestCombo,
  };
}

export function levelClearBonus(parMoves: number | undefined, actualMoves: number): number {
  const bonus = SCORE_RULES.LEVEL_CLEAR_BONUS;
  if (!parMoves) {
    return bonus;
  }

  const delta = Math.max(0, parMoves - actualMoves);
  return bonus + delta * SCORE_RULES.PAR_MOVE_BONUS;
}
