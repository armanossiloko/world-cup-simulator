const STAGES = [
  { key: 'groups', label: 'Groups', shortLabel: '1' },
  { key: 'third', label: '3rd place', shortLabel: '2' },
  { key: 'bracket', label: 'Bracket', shortLabel: '3' },
];

export default function MobileStageNav({ activeStage, onStageChange, groupsUnlocked, thirdUnlocked, bracketUnlocked }) {
  const unlocked = {
    groups: true,
    third: groupsUnlocked,
    bracket: bracketUnlocked,
  };

  return (
    <nav
      className="border-b border-line/60 bg-ink/90 backdrop-blur-xl"
      aria-label="Tournament stages"
    >
      <div className="mx-auto flex max-w-lg px-2">
        {STAGES.map((stage) => {
          const isActive = activeStage === stage.key;
          const isUnlocked = unlocked[stage.key];
          return (
            <button
              key={stage.key}
              type="button"
              disabled={!isUnlocked}
              onClick={() => isUnlocked && onStageChange(stage.key)}
              aria-current={isActive ? 'step' : undefined}
              className={`relative flex flex-1 flex-col items-center gap-0.5 px-2 py-3 text-center transition ${
                isActive
                  ? 'text-gold'
                  : isUnlocked
                    ? 'text-zinc-400 hover:text-zinc-200'
                    : 'cursor-not-allowed text-zinc-700'
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold ${
                  isActive
                    ? 'bg-gold text-ink'
                    : isUnlocked
                      ? 'border border-line bg-surface text-zinc-400'
                      : 'border border-line/50 bg-ink-2 text-zinc-700'
                }`}
              >
                {stage.shortLabel}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide">{stage.label}</span>
              {isActive && (
                <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-gold" aria-hidden />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { STAGES };
