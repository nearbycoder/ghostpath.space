import clsx from 'clsx';
import { Ghost, Skull, Footprints } from 'lucide-react';

export function Tile({
  x,
  y,
  type,
  revealed,
  isPlayer,
  isVisited,
  onClick,
  disabled,
}) {
  // Determine visual state
  // If player is here: show player
  // If revealed and trap: show trap
  // If visited: show visited style
  // If hidden: show hidden style

  const isTrap = type === 'trap';

  return (
    <button
      onClick={() => onClick(x, y)}
      disabled={disabled || isPlayer || (revealed && isTrap)}
      className={clsx(
        'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg flex items-center justify-center transition-all duration-300 transform',
        'border-2',
        {
          // Player position
          'bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105 z-10':
            isPlayer,

          // Revealed Trap
          'bg-red-900/80 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]':
            revealed && isTrap && !isPlayer,

          // Visited Safe Tile
          'bg-emerald-900/40 border-emerald-500/50': isVisited && !isPlayer,

          // Hidden / Default
          'bg-gray-800 border-gray-700 hover:border-gray-500 hover:bg-gray-750':
            !isPlayer && !revealed && !isVisited,

          // Cursor styles
          'cursor-pointer hover:scale-105': !disabled && !isPlayer,
          'cursor-default': disabled || isPlayer,
        }
      )}
    >
      {isPlayer && (
        <Ghost className="w-6 h-6 sm:w-8 sm:h-8 text-white animate-bounce" />
      )}
      {revealed && isTrap && !isPlayer && (
        <Skull className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 animate-pulse" />
      )}
      {isVisited && !isPlayer && (
        <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
      )}
    </button>
  );
}
