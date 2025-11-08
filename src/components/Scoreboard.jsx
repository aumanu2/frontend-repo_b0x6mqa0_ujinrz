import React from 'react';
import { Star, Heart, TimerReset } from 'lucide-react';

const Stat = ({ icon: Icon, label, value, color }) => (
  <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
    <Icon className={`w-4 h-4 ${color}`} />
    <span className="text-white/70 text-sm">{label}</span>
    <span className="text-white font-semibold ml-1">{value}</span>
  </div>
);

const Scoreboard = ({ score, lives, time }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Stat icon={Star} label="Score" value={score} color="text-yellow-300" />
      <Stat icon={Heart} label="Lives" value={lives} color="text-rose-400" />
      <Stat icon={TimerReset} label="Time" value={`${time}s`} color="text-sky-300" />
    </div>
  );
};

export default Scoreboard;
