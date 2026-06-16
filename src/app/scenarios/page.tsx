'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PageShell, ProgressBar } from '@/components';
import { shuffle } from '@/lib/utils';
import scenariosData from '@/data/scenarios.json';
import type { Scenario } from './types';
import s from './scenarios.module.css';

const scenarios = scenariosData as Scenario[];
const DONE_KEY = 'fl-health-scenarios-done';

/** Read completed scenario ids (SSR-safe). */
function readDone(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DONE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeDone(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DONE_KEY, JSON.stringify(ids));
  } catch {
    /* ignore quota errors */
  }
}

type Resolved = { chosen: string; correct: boolean };

export default function ScenariosPage() {
  const [active, setActive] = useState<Scenario | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [resolved, setResolved] = useState<Resolved[]>([]);
  const [done, setDone] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setDone(readDone());
  }, []);

  const start = useCallback((scenario: Scenario) => {
    // Shuffle option order per step so position isn't memorized.
    const shuffled: Scenario = {
      ...scenario,
      steps: scenario.steps.map(st => ({ ...st, options: shuffle(st.options) })),
    };
    setActive(shuffled);
    setStepIndex(0);
    setChosen(null);
    setResolved([]);
    setFinished(false);
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }, []);

  const startRandom = useCallback(() => {
    start(scenarios[Math.floor(Math.random() * scenarios.length)]);
  }, [start]);

  const exit = useCallback(() => {
    setActive(null);
    setFinished(false);
  }, []);

  const answer = useCallback(
    (option: string) => {
      if (chosen !== null || !active) return;
      const step = active.steps[stepIndex];
      setChosen(option);
      setResolved(prev => [...prev, { chosen: option, correct: option === step.answer }]);
    },
    [chosen, active, stepIndex]
  );

  const next = useCallback(() => {
    if (!active) return;
    if (stepIndex + 1 < active.steps.length) {
      setStepIndex(i => i + 1);
      setChosen(null);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    } else {
      // Mark complete.
      setDone(prev => {
        if (prev.includes(active.id)) return prev;
        const updated = [...prev, active.id];
        writeDone(updated);
        return updated;
      });
      setFinished(true);
      if (typeof window !== 'undefined') window.scrollTo(0, 0);
    }
  }, [active, stepIndex]);

  const score = useMemo(() => resolved.filter(r => r.correct).length, [resolved]);

  /* ── Complete screen ───────────────────────── */
  if (active && finished) {
    const pct = Math.round((score / active.steps.length) * 100);
    return (
      <PageShell title="Scenario Complete">
        <div className={s.completeCard}>
          <p className={s.cardCategory}>{active.category}</p>
          <h2>{active.title}</h2>
          <div className={s.scoreBig}>
            {score} / {active.steps.length}
          </div>
          <p style={{ color: 'var(--text-light)' }}>
            {pct >= 80
              ? 'Strong work — you handled this client well.'
              : pct >= 50
              ? 'Decent — review the topics below before exam day.'
              : 'Worth another pass. Re-read these topics in Lessons.'}
          </p>

          <ul className={s.topicsCovered}>
            {active.steps.map((st, i) => (
              <li key={i}>
                <span>{st.topic}</span>
                <span
                  style={{
                    color: resolved[i]?.correct ? 'var(--success, #28a745)' : '#c62828',
                    fontWeight: 700,
                  }}
                >
                  {resolved[i]?.correct ? '✓' : '✗'}
                </span>
              </li>
            ))}
          </ul>

          <div className={s.completeActions}>
            <button onClick={() => start(active)} className="btn">
              Retry this client
            </button>
            <button onClick={startRandom} className="btn">
              Next random client
            </button>
            <button onClick={exit} className={`btn ${s.secondaryBtn}`}>
              All scenarios
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  /* ── Active conversation ───────────────────── */
  if (active) {
    const step = active.steps[stepIndex];
    return (
      <PageShell title="Customer Scenario">
        <div className={s.contextBox}>
          <p className={s.contextPersona}>{active.persona}</p>
          <p className={s.contextText}>{active.context}</p>
        </div>

        <p className={s.stepCount}>
          Exchange {stepIndex + 1} of {active.steps.length}
        </p>
        <ProgressBar current={stepIndex + 1} total={active.steps.length} />

        <div className={s.transcript} style={{ marginTop: '1rem' }}>
          {/* Resolved exchanges so far */}
          {active.steps.slice(0, stepIndex).map((past, i) => (
            <div key={i} className={s.bubbleRow}>
              <span className={s.customerLabel}>{active.persona.split(',')[0]}</span>
              <div className={s.customerBubble}>{past.customer}</div>
              <div
                className={`${s.youBubble} ${
                  resolved[i] && !resolved[i].correct ? s.youBubbleWrong : ''
                }`}
              >
                {resolved[i]?.chosen}
              </div>
            </div>
          ))}

          {/* Current customer message */}
          <div className={s.bubbleRow}>
            <span className={s.customerLabel}>{active.persona.split(',')[0]}</span>
            <div className={s.customerBubble}>{step.customer}</div>
          </div>
        </div>

        <div className={s.panel}>
          <p className={s.prompt}>{step.prompt}</p>
          <ul className={s.options}>
            {step.options.map((option, idx) => {
              let cls = s.option;
              if (chosen !== null) {
                cls += ` ${s.locked}`;
                if (option === step.answer) cls += ` ${s.correct}`;
                else if (option === chosen) cls += ` ${s.incorrect}`;
              }
              return (
                <li key={idx} className={cls} onClick={() => answer(option)}>
                  {option}
                </li>
              );
            })}
          </ul>

          {chosen !== null && (
            <>
              <div
                className={`${s.feedback} ${
                  chosen === step.answer ? s.feedbackCorrect : s.feedbackIncorrect
                }`}
              >
                <span className={s.topicTag}>{step.topic}</span>
                <div>
                  <strong>
                    {chosen === step.answer ? '✅ Correct. ' : '❌ Not quite. '}
                  </strong>
                  {step.explanation}
                </div>
              </div>
              <div className={s.actions}>
                <button onClick={next} className="btn">
                  {stepIndex + 1 < active.steps.length ? 'Continue' : 'Finish'}
                </button>
              </div>
            </>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            onClick={exit}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              textDecoration: 'underline',
            }}
          >
            Exit scenario
          </button>
        </p>
      </PageShell>
    );
  }

  /* ── Scenario list ─────────────────────────── */
  return (
    <PageShell title="Customer Scenarios">
      <p className={s.intro}>
        Step into real client conversations. A customer describes their situation and asks
        questions — you choose the best response and get instant feedback tied to the exam
        concept. {done.length} of {scenarios.length} completed.
      </p>

      <div className={s.randomRow}>
        <button onClick={startRandom} className="btn">
          🎲 Random Client
        </button>
      </div>

      <div className={s.list}>
        {scenarios.map(scenario => {
          const isDone = done.includes(scenario.id);
          return (
            <div
              key={scenario.id}
              className={s.scenarioCard}
              onClick={() => start(scenario)}
              role="button"
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') start(scenario);
              }}
            >
              <span className={s.cardCategory}>{scenario.category}</span>
              <span className={s.cardTitle}>{scenario.title}</span>
              <span className={s.cardPersona}>{scenario.persona}</span>
              <span className={s.cardMeta}>
                <span>{scenario.steps.length} exchanges</span>
                {isDone && <span className={s.doneTag}>✓ Done</span>}
              </span>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
