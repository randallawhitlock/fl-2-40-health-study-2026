'use client';

import { useState, useMemo, useEffect } from 'react';
import flashcardsData from '@/data/flashcards.json';
import { shuffle } from '@/lib/utils';
import { PageShell } from '@/components';
import { Flashcard } from './components/Flashcard';
import { FlashcardControls } from './components/FlashcardControls';
import { FlashcardNav } from './components/FlashcardNav';
import s from './flashcards.module.css';

export default function FlashcardsPage() {
  const [selectedModule, setSelectedModule] = useState('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [definitionFirst, setDefinitionFirst] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [cards, setCards] = useState([...flashcardsData]);

  const modules = useMemo(() => {
    const mods = new Set(flashcardsData.map(f => f.module));
    return ['All', ...Array.from(mods)];
  }, []);

  useEffect(() => {
    let filtered = selectedModule === 'All'
      ? [...flashcardsData]
      : flashcardsData.filter(f => f.module === selectedModule);

    if (isShuffled) filtered = shuffle(filtered);

    setCards(filtered);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedModule, isShuffled]);

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  };

  const currentCard = cards[currentIndex];
  const front = definitionFirst ? currentCard?.definition : currentCard?.term;
  const back = definitionFirst ? currentCard?.term : currentCard?.definition;

  return (
    <PageShell title="Study Flashcards">
      <FlashcardControls
        modules={modules}
        selectedModule={selectedModule}
        onModuleChange={setSelectedModule}
        definitionFirst={definitionFirst}
        onToggleDefinitionFirst={() => { setDefinitionFirst(d => !d); setIsFlipped(false); }}
        shuffled={isShuffled}
        onToggleShuffle={() => setIsShuffled(s => !s)}
      />

      {cards.length > 0 ? (
        <>
          <Flashcard
            front={front}
            back={back}
            isFlipped={isFlipped}
            onFlip={() => setIsFlipped(f => !f)}
          />
          <FlashcardNav
            current={currentIndex}
            total={cards.length}
            onPrev={prevCard}
            onNext={nextCard}
          />
        </>
      ) : (
        <p className={s.empty}>No flashcards found for this module.</p>
      )}
    </PageShell>
  );
}
