import React, { useState, useCallback } from 'react';
import Spline from '@splinetool/react-spline';
import GameCanvas from './components/GameCanvas';
import Scoreboard from './components/Scoreboard';
import HowToPlay from './components/HowToPlay';

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);

  const handleScoreChange = useCallback((s) => setScore(s), []);
  const handleStatsChange = useCallback((stats) => {
    if (typeof stats?.lives === 'number') setLives(stats.lives);
    if (typeof stats?.timeLeft === 'number') setTimeLeft(stats.timeLeft);
  }, []);

  const scrollToGame = () => {
    const el = document.getElementById('game-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-white">
      {/* Hero with Spline full-width cover */}
      <section className="relative w-full min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] overflow-hidden">
        <div className="absolute inset-0">
          <Spline
            scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh]">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
            Anime Runner
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl">
            Slick, anime-styled action. Collect stars, dodge spikes, go fast.
          </p>
          <div className="mt-8">
            <button
              onClick={scrollToGame}
              className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 text-sm sm:text-base font-semibold shadow-lg shadow-pink-500/30 transition"
            >
              Play Now
            </button>
          </div>
        </div>
      </section>

      <main id="game-section" className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Play the Game</h2>
          <Scoreboard score={score} lives={lives} time={timeLeft} />
        </div>

        <GameCanvas
          onScoreChange={handleScoreChange}
          onStatsChange={handleStatsChange}
          onGameOver={(finalScore) => setScore(finalScore)}
        />

        <section className="mt-10">
          <h3 className="text-xl font-semibold mb-3">How to Play</h3>
          <HowToPlay />
        </section>

        <footer className="mt-12 text-center text-white/60 text-sm">
          Built for speed and style. Have fun!
        </footer>
      </main>
    </div>
  );
}

export default App;
