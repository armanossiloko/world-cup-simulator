import { GROUPS, GROUP_LETTERS } from '../data/tournament';

function buildTeamMeta() {
  const isoByCode = {};
  const hostTeams = new Set();
  const debutTeams = new Set();

  for (const letter of GROUP_LETTERS) {
    for (const team of GROUPS[letter]) {
      if (team.iso) isoByCode[team.code] = team.iso;
      if (team.host) hostTeams.add(team.id);
      if (team.debut) debutTeams.add(team.id);
    }
  }

  return { isoByCode, hostTeams, debutTeams };
}

const { isoByCode, hostTeams, debutTeams } = buildTeamMeta();

export const FLAG_ISO = isoByCode;
export const HOST_TEAMS = hostTeams;
export const DEBUT_TEAMS = debutTeams;

export function getFlagUrl(code) {
  const iso = FLAG_ISO[code];
  if (!iso) return null;
  return `https://flagcdn.com/w40/${iso}.png`;
}
