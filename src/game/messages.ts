import type { Direction, FinalDialog } from "../types/game";
import { directionLabel } from "./sequence";

export function wrongMoveMessage(expected: Direction, actual: Direction): string {
  return `Yanlış hamle: ${directionLabel(actual)}. Beklenen: ${directionLabel(expected)}.`;
}

export function successMessage(levelName: string): string {
  return `${levelName} tamamlandı. Harika ilerliyorsun.`;
}

export function timeoutDialog(highestLevelCompleted: number, totalLevels: number): FinalDialog {
  if (highestLevelCompleted >= 4) {
    return {
      title: "🎉 Tebrikler!",
      message: "Tebrikler seni de yazılım dünyasına bekliyoruz",
      detail:
        highestLevelCompleted >= totalLevels
          ? "Tüm seviyeleri başarıyla tamamladın!"
          : `4. seviyeyi geçtin. En yüksek tamamlanan seviye: ${highestLevelCompleted}.`,
      highlight: true,
    };
  }

  return {
    title: "⏰ Süre Doldu",
    message: "3 dakikalık oyun süresi sona erdi.",
    detail:
      highestLevelCompleted > 0
        ? `Tamamladığın son seviye: ${highestLevelCompleted}.`
        : "Bu turda herhangi bir seviye tamamlanamadı.",
    highlight: false,
  };
}
