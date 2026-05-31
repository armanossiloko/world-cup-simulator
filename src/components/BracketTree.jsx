import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  CENTER_GAP,
  COLUMN_GAP,
  LEFT_COLUMNS,
  LEFT_FEED,
  LEFT_R32,
  MATCH_HEIGHT,
  MATCH_SLOT,
  MATCH_WIDTH,
  RIGHT_COLUMNS,
  RIGHT_FEED,
  RIGHT_R32,
  computeHalfPositions,
  getHalfConnectors,
  getHalfHeight,
  getLayoutWidth,
  getLeftColumnX,
} from '../data/bracketLayout';
import { getFlagUrl } from '../utils/flags';
import { downloadBracketImage } from '../utils/exportBracket';
import AwardsExportPanel, { AWARDS_PANEL_HEIGHT } from './AwardsExportPanel';

const HEADER_H = 40;
const CHAMPION_H = 108;
const CONTENT_PAD_X = 32;
const CONTENT_PAD_Y = 32;

function useBracketScale(contentWidth) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const available = el.clientWidth - 2;
      setScale(Math.min(1, available / contentWidth));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [contentWidth]);

  return { containerRef, scale };
}

const BracketTree = forwardRef(function BracketTree(
  { matchTeams, knockoutWinners, onPick, champion, awards, onAwardsChange, locked = false },
  ref
) {
  const scaleWrapperRef = useRef(null);
  const contentRef = useRef(null);
  const awardsRef = useRef(null);
  const [awardsHeight, setAwardsHeight] = useState(AWARDS_PANEL_HEIGHT);
  const leftPositions = useMemo(() => computeHalfPositions(LEFT_R32, LEFT_FEED), []);
  const rightPositions = useMemo(() => computeHalfPositions(RIGHT_R32, RIGHT_FEED), []);
  const positions = useMemo(
    () => ({
      ...leftPositions,
      ...rightPositions,
      'final-1': getHalfHeight() / 2,
    }),
    [leftPositions, rightPositions]
  );

  const leftConnectors = useMemo(
    () => getHalfConnectors(LEFT_FEED, leftPositions),
    [leftPositions]
  );
  const rightConnectors = useMemo(
    () => getHalfConnectors(RIGHT_FEED, rightPositions),
    [rightPositions]
  );

  const halfCols = LEFT_COLUMNS.length;
  const sideWidth = halfCols * MATCH_WIDTH + (halfCols - 1) * COLUMN_GAP;
  const centerWidth = MATCH_WIDTH + CENTER_GAP * 2;
  const totalWidth = getLayoutWidth() + CONTENT_PAD_X * 2;
  const bracketHeight = getHalfHeight() + HEADER_H + CHAMPION_H + CONTENT_PAD_Y * 2;
  const totalHeight = bracketHeight + awardsHeight;
  const contentLeft = CONTENT_PAD_X;
  const centerX = contentLeft + sideWidth + CENTER_GAP;
  const finalY = positions['final-1'] - MATCH_HEIGHT / 2 + HEADER_H + CONTENT_PAD_Y;
  const { containerRef: fitContainerRef, scale } = useBracketScale(totalWidth);

  useEffect(() => {
    const el = awardsRef.current;
    if (!el) return;

    const update = () => setAwardsHeight(el.offsetHeight);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      exportImage: () =>
        downloadBracketImage({
          container: fitContainerRef.current,
          content: contentRef.current,
          scaleWrapper: scaleWrapperRef.current,
          width: totalWidth,
          champion,
        }),
    }),
    [totalWidth, champion, awards]
  );

  return (
    <div className="bracket-shell">
      <div
        ref={fitContainerRef}
        className="bracket-fit flex w-full justify-center overflow-hidden rounded-2xl border border-line bg-ink-2 px-2 py-4 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.9)] sm:px-4 sm:py-6"
      >
        <div
          ref={scaleWrapperRef}
          className="mx-auto"
          style={{
            width: totalWidth * scale,
            height: totalHeight * scale,
          }}
        >
          <div
            ref={contentRef}
            className="relative"
            style={{
              width: totalWidth,
              minHeight: totalHeight,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
          <div className="relative" style={{ height: bracketHeight }}>
          {/* Left half */}
          <HalfSide
            side="left"
            columns={LEFT_COLUMNS}
            positions={leftPositions}
            connectors={leftConnectors}
            getColumnX={(colIndex) => contentLeft + getLeftColumnX(colIndex)}
            matchTeams={matchTeams}
            knockoutWinners={knockoutWinners}
            onPick={onPick}
            locked={locked}
            headerOffset={HEADER_H + CONTENT_PAD_Y}
          />

          {/* Center: Final + Champion */}
          <div className="absolute z-10" style={{ left: centerX, top: HEADER_H + CONTENT_PAD_Y, width: MATCH_WIDTH }}>
            <div className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
              Final
            </div>
            <div
              className="relative z-10"
              style={{ position: 'absolute', top: finalY - HEADER_H - CONTENT_PAD_Y, width: MATCH_WIDTH }}
            >
              <MatchNode
                matchId="final-1"
                teams={matchTeams['final-1']}
                winnerId={knockoutWinners['final-1']}
                onPick={onPick}
                locked={locked}
                highlight
              />
            </div>

            <div
              className="absolute flex flex-col items-center"
              style={{ top: finalY + MATCH_HEIGHT + 24 - HEADER_H - CONTENT_PAD_Y, width: MATCH_WIDTH }}
            >
              <span className="text-3xl">🏆</span>
              <div
                className={`mt-3 w-full rounded-lg border px-4 py-4 text-center ${
                  champion ? 'border-gold bg-gold/10' : 'border-line bg-surface'
                }`}
              >
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
                  Champion
                </p>
                {champion ? (
                  <div className="mt-1.5 flex items-center justify-center gap-2">
                    {getFlagUrl(champion.code) ? (
                      <img
                        src={getFlagUrl(champion.code)}
                        alt=""
                        crossOrigin="anonymous"
                        className="h-4 w-6 rounded-sm object-cover"
                      />
                    ) : (
                      <span>{champion.flag}</span>
                    )}
                    <span className="text-xs font-bold uppercase tracking-wide text-white">
                      {champion.name}
                    </span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                    Pick your winner
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right half */}
          <HalfSide
            side="right"
            columns={RIGHT_COLUMNS}
            positions={rightPositions}
            connectors={rightConnectors}
            getColumnX={(colIndex) =>
              contentLeft + sideWidth + centerWidth + colIndex * (MATCH_WIDTH + COLUMN_GAP)
            }
            matchTeams={matchTeams}
            knockoutWinners={knockoutWinners}
            onPick={onPick}
            locked={locked}
            headerOffset={HEADER_H + CONTENT_PAD_Y}
          />

          {/* Final connectors from semi-finals */}
          <svg
            className="pointer-events-none absolute inset-0 z-0 overflow-visible"
            width={totalWidth}
            height={bracketHeight}
          >
            <FinalConnector
              fromX={contentLeft + getLeftColumnX(halfCols - 1) + MATCH_WIDTH}
              fromY={positions['sf-1'] + HEADER_H + CONTENT_PAD_Y}
              toX={centerX}
              toY={positions['final-1'] + HEADER_H + CONTENT_PAD_Y}
              active={Boolean(knockoutWinners['sf-1'])}
            />
            <FinalConnector
              fromX={contentLeft + sideWidth + centerWidth + MATCH_WIDTH}
              fromY={positions['sf-2'] + HEADER_H + CONTENT_PAD_Y}
              toX={centerX + MATCH_WIDTH}
              toY={positions['final-1'] + HEADER_H + CONTENT_PAD_Y}
              active={Boolean(knockoutWinners['sf-2'])}
              reverse
            />
          </svg>
          </div>

          <div ref={awardsRef}>
            <AwardsExportPanel awards={awards} onChange={onAwardsChange} />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BracketTree;

function HalfSide({
  side,
  columns,
  positions,
  connectors,
  getColumnX,
  matchTeams,
  knockoutWinners,
  onPick,
  locked,
  headerOffset,
}) {
  const isLeft = side === 'left';

  return (
    <>
      {columns.map((column, colIndex) => (
        <div
          key={`${side}-${column.id}`}
          className="absolute top-0"
          style={{ left: getColumnX(colIndex), width: MATCH_WIDTH }}
        >
          <div className="mb-4 px-1 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-gold">
            {column.label.replace('Quarter-finals', 'Quarters').replace('Semi-finals', 'Semis')}
          </div>

          {column.matches.map((matchId) => {
            const top = positions[matchId] - MATCH_HEIGHT / 2 + headerOffset;
            return (
              <div
                key={matchId}
                className="absolute z-10"
                style={{ top, width: MATCH_WIDTH, height: MATCH_HEIGHT }}
              >
                <MatchNode
                  matchId={matchId}
                  teams={matchTeams[matchId]}
                  winnerId={knockoutWinners[matchId]}
                  onPick={onPick}
                  locked={locked}
                />
              </div>
            );
          })}
        </div>
      ))}

      <svg
        className="pointer-events-none absolute inset-0 z-0 overflow-visible"
        style={{ width: '100%', height: '100%' }}
      >
        {connectors.map(({ from, to, fromY, toY }) => {
          const fromCol = findColumnIndex(columns, from);
          const toCol = findColumnIndex(columns, to);
          if (fromCol < 0 || toCol < 0) return null;

          const winnerId = knockoutWinners[from];
          const active = Boolean(winnerId);

          if (isLeft) {
            const x1 = getColumnX(fromCol) + MATCH_WIDTH;
            const x2 = getColumnX(toCol);
            const y1 = fromY + headerOffset;
            const y2 = toY + headerOffset;
            const midX = x1 + COLUMN_GAP / 2;
            return (
              <ConnectorPath
                key={`${from}-${to}`}
                d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`}
                active={active}
              />
            );
          }

          const x1 = getColumnX(fromCol);
          const x2 = getColumnX(toCol) + MATCH_WIDTH;
          const y1 = fromY + headerOffset;
          const y2 = toY + headerOffset;
          const midX = x1 - COLUMN_GAP / 2;
          return (
            <ConnectorPath
              key={`${from}-${to}`}
              d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`}
              active={active}
            />
          );
        })}
      </svg>
    </>
  );
}

function findColumnIndex(columns, matchId) {
  for (let i = 0; i < columns.length; i += 1) {
    if (columns[i].matches.includes(matchId)) return i;
  }
  return -1;
}

function ConnectorPath({ d, active }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={active ? '#c9a227' : '#3f3f46'}
      strokeWidth={active ? 2 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={active ? 0.95 : 0.5}
    />
  );
}

function FinalConnector({ fromX, fromY, toX, toY, active, reverse }) {
  const midX = reverse ? fromX - CENTER_GAP / 2 : fromX + CENTER_GAP / 2;
  const d = reverse
    ? `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`
    : `M ${fromX} ${fromY} H ${midX} V ${toY} H ${toX}`;

  return <ConnectorPath d={d} active={active} />;
}

function MatchNode({ matchId, teams, winnerId, onPick, highlight, locked }) {
  const home = teams?.home;
  const away = teams?.away;
  const ready = home && away;
  const interactive = ready && !locked;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-surface shadow-sm ${
        highlight ? 'border-gold shadow-[0_0_16px_rgba(230,179,57,0.18)]' : 'border-line'
      }`}
    >
      <TeamRow
        team={home}
        selected={winnerId === home?.id}
        onClick={() => interactive && home && onPick(matchId, home.id)}
        ready={ready}
        interactive={interactive}
      />
      <div className="h-px bg-line/80" />
      <TeamRow
        team={away}
        selected={winnerId === away?.id}
        onClick={() => interactive && away && onPick(matchId, away.id)}
        ready={ready}
        interactive={interactive}
      />
    </div>
  );
}

function TeamRow({ team, selected, onClick, ready, interactive }) {
  if (!team) {
    return (
      <div className="flex h-[29px] items-center gap-2.5 bg-surface-2/50 px-3">
        <span className="h-3.5 w-5 rounded-sm bg-surface-2" />
        <span className="text-[11px] font-medium text-zinc-600">—</span>
      </div>
    );
  }

  const flagUrl = getFlagUrl(team.code);

  return (
    <button
      type="button"
      disabled={!interactive}
      onClick={onClick}
      className={`flex h-[29px] w-full items-center gap-2.5 px-3 text-left transition ${
        selected
          ? 'bg-gold/25 text-gold ring-1 ring-inset ring-gold/40'
          : interactive
            ? 'text-zinc-100 hover:bg-white/5'
            : ready
              ? 'cursor-default text-zinc-300'
              : 'cursor-default text-zinc-500'
      }`}
    >
      {flagUrl ? (
        <img
          src={flagUrl}
          alt=""
          crossOrigin="anonymous"
          className="h-3.5 w-5 shrink-0 rounded-sm object-cover"
        />
      ) : (
        <span className="shrink-0 text-sm leading-none">{team.flag}</span>
      )}
      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold leading-tight">
        {team.name}
      </span>
      {selected && (
        <span className="ml-1 shrink-0 rounded bg-gold/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-gold">
          W
        </span>
      )}
    </button>
  );
}
