import { useMemo, useState } from 'react';
import { GROUPS, GROUP_LETTERS } from '../data/tournament';
import { DEBUT_TEAMS, HOST_TEAMS, getFlagUrl } from '../utils/flags';

/* Each finishing position carries meaning — surface it through color so ranking
   a group instantly shows who goes through. */
const POSITION_META = [
  { label: '1st', status: 'Group winner', tone: 'gold' },
  { label: '2nd', status: 'Runner-up', tone: 'grass' },
  { label: '3rd', status: 'Best-third race', tone: 'amber' },
  { label: '4th', status: 'Eliminated', tone: 'out' },
];

const TONES = {
  gold: {
    rail: 'bg-gold',
    badge: 'border-gold/70 bg-gold/20 text-gold',
    pill: 'bg-gold/15 text-gold',
    dot: 'bg-gold',
  },
  grass: {
    rail: 'bg-grass',
    badge: 'border-grass/60 bg-grass/15 text-grass',
    pill: 'bg-grass/15 text-grass',
    dot: 'bg-grass',
  },
  amber: {
    rail: 'bg-amber',
    badge: 'border-amber/50 bg-amber/10 text-amber',
    pill: 'bg-amber/10 text-amber',
    dot: 'bg-amber',
  },
  out: {
    rail: 'bg-zinc-600',
    badge: 'border-line bg-surface-2 text-zinc-500',
    pill: 'bg-white/5 text-zinc-500',
    dot: 'bg-zinc-600',
  },
};

function reorderList(items, fromIndex, toIndex) {
  if (fromIndex === toIndex) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function GroupStage({ groupRankings, onReorder, compact = false, mobile = false }) {
  return (
    <section>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-zinc-400">
          {mobile ? (
            <>
              Use the <span className="text-zinc-200">▲ ▼ buttons</span> to rank each team 1st to
              4th. Top two advance; third-placed sides fight for the last R32 spots.
            </>
          ) : (
            <>
              Drag a team — <span className="text-zinc-200">anywhere on its row</span> — to rank it
              1st&nbsp;to&nbsp;4th. The top two go straight through; the best third-placed sides
              fight for the final spots.
            </>
          )}
        </p>
        <Legend />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {GROUP_LETTERS.map((letter, i) => (
          <GroupCard
            key={letter}
            letter={letter}
            index={i}
            teams={GROUPS[letter]}
            rankings={groupRankings[letter]}
            onReorder={(orderedTeamIds) => onReorder(letter, orderedTeamIds)}
            mobile={mobile}
          />
        ))}
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
      {POSITION_META.map((meta) => (
        <span key={meta.label} className="inline-flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${TONES[meta.tone].dot}`} />
          {meta.status}
        </span>
      ))}
    </div>
  );
}

function GroupCard({ letter, index, teams, rankings, onReorder, mobile = false }) {
  const orderedTeams = useMemo(
    () => rankings.map((id) => teams.find((t) => t.id === id)).filter(Boolean),
    [teams, rankings]
  );

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [overIndex, setOverIndex] = useState(null);

  const resetDrag = () => {
    setDraggedIndex(null);
    setOverIndex(null);
  };

  const handleDrop = (toIndex) => {
    if (draggedIndex !== null && draggedIndex !== toIndex) {
      onReorder(reorderList(rankings, draggedIndex, toIndex));
    }
    resetDrag();
  };

  const move = (from, to) => {
    if (to < 0 || to >= rankings.length) return;
    onReorder(reorderList(rankings, from, to));
  };

  return (
    <div
      className="animate-rise overflow-hidden rounded-2xl border border-line/80 bg-surface/70 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.9)] backdrop-blur-sm transition-colors hover:border-line"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <div className="flex items-center justify-between border-b border-line/70 bg-ink-2/40 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="font-display text-xl leading-none text-gold">{letter}</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
            Group {letter}
          </span>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
          {mobile ? 'Tap ▲ ▼' : 'Drag to rank'}
        </span>
      </div>

      <ul className="p-1.5">
        {orderedTeams.map((team, position) => (
          <TeamRow
            key={team.id}
            team={team}
            position={position}
            isLast={position === orderedTeams.length - 1}
            isDragging={!mobile && draggedIndex === position}
            isOver={!mobile && overIndex === position && draggedIndex !== null && draggedIndex !== position}
            dropBelow={!mobile && draggedIndex !== null && draggedIndex < position}
            onDragStart={() => setDraggedIndex(position)}
            onDragEnd={resetDrag}
            onDragEnter={() => setOverIndex(position)}
            onDrop={() => handleDrop(position)}
            onMoveUp={() => move(position, position - 1)}
            onMoveDown={() => move(position, position + 1)}
            mobile={mobile}
          />
        ))}
      </ul>
    </div>
  );
}

function TeamRow({
  team,
  position,
  isLast,
  isDragging,
  isOver,
  dropBelow,
  onDragStart,
  onDragEnd,
  onDragEnter,
  onDrop,
  onMoveUp,
  onMoveDown,
  mobile = false,
}) {
  const meta = POSITION_META[position];
  const tone = TONES[meta.tone];
  const isHost = HOST_TEAMS.has(team.id);
  const isDebut = DEBUT_TEAMS.has(team.id);
  const flagUrl = getFlagUrl(team.code);

  const rowClassName = mobile
    ? 'group relative flex items-center gap-2.5 rounded-xl px-2 py-2'
    : `row-draggable group relative flex items-center gap-2.5 rounded-xl px-2 py-2 transition ${
        isDragging
          ? 'drag-ghost'
          : isOver
            ? 'bg-gold/10 ring-1 ring-inset ring-gold/40'
            : 'hover:bg-white/[0.04]'
      }`;

  const dragProps = mobile
    ? {}
    : {
        draggable: true,
        onDragStart: (e) => {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', team.id);
          onDragStart();
        },
        onDragEnd,
        onDragEnter,
        onDragOver: (e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDragEnter();
        },
        onDrop: (e) => {
          e.preventDefault();
          onDrop();
        },
      };

  const rankButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-md text-zinc-500 transition-all duration-150 hover:bg-gold/15 hover:text-gold hover:ring-1 hover:ring-inset hover:ring-gold/30 hover:shadow-[0_0_10px_rgba(230,179,57,0.15)] active:scale-95 active:bg-gold/20 active:text-gold disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-zinc-600 disabled:hover:ring-0 disabled:hover:shadow-none disabled:active:scale-100';

  const stopRowDrag = (e) => e.stopPropagation();

  return (
    <li className="relative">
      {!mobile && isOver && !dropBelow && (
        <span className="drop-line pointer-events-none absolute -top-0.5 left-2 right-2 z-10 h-0.5 rounded-full bg-gold shadow-[0_0_8px_rgba(230,179,57,0.8)]" />
      )}

      <div {...dragProps} className={rowClassName}>
        {/* status rail */}
        <span className={`h-9 w-1 shrink-0 rounded-full ${tone.rail}`} />

        {!mobile && (
          <GripIcon className="shrink-0 text-zinc-600 transition group-hover:text-zinc-400" />
        )}

        {/* rank */}
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${tone.badge}`}
        >
          {position + 1}
        </span>

        {flagUrl ? (
          <img
            src={flagUrl}
            alt=""
            className="h-5 w-7 shrink-0 rounded-sm object-cover shadow-sm ring-1 ring-black/30"
            draggable={false}
          />
        ) : (
          <span className="shrink-0 text-lg leading-none">{team.flag}</span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold uppercase tracking-wide text-zinc-100">
            {team.name}
          </p>
          <p className={`truncate text-[10px] font-semibold uppercase tracking-wide ${
            meta.tone === 'out' ? 'text-zinc-600' : 'text-zinc-500'
          }`}>
            {meta.status}
          </p>
        </div>

        {isHost && (
          <span className="hidden shrink-0 rounded bg-gold/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-gold sm:inline">
            Host
          </span>
        )}
        {isDebut && (
          <span className="hidden shrink-0 rounded bg-grass/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-grass sm:inline">
            Debut
          </span>
        )}

        {/* up/down controls */}
        <div className="flex shrink-0 flex-row gap-1 rounded-lg border border-line/60 bg-ink-2/40 p-0.5">
          <button
            type="button"
            onClick={onMoveUp}
            onMouseDown={stopRowDrag}
            disabled={position === 0}
            aria-label={`Move ${team.name} up`}
            className={rankButtonClass}
          >
            <ChevronIcon dir="up" large />
          </button>
          <button
            type="button"
            onClick={onMoveDown}
            onMouseDown={stopRowDrag}
            disabled={isLast}
            aria-label={`Move ${team.name} down`}
            className={rankButtonClass}
          >
            <ChevronIcon dir="down" large />
          </button>
        </div>
      </div>

      {!mobile && isOver && dropBelow && (
        <span className="drop-line pointer-events-none absolute -bottom-0.5 left-2 right-2 z-10 h-0.5 rounded-full bg-gold shadow-[0_0_8px_rgba(230,179,57,0.8)]" />
      )}
    </li>
  );
}

function GripIcon({ className = '' }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${className}`} aria-hidden>
      <path d="M7 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM7 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM13 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM13 9a1 1 0 1 0 0 2 1 1 0 0 0 0-2ZM13 14a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />
    </svg>
  );
}

function ChevronIcon({ dir, large = false }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={large ? 'h-4 w-4' : 'h-3 w-3'}
      aria-hidden
    >
      {dir === 'up' ? <path d="M4 10l4-4 4 4" /> : <path d="M4 6l4 4 4-4" />}
    </svg>
  );
}
