'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import quizzesData from '@/data/quizzes.json';
import { shuffle } from '@/lib/utils';
import { useStudyStorage } from '@/lib/useStudyStorage';
import type {
  GroupStat,
  MissedQuestion,
  QuizMode,
  ActiveQuizState,
} from '@/lib/storage-types';
import { PageShell, ProgressBar } from '@/components';
import { ModuleSelector } from './components/ModuleSelector';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import type { Question } from './types';
import s from './quiz.module.css';

const allQuestions = quizzesData as Question[];
const CUMULATIVE = 'Cumulative Exam (Random 40)';

const TIMED_TOTAL = 40;
const TIMED_SECONDS_PER_Q = 90; // ~real exam pacing
const TIMED_LIMIT_MS = TIMED_TOTAL * TIMED_SECONDS_PER_Q * 1000;
const WEAK_MAX_TOPICS = 20;
const WEAK_ACCURACY_THRESHOLD = 0.8;

function groupKey(q: Question, i: number): string {
  return q.group ? `${q.module}::${q.group}` : `solo::${i}`;
}

/** One random variant per concept group, shuffled order + options. */
function pickVariants(pool: Question[]): Question[] {
  const byGroup = new Map<string, Question[]>();
  pool.forEach((q, i) => {
    const key = groupKey(q, i);
    const list = byGroup.get(key) || [];
    list.push(q);
    byGroup.set(key, list);
  });
  const picked = Array.from(byGroup.values()).map(
    variants => variants[Math.floor(Math.random() * variants.length)]
  );
  return shuffle(picked).map(q => ({ ...q, options: shuffle(q.options) }));
}

function buildPractice(selectedModules: string[]): Question[] {
  const cumulative = selectedModules.includes(CUMULATIVE);
  const pool = cumulative
    ? allQuestions
    : allQuestions.filter(q => selectedModules.includes(q.module));
  const questions = pickVariants(pool);
  return cumulative ? questions.slice(0, 40) : questions;
}

function buildTimed(): Question[] {
  return pickVariants(allQuestions).slice(0, TIMED_TOTAL);
}

/** Concept groups with accuracy below threshold, worst first. */
function weakGroupKeys(groupStats: Record<string, GroupStat>): string[] {
  return Object.entries(groupStats)
    .filter(([, st]) => st.total > 0 && st.correct / st.total < WEAK_ACCURACY_THRESHOLD)
    .sort(([, a], [, b]) => a.correct / a.total - b.correct / b.total)
    .slice(0, WEAK_MAX_TOPICS)
    .map(([key]) => key);
}

function buildWeak(groupStats: Record<string, GroupStat>): Question[] {
  const keys = new Set(weakGroupKeys(groupStats));
  const pool = allQuestions.filter(
    q => q.group && keys.has(`${q.module}::${q.group}`)
  );
  return pickVariants(pool);
}

function formatClock(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${m}:${String(sec).padStart(2, '0')}`;
}

export default function QuizPage() {
  const { data, loaded, saveQuizResult, updatePreferences, setActiveQuiz } = useStudyStorage();
  const [hydrated, setHydrated] = useState(false);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [mode, setMode] = useState<QuizMode>('practice');
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastMissed, setLastMissed] = useState<MissedQuestion[]>([]);
  const [lastScore, setLastScore] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);
  const [timeUsedMs, setTimeUsedMs] = useState<number | undefined>(undefined);

  // Timer state (timed mode only)
  const [remainingMs, setRemainingMs] = useState(TIMED_LIMIT_MS);
  const startedAtRef = useRef(0);
  const deadlineRef = useRef<number | undefined>(undefined);
  const answersRef = useRef<(string | null)[]>([]);
  const questionsRef = useRef<Question[]>([]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);
  useEffect(() => {
    questionsRef.current = quizQuestions;
  }, [quizQuestions]);

  /** Persist the live quiz so a refresh resumes exactly where the user was. */
  const persistActive = useCallback(
    (
      questions: Question[],
      ans: (string | null)[],
      index: number,
      quizMode: QuizMode,
      mods: string[],
      startedAt: number,
      deadline?: number,
    ) => {
      setActiveQuiz({
        mode: quizMode,
        modules: mods,
        questions,
        answers: ans,
        currentIndex: index,
        startedAt,
        deadline,
      });
    },
    [setActiveQuiz]
  );

  // Hydrate persisted module selections + resume any in-progress quiz
  useEffect(() => {
    if (hydrated || !loaded) return;
    const saved = data.preferences.quizSelectedModules;
    if (saved.length > 0) {
      setSelectedModules(saved);
    }
    {
      const active = data.activeQuiz;
      if (active && active.questions.length > 0) {
        setQuizQuestions(active.questions as Question[]);
        setAnswers(
          active.answers.length === active.questions.length
            ? active.answers
            : active.questions.map(() => null)
        );
        setCurrentIndex(
          Math.min(active.currentIndex, active.questions.length - 1)
        );
        setMode(active.mode);
        if (active.mode === 'practice' && active.modules.length > 0) {
          setSelectedModules(active.modules);
        }
        startedAtRef.current = active.startedAt;
        deadlineRef.current = active.deadline;
        if (active.deadline) {
          setRemainingMs(Math.max(0, active.deadline - Date.now()));
        }
        setQuizStarted(true);
      }
      setHydrated(true);
    }
  }, [data.preferences.quizSelectedModules, loaded, data.activeQuiz, hydrated]);

  const modules = useMemo(() => {
    return [...Array.from(new Set(allQuestions.map(q => q.module))), CUMULATIVE];
  }, []);

  const selectedCount = useMemo(() => {
    if (selectedModules.length === 0) return 0;
    const cumulative = selectedModules.includes(CUMULATIVE);
    const pool = cumulative
      ? allQuestions
      : allQuestions.filter(q => selectedModules.includes(q.module));
    const groups = new Set(pool.map((q, i) => groupKey(q, i)));
    return cumulative ? Math.min(groups.size, 40) : groups.size;
  }, [selectedModules]);

  const weakTopicCount = useMemo(
    () => weakGroupKeys(data.groupStats).length,
    [data.groupStats]
  );

  const toggleModule = useCallback((mod: string) => {
    setSelectedModules(prev => {
      const next = prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod];
      updatePreferences({ quizSelectedModules: next });
      return next;
    });
  }, [updatePreferences]);

  const launch = (questions: Question[], quizMode: QuizMode) => {
    if (questions.length === 0) return;
    const blank = questions.map(() => null);
    const startedAt = Date.now();
    const deadline = quizMode === 'timed' ? startedAt + TIMED_LIMIT_MS : undefined;
    setQuizQuestions(questions);
    setAnswers(blank);
    setMode(quizMode);
    setQuizStarted(true);
    setCurrentIndex(0);
    setShowResult(false);
    setRemainingMs(TIMED_LIMIT_MS);
    startedAtRef.current = startedAt;
    deadlineRef.current = deadline;
    persistActive(questions, blank, 0, quizMode, selectedModules, startedAt, deadline);
  };

  const startPractice = () => launch(buildPractice(selectedModules), 'practice');
  const startTimed = () => launch(buildTimed(), 'timed');
  const startWeak = () => launch(buildWeak(data.groupStats), 'weak');

  const retake = () => {
    if (mode === 'timed') startTimed();
    else if (mode === 'weak') startWeak();
    else startPractice();
  };

  const exitToSelection = () => {
    setActiveQuiz(null);
    setQuizStarted(false);
    setShowResult(false);
  };

  /** Compute results from the answers array and persist. */
  const finishQuiz = useCallback(
    (ans: (string | null)[], questions: Question[], quizMode: QuizMode) => {
      const missed: MissedQuestion[] = [];
      const groupResults: Record<string, GroupStat> = {};
      let score = 0;

      questions.forEach((q, i) => {
        const chosen = ans[i];
        const correct = chosen === q.answer;
        if (correct) score++;
        else {
          missed.push({
            question: q.question,
            yourAnswer: chosen ?? '(no answer — time expired)',
            correctAnswer: q.answer,
            explanation: q.explanation,
            topic: q.topic,
            module: q.module,
            group: q.group,
          });
        }
        if (q.group) {
          const key = `${q.module}::${q.group}`;
          const cur = groupResults[key] ?? { correct: 0, total: 0 };
          groupResults[key] = {
            correct: cur.correct + (correct ? 1 : 0),
            total: cur.total + 1,
          };
        }
      });

      const total = questions.length;
      const elapsed = Date.now() - startedAtRef.current;

      saveQuizResult(
        {
          modules: quizMode === 'practice' ? selectedModules : [quizMode],
          score,
          total,
          percentage: Math.round((score / total) * 100),
          mode: quizMode,
          timeUsedMs: quizMode === 'timed' ? Math.min(elapsed, TIMED_LIMIT_MS) : undefined,
          missed,
        },
        groupResults
      );
      setActiveQuiz(null);

      setLastMissed(missed);
      setLastScore(score);
      setLastTotal(total);
      setTimeUsedMs(quizMode === 'timed' ? Math.min(elapsed, TIMED_LIMIT_MS) : undefined);
      setShowResult(true);
    },
    [saveQuizResult, setActiveQuiz, selectedModules]
  );

  // Countdown for timed mode
  useEffect(() => {
    if (!quizStarted || showResult || mode !== 'timed') return;
    const id = setInterval(() => {
      const deadline = deadlineRef.current ?? 0;
      const left = deadline - Date.now();
      setRemainingMs(left);
      if (left <= 0) {
        clearInterval(id);
        finishQuiz(answersRef.current, questionsRef.current, 'timed');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [quizStarted, showResult, mode, finishQuiz]);

  const handleAnswer = (option: string) => {
    if (answers[currentIndex] !== null) return;
    setAnswers(prev => {
      const next = [...prev];
      next[currentIndex] = option;
      persistActive(
        quizQuestions, next, currentIndex, mode, selectedModules,
        startedAtRef.current, deadlineRef.current
      );
      return next;
    });
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < quizQuestions.length) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      persistActive(
        quizQuestions, answersRef.current, nextIndex, mode, selectedModules,
        startedAtRef.current, deadlineRef.current
      );
    } else {
      finishQuiz(answersRef.current, quizQuestions, mode);
    }
  };

  /* ── Result screen ─────────────────────────── */
  if (showResult) {
    return (
      <PageShell title="Quiz Results">
        <ResultScreen
          score={lastScore}
          total={lastTotal}
          onRetake={retake}
          onChangeModules={exitToSelection}
          quizHistory={data.quizHistory}
          selectedModules={selectedModules}
          missed={lastMissed}
          mode={mode}
          timeUsedMs={timeUsedMs}
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
          onStart={startPractice}
          onStartTimed={startTimed}
          onStartWeak={startWeak}
          weakTopicCount={weakTopicCount}
          timedTotal={TIMED_TOTAL}
          timedMinutes={Math.round(TIMED_LIMIT_MS / 60000)}
        />
      </PageShell>
    );
  }

  /* ── Active quiz ────────────────────────────── */
  const title =
    mode === 'timed' ? 'Timed Exam' : mode === 'weak' ? 'Weak Spots' : 'Practice Quizzes';

  return (
    <PageShell title={title}>
      <div className={s.progressHeader}>
        <p>
          Question {currentIndex + 1} of {quizQuestions.length}
          {mode === 'timed' && (
            <span
              className={`${s.timer} ${remainingMs < 5 * 60 * 1000 ? s.timerLow : ''}`}
            >
              ⏱ {formatClock(remainingMs)}
            </span>
          )}
        </p>
        <ProgressBar current={currentIndex + 1} total={quizQuestions.length} />
      </div>

      <QuestionCard
        question={quizQuestions[currentIndex]}
        userAnswer={answers[currentIndex]}
        onAnswer={handleAnswer}
        onNext={nextQuestion}
        isLast={currentIndex + 1 >= quizQuestions.length}
      />

      <p className={s.hint} style={{ textAlign: 'center' }}>
        <button onClick={exitToSelection} className={s.historyToggle}>
          Exit quiz
        </button>
      </p>
    </PageShell>
  );
}
