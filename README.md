# FIFA World Cup 2026 Predictor & Simulator

An interactive single-page app for predicting the full 2026 FIFA World Cup — from group-stage rankings through the knockout bracket, individual awards, and a shareable PNG export.

Built with React, Vite, and Tailwind CSS. Tournament structure follows the official 48-team format (12 groups of 4, Round of 32 through Final).

## Features

### 1. Group stage
- All 12 groups (A–L) with the April 2026 draw teams
- **Drag and drop** teams to rank them 1st through 4th in each group
- Top two from each group advance automatically
- Host and debut badges on team cards

### 2. Third-place selection
- Pick exactly **8 of 12** third-placed teams to advance to the Round of 32
- Bracket unlocks once all 8 are selected
- Resets if you change any group ranking

### 3. Knockout bracket
- Full symmetrical bracket: Round of 32 → Round of 16 → Quarters → Semis → Final
- Click a team to advance them; winning path highlighted in gold
- Official FIFA Round of 32 pairings and knockout tree
- Auto-scales to fit the viewport (full-width layout)
- **Download bracket image** — exports a high-resolution PNG of the bracket plus your award picks

### 4. Individual awards
Free-text fields for your predictions:
- **Golden Boot** — top scorer
- **Golden Glove** — best goalkeeper
- **Young Player** — best player born in 2004 or later
- **Player of the Tournament** — overall best player

Award picks appear in the downloaded PNG below the bracket.

### Other
- **Share** — copies a URL that encodes your full prediction (groups, third-place picks, bracket, awards)
- **Reset** — clears everything and returns to the top
- Progress bar and sticky step navigation across all four stages

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

## How to use

1. **Groups** — Drag teams within each group to set final standings (1st–4th).
2. **Pick 3rd place** — Select 8 third-placed teams that advance.
3. **Bracket** — Click winners through each knockout round until you have a champion.
4. **Awards** — Type your picks for the four individual awards.
5. **Share** or **Download** — Send your link to friends or save the bracket as a PNG.

Changing group rankings clears third-place picks and the knockout bracket. Changing third-place picks clears the knockout bracket.

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
├── App.jsx                 # Main state, stage layout, share/reset
├── components/
│   ├── GroupStage.jsx      # Drag-and-drop group rankings
│   ├── ThirdPlaceSelector.jsx
│   ├── BracketTree.jsx     # Knockout bracket UI + connectors
│   ├── KnockoutBracket.jsx # Bracket wrapper + PNG download
│   ├── TournamentAwards.jsx
│   ├── AwardsExportPanel.jsx
│   ├── StageStepper.jsx
│   ├── StageSection.jsx
│   ├── ProgressBar.jsx
│   └── Header.jsx
├── data/
│   ├── tournament.js       # Groups, R32 pairings, knockout tree
│   ├── bracketLayout.js    # Bracket geometry and layout
│   └── players.js          # Award definitions
└── utils/
    ├── bracket.js          # Bracket resolution, progress, URL encoding
    ├── exportBracket.js    # PNG export logic
    └── flags.js            # Flag URLs, host/debut sets
```

## Share links

Predictions are encoded in the `?bracket=` query parameter as Base64 JSON:

```json
{
  "g": { "A": ["mex", "rsa", "kor", "cze"], ... },
  "t": ["A", "B", "C", "D", "E", "F", "G", "H"],
  "k": { "r32-1": "mex", "final-1": "bra", ... },
  "a": { "goldenBoot": "...", "goldenGlove": "...", ... }
}
```

Opening a shared link restores the full state.

## Data notes

- Team and group data reflect the **April 2026 World Cup draw**
- Round of 32 matchups and third-place slot rules match **official FIFA bracket logic**
- Award fields are free text — no player database is required

## License

Private project. Not affiliated with FIFA.
