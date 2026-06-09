'use client';

import { useState, useMemo } from 'react';
import quizzesData from '@/data/quizzes.json';
import { shuffle } from '@/lib/utils';
import { PageShell, ProgressBar } from '@/components';
import { ModuleSelector } from './components/ModuleSelector';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import type { Question } from './types';
import s from './quiz.module.css';

const allQuestions = quizzesData as Question[];
const CUMULATIVE = 'Cumulative Exam (Random 40)';

/** Pick one random variant per concept group, shuffle order + options. */
function buildQuiz(selectedModules: string[]): Question[] {
  const cumulative = selectedModules.includes(CUMULATIVE);
  const pool = cumulative
    ? allQuestions
    : allQuestions.filter(q => selectedModules.includes(q.module));

  const byGroup = new Map<string, Question[]>();
  pool.forEach((q, i) => {
    const key = q.group ? `${q.module}::${q.group}` : `solo::${i}`;
    const list = byGroup.get(key) || [];
    list.push(q);
    byGroup.set(key, list);
  });

  const picked = Array.from(byGroup.values()).map(
    variants => variants[Math.floor(Math.random() * variants.length)]
  );

  let questions = shuffle(picked);
  if (cumulative) questions = questions.slice(0, 40);
  return questions.map(q => ({ ...q, options: shuffle(q.options) }));
}

export default function QuizPage() {
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [userAnswer, setUserAnswer] = useState<string | null>(null);

  const modules = useMemo(() => {
    return [...Array.from(new Set(allQuestions.map(q => q.module))), CUMULATIVE];
  }, []);

  const selectedCount = useMemo(() => {
    if (selectedModules.length === 0) return 0;
    const cumulative = selectedModules.includes(CUMULATIVE);
    const pool = cumulative
      ? allQuestions
      : allQuestions.filter(q => selectedModules.includes(q.module));
    const groups = new Set(
      pool.map((q, i) => (q.group ? `${q.module}::${q.group}` : `solo::${i}`))
    );
    return cumulative ? Math.min(groups.size, 40) : groups.size;
  }, [selectedModules]);

  const toggleModule = (mod: string) => {
    setSelectedModules(prev =>
      prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
    );
  };

  const startQuiz = () => {
    const questions = buildQuiz(selectedModules);
    if (questions.length > 0) {
      setQuizQuestions(questions);
      setQuizStarted(true);
      setCurrentIndex(0);
      setScore(0);
      setShowResult(false);
      setUserAnswer(null);
    }
  };

  const handleAnswer = (option: string) => {
    if (userAnswer !== null) return;
    setUserAnswer(option);
    if (option === quizQuestions[currentIndex].answer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setUserAnswer(null);
    if (currentIndex + 1 < quizQuestions.length) {
      setCurrentIndex(i => i + 1);
    } else {
      setShowResult(true);
    }
  };

  /* ── Result screen ─────────────────────────── */
  if (showResult) {
    return (
      <PageShell title="Quiz Results">
        <ResultScreen
          score={score}
          total={quizQuestions.length}
          onRetake={startQuiz}
          onChangeModules={() => setQuizStarted(false)}
        />
      </PageShell>
    );
  }

  /* ── Module selection screen ────────────────── */
  if (!quizStarted) {
    return (
      <PageShell title="Practice Quizzes">
        <ModuleSelector
          modules={modules}
          selected={selectedModules}
          onToggle={toggleModule}
          questionCount={selectedCount}
          onStart={startQuiz}
        />
      </PageShell>
    );
  }

  /* ── Active quiz ────────────────────────────── */
  return (
    <PageShell title="Practice Quizzes">
      <div className={s.progressHeader}>
        <p>Question {currentIndex + 1} of {quizQuestions.length}</p>
        <ProgressBar current={currentIndex + 1} total={quizQuestions.length} />
      </div>

      <QuestionCard
        question={quizQuestions[currentIndex]}
        userAnswer={userAnswer}
        onAnswer={handleAnswer}
        onNext={nextQuestion}
        isLast={currentIndex + 1 >= quizQuestions.length}
      />
    </PageShell>
  );
}
