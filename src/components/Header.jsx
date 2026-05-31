import GitHubRepoLink from './GitHubRepoLink';

export default function Header({ onReset }) {
  return (
    <header className="border-b border-line/60">
      <div className="mx-auto flex max-w-[1840px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-gold-light text-ink shadow-[0_0_18px_rgba(230,179,57,0.35)]">
            <TrophyMark />
          </span>
          <div className="leading-none">
            <h1 className="font-display text-lg tracking-wide text-white sm:text-2xl">
              WORLD CUP <span className="text-gold">2026</span>
            </h1>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.28em] text-zinc-500">
              Bracket Predictor
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <GitHubRepoLink />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-bold uppercase tracking-wide text-zinc-400 transition hover:border-coral/60 hover:text-coral"
          >
            <ResetIcon />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function TrophyMark() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
      <path d="M6 3h12v2h3v3a4 4 0 0 1-4 4h-.3A6 6 0 0 1 13 15.9V18h3v2H8v-2h3v-2.1A6 6 0 0 1 7.3 12H7a4 4 0 0 1-4-4V5h3V3Zm0 4H5v1a2 2 0 0 0 1 1.7V7Zm12 0v2.7A2 2 0 0 0 19 8V7h-1Z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden>
      <path d="M3 10a7 7 0 1 1 2 4.9M3 15v-4h4" />
    </svg>
  );
}
