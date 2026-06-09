import type { Term } from '../types';
import s from '../matching.module.css';

interface TermChipProps {
  term: Term;
  isMatched: boolean;
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onTouchStart: (e: React.TouchEvent, term: Term) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function TermChip({
  term,
  isMatched,
  onDragStart,
  onDragEnd,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: TermChipProps) {
  return (
    <div
      draggable={!isMatched}
      onDragStart={e => onDragStart(e, term.id)}
      onDragEnd={onDragEnd}
      onTouchStart={e => onTouchStart(e, term)}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className={`${s.termChip} ${isMatched ? s.termChipMatched : ''}`}
    >
      {term.text}
    </div>
  );
}
