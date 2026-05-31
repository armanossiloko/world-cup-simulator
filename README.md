# FIFA World Cup 2026 Predictor & Simulator

An interactive single-page app for predicting the full 2026 FIFA World Cup — group-stage rankings, third-place selection, the knockout bracket, individual awards, and a downloadable PNG export.

Built with React, Vite, and Tailwind CSS. The tournament structure follows the official 48-team format: 12 groups of 4, Round of 32 through Final.

**Live site:** [armanossiloko.github.io/world-cup-simulator](https://armanossiloko.github.io/world-cup-simulator/)

## Features

### Group stage
- All 12 groups (A–L) loaded from editable JSON
- **Drag and drop** teams to rank them 1st through 4th
- Top two from each group advance automatically
- Host and debut badges on team cards

### Third-place selection
- Pick exactly **8 of 12** third-placed teams for the Round of 32
- Bracket picks unlock once all 8 are selected
- Changing any group ranking clears third-place and knockout picks

### Knockout bracket
- Full symmetrical bracket: Round of 32 → Round of 16 → Quarters → Semis → Final
- Click a team to advance them; the winning path is highlighted in gold
- Official FIFA Round of 32 pairings and knockout tree
- Auto-scales to fit the viewport on smaller screens
- **Download bracket image** — high-resolution PNG of the bracket plus award picks

### Individual awards
Free-text fields for your predictions:
- **Golden Boot** — top scorer
- **Golden Glove** — best goalkeeper
- **Young Player** — best player born in 2004 or later
- **Player of the Tournament** — overall best player

Awards can be edited in the bracket stage and are included in the exported PNG.

### Other
- **Reset** — clears all picks in place (no page reload or scroll jump)
- **Shared links** — opening a URL with a `?bracket=` parameter restores a saved prediction

## Getting started

**Requirements:** Node.js 18+

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```bash
npm run build
npm run preview
```

Production builds use the `/world-cup-simulator/` base path for GitHub Pages. Local dev uses `/`.

## How to use

1. **Groups** — Drag teams within each group to set final standings (1st–4th).
2. **Pick 3rd place** — Select 8 third-placed teams that advance, then continue to the bracket.
3. **Bracket** — Click winners through each knockout round until you have a champion.
4. **Awards** — Enter your picks for the four individual awards.
5. **Download** — Save the bracket and awards as a PNG to share.

Changing group rankings clears third-place picks and the knockout bracket. Changing third-place picks clears the knockout bracket.

## Customizing teams

All countries, flags, and group assignments live in [`src/data/teams.json`](src/data/teams.json). Each team entry supports:

| Field | Description |
|-------|-------------|
| `id` | Internal slug used in app state |
| `name` | Display name |
| `code` | Short code (e.g. `MEX`) |
| `flag` | Emoji fallback |
| `iso` | [flagcdn.com](https://flagcdn.com) code for flag images |
| `host` | Optional — marks a host nation |
| `debut` | Optional — marks a World Cup debut |

Edit the JSON and restart the dev server to see changes. Knockout pairings and bracket logic remain in [`src/data/tournament.js`](src/data/tournament.js).

## Deployment

The repo deploys to GitHub Pages automatically on push to `master` via [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml).

To enable Pages on a fork:
1. Go to **Settings → Pages**
2. Set **Source** to **GitHub Actions**
3. Push to `master` or re-run the deploy workflow

## Tech stack

| Layer | Choice |
|-------|--------|
| UI | React 19 |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Image export | [html-to-image](https://github.com/bubkoo/html-to-image) |
| Flags | [flagcdn.com](https://flagcdn.com) |

## Project structure

```
src/
├── App.jsx                   # Main state, stage layout, reset
├── components/
│   ├── GroupStage.jsx        # Drag-and-drop group rankings
│   ├── ThirdPlaceSelector.jsx
│   ├── BracketTree.jsx       # Knockout bracket UI + connectors
│   ├── KnockoutBracket.jsx   # Bracket wrapper + PNG download
│   ├── TournamentAwards.jsx
│   ├── AwardsExportPanel.jsx
│   ├── StageSection.jsx
│   ├── Header.jsx
│   └── GitHubRepoLink.jsx
├── data/
│   ├── teams.json            # Countries, flags, and group assignments
│   ├── tournament.js         # R32 pairings and knockout tree
│   ├── bracketLayout.js      # Bracket geometry and layout
│   └── players.js            # Award definitions
└── utils/
    ├── bracket.js            # Bracket resolution, URL encoding
    ├── exportBracket.js      # PNG export logic
    └── flags.js              # Flag URLs derived from teams.json
```

## Shared bracket URLs

Predictions can be encoded in the `?bracket=` query parameter as Base64 JSON:

```json
{
  "g": { "A": ["mex", "rsa", "kor", "cze"], "...": "..." },
  "t": ["A", "B", "C", "D", "E", "F", "G", "H"],
  "k": { "r32-1": "mex", "final-1": "bra", "...": "..." },
  "a": { "goldenBoot": "...", "goldenGlove": "...", "...": "..." }
}
```

Opening a link with this parameter restores the full state on load.

## Data notes

- Team and group data reflect the **April 2026 World Cup draw**
- Round of 32 matchups and third-place slot rules follow **official FIFA bracket logic**
- Award fields are free text — no player database is required

## License

Private project. Not affiliated with FIFA.
