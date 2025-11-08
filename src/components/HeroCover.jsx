import React from 'react';
import Spline from '@splinetool/react-spline';

const HeroCover = () => {
  const handleScrollToGame = () => {
    const el = document.getElementById('game-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section className="relative w-full min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline
          scene="https://prod.spline.design/atN3lqky4IzF-KEP/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      {/* Gradient overlays that don't block interaction with Spline */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/20" />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center min-h-[70vh] md:min-h-[80vh] lg:min-h-[85vh]">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-2xl">
          Cartoon Dash
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-white/90 max-w-2xl">
          A playful, fast-paced mini-game. Collect stars, dodge baddies, and set a new high score!
        </p>
        <div className="mt-8">
          <button
            onClick={handleScrollToGame}
            className="inline-flex items-center gap-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 text-sm sm:text-base font-semibold shadow-lg shadow-pink-500/30 transition"
          >
            Play Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroCover;
