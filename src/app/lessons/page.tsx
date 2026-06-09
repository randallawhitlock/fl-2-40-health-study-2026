'use client';

import { useState } from 'react';
import lessonsData from '@/data/lessons.json';
import { PageShell } from '@/components';
import { ModuleSelector } from './components/ModuleSelector';
import { LessonContent } from './components/LessonContent';
import type { Lesson } from './types';
import s from './lessons.module.css';

const lessons = lessonsData as Lesson[];

export default function LessonsPage() {
  const [selectedModule, setSelectedModule] = useState(lessons[0]?.module || '');
  const currentLesson = lessons.find(l => l.module === selectedModule);

  return (
    <PageShell title="Lesson Reviews">
      <ModuleSelector
        modules={lessons.map(l => l.module)}
        selected={selectedModule}
        onSelect={setSelectedModule}
      />

      {currentLesson ? (
        <LessonContent lesson={currentLesson} />
      ) : (
        <p className={s.emptyState}>Please select a lesson to read.</p>
      )}
    </PageShell>
  );
}
