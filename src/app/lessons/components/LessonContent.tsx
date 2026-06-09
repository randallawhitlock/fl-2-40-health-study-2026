import type { Lesson as LessonType } from '../types';
import { LessonBlock } from './LessonBlock';
import s from '../lessons.module.css';

interface LessonContentProps {
  lesson: LessonType;
}

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <div className={s.lessonCard}>
      <h2 className={s.lessonTitle}>{lesson.title}</h2>
      {lesson.sections.map((section, i) => (
        <section key={i} className={s.section}>
          <h3 className={s.sectionHeading}>{section.heading}</h3>
          {section.blocks.map((block, j) => (
            <LessonBlock key={j} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
