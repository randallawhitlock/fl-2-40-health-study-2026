import { useCallback } from 'react';
import type { Def, Term } from '../types';
import s from '../matching.module.css';

interface DropZoneProps {
  def: Def;
  isMatched: boolean;
  isActive: boolean;
  isWrong: boolean;
  matchedTerm: Term | null;
  onDragOver: (e: React.DragEvent, defId: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, defId: number) => void;
  /** Registers the DOM element for touch hit-testing */
  registerRef: (id: number, el: HTMLDivElement | null) => void;
}

export function DropZone({
  def,
  isMatched,
  isActive,
  isWrong,
  matchedTerm,
  onDragOver,
  onDragLeave,
  onDrop,
  registerRef,
}: DropZoneProps) {
  const handleRef = useCallback(
    (el: HTMLDivElement | null) => registerRef(def.id, el),
    [def.id, registerRef],
  );

  const className = [
    s.dropZone,
    isActive ? s.dropZoneActive : '',
    isMatched ? s.dropZoneMatched : '',
    isWrong ? s.dropZoneWrong : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={handleRef}
      onDragOver={e => onDragOver(e, def.id)}
      onDragLeave={onDragLeave}
      onDrop={e => onDrop(e, def.id)}
      className={className}
    >
      {matchedTerm && (
        <div className={s.matchedTag}>✓ {matchedTerm.text}</div>
      )}
      {def.text}
    </div>
  );
}
