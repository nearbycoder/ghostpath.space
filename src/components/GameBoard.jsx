import { Tile } from './Tile';
import { GRID_SIZE } from '../lib/gameLogic';

export function GameBoard({ state, onMove }) {
  const { grid, player, visited, revealedTraps, status } = state;
  const isGameOver = status !== 'playing';

  return (
    <div
      className="grid gap-2 p-4 bg-gray-900/50 rounded-xl border border-gray-800 shadow-2xl backdrop-blur-sm"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}
    >
      {grid.map((tile, i) => {
        const isPlayer = player.x === tile.x && player.y === tile.y;
        const isVisited = visited.includes(i);
        const isRevealedTrap = revealedTraps.includes(i);

        // Check adjacency for interaction
        const dx = Math.abs(player.x - tile.x);
        const dy = Math.abs(player.y - tile.y);
        const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);

        const isDisabled = isGameOver || (!isAdjacent && !isPlayer);

        return (
          <Tile
            key={i}
            x={tile.x}
            y={tile.y}
            type={tile.type}
            revealed={isRevealedTrap}
            isPlayer={isPlayer}
            isVisited={isVisited}
            onClick={onMove}
            disabled={isDisabled}
          />
        );
      })}
    </div>
  );
}
