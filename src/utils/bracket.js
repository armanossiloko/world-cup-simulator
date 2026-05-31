import {
  GROUP_LETTERS,
  KNOCKOUT_ROUNDS,
  R32_MATCHES,
  getTeamById,
} from '../data/tournament';
import { AWARD_DEFS, countAwardsComplete } from '../data/players';

function resolveSlot(slot, groupRankings, advancingThirdGroups) {
  if (slot.type === '1st') {
    const teamId = groupRankings[slot.group][0];
    return getTeamById(teamId);
  }
  if (slot.type === '2nd') {
    const teamId = groupRankings[slot.group][1];
    return getTeamById(teamId);
  }
  if (slot.type === '3rd') {
    const eligible = slot.groups.filter((g) => advancingThirdGroups.includes(g));
    for (const group of eligible) {
      if (advancingThirdGroups.includes(group)) {
        const teamId = groupRankings[group][2];
        return getTeamById(teamId);
      }
    }
    return null;
  }
  return null;
}

const thirdSlotUsage = new Map();

function resolveThirdSlot(slot, groupRankings, advancingThirdGroups, matchId) {
  const eligible = slot.groups.filter((g) => advancingThirdGroups.includes(g));
  if (eligible.length === 0) return null;

  for (const group of eligible) {
    const key = `${matchId}-${group}`;
    if (!thirdSlotUsage.has(key)) {
      thirdSlotUsage.set(key, true);
      const teamId = groupRankings[group][2];
      return getTeamById(teamId);
    }
  }

  const group = eligible[0];
  const teamId = groupRankings[group][2];
  return getTeamById(teamId);
}

export function resolveR32Teams(groupRankings, advancingThirdGroups) {
  thirdSlotUsage.clear();
  const usedThirdGroups = new Set();
  const teams = {};

  for (const match of R32_MATCHES) {
    let home = resolveSlot(match.home, groupRankings, advancingThirdGroups);
    let away;

    if (match.away.type === '3rd') {
      const eligible = match.away.groups.filter((g) => advancingThirdGroups.includes(g));
      const available = eligible.find((g) => !usedThirdGroups.has(g));
      if (available) {
        usedThirdGroups.add(available);
        away = getTeamById(groupRankings[available][2]);
      } else if (eligible.length > 0) {
        away = getTeamById(groupRankings[eligible[0]][2]);
      } else {
        away = null;
      }
    } else {
      away = resolveSlot(match.away, groupRankings, advancingThirdGroups);
    }

    teams[match.id] = { home, away };
  }

  return teams;
}

function getLoserFromMatch(matchId, r32Teams, knockoutWinners) {
  const teams = resolveKnockoutMatchTeams(matchId, r32Teams, knockoutWinners);
  const winnerId = knockoutWinners[matchId];
  if (!teams.home || !teams.away || !winnerId) return null;
  const loserId = winnerId === teams.home.id ? teams.away.id : teams.home.id;
  return getTeamById(loserId);
}

export function resolveKnockoutMatchTeams(matchId, r32Teams, knockoutWinners) {
  const r32Match = R32_MATCHES.find((m) => m.id === matchId);
  if (r32Match) return r32Teams[matchId] || { home: null, away: null };

  if (matchId === 'third-1') {
    const loser1 = getLoserFromMatch('sf-1', r32Teams, knockoutWinners);
    const loser2 = getLoserFromMatch('sf-2', r32Teams, knockoutWinners);
    return { home: loser1, away: loser2 };
  }

  for (const round of KNOCKOUT_ROUNDS) {
    const match = round.matches.find((m) => m.id === matchId);
    if (!match) continue;

    const homeSource = match.home;
    const awaySource = match.away;

    const homeWinnerId = knockoutWinners[homeSource];
    const awayWinnerId = knockoutWinners[awaySource];

    const home = homeWinnerId ? getTeamById(homeWinnerId) : null;
    const away = awayWinnerId ? getTeamById(awayWinnerId) : null;

    return { home, away };
  }

  return { home: null, away: null };
}

export function getAllKnockoutMatchTeams(groupRankings, advancingThirdGroups, knockoutWinners) {
  const r32Teams = resolveR32Teams(groupRankings, advancingThirdGroups);
  const allTeams = { ...r32Teams };

  for (const round of KNOCKOUT_ROUNDS) {
    if (round.id === 'r32') continue;
    for (const match of round.matches) {
      allTeams[match.id] = resolveKnockoutMatchTeams(match.id, r32Teams, knockoutWinners);
    }
  }

  return allTeams;
}

export function getThirdPlaceTeams(groupRankings) {
  return GROUP_LETTERS.map((letter) => ({
    group: letter,
    team: getTeamById(groupRankings[letter][2]),
  }));
}

export function isGroupStageComplete(groupRankings) {
  return GROUP_LETTERS.every((letter) => groupRankings[letter]?.length === 4);
}

export function isThirdPlaceComplete(advancingThirdGroups) {
  return advancingThirdGroups.length === 8;
}

export function getProgress(groupRankings, advancingThirdGroups, knockoutWinners, awards) {
  const groupsDone = GROUP_LETTERS.filter(
    (l) => groupRankings[l]?.[0] && groupRankings[l]?.[1]
  ).length;

  const thirdDone = advancingThirdGroups.length;
  const knockoutTotal = KNOCKOUT_ROUNDS.reduce((acc, r) => acc + r.matches.length, 0);
  const knockoutDone = Object.values(knockoutWinners).filter(Boolean).length;
  const awardsDone = awards ? countAwardsComplete(awards) : 0;

  const total = GROUP_LETTERS.length + 8 + knockoutTotal + AWARD_DEFS.length;
  const done = groupsDone + Math.min(thirdDone, 8) + knockoutDone + awardsDone;

  return { done, total, percent: Math.round((done / total) * 100) };
}

export function getChampion(knockoutWinners) {
  return knockoutWinners['final-1'] ? getTeamById(knockoutWinners['final-1']) : null;
}

export function encodeState(groupRankings, advancingThirdGroups, knockoutWinners, awards) {
  const state = { g: groupRankings, t: advancingThirdGroups, k: knockoutWinners, a: awards };
  return btoa(JSON.stringify(state));
}

export function decodeState(encoded) {
  try {
    const state = JSON.parse(atob(encoded));
    return {
      groupRankings: state.g,
      advancingThirdGroups: state.t,
      knockoutWinners: state.k,
      awards: state.a ?? null,
    };
  } catch {
    return null;
  }
}
