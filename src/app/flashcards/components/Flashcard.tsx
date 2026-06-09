import s from '../flashcards.module.css';

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ front, back, isFlipped, onFlip }: FlashcardProps) {
  return (
    <div className={s.flashcardContainer} onClick={onFlip}>
      <div className={`${s.flashcard} ${isFlipped ? s.flashcardFlipped : ''}`}>
        <div className={s.face}>{front}</div>
        <div className={`${s.face} ${s.back}`}>{back}</div>
      </div>
    </div>
  );
}
