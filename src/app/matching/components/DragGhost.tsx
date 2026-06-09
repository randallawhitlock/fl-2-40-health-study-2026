import s from '../matching.module.css';

interface DragGhostProps {
  ghostRef: React.RefObject<HTMLDivElement | null>;
}

/** Floating element that follows the finger during touch drag. */
export function DragGhost({ ghostRef }: DragGhostProps) {
  return <div ref={ghostRef} className={s.ghost} style={{ display: 'none' }} />;
}
