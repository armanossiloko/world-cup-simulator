import { useMemo, useRef, useState } from 'react';
import { KNOCKOUT_ROUNDS, R32_MATCHES } from '../data/tournament';
import { getFlagUrl } from '../utils/flags';
import TournamentAwards from './TournamentAwards';

const DISPLAY_ROUNDS = KNOCKOUT_ROUNDS.filter((round) => round.id !== 'third');

const R32_LABELS = Object.fromEntries(R32_MATCHES.map((match) => [match.id, match.label]));

function getRoundProgress(round, knockoutWinners) {
  const total = round.matches.length;
  const done = round.matches.filter((match) => knockoutWinners[match.id]).length;
  return { done, total, complete: done === total };
}

export default function MobileBracket({
  matchTeams,
  knockoutWinners,
  onPick,
  locked,
  champion,
  awards,
  onAwardsChange,
}) {
  const [activeRoundId, setActiveRoundId] = useState('r32');
  const roundPanelRef = useRef(null);
  const matchRefs = useRef({});

  const activeRound = DISPLAY_ROUNDS.find((round) => round.id === activeRoundId) ?? DISPLAY_ROUNDS[0];
  const roundProgress = getRoundProgress(activeRound, knockoutWinners);
  const activeRoundIndex = DISPLAY_ROUNDS.findIndex((round) => round.id === activeRoundId);
  const nextRound =
    activeRoundIndex >= 0 && activeRoundIndex < DISPLAY_ROUNDS.length - 1
      ? DISPLAY_ROUNDS[activeRoundIndex + 1]
      : null;

  const overallProgress = useMemo(() => {
    let done = 0;
    let total = 0;
    for (const round of DISPLAY_ROUNDS) {
      const progress = getRoundProgress(round, knockoutWinners);
      done += progress.done;
      total += progress.total;
    }
    return { done, total };
  }, [knockoutWinners]);

  const bracketComplete = overallProgress.done === overallProgress.total;

  function goToRound(roundId) {
    setActiveRoundId(roundId);
    requestAnimationFrame(() => {
      roundPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function handlePick(matchId, teamId) {
    const alreadySelected = knockoutWinners[matchId] === teamId;
    onPick(matchId, teamId);

    if (alreadySelected) return;

    const matchIndex = activeRound.matches.findIndex((match) => match.id === matchId);
    if (matchIndex < 0) return;

    const allAbovePicked = activeRound.matches
      .slice(0, matchIndex)
      .every((match) => knockoutWinners[match.id]);
    if (!allAbovePicked) return;

    const winnersAfterPick = { ...knockoutWinners, [matchId]: teamId };
    const nextUnvotedMatch = activeRound.matches
      .slice(matchIndex + 1)
      .find((match) => !winnersAfterPick[match.id]);
    if (!nextUnvotedMatch) return;

    requestAnimationFrame(() => {
      matchRefs.current[nextUnvotedMatch.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  return (
    <div className="space-y-5">
      {champion && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3.5">
          <span className="text-2xl" aria-hidden>
            🏆
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold">Your champion</p>
            <div className="mt-1 flex items-center gap-2">
              {getFlagUrl(champion.code) ? (
                <img
                  src={getFlagUrl(champion.code)}
                  alt=""
                  className="h-5 w-7 shrink-0 rounded-sm object-cover ring-1 ring-black/30"
                />
              ) : (
                <span className="text-lg">{champion.flag}</span>
              )}
              <p className="truncate font-display text-lg tracking-wide text-white">{champion.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Knockout picks{' '}
          <span className="tabular-nums text-zinc-300">
            {overallProgress.done}/{overallProgress.total}
          </span>
        </p>
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          This round{' '}
          <span className={`tabular-nums ${roundProgress.complete ? 'text-grass' : 'text-gold'}`}>
            {roundProgress.done}/{roundProgress.total}
          </span>
        </p>
      </div>

      <div
        className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Knockout rounds"
      >
        {DISPLAY_ROUNDS.map((round) => {
          const progress = getRoundProgress(round, knockoutWinners);
          const isActive = round.id === activeRoundId;
          return (
            <button
              key={round.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => goToRound(round.id)}
              className={`shrink-0 rounded-xl border px-3 py-2 text-left transition ${
                isActive
                  ? 'border-gold/50 bg-gold/15 text-gold'
                  : progress.complete
                    ? 'border-grass/30 bg-grass/5 text-grass'
                    : 'border-line bg-surface/60 text-zinc-400'
              }`}
            >
              <span className="block text-[10px] font-bold uppercase tracking-wide">
                {roundShortName(round.name)}
              </span>
              <span className="mt-0.5 block text-[11px] font-semibold tabular-nums text-zinc-500">
                {progress.done}/{progress.total}
              </span>
            </button>
          );
        })}
      </div>

      <div ref={roundPanelRef} role="tabpanel" className="scroll-mt-36 space-y-3">
        <h3 className="font-display text-lg tracking-wide text-white">{activeRound.name}</h3>
        {activeRound.matches.map((match, index) => (
          <MobileMatchCard
            key={match.id}
            cardRef={(el) => {
              if (el) matchRefs.current[match.id] = el;
              else delete matchRefs.current[match.id];
            }}
            matchId={match.id}
            matchNumber={index + 1}
            teams={matchTeams[match.id]}
            winnerId={knockoutWinners[match.id]}
            onPick={handlePick}
            locked={locked}
            highlight={match.id === 'final-1'}
          />
        ))}

        {roundProgress.complete && nextRound && (
          <div className="pt-4">
            <div className="mb-4 rounded-xl border border-grass/30 bg-grass/10 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-grass">
                {activeRound.name} complete — {roundProgress.total}/{roundProgress.total} picks
              </p>
            </div>
            <button
              type="button"
              onClick={() => goToRound(nextRound.id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-6 py-3.5 font-display text-base uppercase tracking-wide text-ink shadow-[0_10px_30px_-10px_rgba(230,179,57,0.6)] transition hover:brightness-110"
            >
              Continue to {nextRound.name} →
            </button>
          </div>
        )}
      </div>

      {bracketComplete && (
        <div className="rounded-2xl border border-line bg-surface/40 p-4">
          <p className="mb-1 text-center text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            Individual Awards
          </p>
          <p className="mb-4 text-center text-xs text-zinc-500">
            Bracket complete — add your award picks below.
          </p>
          <TournamentAwards awards={awards} onChange={onAwardsChange} compact />
        </div>
      )}
    </div>
  );
}

function roundShortName(name) {
  return name
    .replace('Round of 32', 'R32')
    .replace('Round of 16', 'R16')
    .replace('Quarter-finals', 'Quarters')
    .replace('Semi-finals', 'Semis');
}

function MobileMatchCard({ cardRef, matchId, matchNumber, teams, winnerId, onPick, locked, highlight }) {
  const home = teams?.home;
  const away = teams?.away;
  const ready = home && away;
  const interactive = ready && !locked;
  const label = R32_LABELS[matchId] ?? `Match ${matchNumber}`;

  return (
    <article
      ref={cardRef}
      className={`scroll-mt-36 overflow-hidden rounded-2xl border bg-surface shadow-sm ${
        highlight ? 'border-gold shadow-[0_0_20px_rgba(230,179,57,0.12)]' : 'border-line'
      }`}
    >
      <div className="border-b border-line/70 bg-ink-2/50 px-4 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</p>
      </div>
      <MobileTeamPick
        team={home}
        selected={winnerId === home?.id}
        onClick={() => interactive && home && onPick(matchId, home.id)}
        interactive={interactive}
        ready={ready}
        position="home"
      />
      <div className="flex items-center gap-3 px-4 py-1.5">
        <div className="h-px flex-1 bg-line/80" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">vs</span>
        <div className="h-px flex-1 bg-line/80" />
      </div>
      <MobileTeamPick
        team={away}
        selected={winnerId === away?.id}
        onClick={() => interactive && away && onPick(matchId, away.id)}
        interactive={interactive}
        ready={ready}
        position="away"
      />
    </article>
  );
}

function MobileTeamPick({ team, selected, onClick, interactive, ready, position }) {
  if (!team) {
    return (
      <div className="flex min-h-[52px] items-center gap-3 px-4 py-3">
        <span className="h-6 w-9 rounded-sm bg-surface-2" />
        <span className="text-sm font-medium text-zinc-600">
          {position === 'home' ? 'Awaiting winner' : 'Awaiting winner'}
        </span>
      </div>
    );
  }

  const flagUrl = getFlagUrl(team.code);

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition active:scale-[0.99] ${
        selected
          ? 'bg-gold/20 text-gold ring-1 ring-inset ring-gold/35'
          : interactive
            ? 'text-zinc-100 hover:bg-white/[0.04]'
            : ready
              ? 'cursor-default text-zinc-300'
              : 'cursor-default text-zinc-500'
      }`}
    >
      {flagUrl ? (
        <img
          src={flagUrl}
          alt=""
          className="h-6 w-9 shrink-0 rounded-sm object-cover ring-1 ring-black/30"
        />
      ) : (
        <span className="shrink-0 text-xl leading-none">{team.flag}</span>
      )}
      <span className="min-w-0 flex-1 text-sm font-bold uppercase tracking-wide">{team.name}</span>
      {selected && (
        <span className="shrink-0 rounded-full bg-gold/25 px-2.5 py-1 text-[10px] font-bold uppercase text-gold">
          Winner
        </span>
      )}
    </button>
  );
}
