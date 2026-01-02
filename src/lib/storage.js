const STORAGE_KEY = 'ghostpath_state_v1';
const STATS_KEY = 'ghostpath_stats_v1';

// Simple obfuscation to prevent casual peeking
function encode(data) {
  try {
    return btoa(JSON.stringify(data));
  } catch (e) {
    console.error('Failed to encode data', e);
    return null;
  }
}

function decode(str) {
  try {
    return JSON.parse(atob(str));
  } catch (e) {
    // Fallback for legacy plain JSON or errors
    try {
      return JSON.parse(str);
    } catch (e2) {
      console.error('Failed to decode data', e);
      return null;
    }
  }
}

export function saveGameState(state) {
  const encoded = encode(state);
  if (encoded) {
    localStorage.setItem(STORAGE_KEY, encoded);
  }
}

export function loadGameState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;
  return decode(saved);
}

export function clearGameState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function saveStats(stats) {
  const encoded = encode(stats);
  if (encoded) {
    localStorage.setItem(STATS_KEY, encoded);
  }
}

export function loadStats() {
  const saved = localStorage.getItem(STATS_KEY);
  const defaultStats = {
    currentStreak: 0,
    maxStreak: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    lastPlayedDate: null,
  };

  if (!saved) return defaultStats;

  const decoded = decode(saved);
  return decoded || defaultStats;
}
