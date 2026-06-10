'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import flashcardsData from '@/data/flashcards.json';
import { shuffle } from '@/lib/utils';
import { useStudyStorage } from '@/lib/useStudyStorage';
import type { FlashcardEntry, FlashcardStatus } from '@/lib/storage-types';
import { PageShell } from '@/components';
import { Flashcard } from './components/Flashcard';
import { FlashcardControls } from './components/FlashcardControls';
import { FlashcardNav } from './components/FlashcardNav';
import s from './flashcards.module.css';

type CardData = { module: string; term: string; definition: string };
const allCards = flashcardsData as CardData[];

const MASTERED: FlashcardStatus[] = ['known', 'easy', 'good'];

function isDue(entry: FlashcardEntry | undefined): boolean {
  if (!entry) return false; // unrated cards are "new", not "due"
  return new Date(entry.dueAt).getTime() <= Date.now();
}

export default function FlashcardsPage() {
  const { data, updatePreferences, markFlashcard } = useStudyStorage();
  const [hydrated, setHydrated] = useState(false);
  const [selectedModule, setSelectedModule] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [definitionFirst, setDefinitionFirst] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [cards, setCards] = useState<CardData[]>([...allCards]);

  const pendingIndexRef = useRef<number | null>(null);

  // Hydrate preferences from localStorage after mount
  useEffect(() => {
    if (hydrated) return;
    const prefs = data.preferences;
    if (prefs.flashcardModule) setSelectedModule(prefs.flashcardModule);
    if (prefs.flashcardDefinitionFirst) setDefinitionFirst(prefs.flashcardDefinitionFirst);
    if (prefs.flashcardShuffle) setIsShuffled(prefs.flashcardShuffle);
    if (prefs.flashcardDueOnly) setDueOnly(prefs.flashcardDueOnly);
    if (prefs.flashcardIndex > 0) pendingIndexRef.current = prefs.flashcardIndex;
    if (data.lastActivity !== '') setHydrated(true);
  }, [data.preferences, data.lastActivity, hydrated]);

  const modules = useMemo(() => {
    const mods = new Set(allCards.map(f => f.module));
    return ['All', ...Array.from(mods)];
  }, []);

  useEffect(() => {
    let filtered = selectedModule === 'All'
      ? [...allCards]
      : allCards.filter(f => f.module === selectedModule);

    if (dueOnly) {
      filtered = filtered.filter(f =>
        isDue(data.flashcardProgress[`${f.module}::${f.term}`])
      );
    }

    if (isShuffled) filtered = shuffle(filtered);

    setCards(filtered);
    // Restore the card the user was on before a refresh (first build only)
    const pending = pendingIndexRef.current;
    pendingIndexRef.current = null;
    setCurrentIndex(
      pending !== null && filtered.length > 0
        ? Math.min(pending, filtered.length - 1)
        : 0
    );
    setIsFlipped(false);
    // Intentionally NOT depending on flashcardProgress: rating a card
    // mid-session shouldn't yank it out of the deck.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedModule, isShuffled, dueOnly, hydrated]);

  const handleModuleChange = (mod: string) => {
    setSelectedModule(mod);
    updatePreferences({ flashcardModule: mod, flashcardIndex: 0 });
  };

  const handleToggleDefinitionFirst = () => {
    setDefinitionFirst(d => {
      const next = !d;
      updatePreferences({ flashcardDefinitionFirst: next });
      return next;
    });
    setIsFlipped(false);
  };

  const handleToggleShuffle = () => {
    setIsShuffled(prev => {
      const next = !prev;
      updatePreferences({ flashcardShuffle: next });
      return next;
    });
  };

  const handleToggleDueOnly = () => {
    setDueOnly(prev => {
      const next = !prev;
      updatePreferences({ flashcardDueOnly: next });
      return next;
    });
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => {
      const next = (prev + 1) % cards.length;
      updatePreferences({ flashcardIndex: next });
      return next;
    });
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => {
      const next = (prev - 1 + cards.length) % cards.length;
      updatePreferences({ flashcardIndex: next });
      return next;
    });
  };

  /** Rate the current card, then auto-advance. */
  const rateCard = (status: FlashcardStatus) => {
    if (!currentCard) return;
    markFlashcard(cardKey, status);
    if (cards.length > 1) nextCard();
  };

  const currentCard = cards[currentIndex];
  const cardKey = currentCard ? `${currentCard.module}::${currentCard.term}` : '';
  const cardEntry = data.flashcardProgress[cardKey];

  const front = definitionFirst ? currentCard?.definition : currentCard?.term;
  const back = definitionFirst ? currentCard?.term : currentCard?.definition;

  // Stats for the current module pool
  const { masteryCount, dueCount, poolSize } = useMemo(() => {
    const pool = selectedModule === 'All'
      ? allCards
      : allCards.filter(f => f.module === selectedModule);
    let mastered = 0, due = 0;
    for (const f of pool) {
      const entry = data.flashcardProgress[`${f.module}::${f.term}`];
      if (entry && MASTERED.includes(entry.status) && !isDue(entry)) mastered++;
      if (isDue(entry)) due++;
    }
    return { masteryCount: mastered, dueCount: due, poolSize: pool.length };
  }, [selectedModule, data.flashcardProgress]);

  const statusLabel: Record<FlashcardStatus, string> = {
    again: '🔁 Marked: Again',
    review: '🔄 Marked: Needs Review',
    good: '👍 Marked: Good',
    easy: '✅ Marked: Easy',
    known: '✅ Marked: Known',
  };

  return (
    <PageShell title="Study Flashcards">
      <FlashcardControls
        modules={modules}
        selectedModule={selectedModule}
        onModuleChange={handleModuleChange}
        definitionFirst={definitionFirst}
        onToggleDefinitionFirst={handleToggleDefinitionFirst}
        shuffled={isShuffled}
        onToggleShuffle={handleToggleShuffle}
        dueOnly={dueOnly}
        onToggleDueOnly={handleToggleDueOnly}
        dueCount={dueCount}
      />

      <p className={s.masteryCounter}>
        ✅ Mastered: {masteryCount} / {poolSize}
        {dueCount > 0 && <span> · 🔁 Due for review: {dueCount}</span>}
      </p>

      {cards.length > 0 ? (
        <>
          <Flashcard
            front={front}
            back={back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
          />

          <div className={s.masteryActions}>
            <button
              className={`${s.masteryBtn} ${s.masteryReview} ${cardEntry?.status === 'again' ? s.masteryActive : ''}`}
              onClick={() => rateCard('again')}
              title="See it again this session — due immediately"
            >
              🔁 Again
            </button>
            <button
              className={`${s.masteryBtn} ${cardEntry?.status === 'good' ? s.masteryActive : ''}`}
              onClick={() => rateCard('good')}
              title="Knew it with effort — due in 3 days"
            >
              👍 Good
            </button>
            <button
              className={`${s.masteryBtn} ${cardEntry?.status === 'easy' || cardEntry?.status === 'known' ? s.masteryActive : ''}`}
              onClick={() => rateCard('easy')}
              title="Knew it instantly — due in 7 days"
            >
              ✅ Easy
            </button>
          </div>

          {cardEntry && (
            <p className={s.cardStatus}>{statusLabel[cardEntry.status]}</p>
          )}

          <FlashcardNav
            current={currentIndex}
            total={cards.length}
            onPrev={prevCard}
            onNext={nextCard}
          />
        </>
      ) : (
        <p className={s.empty}>
          {dueOnly
            ? 'Nothing due for review — nice work. Uncheck "Due only" to browse all cards.'
            : 'No flashcards found for this module.'}
        </p>
      )}
    </PageShell>
  );
}
