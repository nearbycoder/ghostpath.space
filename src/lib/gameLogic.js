export const GRID_SIZE = 6;
export const TRAP_COUNT = 15; // Number of traps
export const LIVES = 5;

// Simple seeded random number generator (Mulberry32)
function mulberry32(a) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Get daily seed string YYYY-MM-DD
export function getDailySeed() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;
}

// Convert string seed to integer for PRNG
function cyrb128(str) {
  let h1 = 1779033703,
    h2 = 3144134277,
    h3 = 1013904242,
    h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
    k = str.charCodeAt(i);
    h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
    h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
    h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
    h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  return (h1 ^ h2 ^ h3 ^ h4) >>> 0;
}

export function generateGrid(dateString) {
  const seed = cyrb128(dateString);
  const random = mulberry32(seed);

  // Initialize empty grid
  let grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      grid.push({ x, y, type: 'safe', revealed: false });
    }
  }

  // Start is always (0,0), End is always (SIZE-1, SIZE-1)
  const startIdx = 0;
  const endIdx = grid.length - 1;

  // Ensure Start and End are safe
  // (They are safe by default initialization)

  // Place Traps
  // We need to ensure there is at least one valid path.
  // A simple way is to generate a random path first, mark it as "guaranteed safe",
  // then place traps randomly in the remaining spots.

  const guaranteedPath = generateRandomPath(random);
  const guaranteedIndices = new Set(
    guaranteedPath.map((p) => p.y * GRID_SIZE + p.x)
  );

  let trapsPlaced = 0;
  while (trapsPlaced < TRAP_COUNT) {
    const idx = Math.floor(random() * grid.length);
    if (
      idx !== startIdx &&
      idx !== endIdx &&
      !guaranteedIndices.has(idx) &&
      grid[idx].type !== 'trap'
    ) {
      grid[idx].type = 'trap';
      trapsPlaced++;
    }
  }

  return grid;
}

function generateRandomPath(random) {
  let path = [{ x: 0, y: 0 }];
  let current = { x: 0, y: 0 };

  while (current.x < GRID_SIZE - 1 || current.y < GRID_SIZE - 1) {
    const moves = [];
    if (current.x < GRID_SIZE - 1)
      moves.push({ x: current.x + 1, y: current.y });
    if (current.y < GRID_SIZE - 1)
      moves.push({ x: current.x, y: current.y + 1 });

    // Bias slightly towards diagonal progress if possible, or just random
    const next = moves[Math.floor(random() * moves.length)];
    path.push(next);
    current = next;
  }
  return path;
}
