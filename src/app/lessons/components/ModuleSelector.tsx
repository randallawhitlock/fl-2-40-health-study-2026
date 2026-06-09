import s from '../lessons.module.css';

interface ModuleSelectorProps {
  modules: string[];
  selected: string;
  onSelect: (mod: string) => void;
}

export function ModuleSelector({ modules, selected, onSelect }: ModuleSelectorProps) {
  return (
    <div className={s.moduleSelector}>
      {modules.map(mod => (
        <button
          key={mod}
          onClick={() => onSelect(mod)}
          className={`${s.moduleBtn} ${selected === mod ? s.moduleBtnActive : ''}`}
        >
          {mod}
        </button>
      ))}
    </div>
  );
}
