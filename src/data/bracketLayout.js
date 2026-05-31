export const R32_ORDER = [
  'r32-1', 'r32-3', 'r32-2', 'r32-4', 'r32-5', 'r32-7', 'r32-6', 'r32-8',
  'r32-9', 'r32-11', 'r32-10', 'r32-12', 'r32-13', 'r32-15', 'r32-16', 'r32-14',
];

/** Visual order pairs feeders adjacently so connector lines don't cross. */
export const LEFT_R32 = R32_ORDER.slice(0, 8);
export const RIGHT_R32 = R32_ORDER.slice(8, 16);

export const BRACKET_FEED = {
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
  'final-1': ['sf-1', 'sf-2'],
};

export const LEFT_FEED = {
  'r16-1': ['r32-1', 'r32-3'],
  'r16-2': ['r32-2', 'r32-4'],
  'r16-3': ['r32-5', 'r32-7'],
  'r16-4': ['r32-6', 'r32-8'],
  'qf-1': ['r16-1', 'r16-2'],
  'qf-2': ['r16-3', 'r16-4'],
  'sf-1': ['qf-1', 'qf-2'],
};

export const RIGHT_FEED = {
  'r16-5': ['r32-9', 'r32-11'],
  'r16-6': ['r32-10', 'r32-12'],
  'r16-7': ['r32-13', 'r32-15'],
  'r16-8': ['r32-16', 'r32-14'],
  'qf-3': ['r16-5', 'r16-6'],
  'qf-4': ['r16-7', 'r16-8'],
  'sf-2': ['qf-3', 'qf-4'],
};

export const LEFT_COLUMNS = [
  { id: 'r32', label: 'Round of 32', matches: LEFT_R32 },
  { id: 'r16', label: 'Round of 16', matches: ['r16-1', 'r16-2', 'r16-3', 'r16-4'] },
  { id: 'qf', label: 'Quarter-finals', matches: ['qf-1', 'qf-2'] },
  { id: 'sf', label: 'Semi-finals', matches: ['sf-1'] },
];

export const RIGHT_COLUMNS = [
  { id: 'sf', label: 'Semi-finals', matches: ['sf-2'] },
  { id: 'qf', label: 'Quarter-finals', matches: ['qf-3', 'qf-4'] },
  { id: 'r16', label: 'Round of 16', matches: ['r16-5', 'r16-6', 'r16-7', 'r16-8'] },
  { id: 'r32', label: 'Round of 32', matches: RIGHT_R32 },
];

export const MATCH_SLOT = 76;
export const MATCH_WIDTH = 204;
export const MATCH_HEIGHT = 60;
export const COLUMN_GAP = 56;
export const CENTER_GAP = 72;

export function computeHalfPositions(r32Order, feed) {
  const positions = {};

  r32Order.forEach((id, index) => {
    positions[id] = index * MATCH_SLOT + MATCH_SLOT / 2;
  });

  function centerFor(matchId) {
    if (positions[matchId] !== undefined) return positions[matchId];
    const children = feed[matchId];
    if (!children?.length) return 0;
    const centers = children.map(centerFor);
    positions[matchId] = (Math.min(...centers) + Math.max(...centers)) / 2;
    return positions[matchId];
  }

  Object.keys(feed).forEach(centerFor);
  return positions;
}

export function getHalfConnectors(feed, positions) {
  const lines = [];
  for (const [parentId, children] of Object.entries(feed)) {
    const parentY = positions[parentId];
    for (const childId of children) {
      lines.push({ from: childId, to: parentId, fromY: positions[childId], toY: parentY });
    }
  }
  return lines;
}

export function getHalfHeight() {
  return LEFT_R32.length * MATCH_SLOT;
}

export function getLeftColumnX(colIndex) {
  return colIndex * (MATCH_WIDTH + COLUMN_GAP);
}

export function getRightColumnX(colIndex, leftWidth, centerWidth) {
  return leftWidth + centerWidth + colIndex * (MATCH_WIDTH + COLUMN_GAP);
}

export function getLayoutWidth() {
  const halfCols = LEFT_COLUMNS.length;
  const sideWidth = halfCols * MATCH_WIDTH + (halfCols - 1) * COLUMN_GAP;
  const centerWidth = MATCH_WIDTH + CENTER_GAP * 2;
  return sideWidth * 2 + centerWidth;
}

// Legacy exports used elsewhere
export const ROUND_COLUMNS = [
  { id: 'r32', label: 'Round of 32', matches: R32_ORDER },
  { id: 'r16', label: 'Round of 16', matches: ['r16-1', 'r16-2', 'r16-3', 'r16-4', 'r16-5', 'r16-6', 'r16-7', 'r16-8'] },
  { id: 'qf', label: 'Quarter-finals', matches: ['qf-1', 'qf-2', 'qf-3', 'qf-4'] },
  { id: 'sf', label: 'Semi-finals', matches: ['sf-1', 'sf-2'] },
  { id: 'final', label: 'Final', matches: ['final-1'] },
];

export function computeMatchPositions() {
  const left = computeHalfPositions(LEFT_R32, LEFT_FEED);
  const right = computeHalfPositions(RIGHT_R32, RIGHT_FEED);
  return { ...left, ...right, 'final-1': getHalfHeight() / 2 };
}

export function getConnectors(positions) {
  return [
    ...getHalfConnectors(LEFT_FEED, positions),
    ...getHalfConnectors(RIGHT_FEED, positions),
    { from: 'sf-1', to: 'final-1', fromY: positions['sf-1'], toY: positions['final-1'] },
    { from: 'sf-2', to: 'final-1', fromY: positions['sf-2'], toY: positions['final-1'] },
  ];
}

export function getColumnX(columnIndex) {
  return getLeftColumnX(columnIndex);
}

export function getTotalWidth() {
  return getLayoutWidth();
}

export function getTotalHeight() {
  return getHalfHeight() + 120;
}
