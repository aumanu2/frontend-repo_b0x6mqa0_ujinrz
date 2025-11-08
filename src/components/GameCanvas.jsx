import React, { useEffect, useRef, useState } from 'react';

// Simple canvas-based runner: move with arrows or A/D, jump with Space/W/Up.
// Collect stars (+10), avoid obstacles (-1 life). Game ends at 0 lives or timer runs out.

const WIDTH = 900;
const HEIGHT = 420;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current != null) {
        const deltaTime = (time - previousTimeRef.current) / 1000; // seconds
        callback(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
};

const GameCanvas = ({ onScoreChange, onGameOver }) => {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRef = useRef({ left: false, right: false, up: false });

  // Player state
  const playerRef = useRef({ x: 120, y: HEIGHT - 60, vx: 0, vy: 0, w: 38, h: 46, onGround: true });
  const gravity = 1400;
  const moveSpeed = 420;
  const jumpVel = -620;

  // Entities
  const starsRef = useRef([]); // collectibles
  const spikesRef = useRef([]); // obstacles
  const groundY = HEIGHT - 40;

  // Spawn helpers
  const spawnStar = () => {
    const y = groundY - 20 - Math.random() * 160;
    starsRef.current.push({ x: WIDTH + 40 + Math.random() * 200, y, r: 10 });
  };
  const spawnSpike = () => {
    spikesRef.current.push({ x: WIDTH + 40 + Math.random() * 200, y: groundY - 18, w: 26, h: 26 });
  };

  // Input handlers
  useEffect(() => {
    const down = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = true;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.up = true;
      if (e.code === 'KeyP') setRunning((r) => !r);
    };
    const up = (e) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') inputRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') inputRef.current.right = false;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') inputRef.current.up = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  // Timer
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (timeLeft <= 0 || lives <= 0) {
      setRunning(false);
      onGameOver?.(score);
    }
  }, [timeLeft, lives, score, onGameOver]);

  useEffect(() => {
    onScoreChange?.(score);
  }, [score, onScoreChange]);

  // Main loop
  useAnimationFrame((dt) => {
    if (!running) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Background
    ctx.fillStyle = '#0b1020';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Parallax stars
    for (let i = 0; i < 80; i++) {
      const px = (i * 47 + performance.now() / 30) % WIDTH;
      const py = (i * 29) % HEIGHT;
      ctx.fillStyle = i % 7 === 0 ? '#ffd54a' : '#9ad0ff';
      ctx.fillRect(WIDTH - px, py, 2, 2);
    }

    // Ground
    ctx.fillStyle = '#1b2b4a';
    ctx.fillRect(0, groundY, WIDTH, HEIGHT - groundY);

    // Player physics
    const p = playerRef.current;
    p.vx = 0;
    if (inputRef.current.left) p.vx -= moveSpeed;
    if (inputRef.current.right) p.vx += moveSpeed;
    if (inputRef.current.up && p.onGround) {
      p.vy = jumpVel;
      p.onGround = false;
    }

    p.vy += gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;

    // Collide with ground
    if (p.y + p.h > groundY) {
      p.y = groundY - p.h;
      p.vy = 0;
      p.onGround = true;
    }

    p.x = clamp(p.x, 0, WIDTH - p.w);

    // Spawning
    if (Math.random() < 0.02) spawnStar();
    if (Math.random() < 0.018) spawnSpike();

    // Move entities and draw
    ctx.lineWidth = 2;

    // Stars
    ctx.fillStyle = '#ffd54a';
    ctx.strokeStyle = '#ffb300';
    starsRef.current.forEach((s) => {
      s.x -= 240 * dt;
      // Draw star (simple 5-point)
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5;
        const rad = i % 2 === 0 ? s.r : s.r / 2;
        const x = s.x + Math.cos(angle) * rad;
        const y = s.y + Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Spikes
    ctx.fillStyle = '#ff6b6b';
    ctx.strokeStyle = '#e63946';
    spikesRef.current.forEach((s) => {
      s.x -= 280 * dt;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y + s.h);
      ctx.lineTo(s.x + s.w / 2, s.y);
      ctx.lineTo(s.x + s.w, s.y + s.h);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

    // Collisions
    const rectCircleOverlap = (rx, ry, rw, rh, cx, cy, cr) => {
      const closestX = clamp(cx, rx, rx + rw);
      const closestY = clamp(cy, ry, ry + rh);
      const dx = cx - closestX;
      const dy = cy - closestY;
      return dx * dx + dy * dy < cr * cr;
    };

    // Collect stars
    starsRef.current = starsRef.current.filter((s) => {
      const collected = rectCircleOverlap(p.x, p.y, p.w, p.h, s.x, s.y, s.r);
      if (collected) setScore((sc) => sc + 10);
      return !collected && s.x > -40;
    });

    // Hit spikes
    let hit = false;
    spikesRef.current = spikesRef.current.filter((s) => {
      const collide = !(p.x + p.w < s.x || p.x > s.x + s.w || p.y + p.h < s.y || p.y > s.y + s.h);
      if (collide) hit = true;
      return !collide && s.x > -40;
    });
    if (hit) {
      setLives((l) => Math.max(0, l - 1));
      // brief knockback
      p.vy = -300;
      p.onGround = false;
    }

    // Draw player (cartoony character)
    // Body
    ctx.fillStyle = '#8ec5ff';
    ctx.strokeStyle = '#2a6fd6';
    ctx.beginPath();
    ctx.roundRect(p.x, p.y, p.w, p.h, 10);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x + 12, p.y + 16, 5, 0, Math.PI * 2);
    ctx.arc(p.x + 26, p.y + 16, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b1020';
    ctx.beginPath();
    ctx.arc(p.x + 13 + (p.vx > 0 ? 1 : p.vx < 0 ? -1 : 0), p.y + 16, 2.2, 0, Math.PI * 2);
    ctx.arc(p.x + 25 + (p.vx > 0 ? 1 : p.vx < 0 ? -1 : 0), p.y + 16, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Mouth
    ctx.strokeStyle = '#0b1020';
    ctx.beginPath();
    ctx.arc(p.x + 19, p.y + 28, 6, 0, Math.PI);
    ctx.stroke();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText(`Score: ${score}`, 16, 24);
    ctx.fillText(`Lives: ${lives}`, 16, 44);
    ctx.fillText(`Time: ${Math.max(0, timeLeft)}s`, 16, 64);
    ctx.fillText('Controls: arrows/A-D to move, W/Up/Space to jump, P to pause', 16, HEIGHT - 12);
  });

  const reset = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    playerRef.current = { x: 120, y: HEIGHT - 60, vx: 0, vy: 0, w: 38, h: 46, onGround: true };
    starsRef.current = [];
    spikesRef.current = [];
    setRunning(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          className="mx-auto block w-full h-auto bg-[#0b1020]"
        />

        {!running && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <div className="text-center p-6 bg-white/10 rounded-xl border border-white/20 text-white max-w-sm mx-auto">
              <h3 className="text-2xl font-bold mb-2">Game Over</h3>
              <p className="mb-4">Your score: <span className="font-semibold">{score}</span></p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={reset}
                  className="px-4 py-2 rounded-md bg-pink-500 hover:bg-pink-600 text-white font-semibold"
                >
                  Play Again
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCanvas;
