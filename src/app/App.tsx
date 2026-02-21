import { useEffect } from "react";
import { AlgorithmPanel } from "../components/AlgorithmPanel";
import { Board } from "../components/Board";
import { HudPanel } from "../components/HudPanel";
import { MovePreview } from "../components/MovePreview";
import { OverlayDialog } from "../components/OverlayDialog";
import { useGameController } from "../hooks/useGameController";
import { useSwipe } from "../hooks/useSwipe";

export function App() {
  const { state, actions } = useGameController();
  const swipeRef = useSwipe<HTMLDivElement>(actions.move);

  useEffect(() => {
    if (!state.feedback) return;
    const timeout = window.setTimeout(() => {
      actions.clearFeedback();
    }, 2400);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [actions, state.feedback]);

  if (state.phase === "loading") {
    return (
      <main className="state-screen">
        <p>Oyun yükleniyor...</p>
      </main>
    );
  }

  if (state.phase === "error") {
    return (
      <main className="state-screen state-screen--error">
        <h1>Yükleme Hatası</h1>
        <p>{state.loadingError ?? "Bilinmeyen hata"}</p>
      </main>
    );
  }

  if (!state.runtime) {
    return (
      <main className="state-screen state-screen--error">
        <h1>Seviye Verisi Yok</h1>
      </main>
    );
  }

  const runtime = state.runtime;
  const totalMoves = runtime.moveSequence.length;
  const completedMoves = Math.min(state.step, totalMoves);
  const upcomingMoves = runtime.moveSequence.slice(state.step, state.step + 3);

  const finalDialog = state.finalDialog;

  return (
    <main className="app">
      <img src="/assets/logo-bv-dark.png" alt="Bilişim Vadisi logosu" className="corner-logo logo-left logo-dark" />
      <img src="/assets/logo-bv-light.png" alt="Bilişim Vadisi logosu" className="corner-logo logo-left logo-light" />
      <img src="/assets/logo-42-dark.png" alt="42 Türkiye logosu" className="corner-logo logo-right logo-dark" />
      <img src="/assets/logo-42-light.png" alt="42 Türkiye logosu" className="corner-logo logo-right logo-light" />

      <div className="corner-controls">
        <button className="theme-toggle" onClick={actions.toggleTheme} aria-label="Tema değiştir">
          {state.theme === "dark" ? "🌞" : "🌙"}
        </button>
        <button className="theme-toggle" onClick={actions.restartLevel} aria-label="Seviyeyi yeniden başlat">
          🔄
        </button>
      </div>

      <div className="layout">
        <div className={`board-wrap ${state.phase === "levelComplete" ? "board-wrap--complete" : ""}`} ref={swipeRef}>
          <Board runtime={runtime} player={state.player} pathBlocks={state.pathBlocks} onMove={actions.move} />

          <OverlayDialog
            open={state.phase === "levelComplete"}
            title="🏁 Bölüm Tamamlandı"
            message="Sıradaki bölüme geçiliyor..."
            detail="Akışı aynı tempoda sürdür."
            highlight
          />
        </div>

        <aside className="sidebar">
          <HudPanel
            levelName={runtime.level.name}
            levelNumber={state.currentLevel}
            totalLevels={state.levelNumbers.length}
            score={state.session.score}
            combo={state.session.combo}
            bestCombo={state.session.bestCombo}
            remainingMs={state.remainingMs}
            moveProgressText={`${completedMoves}/${totalMoves}`}
            parMoves={runtime.level.parMoves}
            onUndo={actions.undo}
            onRestartLevel={actions.restartLevel}
            undoDisabled={state.undoStack.length === 0 || state.phase !== "running"}
          />

          <MovePreview upcomingMoves={upcomingMoves} />
          <AlgorithmPanel lines={runtime.level.algorithm} />
        </aside>
      </div>

      <div className="live-region" aria-live="polite" aria-atomic="true">
        {state.feedback ? <p className={`feedback feedback--${state.feedback.tone}`}>{state.feedback.text}</p> : null}
      </div>

      <OverlayDialog
        open={state.phase === "sessionSuccess" || state.phase === "sessionTimeout"}
        title={finalDialog?.title ?? "Oyun Bitti"}
        message={finalDialog?.message ?? ""}
        detail={finalDialog?.detail}
        highlight={finalDialog?.highlight}
        primaryActionLabel="Yeniden Başla"
        onPrimaryAction={actions.restartSession}
      />
    </main>
  );
}
