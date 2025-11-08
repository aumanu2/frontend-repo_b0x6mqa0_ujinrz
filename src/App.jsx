import React, { useState, useCallback } from 'react';
import HeroCover from './components/HeroCover';
import GameCanvas from './components/GameCanvas';
import Scoreboard from './components/Scoreboard';
import HowToPlay from './components/HowToPlay';

function App() {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);

  // Receive stats from the canvas via callbacks if needed in future iterations
  const handleScoreChange = useCallback((s) => setScore(s), []);

  // We'll display lives/time from in-canvas HUD, but mirror some defaults here

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-white">
      <HeroCover />

      <main id="game-section" className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Play the Game</h2>
          <Scoreboard score={score} lives={lives} time={timeLeft} />
        </div>

        <GameCanvas
          onScoreChange={handleScoreChange}
          onGameOver={(finalScore) => {
            setScore(finalScore);
          }}
        />

        <section className="mt-10">
          <h3 className="text-xl font-semibold mb-3">How to Play</h3>
          <HowToPlay />
        </section>

        <footer className="mt-12 text-center text-white/60 text-sm">
          Built for fun. Have a great run!
        </footer>
      </main>
    </div>
  );
}

export default App;
