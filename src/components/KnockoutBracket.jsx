import { useRef, useState } from 'react';
import BracketTree from './BracketTree';

export default function KnockoutBracket({
  matchTeams,
  knockoutWinners,
  onPick,
  disabled,
  thirdPlaceCount = 0,
  champion,
  awards,
  onAwardsChange,
  compact = false,
}) {
  const bracketRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  async function handleDownload() {
    setExportError(null);
    setExporting(true);
    try {
      await bracketRef.current?.exportImage();
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setExporting(false);
    }
  }

  return (
    <section>
      {disabled ? (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber/30 bg-amber/[0.06] px-4 py-3 text-sm text-amber">
          <InfoIcon />
          <span>
            Pick <strong className="font-bold">8 third-placed teams</strong> in Stage 2 above before
            you can choose knockout winners here.{' '}
            <strong className="font-bold tabular-nums">
              {thirdPlaceCount}/8 selected
            </strong>
            {thirdPlaceCount < 8 && (
              <> — {8 - thirdPlaceCount} more to go.</>
            )}
          </span>
        </div>
      ) : (
        compact && (
          <p className="mb-6 text-sm text-zinc-500">
            Click a team to send them through to the next round.
          </p>
        )
      )}

      <div className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 px-3 sm:px-5 lg:px-8">
        <div className="relative">
          <BracketTree
            ref={bracketRef}
            matchTeams={matchTeams}
            knockoutWinners={knockoutWinners}
            onPick={onPick}
            champion={champion}
            awards={awards}
            onAwardsChange={onAwardsChange}
            locked={disabled}
          />
          {disabled && (
            <div
              className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-ink/75 backdrop-blur-[2px]"
              aria-hidden
            >
              <div className="mx-4 max-w-sm rounded-xl border border-amber/40 bg-ink-2/95 px-6 py-5 text-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)]">
                <LockIcon />
                <p className="mt-3 font-display text-xl tracking-wide text-white">
                  Bracket locked
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                  Select 8 third-placed teams in Stage 2 to unlock knockout picks.
                </p>
                <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber/[0.08] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-amber">
                  <span className="font-display text-base tabular-nums">{thirdPlaceCount}</span>
                  <span className="text-amber/70">/ 8 picked</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={handleDownload}
          disabled={exporting}
          className={`inline-flex items-center gap-2 rounded-xl border px-6 py-3 font-display text-base uppercase tracking-wide transition disabled:cursor-not-allowed disabled:opacity-60 ${
            champion
              ? 'border-gold bg-gradient-to-r from-gold to-gold-light text-ink shadow-[0_10px_30px_-10px_rgba(230,179,57,0.6)] hover:brightness-110'
              : 'border-line bg-surface text-zinc-200 hover:border-zinc-500 hover:bg-surface-2'
          }`}
        >
          {exporting ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating image…
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 1 0-1.09-1.03l-2.955 3.129V2.75Z" />
                <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
              </svg>
              {champion ? `Download ${champion.name} bracket` : 'Download bracket image'}
            </>
          )}
        </button>
        {exportError && <p className="text-center text-xs text-coral">{exportError}</p>}
        {champion && !exportError && (
          <p className="text-center text-xs text-zinc-500">
            Save your bracket and award picks as a PNG to share.
          </p>
        )}
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="mx-auto h-8 w-8 text-amber" aria-hidden>
      <path d="M12 2a4 4 0 0 0-4 4v2H6.5A2.5 2.5 0 0 0 4 10.5v9A2.5 2.5 0 0 0 6.5 22h11a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 17.5 8H16V6a4 4 0 0 0-4-4Zm-2 4V6a2 2 0 1 1 4 0v2h-4Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" aria-hidden>
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-11.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM9 9a.75.75 0 0 0 0 1.5h.25v2.25H9a.75.75 0 0 0 0 1.5h2a.75.75 0 0 0 0-1.5h-.25V9.75A.75.75 0 0 0 10 9H9Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
