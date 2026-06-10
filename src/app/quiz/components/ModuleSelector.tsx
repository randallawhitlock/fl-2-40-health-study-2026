import { Card } from '@/components';
import s from '../quiz.module.css';

interface ModuleSelectorProps {
  modules: string[];
  selected: string[];
  onToggle: (mod: string) => void;
  questionCount: number;
  onStart: () => void;
  onStartTimed: () => void;
  onStartWeak: () => void;
  weakTopicCount: number;
  timedTotal: number;
  timedMinutes: number;
}

export function ModuleSelector({
  modules,
  selected,
  onToggle,
  questionCount,
  onStart,
  onStartTimed,
  onStartWeak,
  weakTopicCount,
  timedTotal,
  timedMinutes,
}: ModuleSelectorProps) {
  return (
    <>
      <Card>
        <h3>Select Modules to Study:</h3>
        <div className={s.moduleList}>
          {modules.filter(m => !m.startsWith('Next:')).map(mod => (
            <label key={mod} className={s.moduleLabel}>
              <input
                type="checkbox"
                checked={selected.includes(mod)}
                onChange={() => onToggle(mod)}
              />
              {mod}
            </label>
          ))}
          {modules.some(m => m.startsWith('Next:')) && (
            <p className={s.hint} style={{ marginTop: '0.75rem', marginBottom: '0.25rem' }}>
              🔜 <strong>Coming Up Next</strong> — ahead of your class materials:
            </p>
          )}
          {modules.filter(m => m.startsWith('Next:')).map(mod => (
            <label key={mod} className={s.moduleLabel}>
              <input
                type="checkbox"
                checked={selected.includes(mod)}
                onChange={() => onToggle(mod)}
              />
              {mod}
            </label>
          ))}
        </div>
        <p className={s.hint}>
          Questions and answer choices are randomized — retaking a quiz gives
          you a fresh variation.
        </p>
        <button
          onClick={onStart}
          className="btn"
          disabled={selected.length === 0}
          style={{ opacity: selected.length === 0 ? 0.5 : 1 }}
        >
          Start Quiz ({questionCount} questions)
        </button>
      </Card>

      <Card>
        <h3>Exam Modes</h3>
        <div className={s.modeRow}>
          <div className={s.modeCard}>
            <h4>⏱️ Timed Exam</h4>
            <p className={s.modeDesc}>
              {timedTotal} random questions from every module, {timedMinutes}{' '}
              minutes on the clock — real exam pacing.
            </p>
            <button onClick={onStartTimed} className="btn">
              Start Timed Exam
            </button>
          </div>

          <div className={s.modeCard}>
            <h4>🎯 Weak Spots</h4>
            <p className={s.modeDesc}>
              {weakTopicCount > 0
                ? `Drills your ${weakTopicCount} weakest topics based on past quiz results.`
                : 'Take a few quizzes first — this mode targets the topics you miss most.'}
            </p>
            <button
              onClick={onStartWeak}
              className="btn"
              disabled={weakTopicCount === 0}
              style={{ opacity: weakTopicCount === 0 ? 0.5 : 1 }}
            >
              Practice Weak Spots
            </button>
          </div>
        </div>
      </Card>
    </>
  );
}
