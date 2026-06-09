import Link from 'next/link';
import { Card } from '@/components';
import s from '../quiz.module.css';

interface ResultScreenProps {
  score: number;
  total: number;
  onRetake: () => void;
  onChangeModules: () => void;
}

export function ResultScreen({ score, total, onRetake, onChangeModules }: ResultScreenProps) {
  const pct = Math.round((score / total) * 100);

  return (
    <Card>
      <h2>Your Score: {score} / {total}</h2>
      <p>{pct}%</p>
      <div className={s.resultActions}>
        <button onClick={onRetake} className="btn">
          Retake (New Variation)
        </button>
        <button onClick={onChangeModules} className={`btn ${s.secondaryBtn}`}>
          Change Modules
        </button>
        <Link href="/" className={`btn ${s.tertiaryBtn}`}>
          Home
        </Link>
      </div>
    </Card>
  );
}
