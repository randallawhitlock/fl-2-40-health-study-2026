import type { LessonNote } from '@/lib/storage-types';
import type { Lesson as LessonType } from '../types';
import { LessonBlock } from './LessonBlock';
import { NoteSlot } from './NoteSlot';
import s from '../lessons.module.css';

interface LessonContentProps {
  lesson: LessonType;
  notes: LessonNote[];
  onSaveNote: (note: LessonNote) => void;
  onDeleteNote: (id: string) => void;
}

export function LessonContent({
  lesson,
  notes,
  onSaveNote,
  onDeleteNote,
}: LessonContentProps) {
  const notesAt = (sectionIndex: number, blockIndex: number) =>
    notes.filter(
      n =>
        n.module === lesson.module &&
        n.sectionIndex === sectionIndex &&
        n.blockIndex === blockIndex
    );

  return (
    <div className={s.lessonCard}>
      <h2 className={s.lessonTitle}>{lesson.title}</h2>
      {lesson.sections.map((section, i) => (
        <section key={i} className={s.section}>
          <h3 className={s.sectionHeading}>{section.heading}</h3>
          {section.blocks.map((block, j) => (
            <div key={j} className={s.blockWrap}>
              <LessonBlock block={block} />
              <NoteSlot
                module={lesson.module}
                sectionIndex={i}
                blockIndex={j}
                notes={notesAt(i, j)}
                onSave={onSaveNote}
                onDelete={onDeleteNote}
              />
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
