import { renderInlineText } from '@/lib/renderInlineText';
import type { Block } from '../types';
import s from '../lessons.module.css';

interface LessonBlockProps {
  block: Block;
}

export function LessonBlock({ block }: LessonBlockProps) {
  switch (block.type) {
    case 'p':
      return (
        <p className={s.paragraph}>
          {renderInlineText(block.text)}
        </p>
      );
    case 'list':
      return (
        <ul className={s.list}>
          {block.items.map((item, j) => (
            <li key={j} className={s.listItem}>{renderInlineText(item)}</li>
          ))}
        </ul>
      );
    case 'tip':
      return (
        <div className={s.tip}>
          <span className={s.tipLabel}>Exam Tip: </span>
          {renderInlineText(block.text)}
        </div>
      );
    default:
      return null;
  }
}
