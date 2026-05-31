import { getFlagUrl } from '../utils/flags';

export default function ThirdPlaceSelector({
  thirdPlaceTeams,
  advancingThirdGroups,
  onToggle,
  onContinue,
  compact = false,
}) {
  const selectedCount = advancingThirdGroups.length;
  const remaining = 8 - selectedCount;
  const isComplete = selectedCount === 8;

  return (
    <section>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
          Twelve teams finish third. Tap exactly <span className="text-zinc-200">eight</span> to
          join the Round of 32 — the four you leave out are eliminated.
        </p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-line bg-surface/60 px-4 py-1.5">
            <span className={`font-display text-xl tabular-nums ${isComplete ? 'text-grass' : 'text-gold'}`}>
              {selectedCount}
            </span>
            <span className="text-xs font-bold uppercase tracking-wide text-zinc-500">/ 8 picked</span>
          </div>
          {!isComplete && (
            <span className="text-xs font-semibold uppercase tracking-wide text-zinc-600">
              {remaining} to go
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {thirdPlaceTeams.map(({ group, team }) => {
          const selected = advancingThirdGroups.includes(group);
          const disabled = !selected && selectedCount >= 8;
          const eliminated = isComplete && !selected;
          const flagUrl = getFlagUrl(team.code);

          return (
            <button
              key={group}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(group)}
              className={`group flex items-center gap-3.5 rounded-xl border px-4 py-3.5 text-left transition ${
                selected
                  ? 'border-grass/50 bg-grass/10 shadow-[0_0_24px_-6px_rgba(56,211,154,0.3)]'
                  : eliminated
                    ? 'border-line/50 bg-ink-2/60 opacity-45'
                    : disabled
                      ? 'cursor-not-allowed border-line/60 bg-surface/30 opacity-40'
                      : 'border-line bg-surface/60 hover:border-grass/40 hover:bg-surface-2/70'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition ${
                  selected
                    ? 'bg-grass text-ink'
                    : eliminated
                      ? 'bg-surface-2 text-zinc-600'
                      : 'border border-line bg-surface-2 text-zinc-400 group-hover:text-grass'
                }`}
              >
                {selected ? '✓' : group}
              </div>

              {flagUrl ? (
                <img
                  src={flagUrl}
                  alt=""
                  className={`h-6 w-8 shrink-0 rounded-sm object-cover ring-1 ring-black/30 ${eliminated ? 'grayscale' : ''}`}
                />
              ) : (
                <span className={`text-2xl ${eliminated ? 'opacity-50 grayscale' : ''}`}>{team.flag}</span>
              )}

              <div className="min-w-0 flex-1">
                <p
                  className={`truncate text-sm font-bold uppercase tracking-wide ${
                    eliminated ? 'text-zinc-600 line-through' : 'text-zinc-100'
                  }`}
                >
                  {team.name}
                </p>
                <p
                  className={`mt-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    selected ? 'text-grass' : eliminated ? 'text-zinc-700' : 'text-zinc-500'
                  }`}
                >
                  {selected ? 'Through to R32' : eliminated ? 'Eliminated' : `3rd · Group ${group}`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {isComplete && (
        <div className="mt-8 flex justify-center">
          <ContinueButton onClick={onContinue}>Build the bracket →</ContinueButton>
        </div>
      )}
    </section>
  );
}

function ContinueButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-7 py-3 font-display text-base uppercase tracking-wide text-ink shadow-[0_10px_30px_-10px_rgba(230,179,57,0.6)] transition hover:brightness-110"
    >
      {children}
    </button>
  );
}
