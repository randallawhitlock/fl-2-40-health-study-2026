import s from './shared.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
}

/**
 * Horizontal progress bar. Used by quiz and anywhere else
 * that needs to show advancement through a sequence.
 */
export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  return (
    <div className={s.progressWrap}>
      <div className={s.progressFill} style={{ width: `${pct}%` }} />
    </div>
  );
}
