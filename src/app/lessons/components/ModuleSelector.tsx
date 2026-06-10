import s from '../lessons.module.css';

interface ModuleSelectorProps {
  modules: string[];
  selected: string;
  onSelect: (mod: string) => void;
  lessonsRead: string[];
  /** Modules tagged as upcoming/preview content. */
  upcoming?: string[];
}

export function ModuleSelector({
  modules,
  selected,
  onSelect,
  lessonsRead,
  upcoming = [],
}: ModuleSelectorProps) {
  const core = modules.filter(m => !upcoming.includes(m));
  const next = modules.filter(m => upcoming.includes(m));

  const renderBtn = (mod: string) => (
    <button
      key={mod}
      onClick={() => onSelect(mod)}
      className={`${s.moduleBtn} ${selected === mod ? s.moduleBtnActive : ''}`}
    >
      {lessonsRead.includes(mod) && <span className={s.readBadge}>✓</span>}
      {mod}
    </button>
  );

  return (
    <>
      <div className={s.moduleSelector}>{core.map(renderBtn)}</div>
      {next.length > 0 && (
        <>
          <p className={s.categoryLabel}>
            🔜 <strong>Coming Up Next</strong> — Florida law &amp; remaining exam
            topics (ahead of your class materials)
          </p>
          <div className={s.moduleSelector}>{next.map(renderBtn)}</div>
        </>
      )}
    </>
  );
}
