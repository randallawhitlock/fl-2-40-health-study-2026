'use client';

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import flashcardsData from '@/data/flashcards.json';
import { shuffle } from '@/lib/utils';
import { useStudyStorage } from '@/lib/useStudyStorage';
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
  const { data, saveMatchingResult, updatePreferences } = useStudyStorage();
  const [started, setStarted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [selectedModule, setSelectedModule] = useState('All');

  // Hydrate module preference after mount
  useEffect(() => {
    if (hydrated) return;
    if (data.preferences.matchingModule) {
      setSelectedModule(data.preferences.matchingModule);
    }
    if (data.lastActivity !== '') setHydrated(true);
  }, [data.preferences.matchingModule, data.lastActivity, hydrated]);

  const modules = useMemo(
    () => ['All', ...Array.from(new Set(flashcardsData.map(f => f.module)))],
    []
  );

  const handleModuleChange = (mod: string) => {
    setSelectedModule(mod);
    updatePreferences({ matchingModule: mod });
  };
  const [terms, setTerms] = useState<Term[]>([]);
  const [defs, setDefs] = useState<Def[]>([]);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [wrongDef, setWrongDef] = useState<number | null>(null);
  const [roundStartTime, setRoundStartTime] = useState<number>(0);
  const [lastRoundTimeMs, setLastRoundTimeMs] = useState<number | null>(null);

  const defElemsRef = useRef<Map<number, HTMLDivElement>>(new Map());

  const handleMatch = useCallback((termId: number, defId: number) => {
    if (matched.has(defId)) return;
    if (termId === defId) {
      setMatched(prev => {
        const next = new Set(prev).add(termId);
        // Check if round is complete
        if (next.size === ROUND_SIZE) {
          const elapsed = Date.now() - roundStartTime;
          setLastRoundTimeMs(elapsed);
          saveMatchingResult(elapsed);
        }
        return next;
      });
    } else {
      setWrongDef(defId);
      setTimeout(() => setWrongDef(null), 600);
    }
  }, [matched, roundStartTime, saveMatchingResult]);

  const {
    activeDef,
    ghostRef,
    onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
    onTouchStart, onTouchMove, onTouchEnd,
  } = useDragAndDrop({ matched, onMatch: handleMatch, defElemsRef });

  const start = useCallback(() => {
    const pool = selectedModule === 'All'
      ? flashcardsData
      : flashcardsData.filter(f => f.module === selectedModule);
    const picked = shuffle(pool).slice(0, ROUND_SIZE);
    setTerms(picked.map((f, i) => ({ id: i, text: f.term })));
    setDefs(shuffle(picked.map((f, i) => ({ id: i, text: f.definition }))));
    setMatched(new Set());
    setWrongDef(null);
    setLastRoundTimeMs(null);
    defElemsRef.current.clear();
    setRoundStartTime(Date.now());
    setStarted(true);
  }, [selectedModule]);

  return (
    <PageShell title="Matching Exercise">
      {!started ? (
        <StartScreen
          onStart={start}
          gamesPlayed={data.matchingStats.gamesPlayed}
          bestTimeMs={data.matchingStats.bestTimeMs}
          modules={modules}
          selectedModule={selectedModule}
          onModuleChange={handleModuleChange}
        />
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
            <CompleteScreen
              onPlayAgain={start}
              timeMs={lastRoundTimeMs}
              bestTimeMs={data.matchingStats.bestTimeMs}
              gamesPlayed={data.matchingStats.gamesPlayed}
              streak={data.matchingStats.currentStreak}
            />
          )}
        </>
      )}

      <DragGhost ghostRef={ghostRef} />
    </PageShell>
  );
}
