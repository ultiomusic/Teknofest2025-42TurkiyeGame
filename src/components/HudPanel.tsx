import { formatTime } from "../game/helpers";

interface HudPanelProps {
  levelName: string;
  levelNumber: number;
  totalLevels: number;
  score: number;
  combo: number;
  bestCombo: number;
  remainingMs: number;
  moveProgressText: string;
  parMoves?: number;
  onUndo: () => void;
  onRestartLevel: () => void;
  undoDisabled: boolean;
}

export function HudPanel({
  levelName,
  levelNumber,
  totalLevels,
  score,
  combo,
  bestCombo,
  remainingMs,
  moveProgressText,
  parMoves,
  onUndo,
  onRestartLevel,
  undoDisabled,
}: HudPanelProps) {
  return (
    <section className="panel panel--hud" aria-label="Oyun paneli">
      <div className="hud-head">
        <h2>
          Seviye {levelNumber}/{totalLevels}
        </h2>
        <p>{levelName}</p>
      </div>

      <div className="hud-grid">
        <div className="hud-stat">
          <span>Süre</span>
          <strong>{formatTime(remainingMs)}</strong>
        </div>
        <div className="hud-stat">
          <span>Skor</span>
          <strong>{score}</strong>
        </div>
        <div className="hud-stat">
          <span>Combo</span>
          <strong>x{combo}</strong>
        </div>
        <div className="hud-stat">
          <span>En İyi Combo</span>
          <strong>x{bestCombo}</strong>
        </div>
      </div>

      <p className="hud-progress">İlerleme: {moveProgressText}</p>
      {parMoves ? <p className="hud-par">Par hedefi: {parMoves} hamle</p> : null}

      <div className="hud-actions">
        <button className="btn" onClick={onUndo} disabled={undoDisabled}>
          Hamleyi Geri Al (Z)
        </button>
        <button className="btn" onClick={onRestartLevel}>
          Seviyeyi Yeniden Başlat (R)
        </button>
      </div>
    </section>
  );
}
