'use client';

import Link from 'next/link';
import { PageShell, Card } from '@/components';
import { useStudyStorage } from '@/lib/useStudyStorage';
import flashcardsData from '@/data/flashcards.json';
import lessonsData from '@/data/lessons.json';
import quizzesData from '@/data/quizzes.json';

type QuizMeta = { module: string; group?: string; topic?: string };

/** Map "module::group" → friendly topic label. */
const topicByKey = new Map<string, string>();
(quizzesData as QuizMeta[]).forEach(q => {
  if (q.group && q.topic) topicByKey.set(`${q.module}::${q.group}`, q.topic);
});

interface FeatureCardProps {
  title: string;
  description: string;
  href: string;
  label: string;
  badge?: string;
}

function FeatureCard({ title, description, href, label, badge }: FeatureCardProps) {
  return (
    <Card>
      <h2>
        {title}
        {badge && <span className="progressBadge">{badge}</span>}
      </h2>
      <p>{description}</p>
      <Link href={href} className="btn">{label}</Link>
    </Card>
  );
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const tenths = Math.floor((ms % 1000) / 100);
  return `${seconds}.${tenths}s`;
}

export default function Home() {
  const { data } = useStudyStorage();

  // Compute badges
  const totalFlashcards = flashcardsData.length;
  const knownCount = Object.values(data.flashcardProgress).filter(e =>
    ['known', 'easy', 'good'].includes(e.status)
  ).length;

  // Weakest topics (accuracy < 80%, at least 2 answers recorded)
  const weakTopics = Object.entries(data.groupStats)
    .filter(([, st]) => st.total >= 2 && st.correct / st.total < 0.8)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .slice(0, 5)
    .map(([key, st]) => ({
      key,
      module: key.split('::')[0],
      topic: topicByKey.get(key) ?? key.split('::')[1],
      pct: Math.round((st.correct / st.total) * 100),
    }));
  const flashcardBadge = knownCount > 0 ? `${knownCount}/${totalFlashcards}` : undefined;

  const visibleLessons = (lessonsData as { module: string; category?: string }[])
    .filter(l => l.category !== 'Coming Up Next');
  const totalLessons = visibleLessons.length;
  const visibleModules = new Set(visibleLessons.map(l => l.module));
  const lessonsReadCount = data.lessonsRead.filter(m => visibleModules.has(m)).length;
  const lessonBadge = lessonsReadCount > 0 ? `${lessonsReadCount}/${totalLessons}` : undefined;

  const lastQuiz = data.quizHistory[0];
  const quizBadge = lastQuiz ? `${lastQuiz.percentage}%` : undefined;

  const matchBadge = data.matchingStats.gamesPlayed > 0
    ? `${data.matchingStats.gamesPlayed} played`
    : undefined;

  const hasAnyProgress = knownCount > 0 || lessonsReadCount > 0 || lastQuiz || data.matchingStats.gamesPlayed > 0;

  return (
    <PageShell title="FL Health &amp; Life Study App" hideBack>
      <p style={{ textAlign: 'center', color: 'var(--text-light)', marginTop: '-1rem', marginBottom: '2rem' }}>
        Comprehensive study tools for the Florida 2-40 Health-Only License Exam
      </p>

      {/* ── Progress Dashboard ──────────────────── */}
      {hasAnyProgress && (
        <div className="progressDashboard">
          <h3 className="progressTitle">📊 Study Progress</h3>
          <div className="progressGrid">
            {lastQuiz && (
              <div className="progressStat">
                <span className="progressValue">{lastQuiz.percentage}%</span>
                <span className="progressLabel">Last Quiz</span>
              </div>
            )}
            {knownCount > 0 && (
              <div className="progressStat">
                <span className="progressValue">{knownCount}/{totalFlashcards}</span>
                <span className="progressLabel">Cards Known</span>
              </div>
            )}
            {data.matchingStats.gamesPlayed > 0 && (
              <div className="progressStat">
                <span className="progressValue">{data.matchingStats.gamesPlayed}</span>
                <span className="progressLabel">Matching Games</span>
              </div>
            )}
            {data.matchingStats.bestTimeMs !== null && (
              <div className="progressStat">
                <span className="progressValue">{formatTime(data.matchingStats.bestTimeMs)}</span>
                <span className="progressLabel">Best Time</span>
              </div>
            )}
            {lessonsReadCount > 0 && (
              <div className="progressStat">
                <span className="progressValue">{lessonsReadCount}/{totalLessons}</span>
                <span className="progressLabel">Lessons Read</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Weakest Topics ──────────────────────── */}
      {weakTopics.length > 0 && (
        <div className="progressDashboard">
          <h3 className="progressTitle">🎯 Focus Areas</h3>
          <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
            {weakTopics.map(t => (
              <li
                key={t.key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <span>
                  <strong>{t.topic}</strong>
                  <span style={{ color: 'var(--text-light, #565)', fontSize: '0.85rem' }}>
                    {' '}· {t.module}
                  </span>
                </span>
                <span style={{ color: t.pct < 50 ? '#c62828' : '#e65100', fontWeight: 700 }}>
                  {t.pct}%
                </span>
              </li>
            ))}
          </ul>
          <p style={{ marginTop: '0.75rem', fontSize: '0.88rem' }}>
            <Link href="/quiz" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Practice these in Weak Spots mode →
            </Link>
          </p>
        </div>
      )}

      <div className="dashboard">
        <FeatureCard
          title="Flashcards"
          description="Master key terms and definitions with interactive cards."
          href="/flashcards"
          label="Start Studying"
          badge={flashcardBadge}
        />
        <FeatureCard
          title="Practice Quizzes"
          description="Test your knowledge with module-specific assessments."
          href="/quiz"
          label="Take a Quiz"
          badge={quizBadge}
        />
        <FeatureCard
          title="Lesson Summaries"
          description="Review detailed summaries of each module."
          href="/lessons"
          label="Read Lessons"
          badge={lessonBadge}
        />
        <FeatureCard
          title="Matching Game"
          description="Exercise your memory by matching terms to definitions."
          href="/matching"
          label="Play Game"
          badge={matchBadge}
        />
      </div>

      <footer style={{ marginTop: '3rem', textAlign: 'center', color: '#055' }}>
        <p>&copy; {new Date().getFullYear()} Florida Health Insurance License Study App</p>
      </footer>
    </PageShell>
  );
}
