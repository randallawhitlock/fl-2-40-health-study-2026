import { useCallback } from 'react';
import type { Term, Def } from '../types';
import { TermChip } from './TermChip';
import { DropZone } from './DropZone';
import s from '../matching.module.css';

interface GameBoardProps {
  terms: Term[];
  defs: Def[];
  matched: Set<number>;
  activeDef: number | null;
  wrongDef: number | null;
  defElemsRef: React.MutableRefObject<Map<number, HTMLDivElement>>;
  // HTML5 drag
  onDragStart: (e: React.DragEvent, id: number) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent, defId: number) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, defId: number) => void;
  // Touch
  onTouchStart: (e: React.TouchEvent, term: Term) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function GameBoard({
  terms,
  defs,
  matched,
  activeDef,
  wrongDef,
  defElemsRef,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}: GameBoardProps) {
  const registerRef = useCallback(
    (id: number, el: HTMLDivElement | null) => {
      if (el) defElemsRef.current.set(id, el);
    },
    [defElemsRef],
  );

  return (
    <div className={s.board}>
      {/* Terms column */}
      <div className={s.column}>
        <div className={s.columnLabel}>Terms</div>
        {terms.map(t => (
          <TermChip
            key={t.id}
            term={t}
            isMatched={matched.has(t.id)}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />
        ))}
      </div>

      {/* Definitions column */}
      <div className={s.column}>
        <div className={s.columnLabel}>Definitions</div>
        {defs.map(d => (
          <DropZone
            key={d.id}
            def={d}
            isMatched={matched.has(d.id)}
            isActive={activeDef === d.id && !matched.has(d.id)}
            isWrong={wrongDef === d.id}
            matchedTerm={matched.has(d.id) ? terms.find(t => t.id === d.id) ?? null : null}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            registerRef={registerRef}
          />
        ))}
      </div>
    </div>
  );
}
