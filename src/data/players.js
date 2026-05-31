export const AWARD_DEFS = [
  {
    id: 'goldenBoot',
    title: 'Golden Boot',
    subtitle: 'Top scorer of the tournament',
    emoji: '👟',
    placeholder: 'e.g. Erling Haaland',
  },
  {
    id: 'goldenGlove',
    title: 'Golden Glove',
    subtitle: 'Best goalkeeper of the tournament',
    emoji: '🧤',
    placeholder: 'e.g. Emiliano Martínez',
  },
  {
    id: 'youngPlayer',
    title: 'Young Player',
    subtitle: 'Best player born in 2004 or later',
    emoji: '⭐',
    placeholder: 'e.g. Lamine Yamal',
  },
  {
    id: 'bestPlayer',
    title: 'Player of the Tournament',
    subtitle: 'Best overall player at the World Cup',
    emoji: '🏅',
    placeholder: 'e.g. Kylian Mbappé',
  },
];

export function createInitialAwards() {
  return {
    goldenBoot: '',
    goldenGlove: '',
    youngPlayer: '',
    bestPlayer: '',
  };
}

export function countAwardsComplete(awards) {
  if (!awards) return 0;
  return Object.values(awards).filter((v) => String(v ?? '').trim()).length;
}

export function isAwardsComplete(awards) {
  return countAwardsComplete(awards) === AWARD_DEFS.length;
}
