'use client';

import { useState, useEffect } from 'react';
import lessonsData from '@/data/lessons.json';
import { useStudyStorage } from '@/lib/useStudyStorage';
import { PageShell } from '@/components';
import { ModuleSelector } from './components/ModuleSelector';
import { LessonContent } from './components/LessonContent';
import type { Lesson } from './types';
import s from './lessons.module.css';

const lessons = lessonsData as Lesson[];

export default function LessonsPage() {
  const { data, updatePreferences, markLessonRead } = useStudyStorage();
  const [hydrated, setHydrated] = useState(false);
  const [selectedModule, setSelectedModule] = useState(lessons[0]?.module || '');

  // Hydrate last-viewed module from localStorage
  useEffect(() => {
    if (hydrated) return;
    const saved = data.preferences.lessonsSelectedModule;
    if (saved && lessons.some(l => l.module === saved)) {
      setSelectedModule(saved);
    }
    if (data.lastActivity !== '') setHydrated(true);
  }, [data.preferences.lessonsSelectedModule, data.lastActivity, hydrated]);

  // Mark lesson as read whenever the selected module changes
  useEffect(() => {
    if (selectedModule) {
      markLessonRead(selectedModule);
    }
  }, [selectedModule, markLessonRead]);

  const handleModuleSelect = (mod: string) => {
    setSelectedModule(mod);
    updatePreferences({ lessonsSelectedModule: mod });
  };

  const currentLesson = lessons.find(l => l.module === selectedModule);

  return (
    <PageShell title="Lesson Reviews">
      <ModuleSelector
        modules={lessons.map(l => l.module)}
        selected={selectedModule}
        onSelect={handleModuleSelect}
        lessonsRead={data.lessonsRead}
        upcoming={lessons.filter(l => l.category === 'Coming Up Next').map(l => l.module)}
      />

      {currentLesson ? (
        <LessonContent lesson={currentLesson} />
      ) : (
        <p className={s.emptyState}>Please select a lesson to read.</p>
      )}
    </PageShell>
  );
}
