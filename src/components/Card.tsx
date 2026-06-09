import s from './shared.module.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Reusable card container with shadow and rounded corners.
 */
export function Card({ children, className, style }: CardProps) {
  return (
    <div className={`${s.card} ${className ?? ''}`} style={style}>
      {children}
    </div>
  );
}
