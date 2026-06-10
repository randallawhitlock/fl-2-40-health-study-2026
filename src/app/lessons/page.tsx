'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import lessonsData from '@/data/lessons.json';
import { useStudyStorage } from '@/lib/useStudyStorage';
import { PageShell } from '@/components';
import { ModuleSelector } from './components/ModuleSelector';
import { LessonContent } from './components/LessonContent';
import type { Lesson } from './types';
import s from './lessons.module.css';

const allLessons = lessonsData as Lesson[];
// Only show Day 1–3 lessons; hide upcoming/preview content
const lessons = allLessons.filter(l => l.category !== 'Coming Up Next');

/** Build a markdown document from the user's notes, grouped by lesson/section. */
function notesToMarkdown(
  notes: ReturnType<typeof useStudyStorage>['data']['lessonNotes'],
): string {
  const lines: string[] = ['# My Study Notes — FL 2-40 Health Exam', ''];
  for (const lesson of allLessons) {
    const lessonNotes = notes
      .filter(n => n.module === lesson.module)
      .sort((a, b) => a.sectionIndex - b.sectionIndex || a.blockIndex - b.blockIndex);
    if (lessonNotes.length === 0) continue;
    lines.push(`## ${lesson.module} — ${lesson.title}`, '');
    let lastSection = -1;
    for (const n of lessonNotes) {
      if (n.sectionIndex !== lastSection) {
        const heading = lesson.sections[n.sectionIndex]?.heading ?? 'Section';
        lines.push(`### ${heading}`, '');
        lastSection = n.sectionIndex;
      }
      lines.push(`- ${n.text.replace(/\n/g, '\n  ')}`, '');
    }
  }
  return lines.join('\n');
}

export default function LessonsPage() {
  const {
    data,
    updatePreferences,
    markLessonRead,
    saveLessonNote,
    deleteLessonNote,
  } = useStudyStorage();
  const [hydrated, setHydrated] = useState(false);
  const [selectedModule, setSelectedModule] = useState(lessons[0]?.module || '');
  const restoredScrollRef = useRef(false);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate last-viewed module from localStorage
  useEffect(() => {
    if (hydrated) return;
    const saved = data.preferences.lessonsSelectedModule;
    if (saved && lessons.some(l => l.module === saved)) {
      setSelectedModule(saved);
    }
    if (data.lastActivity !== '') setHydrated(true);
  }, [data.preferences.lessonsSelectedModule, data.lastActivity, hydrated]);

  // Restore reading position once, after hydration has rendered the lesson
  useEffect(() => {
    if (!hydrated || restoredScrollRef.current) return;
    restoredScrollRef.current = true;
    const y = data.preferences.lessonsScrollY;
    if (y > 0) {
      requestAnimationFrame(() => window.scrollTo(0, y));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  // Track scroll position (debounced) so a refresh returns to the same spot
  useEffect(() => {
    const onScroll = () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        updatePreferences({ lessonsScrollY: window.scrollY });
      }, 400);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, [updatePreferences]);

  // Mark lesson as read whenever the selected module changes
  useEffect(() => {
    if (selectedModule) {
      markLessonRead(selectedModule);
    }
  }, [selectedModule, markLessonRead]);

  const handleModuleSelect = (mod: string) => {
    setSelectedModule(mod);
    updatePreferences({ lessonsSelectedModule: mod, lessonsScrollY: 0 });
    window.scrollTo(0, 0);
  };

  const exportNotes = useCallback(() => {
    const md = notesToMarkdown(data.lessonNotes);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fl-2-40-study-notes.md';
    a.click();
    URL.revokeObjectURL(url);
  }, [data.lessonNotes]);

  const currentLesson = lessons.find(l => l.module === selectedModule);
  const noteCount = data.lessonNotes.length;

  return (
    <PageShell title="Lesson Reviews">
      <ModuleSelector
        modules={lessons.map(l => l.module)}
        selected={selectedModule}
        onSelect={handleModuleSelect}
        lessonsRead={data.lessonsRead}
        upcoming={lessons.filter(l => l.category === 'Coming Up Next').map(l => l.module)}
      />

      {noteCount > 0 && (
        <p className={s.exportRow}>
          <button className={s.exportBtn} onClick={exportNotes}>
            ⬇ Export my notes ({noteCount})
          </button>
        </p>
      )}

      {currentLesson ? (
        <LessonContent
          lesson={currentLesson}
          notes={data.lessonNotes}
          onSaveNote={saveLessonNote}
          onDeleteNote={deleteLessonNote}
        />
      ) : (
        <p className={s.emptyState}>Please select a lesson to read.</p>
      )}
    </PageShell>
  );
}
