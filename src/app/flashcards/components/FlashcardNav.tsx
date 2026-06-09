import s from '../flashcards.module.css';

interface FlashcardNavProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}

export function FlashcardNav({ current, total, onPrev, onNext }: FlashcardNavProps) {
  return (
    <div className={s.nav}>
      <p className={s.navCounter}>
        Card {current + 1} of {total}
      </p>
      <div className={s.navButtons}>
        <button onClick={onPrev} className="btn">Previous</button>
        <button onClick={onNext} className="btn">Next</button>
      </div>
    </div>
  );
}
