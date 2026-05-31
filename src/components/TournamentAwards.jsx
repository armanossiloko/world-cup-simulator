import { AWARD_DEFS } from '../data/players';

export default function TournamentAwards({ awards, onChange, compact = false }) {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {AWARD_DEFS.map((def) => (
          <AwardCard
            key={def.id}
            award={def}
            value={awards[def.id] ?? ''}
            onChange={(value) => onChange({ ...awards, [def.id]: value })}
          />
        ))}
      </div>
    </section>
  );
}

function AwardCard({ award, value, onChange }) {
  const filled = String(value ?? '').trim().length > 0;

  return (
    <div
      className={`overflow-hidden rounded-2xl border bg-surface/60 transition ${
        filled ? 'border-gold/40 shadow-[0_0_28px_-12px_rgba(230,179,57,0.4)]' : 'border-line'
      }`}
    >
      <div className="flex items-center gap-3.5 border-b border-line/70 bg-ink-2/40 px-5 py-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-2xl leading-none" aria-hidden>
          {award.emoji}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg tracking-wide text-white">{award.title}</h3>
          <p className="truncate text-xs text-zinc-500">{award.subtitle}</p>
        </div>
        {filled && (
          <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-grass/20 text-xs text-grass ring-1 ring-grass/40">
            ✓
          </span>
        )}
      </div>

      <div className="p-4">
        <label htmlFor={award.id} className="sr-only">
          {award.title}
        </label>
        <input
          id={award.id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={award.placeholder}
          autoComplete="off"
          className="w-full rounded-xl border border-line bg-ink-2/60 px-4 py-3 text-sm font-semibold text-zinc-100 placeholder:font-normal placeholder:text-zinc-600 transition focus:border-gold/60 focus:bg-ink-2 focus:outline-none focus:ring-2 focus:ring-gold/20"
        />
      </div>
    </div>
  );
}
