import s from '../matching.module.css';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${seconds}.${tenths}s`;
}

interface CompleteScreenProps {
  onPlayAgain: () => void;
  timeMs: number | null;
  bestTimeMs: number | null;
  gamesPlayed: number;
  streak: number;
}

export function CompleteScreen({
  onPlayAgain,
  timeMs,
  bestTimeMs,
  gamesPlayed,
  streak,
}: CompleteScreenProps) {
  const isNewBest = timeMs !== null && bestTimeMs !== null && timeMs <= bestTimeMs;

  return (
    <div className={s.completeCard}>
      <h2>🎉 All Matched!</h2>

      {timeMs !== null && (
        <p className={s.completeStat}>
          ⏱️ Time: {formatTime(timeMs)}
          {isNewBest && <span className={s.newBest}> 🏆 New Best!</span>}
        </p>
      )}

      <div className={s.statsRow}>
        <span>🎮 {gamesPlayed} games</span>
        {bestTimeMs !== null && <span>⚡ Best: {formatTime(bestTimeMs)}</span>}
        {streak > 1 && <span>🔥 {streak} streak</span>}
      </div>

      <button onClick={onPlayAgain} className={s.startBtn}>
        Play Again
      </button>
    </div>
  );
}
