'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ClickFirefly {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  phase: number;
  pulseSpeed: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
}

// 12 Deterministic Ambient Fireflies (GPU composite only - zero reflow)
const AMBIENT_FIREFLIES = [
  { x: 10, bottom: 8, size: 5, duration: 18, delay: -4, color: '#FFD760', glow: 10 },
  { x: 18, bottom: 2, size: 4, duration: 22, delay: -14, color: '#BEF264', glow: 8 },
  { x: 28, bottom: 5, size: 5.5, duration: 19, delay: -8, color: '#FFE082', glow: 12 },
  { x: 38, bottom: 3, size: 4, duration: 24, delay: -18, color: '#FDE047', glow: 9 },
  { x: 48, bottom: 7, size: 5, duration: 20, delay: -11, color: '#A3E635', glow: 10 },
  { x: 58, bottom: 2, size: 4.5, duration: 23, delay: -15, color: '#FEF08A', glow: 9 },
  { x: 68, bottom: 8, size: 5.5, duration: 19, delay: -5, color: '#FFD760', glow: 11 },
  { x: 76, bottom: 4, size: 4, duration: 22, delay: -13, color: '#FFF59D', glow: 8 },
  { x: 84, bottom: 6, size: 5, duration: 20, delay: -9, color: '#BEF264', glow: 10 },
  { x: 92, bottom: 3, size: 4.5, duration: 23, delay: -17, color: '#FFE082', glow: 9 },
  { x: 25, bottom: 40, size: 4, duration: 21, delay: -6, color: '#FFD760', glow: 8 },
  { x: 70, bottom: 45, size: 4.5, duration: 22, delay: -12, color: '#BEF264', glow: 9 },
];

export default function InteractiveWaterShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const clickFirefliesRef = useRef<ClickFirefly[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);

    // Animation loop for interactive click fireflies
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) * 0.001;
      lastTime = time;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;

      ctx.clearRect(0, 0, w, h);

      const list = clickFirefliesRef.current;

      for (let i = list.length - 1; i >= 0; i--) {
        const f = list[i];
        f.life--;

        // Gentle sinusoidal sway & strictly upward float
        f.x += f.vx + Math.sin(time * 0.002 + f.phase) * 0.4;
        f.y += f.vy; // strictly upward (negative Y in 2D canvas)

        // Breathing glow pulse
        const pulse = (Math.sin(time * 0.003 * f.pulseSpeed + f.phase) + 1) * 0.5;
        let fade = 1.0;
        if (f.life < 150) {
          fade = f.life / 150;
        } else if (f.y < 50) {
          fade = Math.max(0, f.y / 50);
        }

        const currentAlpha = (0.35 + 0.65 * pulse) * fade;

        // Draw luminous glowing core & soft halo
        const grad = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.size * 3.5);
        grad.addColorStop(0, `rgba(255, 255, 255, ${currentAlpha})`);
        grad.addColorStop(0.25, `rgba(${f.r}, ${f.g}, ${f.b}, ${currentAlpha * 0.95})`);
        grad.addColorStop(0.65, `rgba(${Math.min(255, f.r + 20)}, ${f.g}, 60, ${currentAlpha * 0.4})`);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        if (f.life <= 0 || f.y < -20) {
          list.splice(i, 1);
        }
      }

      if (list.length > 0) {
        animFrameIdRef.current = requestAnimationFrame(render);
      } else {
        animFrameIdRef.current = null;
      }
    };

    const startAnimationLoop = () => {
      if (!animFrameIdRef.current) {
        lastTime = performance.now();
        animFrameIdRef.current = requestAnimationFrame(render);
      }
    };

    // Spawn 3 to 5 delicate fireflies on click
    const spawnClickFireflies = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;

      if (clickX < 0 || clickX > rect.width || clickY < 0 || clickY > rect.height) {
        return;
      }

      const count = Math.floor(Math.random() * 3) + 3; // 3 to 5 fireflies
      for (let i = 0; i < count; i++) {
        const palette = Math.random();
        let r = 255;
        let g = 184;
        let b = 0; // Amber gold
        if (palette > 0.6) {
          r = 163;
          g = 230;
          b = 53; // Emerald
        } else if (palette > 0.3) {
          r = 255;
          g = 220;
          b = 120; // Soft champagne
        }

        // Spaced out nicely so they never clump into a glare blob
        const offsetX = (Math.random() - 0.5) * 60;
        const offsetY = (Math.random() - 0.5) * 30;

        clickFirefliesRef.current.push({
          x: clickX + offsetX,
          y: clickY + offsetY,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.6 + 0.8), // Strictly upward (negative Y in screen coords)
          size: Math.random() * 2.5 + 2.5,
          alpha: 1.0,
          phase: Math.random() * Math.PI * 2,
          pulseSpeed: Math.random() * 0.8 + 0.8,
          life: 1100, // ~18 seconds of long graceful ascent
          maxLife: 1100,
          r,
          g,
          b,
        });
      }

      startAnimationLoop();
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('input') ||
        target.closest('textarea')
      ) {
        return;
      }
      spawnClickFireflies(e.clientX, e.clientY);
    };

    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const target = touch.target as HTMLElement;
        if (
          target &&
          (target.closest('button') ||
            target.closest('a') ||
            target.closest('input') ||
            target.closest('textarea'))
        ) {
          return;
        }
        spawnClickFireflies(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch, { passive: true });

    return () => {
      window.removeEventListener('resize', setCanvasSize);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden select-none">
      {/* 1. INSTANT AMBIENT FIREFLIES (Zero-Delay: rendered directly into initial HTML/CSS) */}
      <div className="absolute inset-0 pointer-events-none">
        {AMBIENT_FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: `${f.x}%`,
              bottom: `${f.bottom}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              backgroundColor: f.color,
              boxShadow: `0 0 ${f.glow}px ${f.color}`,
              willChange: 'transform, opacity',
              animation: `fireflyAscend ${f.duration}s ease-in-out infinite`,
              animationDelay: `${f.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 2. INTERACTIVE CANVAS FOR CLICK/TOUCH SPAWNED FIREFLIES */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
    </div>
  );
}
