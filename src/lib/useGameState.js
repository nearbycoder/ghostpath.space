import { useState, useEffect, useCallback } from 'react';
import { generateGrid, getDailySeed, LIVES, GRID_SIZE } from './gameLogic';
import { loadGameState, saveGameState, loadStats, saveStats } from './storage';

export function useGameState() {
  const [stats, setStats] = useState(() => loadStats());
  const [state, setState] = useState(() => {
    const dailySeed = getDailySeed();
    const saved = loadGameState();

    // If we have saved state for today, use it
    if (saved && saved.date === dailySeed) {
      return saved;
    }

    // Otherwise start fresh
    return {
      date: dailySeed,
      grid: generateGrid(dailySeed),
      player: { x: 0, y: 0 },
      lives: LIVES,
      status: 'playing', // playing, won, lost
      visited: [0], // Array of indices
      revealedTraps: [], // Array of indices
    };
  });

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  const movePlayer = useCallback(
    (x, y) => {
      if (state.status !== 'playing') return;

      // Check if move is valid (adjacent)
      const dx = Math.abs(x - state.player.x);
      const dy = Math.abs(y - state.player.y);
      const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

      if (!isAdjacent) return;

      const idx = y * GRID_SIZE + x;
      const tile = state.grid[idx];

      if (tile.type === 'trap') {
        // Hit a trap
        setState((prev) => {
          const newLives = prev.lives - 1;
          const newStatus = newLives <= 0 ? 'lost' : 'playing';
          return {
            ...prev,
            lives: newLives,
            status: newStatus,
            revealedTraps: [...prev.revealedTraps, idx],
          };
        });
      } else {
        // Safe move
        setState((prev) => {
          const newVisited = [...prev.visited];
          if (!newVisited.includes(idx)) {
            newVisited.push(idx);
          }

          let newStatus = prev.status;
          if (x === GRID_SIZE - 1 && y === GRID_SIZE - 1) {
            newStatus = 'won';

            // Update stats if this is the first time finishing today
            if (prev.status === 'playing') {
              const today = getDailySeed();

              setStats((currentStats) => {
                const lastPlayed = currentStats.lastPlayedDate;

                // Check if already played today to avoid double counting
                if (lastPlayed === today) {
                  return currentStats;
                }

                // Check if consecutive day
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = `${yesterday.getFullYear()}-${String(
                  yesterday.getMonth() + 1
                ).padStart(2, '0')}-${String(yesterday.getDate()).padStart(
                  2,
                  '0'
                )}`;

                let newStreak = currentStats.currentStreak;
                if (lastPlayed === yesterdayStr) {
                  newStreak += 1;
                } else {
                  newStreak = 1;
                }

                const newStats = {
                  ...currentStats,
                  gamesPlayed: currentStats.gamesPlayed + 1,
                  gamesWon: currentStats.gamesWon + 1,
                  currentStreak: newStreak,
                  maxStreak: Math.max(currentStats.maxStreak, newStreak),
                  lastPlayedDate: today,
                };
                saveStats(newStats);
                return newStats;
              });
            }
          }

          return {
            ...prev,
            player: { x, y },
            visited: newVisited,
            status: newStatus,
          };
        });
      }
    },
    [state]
  );

  const resetGame = useCallback(() => {
    // Dev only helper or for testing
    const dailySeed = getDailySeed();
    setState({
      date: dailySeed,
      grid: generateGrid(dailySeed),
      player: { x: 0, y: 0 },
      lives: LIVES,
      status: 'playing',
      visited: [0],
      revealedTraps: [],
    });
  }, []);

  return { state, stats, movePlayer, resetGame };
}
