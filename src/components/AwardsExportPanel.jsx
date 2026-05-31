import { AWARD_DEFS } from '../data/players';

export default function AwardsExportPanel({ awards, onChange }) {
  return (
    <div className="border-t border-line px-6 py-5">
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
        Individual Awards
      </p>
      <div className="grid grid-cols-4 gap-3">
        {AWARD_DEFS.map((def) => {
          const value = String(awards?.[def.id] ?? '');
          const filled = value.trim().length > 0;
          return (
            <div
              key={def.id}
              className={`group rounded-lg border px-3 py-3 transition ${
                filled
                  ? 'border-gold/40 bg-gold/[0.07]'
                  : 'border-line bg-surface/80 hover:border-line-soft'
              }`}
            >
              <div className="mb-2 flex items-center justify-center gap-1.5">
                <span className="text-lg leading-none" aria-hidden>
                  {def.emoji}
                </span>
              </div>
              <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-gold">
                {def.title}
              </p>
              <label htmlFor={`award-inline-${def.id}`} className="sr-only">
                {def.title}
              </label>
              <input
                id={`award-inline-${def.id}`}
                type="text"
                value={value}
                onChange={(e) => onChange?.({ ...awards, [def.id]: e.target.value })}
                placeholder={def.placeholder}
                autoComplete="off"
                className="w-full rounded border border-line/70 bg-ink-2/80 px-2 py-1.5 text-center text-[11px] font-semibold text-zinc-100 placeholder:font-normal placeholder:text-zinc-600 transition focus:border-gold/50 focus:bg-ink-2 focus:outline-none focus:ring-1 focus:ring-gold/20"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export const AWARDS_PANEL_HEIGHT = 168;
