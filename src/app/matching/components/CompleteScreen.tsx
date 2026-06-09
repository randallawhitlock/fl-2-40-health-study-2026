import s from '../matching.module.css';

interface CompleteScreenProps {
  onPlayAgain: () => void;
}

export function CompleteScreen({ onPlayAgain }: CompleteScreenProps) {
  return (
    <div className={s.completeCard}>
      <h2>🎉 All Matched!</h2>
      <p>Great work! You matched all 5 correctly.</p>
      <button onClick={onPlayAgain} className={s.startBtn}>
        Play Again
      </button>
    </div>
  );
}
