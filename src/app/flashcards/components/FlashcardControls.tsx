import s from '../flashcards.module.css';

interface FlashcardControlsProps {
  modules: string[];
  selectedModule: string;
  onModuleChange: (mod: string) => void;
  definitionFirst: boolean;
  onToggleDefinitionFirst: () => void;
  shuffled: boolean;
  onToggleShuffle: () => void;
  dueOnly: boolean;
  onToggleDueOnly: () => void;
  dueCount: number;
}

export function FlashcardControls({
  modules,
  selectedModule,
  onModuleChange,
  definitionFirst,
  onToggleDefinitionFirst,
  shuffled,
  onToggleShuffle,
  dueOnly,
  onToggleDueOnly,
  dueCount,
}: FlashcardControlsProps) {
  return (
    <div className={s.controls}>
      <div>
        <label htmlFor="module-select" style={{ marginRight: '0.5rem' }}>
          Select Module:
        </label>
        <select
          id="module-select"
          value={selectedModule}
          onChange={e => onModuleChange(e.target.value)}
          className={s.moduleSelect}
        >
          {modules.map(mod => (
            <option key={mod} value={mod}>{mod}</option>
          ))}
        </select>
      </div>

      <div className={s.toggleRow}>
        <label className={s.toggleLabel}>
          <input
            type="checkbox"
            checked={definitionFirst}
            onChange={onToggleDefinitionFirst}
          />
          Show Definition First
        </label>

        <label className={s.toggleLabel}>
          <input
            type="checkbox"
            checked={shuffled}
            onChange={onToggleShuffle}
          />
          Shuffle Cards
        </label>

        <label className={s.toggleLabel}>
          <input
            type="checkbox"
            checked={dueOnly}
            onChange={onToggleDueOnly}
          />
          Due only{dueCount > 0 ? ` (${dueCount})` : ''}
        </label>
      </div>
    </div>
  );
}
