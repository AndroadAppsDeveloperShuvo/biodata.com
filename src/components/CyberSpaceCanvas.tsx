import React, { useEffect, useRef, useState } from 'react';

interface Boid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'arrow' | 'cross' | 'dash' | 'square' | 'triangle' | 'dot';
  color: string;
  size: number;
  angle: number;
  trail: { x: number; y: number }[];
}

export const CyberSpaceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [boidCount, setBoidCount] = useState<number>(90);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showLaserGrid, setShowLaserGrid] = useState<boolean>(true);
  const [fps, setFps] = useState<number>(60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse & Touch tracking for laser crosshair and gravity pull
    const mouse = {
      x: width / 2,
      y: height / 2,
      active: false,
      down: false,
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };

    const handleMouseDown = () => {
      mouse.down = true;
    };

    const handleMouseUp = () => {
      mouse.down = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Color Palette matching ignitron.dev/space exactly
    const colors = [
      '#ff2a85', // Neon Pink
      '#ffea00', // Bright Yellow
      '#00ff66', // Electric Green
      '#00f0ff', // High-tech Cyan
      '#a855f7', // Purple
      '#ff6b00', // Vibrant Orange
      '#ffffff', // Pure White
      '#3b82f6', // Deep Blue
    ];

    const types: Boid['type'][] = ['arrow', 'arrow', 'cross', 'dash', 'square', 'triangle', 'dot'];

    // Initialize Boids
    const numBoids = 90;
    const boids: Boid[] = [];

    for (let i = 0; i < numBoids; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 3.5;
      boids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 6,
        angle: angle,
        trail: [],
      });
    }

    // FPS calculation state
    let frameCount = 0;
    let lastFpsCheck = performance.now();
    let laserY = 0;
    let laserSpeed = 1.2;

    // Render loop
    const render = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastFpsCheck >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsCheck)));
        frameCount = 0;
        lastFpsCheck = now;
      }

      ctx.clearRect(0, 0, width, height);

      // Deep Space Obsidian Background
      ctx.fillStyle = '#05070e';
      ctx.fillRect(0, 0, width, height);

      // Tech CAD Grid Lines
      const gridSize = 48;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Horizontal Laser Scanning Line
      laserY += laserSpeed;
      if (laserY > height) laserY = 0;

      if (showLaserGrid) {
        const laserGrad = ctx.createLinearGradient(0, laserY - 15, 0, laserY + 15);
        laserGrad.addColorStop(0, 'rgba(255, 42, 133, 0)');
        laserGrad.addColorStop(0.5, 'rgba(255, 42, 133, 0.35)');
        laserGrad.addColorStop(1, 'rgba(255, 42, 133, 0)');
        ctx.fillStyle = laserGrad;
        ctx.fillRect(0, laserY - 15, width, 30);

        ctx.strokeStyle = '#ff2a85';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, laserY);
        ctx.lineTo(width, laserY);
        ctx.stroke();
      }

      // Interactive Mouse Laser Crosshair
      if (mouse.active && showLaserGrid) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1;

        // X Axis Line
        ctx.beginPath();
        ctx.moveTo(0, mouse.y);
        ctx.lineTo(width, mouse.y);
        ctx.stroke();

        // Y Axis Line
        ctx.beginPath();
        ctx.moveTo(mouse.x, 0);
        ctx.lineTo(mouse.x, height);
        ctx.stroke();

        ctx.setLineDash([]);

        // Target Cross Circle at Mouse Position
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 18, 0, Math.PI * 2);
        ctx.stroke();

        // Target Center Dot
        ctx.fillStyle = mouse.down ? '#ff2a85' : '#00f0ff';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();

        // Cursor Coordinate Label Box
        ctx.font = '10px monospace';
        ctx.fillStyle = 'rgba(5, 7, 14, 0.85)';
        ctx.fillRect(mouse.x + 12, mouse.y - 22, 110, 18);
        ctx.strokeStyle = '#00f0ff';
        ctx.strokeRect(mouse.x + 12, mouse.y - 22, 110, 18);
        ctx.fillStyle = '#00f0ff';
        ctx.fillText(`X:${Math.round(mouse.x)} Y:${Math.round(mouse.y)}`, mouse.x + 18, mouse.y - 10);

        ctx.restore();
      }

      // CAD Ruler Margins along top & left
      if (showRulers) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.font = '9px monospace';

        // Top Horizontal Ruler
        for (let x = 0; x < width; x += 100) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 8);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.stroke();
          ctx.fillText(`${x}`, x + 3, 14);
        }

        // Left Vertical Ruler
        for (let y = 0; y < height; y += 100) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(8, y);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.stroke();
          ctx.fillText(`${y}`, 10, y + 8);
        }
      }

      // BOIDS FLOCKING ALGORITHM (Reynolds' Rules: Separation, Alignment, Cohesion)
      const visualRange = 90;
      const protectedRange = 25;
      const centeringFactor = 0.0006;
      const avoidFactor = 0.05;
      const matchingFactor = 0.04;
      const maxSpeed = 4.8;
      const minSpeed = 1.8;

      boids.forEach((boid, idx) => {
        let xposAvg = 0;
        let yposAvg = 0;
        let xvelAvg = 0;
        let yvelAvg = 0;
        let neighboringBoids = 0;
        let closeDx = 0;
        let closeDy = 0;

        for (let j = 0; j < boids.length; j++) {
          if (idx === j) continue;
          const other = boids[j];
          const dx = boid.x - other.x;
          const dy = boid.y - other.y;

          if (Math.abs(dx) < visualRange && Math.abs(dy) < visualRange) {
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < protectedRange) {
              closeDx += boid.x - other.x;
              closeDy += boid.y - other.y;
            } else if (dist < visualRange) {
              xposAvg += other.x;
              yposAvg += other.y;
              xvelAvg += other.vx;
              yvelAvg += other.vy;
              neighboringBoids++;
            }
          }
        }

        if (neighboringBoids > 0) {
          xposAvg = xposAvg / neighboringBoids;
          yposAvg = yposAvg / neighboringBoids;
          xvelAvg = xvelAvg / neighboringBoids;
          yvelAvg = yvelAvg / neighboringBoids;

          boid.vx += (xposAvg - boid.x) * centeringFactor;
          boid.vy += (yposAvg - boid.y) * centeringFactor;

          boid.vx += (xvelAvg - boid.vx) * matchingFactor;
          boid.vy += (yvelAvg - boid.vy) * matchingFactor;
        }

        boid.vx += closeDx * avoidFactor;
        boid.vy += closeDy * avoidFactor;

        // Mouse gravity steering
        if (mouse.active) {
          const mdx = mouse.x - boid.x;
          const mdy = mouse.y - boid.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 220 && mdist > 10) {
            const pull = mouse.down ? 0.35 : 0.08;
            boid.vx += (mdx / mdist) * pull;
            boid.vy += (mdy / mdist) * pull;
          }
        }

        // Clamp Speed
        const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
        if (speed > maxSpeed) {
          boid.vx = (boid.vx / speed) * maxSpeed;
          boid.vy = (boid.vy / speed) * maxSpeed;
        } else if (speed < minSpeed && speed > 0) {
          boid.vx = (boid.vx / speed) * minSpeed;
          boid.vy = (boid.vy / speed) * minSpeed;
        }

        // Update position
        boid.x += boid.vx;
        boid.y += boid.vy;
        boid.angle = Math.atan2(boid.vy, boid.vx);

        // Wrap boundaries smoothly
        const margin = 40;
        if (boid.x < -margin) boid.x = width + margin;
        if (boid.x > width + margin) boid.x = -margin;
        if (boid.y < -margin) boid.y = height + margin;
        if (boid.y > height + margin) boid.y = -margin;

        // Save position for motion trail
        boid.trail.push({ x: boid.x, y: boid.y });
        if (boid.trail.length > 5) boid.trail.shift();

        // Render Boid Trail
        ctx.save();
        if (boid.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(boid.trail[0].x, boid.trail[0].y);
          for (let t = 1; t < boid.trail.length; t++) {
            ctx.lineTo(boid.trail[t].x, boid.trail[t].y);
          }
          ctx.strokeStyle = boid.color;
          ctx.globalAlpha = 0.25;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Render Boid Shape
        ctx.translate(boid.x, boid.y);
        ctx.rotate(boid.angle);
        ctx.globalAlpha = 0.95;
        ctx.fillStyle = boid.color;
        ctx.strokeStyle = boid.color;

        const s = boid.size;

        if (boid.type === 'arrow') {
          // Sharp Chevron Triangular Arrowhead
          ctx.beginPath();
          ctx.moveTo(s * 1.4, 0);
          ctx.lineTo(-s, -s * 0.85);
          ctx.lineTo(-s * 0.3, 0);
          ctx.lineTo(-s, s * 0.85);
          ctx.closePath();
          ctx.fill();
        } else if (boid.type === 'cross') {
          // Plus / Target Cross
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(-s, 0);
          ctx.lineTo(s, 0);
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.stroke();
        } else if (boid.type === 'dash') {
          // Alignment Dash
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-s, 0);
          ctx.lineTo(s, 0);
          ctx.stroke();
        } else if (boid.type === 'triangle') {
          // Wireframe Delta
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s, 0);
          ctx.lineTo(-s * 0.8, -s * 0.8);
          ctx.lineTo(-s * 0.8, s * 0.8);
          ctx.closePath();
          ctx.stroke();
        } else if (boid.type === 'square') {
          // Blueprint Micro Square
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-s / 2, -s / 2, s, s);
        } else {
          // Glowing Solid Particle Dot
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [showLaserGrid, showRulers]);

  return (
    <>
      {/* Fullscreen Interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Top Banner Tag */}
      <div className="fixed top-3 left-3 z-50 pointer-events-none hidden sm:block">
        <div className="bg-slate-950/90 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] sm:text-xs px-3 py-1.5 rounded-lg shadow-[0_0_20px_rgba(0,240,255,0.3)] backdrop-blur-md flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-extrabold text-white">IGNITRON CYBER SPACE</span>
          <span className="text-pink-400 font-semibold">// MATRIX v3.0</span>
        </div>
      </div>

      {/* Floating Bottom Telemetry Control HUD Bar (matching ignitron.dev/space) */}
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 z-50 pointer-events-auto flex items-center justify-between sm:justify-end gap-2 font-mono text-[10px] text-cyan-300">
        <div className="bg-slate-950/90 border border-cyan-500/40 px-3 py-1.5 rounded-xl backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.2)] flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            32 AGENTS
          </span>
          <span className="text-cyan-400/60">•</span>
          <span className="font-bold text-cyan-300">{fps} FPS</span>
          <span className="text-cyan-400/60">•</span>
          <span className="font-bold text-pink-400">{boidCount} BOIDS</span>

          <button
            type="button"
            onClick={() => setShowLaserGrid(!showLaserGrid)}
            className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all cursor-pointer ${
              showLaserGrid
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
          >
            [SCAN: {showLaserGrid ? 'ON' : 'OFF'}]
          </button>

          <button
            type="button"
            onClick={() => setShowRulers(!showRulers)}
            className={`px-2 py-0.5 rounded border text-[9px] font-bold transition-all cursor-pointer hidden sm:block ${
              showRulers
                ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
          >
            [CAD: {showRulers ? 'ON' : 'OFF'}]
          </button>
        </div>
      </div>
    </>
  );
};
