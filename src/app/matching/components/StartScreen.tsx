import s from '../matching.module.css';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  return (
    <div className={s.startCard}>
      <h2>Match Terms to Definitions</h2>
      <p>
        Drag each term on the left and drop it onto the correct definition on
        the right.
      </p>
      <button onClick={onStart} className={s.startBtn}>
        Start Game
      </button>
    </div>
  );
}
