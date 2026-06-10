'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import type { QuizAttempt, MissedQuestion, QuizMode } from '@/lib/storage-types';
import s from '../quiz.module.css';

interface ResultScreenProps {
  score: number;
  total: number;
  onRetake: () => void;
  onChangeModules: () => void;
  quizHistory: QuizAttempt[];
  selectedModules: string[];
  missed: MissedQuestion[];
  mode: QuizMode;
  timeUsedMs?: number;
}

function getTrend(history: QuizAttempt[]): { label: string; emoji: string } {
  if (history.length < 2) return { label: 'First attempt', emoji: '🎯' };
  const recent = history.slice(0, 5).map(h => h.percentage);
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const prevAvg = recent.slice(1).reduce((a, b) => a + b, 0) / (recent.length - 1);
  if (avg > prevAvg + 3) return { label: 'Improving', emoji: '📈' };
  if (avg < prevAvg - 3) return { label: 'Needs practice', emoji: '📉' };
  return { label: 'Steady', emoji: '➡️' };
}

function formatClock(ms: number): string {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export function ResultScreen({
  score,
  total,
  onRetake,
  onChangeModules,
  quizHistory,
  selectedModules,
  missed,
  mode,
  timeUsedMs,
}: ResultScreenProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showMissed, setShowMissed] = useState(missed.length > 0);
  const pct = Math.round((score / total) * 100);

  // Filter history to attempts that share at least one module with current selection
  const relevantHistory =
    mode === 'practice'
      ? quizHistory.filter(a => a.modules.some(m => selectedModules.includes(m)))
      : quizHistory.filter(a => a.mode === mode);
  const trend = getTrend(relevantHistory);
  const chartData = relevantHistory.slice(0, 10).reverse();

  return (
    <>
      <Card>
        <h2>Your Score: {score} / {total}</h2>
        <p className={s.scorePercent}>{pct}%</p>

        {mode === 'timed' && timeUsedMs !== undefined && (
          <p className={s.timeUsed}>⏱️ Time used: {formatClock(timeUsedMs)}</p>
        )}

        {relevantHistory.length > 1 && (
          <p className={s.trendBadge}>
            {trend.emoji} {trend.label}
          </p>
        )}

        {chartData.length > 1 && (
          <div className={s.trendChart} title="Last attempts, oldest → newest">
            {chartData.map((a, i) => (
              <div key={i} className={s.trendBarWrap}>
                <div
                  className={s.trendBar}
                  style={{
                    height: `${Math.max(a.percentage, 4)}%`,
                    background:
                      a.percentage >= 70 ? 'var(--primary, #2e7d32)' : '#c62828',
                  }}
                />
                <span className={s.trendBarLabel}>{a.percentage}</span>
              </div>
            ))}
          </div>
        )}

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

        {relevantHistory.length > 1 && (
          <div className={s.historySection}>
            <button
              onClick={() => setShowHistory(h => !h)}
              className={s.historyToggle}
            >
              {showHistory ? 'Hide' : 'View'} Past Results ({relevantHistory.length})
            </button>

            {showHistory && (
              <ul className={s.historyList}>
                {relevantHistory.slice(0, 10).map((attempt, i) => (
                  <li key={i} className={s.historyItem}>
                    <span className={s.historyScore}>{attempt.percentage}%</span>
                    <span className={s.historyDetail}>
                      {attempt.score}/{attempt.total}
                    </span>
                    <span className={s.historyDate}>
                      {new Date(attempt.timestamp).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      {missed.length > 0 && (
        <Card>
          <button
            onClick={() => setShowMissed(m => !m)}
            className={s.historyToggle}
          >
            {showMissed ? 'Hide' : 'Review'} Missed Questions ({missed.length})
          </button>

          {showMissed && (
            <ul className={s.missedList}>
              {missed.map((m, i) => (
                <li key={i} className={s.missedItem}>
                  <p className={s.missedTopic}>
                    {m.module}
                    {m.topic ? ` · ${m.topic}` : ''}
                  </p>
                  <p className={s.missedQuestion}>{m.question}</p>
                  <p className={s.missedAnswerRow}>
                    <span className={s.missedWrong}>✗ {m.yourAnswer}</span>
                  </p>
                  <p className={s.missedAnswerRow}>
                    <span className={s.missedRight}>✓ {m.correctAnswer}</span>
                  </p>
                  {m.explanation && (
                    <p className={s.missedExplanation}>{m.explanation}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}
    </>
  );
}
