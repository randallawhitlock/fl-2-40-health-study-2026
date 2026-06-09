import s from '../matching.module.css';

interface ScoreBarProps {
  matched: number;
  total: number;
}

export function ScoreBar({ matched, total }: ScoreBarProps) {
  return (
    <div className={s.scoreBar}>
      <div>
        Matched: <span>{matched}</span> / {total}
      </div>
    </div>
  );
}
