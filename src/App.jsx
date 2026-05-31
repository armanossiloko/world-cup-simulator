import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  createInitialGroupRankings,
  createInitialKnockoutWinners,
  createInitialThirdPlaceSelection,
} from './data/tournament';
import { createInitialAwards } from './data/players';
import {
  decodeState,
  getAllKnockoutMatchTeams,
  getChampion,
  getThirdPlaceTeams,
  isGroupStageComplete,
  isThirdPlaceComplete,
} from './utils/bracket';
import { useIsMobile } from './hooks/useIsMobile';
import Header from './components/Header';
import StageSection from './components/StageSection';
import GroupStage from './components/GroupStage';
import ThirdPlaceSelector from './components/ThirdPlaceSelector';
import KnockoutBracket from './components/KnockoutBracket';
import MobileStageNav from './components/MobileStageNav';
import GitHubRepoLink from './components/GitHubRepoLink';

const STAGE_IDS = {
  groups: 'stage-groups',
  third: 'stage-third',
  bracket: 'stage-bracket',
};

function scrollToStage(stageKey, behavior = 'smooth') {
  const el = document.getElementById(STAGE_IDS[stageKey]);
  if (el) el.scrollIntoView({ behavior, block: 'start' });
}

export default function App() {
  const isMobile = useIsMobile();
  const [mobileStage, setMobileStage] = useState('groups');
  const [groupRankings, setGroupRankings] = useState(createInitialGroupRankings);
  const [advancingThirdGroups, setAdvancingThirdGroups] = useState(createInitialThirdPlaceSelection);
  const [knockoutWinners, setKnockoutWinners] = useState(createInitialKnockoutWinners);
  const [awards, setAwards] = useState(createInitialAwards);

  const groupsRef = useRef(null);
  const thirdRef = useRef(null);
  const bracketRef = useRef(null);
  const prevThirdCount = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shared = params.get('bracket');
    if (shared) {
      const decoded = decodeState(shared);
      if (decoded) {
        setGroupRankings(decoded.groupRankings);
        setAdvancingThirdGroups(decoded.advancingThirdGroups);
        setKnockoutWinners(decoded.knockoutWinners);
        if (decoded.awards) {
          setAwards({ ...createInitialAwards(), ...decoded.awards });
        }
      }
    }
  }, []);

  useEffect(() => {
    if (advancingThirdGroups.length === 8 && prevThirdCount.current < 8) {
      if (isMobile) {
        setMobileStage('bracket');
      } else {
        setTimeout(() => scrollToStage('bracket'), 400);
      }
    }
    prevThirdCount.current = advancingThirdGroups.length;
  }, [advancingThirdGroups.length, isMobile]);

  const matchTeams = useMemo(
    () => getAllKnockoutMatchTeams(groupRankings, advancingThirdGroups, knockoutWinners),
    [groupRankings, advancingThirdGroups, knockoutWinners]
  );

  const champion = useMemo(() => getChampion(knockoutWinners), [knockoutWinners]);
  const thirdPlaceTeams = useMemo(() => getThirdPlaceTeams(groupRankings), [groupRankings]);

  const groupsComplete = isGroupStageComplete(groupRankings);
  const thirdComplete = isThirdPlaceComplete(advancingThirdGroups);

  const handleGroupReorder = useCallback((groupLetter, orderedTeamIds) => {
    setGroupRankings((prev) => ({ ...prev, [groupLetter]: orderedTeamIds }));
    setAdvancingThirdGroups([]);
    setKnockoutWinners(createInitialKnockoutWinners());
    prevThirdCount.current = 0;
  }, []);

  const handleToggleThird = useCallback((groupLetter) => {
    setAdvancingThirdGroups((prev) => {
      if (prev.includes(groupLetter)) {
        return prev.filter((g) => g !== groupLetter);
      }
      if (prev.length >= 8) return prev;
      return [...prev, groupLetter];
    });
    setKnockoutWinners(createInitialKnockoutWinners());
  }, []);

  const handleKnockoutPick = useCallback((matchId, teamId) => {
    setKnockoutWinners((prev) => {
      const next = { ...prev, [matchId]: teamId };

      const clearDownstream = (fromMatchId) => {
        for (const round of ['r16', 'qf', 'sf', 'third', 'final']) {
          const roundMatches = {
            r16: ['r16-1', 'r16-2', 'r16-3', 'r16-4', 'r16-5', 'r16-6', 'r16-7', 'r16-8'],
            qf: ['qf-1', 'qf-2', 'qf-3', 'qf-4'],
            sf: ['sf-1', 'sf-2'],
            third: ['third-1'],
            final: ['final-1'],
          };
          for (const mId of roundMatches[round] || []) {
            const sources = getMatchSources(mId);
            if (sources.includes(fromMatchId)) {
              delete next[mId];
              clearDownstream(mId);
            }
          }
        }
      };

      clearDownstream(matchId);
      return next;
    });
  }, []);

  const handleReset = useCallback(() => {
    setGroupRankings(createInitialGroupRankings());
    setAdvancingThirdGroups(createInitialThirdPlaceSelection());
    setKnockoutWinners(createInitialKnockoutWinners());
    setAwards(createInitialAwards());
    prevThirdCount.current = 0;
    setMobileStage('groups');
    window.history.replaceState({}, '', window.location.pathname);
  }, []);

  const goToThirdStage = () => {
    if (isMobile) {
      setMobileStage('third');
      return;
    }
    scrollToStage('third');
  };

  const goToBracketStage = () => {
    if (isMobile) {
      setMobileStage('bracket');
      return;
    }
    scrollToStage('bracket');
  };

  const showGroups = !isMobile || mobileStage === 'groups';
  const showThird = !isMobile || mobileStage === 'third';
  const showBracket = !isMobile || mobileStage === 'bracket';

  return (
    <div className="relative min-h-screen text-zinc-100">
      <a
        href={`#${STAGE_IDS.groups}`}
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
      >
        Skip to group stage
      </a>
      <div className="grain-overlay" />

      <div className="sticky top-0 z-50 bg-ink/85 backdrop-blur-xl">
        <Header onReset={handleReset} />
        {isMobile && (
          <MobileStageNav
            activeStage={mobileStage}
            onStageChange={setMobileStage}
            groupsUnlocked
            thirdUnlocked={groupsComplete}
            bracketUnlocked={groupsComplete}
          />
        )}
      </div>

      <Hero compact={isMobile} />

      <main
        className={`relative z-10 mx-auto max-w-[1840px] px-4 pb-24 pt-4 sm:px-6 lg:px-8 ${
          isMobile ? 'space-y-8' : 'space-y-20'
        }`}
      >
        {showGroups && (
          <StageSection
            id={STAGE_IDS.groups}
            stageNumber={1}
            title="Predict the Group Stage"
            unlocked
            sectionRef={groupsRef}
            compact={isMobile}
          >
            <GroupStage
              groupRankings={groupRankings}
              onReorder={handleGroupReorder}
              compact
              mobile={isMobile}
            />
            {groupsComplete && (
              <div className="mt-10 flex justify-center">
                <ContinueButton onClick={goToThirdStage}>
                  {isMobile ? 'Next: 3rd place →' : 'Continue to best 3rd place →'}
                </ContinueButton>
              </div>
            )}
          </StageSection>
        )}

        {showThird && (
          <StageSection
            id={STAGE_IDS.third}
            stageNumber={2}
            title="Pick 8 Third-Placed Teams"
            unlocked={groupsComplete}
            sectionRef={thirdRef}
            compact={isMobile}
          >
            {!groupsComplete ? (
              <p className="text-sm text-zinc-500">Complete the group stage above to unlock this step.</p>
            ) : (
              <ThirdPlaceSelector
                thirdPlaceTeams={thirdPlaceTeams}
                advancingThirdGroups={advancingThirdGroups}
                onToggle={handleToggleThird}
                onContinue={goToBracketStage}
                compact
                mobile={isMobile}
              />
            )}
          </StageSection>
        )}

        {showBracket && (
          <StageSection
            id={STAGE_IDS.bracket}
            stageNumber={3}
            title="Knockout Bracket & Awards"
            unlocked
            sectionRef={bracketRef}
            compact={isMobile}
          >
            <KnockoutBracket
              matchTeams={matchTeams}
              knockoutWinners={knockoutWinners}
              onPick={handleKnockoutPick}
              disabled={!thirdComplete}
              thirdPlaceCount={advancingThirdGroups.length}
              champion={champion}
              awards={awards}
              onAwardsChange={setAwards}
              compact
            />
          </StageSection>
        )}
      </main>

      <footer className="relative z-10 border-t border-line/60 py-8 text-center">
        <div className="mb-4 flex justify-center">
          <GitHubRepoLink showLabel />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
          Predict it. Share it. Defend it. · World Cup 2026
        </p>
      </footer>
    </div>
  );
}

function Hero({ compact = false }) {
  if (compact) {
    return (
      <section className="relative z-10 border-b border-line/60">
        <div className="mx-auto max-w-lg px-4 py-6">
          <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-grass" />
            48 teams · 104 matches
          </p>
          <h2 className="font-display text-3xl leading-none tracking-wide text-white">
            CALL THE <span className="text-shimmer">TOURNAMENT</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Rank groups, pick eight third-placed sides, then fight through the knockouts.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative z-10 overflow-hidden border-b border-line/60">
      <div className="mx-auto max-w-[1840px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface/50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-400">
          <span className="h-2 w-2 animate-pulse rounded-full bg-grass" />
          48 teams · 104 matches · 1 trophy
        </p>
        <h2 className="max-w-4xl font-display text-4xl leading-[0.95] tracking-wide text-white sm:text-6xl lg:text-7xl">
          CALL THE WHOLE <span className="text-shimmer">TOURNAMENT</span>
        </h2>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-400">
          Rank every group, sweat the third-place race, fight through the knockouts and crown
          your champion. Drag, tap, predict — then share the bracket you'll be bragging about.
        </p>
      </div>
    </section>
  );
}

function ContinueButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold-light px-7 py-3 font-display text-base uppercase tracking-wide text-ink shadow-[0_10px_30px_-10px_rgba(230,179,57,0.6)] transition hover:brightness-110"
    >
      {children}
    </button>
  );
}

function getMatchSources(matchId) {
  const map = {
    'r16-1': ['r32-1', 'r32-3'],
    'r16-2': ['r32-2', 'r32-4'],
    'r16-3': ['r32-5', 'r32-7'],
    'r16-4': ['r32-6', 'r32-8'],
    'r16-5': ['r32-9', 'r32-11'],
    'r16-6': ['r32-10', 'r32-12'],
    'r16-7': ['r32-13', 'r32-15'],
    'r16-8': ['r32-16', 'r32-14'],
    'qf-1': ['r16-1', 'r16-2'],
    'qf-2': ['r16-3', 'r16-4'],
    'qf-3': ['r16-5', 'r16-6'],
    'qf-4': ['r16-7', 'r16-8'],
    'sf-1': ['qf-1', 'qf-2'],
    'sf-2': ['qf-3', 'qf-4'],
    'third-1': ['sf-1', 'sf-2'],
    'final-1': ['sf-1', 'sf-2'],
  };
  return map[matchId] || [];
}
