import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Ghost, Heart, Share2, RotateCcw, Info } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useGameState } from './lib/useGameState';
import { GameBoard } from './components/GameBoard';
import { LIVES } from './lib/gameLogic';

function App() {
  const { state, stats, movePlayer, resetGame } = useGameState();
  const { lives, status, date } = state;

  useEffect(() => {
    if (status === 'won') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#34D399', '#059669'],
      });
    }
  }, [status]);

  // Keyboard controls
  useEffect(() => {
    if (status !== 'playing') return;

    const handleKeyDown = (e) => {
      const { x, y } = state.player;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          movePlayer(x, y - 1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          movePlayer(x, y + 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          movePlayer(x - 1, y);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          movePlayer(x + 1, y);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.player, status, movePlayer]);

  const handleShare = () => {
    // Generate emoji grid
    const text = `GhostPath ${date}\n${
      status === 'won' ? '🏆 Won' : '💀 Lost'
    } (${lives}/${LIVES} Lives)\n🔥 Streak: ${
      stats.currentStreak
    }\n\nPlay now: https://ghostpath.space`;
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Result copied to clipboard!');
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col items-center justify-center p-4 font-sans selection:bg-purple-500/30">
      <Toaster position="top-center" theme="dark" />

      {/* Header */}
      <header className="mb-8 text-center space-y-2">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Ghost className="w-10 h-10 text-purple-400 animate-pulse" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            GhostPath
          </h1>
        </div>
        <p className="text-gray-400 text-sm">
          Navigate the invisible maze. Watch your step.
        </p>
        <div className="flex justify-center gap-4 text-xs text-gray-500 font-mono mt-2">
          <span>Played: {stats.gamesPlayed}</span>
          <span>Streak: {stats.currentStreak}</span>
          <span>Max: {stats.maxStreak}</span>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="flex items-center gap-8 mb-6 bg-gray-900/50 px-6 py-3 rounded-full border border-gray-800 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Heart
            className={`w-5 h-5 ${
              lives > 0 ? 'text-red-500 fill-red-500' : 'text-gray-600'
            }`}
          />
          <span className="font-mono text-xl font-bold">{lives}</span>
        </div>
        <div className="w-px h-6 bg-gray-700" />
        <div className="text-sm font-medium text-gray-300">
          {status === 'playing' && 'Find the path...'}
          {status === 'won' && (
            <span className="text-emerald-400">Path Cleared!</span>
          )}
          {status === 'lost' && <span className="text-red-400">Game Over</span>}
        </div>
      </div>

      {/* Game Board */}
      <div className="relative">
        <GameBoard state={state} onMove={movePlayer} />

        {/* Overlay for Game Over / Win */}
        {status !== 'playing' && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-950/80 backdrop-blur-sm rounded-xl animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-4">
              {status === 'won' ? '🎉 Escaped!' : '💀 Trapped!'}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors"
              >
                <Share2 className="w-4 h-4" />
                Copy
              </button>
              <button
                onClick={() => {
                  const text = `GhostPath ${date}\n${
                    status === 'won' ? '🏆 Won' : '💀 Lost'
                  } (${lives}/${LIVES} Lives)\n🔥 Streak: ${
                    stats.currentStreak
                  }\n\nPlay now: https://ghostpath.space`;
                  window.open(
                    `https://x.com/intent/tweet?text=${encodeURIComponent(
                      text
                    )}`,
                    '_blank'
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-900 rounded-lg font-medium transition-colors border border-gray-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 fill-current text-white"
                  aria-hidden="true"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Post
              </button>
              {/* Dev only reset */}
              {/* <button onClick={resetGame} className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                <RotateCcw className="w-4 h-4" />
              </button> */}
            </div>
            <p className="mt-4 text-sm text-gray-400">
              Come back tomorrow for a new path.
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 max-w-md text-center text-gray-500 text-xs leading-relaxed">
        <p className="flex items-center justify-center gap-1 mb-1">
          <Info className="w-3 h-3" /> How to play
        </p>
        <p>Start at top-left. End at bottom-right.</p>
        <p>Traps are invisible. Hitting one reveals it and costs a life.</p>
        <p>Find the safe path to the exit.</p>
      </div>
    </div>
  );
}

export default App;
