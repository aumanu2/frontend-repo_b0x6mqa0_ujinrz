import React from 'react';
import { Gamepad2, Sparkles, Shield } from 'lucide-react';

const HowToPlay = () => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-white mb-2">
          <Gamepad2 className="w-5 h-5 text-pink-400" />
          <h4 className="font-semibold">Controls</h4>
        </div>
        <p className="text-white/80 text-sm">
          Move with Arrow keys or A/D. Jump with W, Up, or Space. Press P to pause.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-white mb-2">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <h4 className="font-semibold">Goal</h4>
        </div>
        <p className="text-white/80 text-sm">
          Collect stars to gain points. Try to get the highest score before time runs out.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-2 text-white mb-2">
          <Shield className="w-5 h-5 text-rose-400" />
          <h4 className="font-semibold">Avoid</h4>
        </div>
        <p className="text-white/80 text-sm">
          Watch out for spikes. Each hit costs a life. Lose all lives and the run ends.
        </p>
      </div>
    </div>
  );
};

export default HowToPlay;
