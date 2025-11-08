import React, { useEffect, useRef, useState } from 'react';

// "Cartoon Dash" — now with smoother rendering, crisp high-DPI scaling,
// anime-inspired cel shading, speed lines, parallax background, and particle bursts.

const LOGICAL_WIDTH = 960;
const LOGICAL_HEIGHT = 540;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const useAnimationFrame = (callback) => {
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const animate = (time) => {
      if (previousTimeRef.current != null) {
        const dt = (time - previousTimeRef.current) / 1000;
        callback(dt);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [callback]);
};

const GameCanvas = ({ onScoreChange, onGameOver, onStatsChange }) => {
  const canvasRef = useRef(null);
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const inputRef = useRef({ left: false, right: false, up: false });

  // Screen shake
  const shakeRef = useRef(0);

  // Player state
  const groundY = LOGICAL_HEIGHT - 80;
  const playerRef = useRef({ x: 140, y: groundY - 60, vx: 0, vy: 0, w: 44, h: 56, onGround: true, face: 1 });
  const gravity = 1800;
  const moveSpeed = 520;
  const jumpVel = -760;

  // Entities
  const starsRef = useRef([]); // collectibles
  const spikesRef = useRef([]); // obstacles
  const particlesRef = useRef([]); // visual effects
  const speedLinesRef = useRef([]);

  // Spawn helpers
  const spawnStar = () => {
    const y = groundY - 30 - Math.random() * 200;
    starsRef.current.push({ x: LOGICAL_WIDTH + 60 + Math.random() * 260, y, r: 11, t: 0 });
  };
  const spawnSpike = () => {
    spikesRef.current.push({ x: LOGICAL_WIDTH + 60 + Math.random() * 280, y: groundY - 26, w: 30, h: 30 });
  };

  const burst = (x, y, color = '#ffd54a') => {
    for (let i = 0; i < 10; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 420,
        vy: (Math.random() - 0.8) * 420,
        life: 0.6,
        color,
      });
    }
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

  useEffect(() => {
    onStatsChange?.({ score, lives, timeLeft });
  }, [score, lives, timeLeft, onStatsChange]);

  // High-DPI scaling for crisp lines
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = LOGICAL_WIDTH * dpr;
    canvas.height = LOGICAL_HEIGHT * dpr;
    canvas.style.width = '100%';
    canvas.style.height = `${(LOGICAL_HEIGHT / LOGICAL_WIDTH) * 100}%`;
    ctx.scale(dpr, dpr);
  }, []);

  // Main loop
  useAnimationFrame((dt) => {
    if (!running) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear
    ctx.clearRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Background gradient sky (anime vibe)
    const sky = ctx.createLinearGradient(0, 0, 0, LOGICAL_HEIGHT);
    sky.addColorStop(0, '#101633');
    sky.addColorStop(0.5, '#192b5a');
    sky.addColorStop(1, '#0e1729');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    // Parallax mountains
    const t = performance.now() / 1000;
    const parallax = (speed, yBase, color) => {
      ctx.fillStyle = color;
      for (let i = -1; i < 6; i++) {
        const x = ((i * 260 - t * 80 * speed) % (LOGICAL_WIDTH + 260)) - 130;
        ctx.beginPath();
        ctx.moveTo(x, yBase);
        ctx.lineTo(x + 130, yBase - 110);
        ctx.lineTo(x + 260, yBase);
        ctx.closePath();
        ctx.fill();
      }
    };
    parallax(0.4, LOGICAL_HEIGHT - 180, '#14203f');
    parallax(0.7, LOGICAL_HEIGHT - 140, '#1a2c57');

    // Ground with subtle stripes (cel shade)
    ctx.fillStyle = '#1c2b4d';
    ctx.fillRect(0, groundY, LOGICAL_WIDTH, LOGICAL_HEIGHT - groundY);
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.fillStyle = '#89c2ff';
    for (let i = 0; i < LOGICAL_WIDTH; i += 18) {
      ctx.fillRect(i, groundY, 8, LOGICAL_HEIGHT - groundY);
    }
    ctx.restore();

    // Player physics
    const p = playerRef.current;
    p.vx = 0;
    if (inputRef.current.left) p.vx -= moveSpeed;
    if (inputRef.current.right) p.vx += moveSpeed;
    if (p.vx !== 0) p.face = Math.sign(p.vx);
    if (inputRef.current.up && p.onGround) {
      p.vy = jumpVel;
      p.onGround = false;
      burst(p.x + p.w / 2, p.y + p.h / 2, '#8ec5ff');
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

    p.x = clamp(p.x, 0, LOGICAL_WIDTH - p.w);

    // Spawning
    if (Math.random() < 0.022) spawnStar();
    if (Math.random() < 0.019) spawnSpike();

    // Stars
    ctx.lineWidth = 2;
    starsRef.current.forEach((s) => {
      s.x -= 300 * dt;
      s.t += dt * 6;
      const pulse = 1 + Math.sin(s.t) * 0.15;
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(pulse, pulse);
      ctx.fillStyle = '#ffd54a';
      ctx.strokeStyle = '#ffb300';
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const rad = i % 2 === 0 ? s.r : s.r / 2;
        const x = Math.cos(angle) * rad;
        const y = Math.sin(angle) * rad;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // Spikes
    ctx.fillStyle = '#ff6b6b';
    ctx.strokeStyle = '#e63946';
    spikesRef.current.forEach((s) => {
      s.x -= 330 * dt;
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
      if (collected) {
        setScore((sc) => sc + 10);
        burst(s.x, s.y, '#ffd54a');
      }
      return !collected && s.x > -60;
    });

    // Hit spikes
    let hit = false;
    spikesRef.current = spikesRef.current.filter((s) => {
      const collide = !(p.x + p.w < s.x || p.x > s.x + s.w || p.y + p.h < s.y || p.y > s.y + s.h);
      if (collide) hit = true;
      return !collide && s.x > -60;
    });
    if (hit) {
      setLives((l) => Math.max(0, l - 1));
      p.vy = -360;
      p.onGround = false;
      shakeRef.current = 12; // screen shake frames
      burst(p.x + p.w / 2, p.y + p.h / 2, '#ff6b6b');
    }

    // Particles update
    particlesRef.current = particlesRef.current.filter((pt) => {
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      return pt.life > 0;
    });

    // Speed lines when moving fast
    if (Math.abs(p.vx) > 100 && Math.random() < 0.4) {
      speedLinesRef.current.push({
        x: p.x + (p.face > 0 ? -10 : p.w + 10),
        y: p.y + p.h / 2,
        w: 30,
        life: 0.25,
      });
    }
    speedLinesRef.current = speedLinesRef.current.filter((sl) => {
      sl.life -= dt;
      sl.x += (p.face > 0 ? -1 : 1) * 600 * dt;
      return sl.life > 0;
    });

    // Apply screen shake
    if (shakeRef.current > 0) shakeRef.current -= 1;
    const sx = (Math.random() - 0.5) * shakeRef.current;
    const sy = (Math.random() - 0.5) * shakeRef.current;
    ctx.save();
    ctx.translate(sx, sy);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, groundY + 6, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Player (cel-shaded look with outline)
    // Body
    ctx.fillStyle = '#8ec5ff';
    ctx.strokeStyle = '#1f64d7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(p.x, p.y, p.w, p.h, 12);
    } else {
      ctx.rect(p.x, p.y, p.w, p.h);
    }
    ctx.fill();
    ctx.stroke();

    // Hair tuft
    ctx.fillStyle = '#5aa2ff';
    ctx.beginPath();
    ctx.moveTo(p.x + (p.face > 0 ? 10 : p.w - 10), p.y - 6);
    ctx.quadraticCurveTo(p.x + p.w / 2, p.y - 18, p.x + (p.face > 0 ? p.w - 6 : 6), p.y - 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(p.x + 14, p.y + 18, 6, 0, Math.PI * 2);
    ctx.arc(p.x + 30, p.y + 18, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0b1020';
    ctx.beginPath();
    ctx.arc(p.x + 15 + (p.vx > 0 ? 1.5 : p.vx < 0 ? -1.5 : 0), p.y + 18, 2.6, 0, Math.PI * 2);
    ctx.arc(p.x + 29 + (p.vx > 0 ? 1.5 : p.vx < 0 ? -1.5 : 0), p.y + 18, 2.6, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (smile)
    ctx.strokeStyle = '#0b1020';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(p.x + 22, p.y + 32, 7, 0, Math.PI);
    ctx.stroke();

    // Speed lines draw
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    speedLinesRef.current.forEach((sl) => {
      ctx.beginPath();
      ctx.moveTo(sl.x, sl.y);
      ctx.lineTo(sl.x + (p.face > 0 ? -sl.w : sl.w), sl.y);
      ctx.stroke();
    });

    // Particles draw (sparkles)
    particlesRef.current.forEach((pt) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life * 1.5);
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.moveTo(pt.x, pt.y - 4);
      ctx.lineTo(pt.x + 4, pt.y);
      ctx.lineTo(pt.x, pt.y + 4);
      ctx.lineTo(pt.x - 4, pt.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Inter, system-ui, sans-serif';
    ctx.fillText(`Score: ${score}`, 16, 28);
    ctx.fillText(`Lives: ${lives}`, 16, 50);
    ctx.fillText(`Time: ${Math.max(0, timeLeft)}s`, 16, 72);
    ctx.fillText('Arrows/A-D move • W/Up/Space jump • P pause', 16, LOGICAL_HEIGHT - 14);
  });

  const reset = () => {
    setScore(0);
    setLives(3);
    setTimeLeft(60);
    playerRef.current = { x: 140, y: groundY - 60, vx: 0, vy: 0, w: 44, h: 56, onGround: true, face: 1 };
    starsRef.current = [];
    spikesRef.current = [];
    particlesRef.current = [];
    speedLinesRef.current = [];
    shakeRef.current = 0;
    setRunning(true);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl">
        <div className="aspect-[16/9] w-full">
          <canvas ref={canvasRef} className="mx-auto block w-full h-full bg-[#0b1020]" />
        </div>

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
