import { Card } from '@/components';
import s from '../quiz.module.css';

interface ModuleSelectorProps {
  modules: string[];
  selected: string[];
  onToggle: (mod: string) => void;
  questionCount: number;
  onStart: () => void;
}

export function ModuleSelector({
  modules,
  selected,
  onToggle,
  questionCount,
  onStart,
}: ModuleSelectorProps) {
  return (
    <Card>
      <h3>Select Modules to Study:</h3>
      <div className={s.moduleList}>
        {modules.map(mod => (
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
        Questions and answer choices are randomized — retaking a quiz gives you
        a fresh variation.
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
  );
}
