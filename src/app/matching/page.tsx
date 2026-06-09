'use client';

import { useState, useRef, useCallback } from 'react';
import flashcardsData from '@/data/flashcards.json';
import { shuffle } from '@/lib/utils';
import { PageShell } from '@/components';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { StartScreen } from './components/StartScreen';
import { ScoreBar } from './components/ScoreBar';
import { GameBoard } from './components/GameBoard';
import { CompleteScreen } from './components/CompleteScreen';
import { DragGhost } from './components/DragGhost';
import type { Term, Def } from './types';

const ROUND_SIZE = 5;

export default function MatchingPage() {
  const [started, setStarted] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [defs, setDefs] = useState<Def[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongDef, setWrongDef] = useState<number | null>(null);

  const defElemsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleMatch = useCallback((termId: number, defId: number) => {
    if (matched.has(defId)) return;
    if (termId === defId) {
      setMatched(prev => new Set(prev).add(termId));
    } else {
      setWrongDef(defId);
      setTimeout(() => setWrongDef(null), 600);
    }
  }, [matched]);

  const {
    activeDef,
    ghostRef,
    onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
    onTouchStart, onTouchMove, onTouchEnd,
  } = useDragAndDrop({ matched, onMatch: handleMatch, defElemsRef });

  const start = useCallback(() => {
    const picked = shuffle(flashcardsData).slice(0, ROUND_SIZE);
    setTerms(picked.map((f, i) => ({ id: i, text: f.term })));
    setDefs(shuffle(picked.map((f, i) => ({ id: i, text: f.definition }))));
    setMatched(new Set());
    setWrongDef(null);
    defElemsRef.current.clear();
    setStarted(true);
  }, []);

  return (
    <PageShell title="Matching Exercise">
      {!started ? (
        <StartScreen onStart={start} />
      ) : (
        <>
          <ScoreBar matched={matched.size} total={ROUND_SIZE} />

          <GameBoard
            terms={terms}
            defs={defs}
            matched={matched}
            activeDef={activeDef}
            wrongDef={wrongDef}
            defElemsRef={defElemsRef}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          />

          {matched.size === ROUND_SIZE && (
            <CompleteScreen onPlayAgain={start} />
          )}
        </>
      )}

      <DragGhost ghostRef={ghostRef} />
    </PageShell>
  );
}
