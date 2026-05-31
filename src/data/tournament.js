import teamsByGroup from './teams.json';

export const GROUPS = teamsByGroup;

export const GROUP_LETTERS = Object.keys(GROUPS);

export const R32_MATCHES = [
  { id: 'r32-1', home: { type: '2nd', group: 'A' }, away: { type: '2nd', group: 'B' }, label: '2A vs 2B' },
  { id: 'r32-2', home: { type: '1st', group: 'E' }, away: { type: '3rd', groups: ['A', 'B', 'C', 'D', 'F'] }, label: '1E vs 3rd' },
  { id: 'r32-3', home: { type: '1st', group: 'F' }, away: { type: '2nd', group: 'C' }, label: '1F vs 2C' },
  { id: 'r32-4', home: { type: '1st', group: 'C' }, away: { type: '2nd', group: 'F' }, label: '1C vs 2F' },
  { id: 'r32-5', home: { type: '1st', group: 'I' }, away: { type: '3rd', groups: ['C', 'D', 'F', 'G', 'H'] }, label: '1I vs 3rd' },
  { id: 'r32-6', home: { type: '2nd', group: 'E' }, away: { type: '2nd', group: 'I' }, label: '2E vs 2I' },
  { id: 'r32-7', home: { type: '1st', group: 'A' }, away: { type: '3rd', groups: ['C', 'E', 'F', 'H', 'I'] }, label: '1A vs 3rd' },
  { id: 'r32-8', home: { type: '1st', group: 'L' }, away: { type: '3rd', groups: ['E', 'H', 'I', 'J', 'K'] }, label: '1L vs 3rd' },
  { id: 'r32-9', home: { type: '1st', group: 'D' }, away: { type: '3rd', groups: ['B', 'E', 'F', 'I', 'J'] }, label: '1D vs 3rd' },
  { id: 'r32-10', home: { type: '1st', group: 'G' }, away: { type: '3rd', groups: ['A', 'E', 'H', 'I', 'J'] }, label: '1G vs 3rd' },
  { id: 'r32-11', home: { type: '2nd', group: 'K' }, away: { type: '2nd', group: 'L' }, label: '2K vs 2L' },
  { id: 'r32-12', home: { type: '1st', group: 'H' }, away: { type: '2nd', group: 'J' }, label: '1H vs 2J' },
  { id: 'r32-13', home: { type: '1st', group: 'B' }, away: { type: '3rd', groups: ['E', 'F', 'G', 'I', 'J'] }, label: '1B vs 3rd' },
  { id: 'r32-14', home: { type: '1st', group: 'J' }, away: { type: '2nd', group: 'H' }, label: '1J vs 2H' },
  { id: 'r32-15', home: { type: '1st', group: 'K' }, away: { type: '3rd', groups: ['D', 'E', 'I', 'J', 'L'] }, label: '1K vs 3rd' },
  { id: 'r32-16', home: { type: '2nd', group: 'D' }, away: { type: '2nd', group: 'G' }, label: '2D vs 2G' },
];

export const KNOCKOUT_ROUNDS = [
  {
    id: 'r32',
    name: 'Round of 32',
    matches: R32_MATCHES,
  },
  {
    id: 'r16',
    name: 'Round of 16',
    matches: [
      { id: 'r16-1', home: 'r32-1', away: 'r32-3' },
      { id: 'r16-2', home: 'r32-2', away: 'r32-4' },
      { id: 'r16-3', home: 'r32-5', away: 'r32-7' },
      { id: 'r16-4', home: 'r32-6', away: 'r32-8' },
      { id: 'r16-5', home: 'r32-9', away: 'r32-11' },
      { id: 'r16-6', home: 'r32-10', away: 'r32-12' },
      { id: 'r16-7', home: 'r32-13', away: 'r32-15' },
      { id: 'r16-8', home: 'r32-16', away: 'r32-14' },
    ],
  },
  {
    id: 'qf',
    name: 'Quarter-finals',
    matches: [
      { id: 'qf-1', home: 'r16-1', away: 'r16-2' },
      { id: 'qf-2', home: 'r16-3', away: 'r16-4' },
      { id: 'qf-3', home: 'r16-5', away: 'r16-6' },
      { id: 'qf-4', home: 'r16-7', away: 'r16-8' },
    ],
  },
  {
    id: 'sf',
    name: 'Semi-finals',
    matches: [
      { id: 'sf-1', home: 'qf-1', away: 'qf-2' },
      { id: 'sf-2', home: 'qf-3', away: 'qf-4' },
    ],
  },
  {
    id: 'third',
    name: 'Third-place play-off',
    matches: [{ id: 'third-1', home: 'sf-1', away: 'sf-2', isThirdPlace: true }],
  },
  {
    id: 'final',
    name: 'Final',
    matches: [{ id: 'final-1', home: 'sf-1', away: 'sf-2' }],
  },
];

export function getTeamById(teamId) {
  for (const letter of GROUP_LETTERS) {
    const team = GROUPS[letter].find((t) => t.id === teamId);
    if (team) return { ...team, group: letter };
  }
  return null;
}

export function createInitialGroupRankings() {
  const rankings = {};
  for (const letter of GROUP_LETTERS) {
    rankings[letter] = GROUPS[letter].map((t) => t.id);
  }
  return rankings;
}

export function createInitialThirdPlaceSelection() {
  return [];
}

export function createInitialKnockoutWinners() {
  const winners = {};
  for (const round of KNOCKOUT_ROUNDS) {
    for (const match of round.matches) {
      winners[match.id] = null;
    }
  }
  return winners;
}
