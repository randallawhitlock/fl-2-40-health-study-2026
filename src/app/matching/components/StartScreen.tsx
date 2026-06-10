import s from '../matching.module.css';

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${seconds}.${tenths}s`;
}

interface StartScreenProps {
  onStart: () => void;
  gamesPlayed: number;
  bestTimeMs: number | null;
  modules: string[];
  selectedModule: string;
  onModuleChange: (mod: string) => void;
}

export function StartScreen({
  onStart,
  gamesPlayed,
  bestTimeMs,
  modules,
  selectedModule,
  onModuleChange,
}: StartScreenProps) {
  return (
    <div className={s.startCard}>
      <h2>Match Terms to Definitions</h2>
      <p>
        Drag each term on the left and drop it onto the correct definition on
        the right.
      </p>

      <div className={s.moduleRow}>
        <label htmlFor="matching-module" style={{ marginRight: '0.5rem' }}>
          Module:
        </label>
        <select
          id="matching-module"
          value={selectedModule}
          onChange={e => onModuleChange(e.target.value)}
          className={s.moduleSelect}
        >
          {modules.map(mod => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      {gamesPlayed > 0 && (
        <div className={s.statsRow}>
          <span>🎮 {gamesPlayed} games played</span>
          {bestTimeMs !== null && <span>⚡ Best: {formatTime(bestTimeMs)}</span>}
        </div>
      )}

      <button onClick={onStart} className={s.startBtn}>
        {gamesPlayed > 0 ? 'Play Again' : 'Start Game'}
      </button>
    </div>
  );
}
