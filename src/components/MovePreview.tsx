import { directionIcon } from "../game/sequence";
import type { Direction } from "../types/game";

interface MovePreviewProps {
  upcomingMoves: Direction[];
}

export function MovePreview({ upcomingMoves }: MovePreviewProps) {
  return (
    <section className="panel panel--preview" aria-label="Sıradaki hamleler">
      <h3>Sıradaki 3 Hamle</h3>
      <div className="preview-list">
        {upcomingMoves.length === 0 ? <span className="preview-empty">Tamamlandı</span> : null}
        {upcomingMoves.map((move, index) => (
          <span className="preview-item" key={`${move}-${index}`}>
            {directionIcon(move)}
          </span>
        ))}
      </div>
    </section>
  );
}
