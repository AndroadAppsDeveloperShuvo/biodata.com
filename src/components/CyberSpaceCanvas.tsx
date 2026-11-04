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

interface CADBox {
  id: string;
  label: string;
  rect: DOMRect;
  color: string;
  isHovered: boolean;
}

export const CyberSpaceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [autoScan, setAutoScan] = useState<boolean>(true);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [boidCount, setBoidCount] = useState<number>(110);
  const [fps, setFps] = useState<number>(60);

  // Intro explosion sequence timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

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

    // Mouse tracking for interactive laser target & boid attraction
    const mouse = {
      x: width / 2,
      y: height / 2,
      active: false,
      down: false,
    };

    let hoveredCadId: string | null = null;

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      // Check if mouse is hovering any CAD registered element
      const elements = document.querySelectorAll('[data-cad-id]');
      let found: string | null = null;
      elements.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (
          e.clientX >= r.left &&
          e.clientX <= r.right &&
          e.clientY >= r.top &&
          e.clientY <= r.bottom
        ) {
          found = el.getAttribute('data-cad-id');
        }
      });
      hoveredCadId = found;
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

    // Color Palette matching ignitron.dev/space video exactly
    const palette = [
      '#ff2a85', // Hot Pink
      '#ffea00', // Neon Yellow
      '#00ff66', // Vibrant Lime Green
      '#00f0ff', // High-Tech Cyan
      '#a855f7', // Electric Purple
      '#ff6b00', // Deep Orange
      '#ffffff', // Pure White
      '#3b82f6', // Vivid Blue
    ];

    const types: Boid['type'][] = ['arrow', 'arrow', 'cross', 'dash', 'triangle', 'square', 'dot'];

    // Initialize 110 Flocking Boids dispersing from explosion center
    const boids: Boid[] = [];
    const centerX = width / 2;
    const centerY = height / 2;

    for (let i = 0; i < 110; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      boids.push({
        x: centerX + (Math.random() - 0.5) * 60,
        y: centerY + (Math.random() - 0.5) * 60,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        type: types[Math.floor(Math.random() * types.length)],
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 5 + Math.random() * 6,
        angle: angle,
        trail: [],
      });
    }

    // Auto Scanner state variables
    let autoScanIndex = 0;
    let autoScanTimer = 0;
    let scanLineY = 0;
    let laserBarX = 0;

    // FPS counter state
    let frameCount = 0;
    let lastFpsCheck = performance.now();

    // Render loop
    const draw = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastFpsCheck >= 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFpsCheck)));
        frameCount = 0;
        lastFpsCheck = now;
      }

      ctx.clearRect(0, 0, width, height);

      // 1. Deep Space Pitch Black Canvas Background
      ctx.fillStyle = '#03050a';
      ctx.fillRect(0, 0, width, height);

      // 2. Blueprint Tech Grid Lines
      const gridSize = 40;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
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

      // 3. Global Sweeping Laser Scan Line
      scanLineY += 1.8;
      if (scanLineY > height) scanLineY = 0;

      const scanGrad = ctx.createLinearGradient(0, scanLineY - 20, 0, scanLineY + 20);
      scanGrad.addColorStop(0, 'rgba(255, 42, 133, 0)');
      scanGrad.addColorStop(0.5, 'rgba(255, 42, 133, 0.4)');
      scanGrad.addColorStop(1, 'rgba(255, 42, 133, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanLineY - 20, width, 40);

      ctx.strokeStyle = '#ff2a85';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, scanLineY);
      ctx.lineTo(width, scanLineY);
      ctx.stroke();

      // 4. CAD RULERS along top and left
      if (showRulers) {
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.font = '9px monospace';

        for (let x = 0; x < width; x += 80) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 6);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.stroke();
          ctx.fillText(`${x}`, x + 2, 12);
        }

        for (let y = 0; y < height; y += 80) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(6, y);
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
          ctx.stroke();
          ctx.fillText(`${y}`, 8, y + 8);
        }
      }

      // 5. INTERACTIVE CAD BOUNDING BOX & PROJECTION LASERS SYSTEM
      // Find all DOM elements registered with data-cad-id
      const cadElements = document.querySelectorAll('[data-cad-id]');
      const cadBoxes: CADBox[] = [];

      cadElements.forEach((el, index) => {
        const id = el.getAttribute('data-cad-id') || `box_${index}`;
        const label = el.getAttribute('data-cad-label') || `[NODE_0${index + 1}]`;
        const color = el.getAttribute('data-cad-color') || palette[index % palette.length];
        const rect = el.getBoundingClientRect();

        // Only draw if within viewport
        if (rect.bottom > 0 && rect.top < height && rect.right > 0 && rect.left < width) {
          cadBoxes.push({
            id,
            label,
            rect,
            color,
            isHovered: hoveredCadId === id,
          });
        }
      });

      // Auto Scanner rotation timer
      autoScanTimer++;
      if (autoScanTimer > 180 && cadBoxes.length > 0) {
        autoScanTimer = 0;
        autoScanIndex = (autoScanIndex + 1) % cadBoxes.length;
      }

      // Draw CAD Bounding Boxes and Projection Lines
      cadBoxes.forEach((box, i) => {
        const { rect, label, color } = box;
        const isActive = box.isHovered || (autoScan && i === autoScanIndex);

        const pad = 4;
        const left = rect.left - pad;
        const top = rect.top - pad;
        const w = rect.width + pad * 2;
        const h = rect.height + pad * 2;
        const right = left + w;
        const bottom = top + h;

        ctx.save();

        // If Active: Draw Full Projection Laser Guidelines to Screen Edges (like in video!)
        if (isActive) {
          ctx.strokeStyle = 'rgba(255, 42, 133, 0.7)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);

          // Top & Bottom horizontal extension laser lines
          ctx.beginPath();
          ctx.moveTo(0, top);
          ctx.lineTo(width, top);
          ctx.moveTo(0, bottom);
          ctx.lineTo(width, bottom);
          ctx.stroke();

          // Left & Right vertical extension laser lines
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
          ctx.beginPath();
          ctx.moveTo(left, 0);
          ctx.lineTo(left, height);
          ctx.moveTo(right, 0);
          ctx.lineTo(right, height);
          ctx.stroke();

          ctx.setLineDash([]);
        }

        // Bounding Box Outline
        ctx.strokeStyle = isActive ? '#00f0ff' : 'rgba(0, 240, 255, 0.3)';
        ctx.lineWidth = isActive ? 2 : 1;
        ctx.strokeRect(left, top, w, h);

        // Corner Target Crosshairs '+'
        const crossSize = isActive ? 8 : 5;
        ctx.strokeStyle = isActive ? '#ff2a85' : 'rgba(255, 42, 133, 0.6)';
        ctx.lineWidth = 1.5;

        // Top-Left Crosshair
        ctx.beginPath();
        ctx.moveTo(left - crossSize, top);
        ctx.lineTo(left + crossSize, top);
        ctx.moveTo(left, top - crossSize);
        ctx.lineTo(left, top + crossSize);
        ctx.stroke();

        // Top-Right Crosshair
        ctx.beginPath();
        ctx.moveTo(right - crossSize, top);
        ctx.lineTo(right + crossSize, top);
        ctx.moveTo(right, top - crossSize);
        ctx.lineTo(right, top + crossSize);
        ctx.stroke();

        // Bottom-Left Crosshair
        ctx.beginPath();
        ctx.moveTo(left - crossSize, bottom);
        ctx.lineTo(left + crossSize, bottom);
        ctx.moveTo(left, bottom - crossSize);
        ctx.lineTo(left, bottom + crossSize);
        ctx.stroke();

        // Bottom-Right Crosshair
        ctx.beginPath();
        ctx.moveTo(right - crossSize, bottom);
        ctx.lineTo(right + crossSize, bottom);
        ctx.moveTo(right, bottom - crossSize);
        ctx.lineTo(right, bottom + crossSize);
        ctx.stroke();

        // Dimension Tag Badge sitting on Top Border
        ctx.font = '10px monospace';
        const tagText = `${label} [${Math.round(rect.width)}x${Math.round(rect.height)}]`;
        const tagWidth = ctx.measureText(tagText).width + 12;

        ctx.fillStyle = isActive ? '#ff2a85' : 'rgba(5, 7, 14, 0.9)';
        ctx.fillRect(left + 6, top - 14, tagWidth, 14);
        ctx.strokeStyle = isActive ? '#00f0ff' : 'rgba(0, 240, 255, 0.5)';
        ctx.strokeRect(left + 6, top - 14, tagWidth, 14);

        ctx.fillStyle = isActive ? '#ffffff' : '#00f0ff';
        ctx.fillText(tagText, left + 12, top - 3);

        ctx.restore();
      });

      // 6. INTERACTIVE MOUSE LASER POINTER
      if (mouse.active) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);

        ctx.beginPath();
        ctx.moveTo(0, mouse.y);
        ctx.lineTo(width, mouse.y);
        ctx.moveTo(mouse.x, 0);
        ctx.lineTo(mouse.x, height);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = mouse.down ? '#ff2a85' : '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 16, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffea00';
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 7. REYNOLDS' BOIDS FLOCKING ALGORITHM (110 Particle Swarms)
      const visualRange = 100;
      const protectedRange = 28;
      const centeringFactor = 0.0007;
      const avoidFactor = 0.05;
      const matchingFactor = 0.045;
      const maxSpeed = 5.2;
      const minSpeed = 2.0;

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

        // Mouse gravity pull / scatter
        if (mouse.active) {
          const mdx = mouse.x - boid.x;
          const mdy = mouse.y - boid.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < 240 && mdist > 10) {
            const pull = mouse.down ? 0.45 : 0.12;
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

        boid.x += boid.vx;
        boid.y += boid.vy;
        boid.angle = Math.atan2(boid.vy, boid.vx);

        // Screen wrap
        const margin = 50;
        if (boid.x < -margin) boid.x = width + margin;
        if (boid.x > width + margin) boid.x = -margin;
        if (boid.y < -margin) boid.y = height + margin;
        if (boid.y > height + margin) boid.y = -margin;

        // Save trail
        boid.trail.push({ x: boid.x, y: boid.y });
        if (boid.trail.length > 6) boid.trail.shift();

        // Draw Boid Trail
        ctx.save();
        if (boid.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(boid.trail[0].x, boid.trail[0].y);
          for (let t = 1; t < boid.trail.length; t++) {
            ctx.lineTo(boid.trail[t].x, boid.trail[t].y);
          }
          ctx.strokeStyle = boid.color;
          ctx.globalAlpha = 0.35;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Draw Boid Particle
        ctx.translate(boid.x, boid.y);
        ctx.rotate(boid.angle);
        ctx.globalAlpha = 1.0;
        ctx.fillStyle = boid.color;
        ctx.strokeStyle = boid.color;

        const s = boid.size;

        if (boid.type === 'arrow') {
          // Sharp Chevron Triangular Arrowhead
          ctx.beginPath();
          ctx.moveTo(s * 1.5, 0);
          ctx.lineTo(-s, -s * 0.9);
          ctx.lineTo(-s * 0.3, 0);
          ctx.lineTo(-s, s * 0.9);
          ctx.closePath();
          ctx.fill();
        } else if (boid.type === 'cross') {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-s, 0);
          ctx.lineTo(s, 0);
          ctx.moveTo(0, -s);
          ctx.lineTo(0, s);
          ctx.stroke();
        } else if (boid.type === 'dash') {
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(-s, 0);
          ctx.lineTo(s, 0);
          ctx.stroke();
        } else if (boid.type === 'triangle') {
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(s, 0);
          ctx.lineTo(-s * 0.8, -s * 0.8);
          ctx.lineTo(-s * 0.8, s * 0.8);
          ctx.closePath();
          ctx.stroke();
        } else if (boid.type === 'square') {
          ctx.lineWidth = 1.5;
          ctx.strokeRect(-s / 2, -s / 2, s, s);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, s / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, [autoScan, showRulers]);

  return (
    <>
      {/* Interactive Fullscreen Canvas Overlay (pointer-events-none so users can click links underneath) */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-20"
      />

      {/* Opening Matrix Swarm Explosion Intro Banner */}
      {showIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-2xl animate-out fade-out duration-700 pointer-events-none font-mono">
          <div className="text-center p-8 border-2 border-cyan-400 rounded-3xl bg-slate-950 shadow-[0_0_80px_rgba(0,240,255,0.6)] max-w-md mx-4">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-pink-500 animate-spin mx-auto mb-4 flex items-center justify-center text-cyan-400 font-bold text-lg">
              +
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-widest mb-2 drop-shadow-[0_0_20px_rgba(0,240,255,1)]">
              IGNITRON CYBER SPACE
            </h2>
            <p className="text-cyan-400 text-xs font-bold tracking-widest uppercase mb-4">
              // INITIALIZING MATRIX BOID SWARM & CAD SCANNER
            </p>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-cyan-500/50">
              <div className="bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 h-full w-full animate-[pulse_1s_infinite]" />
            </div>
          </div>
        </div>
      )}

      {/* Floating Bottom Telemetry Control HUD Bar (matching ignitron.dev/space video) */}
      <div className="fixed bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 z-50 pointer-events-auto flex items-center justify-between sm:justify-end gap-2 font-mono text-[10px] text-cyan-300">
        <div className="bg-slate-950/95 border-2 border-cyan-400/60 px-3.5 py-1.5 rounded-2xl backdrop-blur-2xl shadow-[0_0_30px_rgba(0,240,255,0.3)] flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            32 AGENTS
          </span>
          <span className="text-cyan-400/60">•</span>
          <span className="font-bold text-cyan-300">{fps} FPS</span>
          <span className="text-cyan-400/60">•</span>
          <span className="font-bold text-pink-400">110 BOIDS</span>

          <button
            type="button"
            onClick={() => setAutoScan(!autoScan)}
            className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold transition-all cursor-pointer ${
              autoScan
                ? 'bg-cyan-400 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.5)]'
                : 'bg-slate-900 border-slate-700 text-slate-500'
            }`}
          >
            [AUTO-SCANNER: {autoScan ? 'ON' : 'OFF'}]
          </button>

          <button
            type="button"
            onClick={() => setShowRulers(!showRulers)}
            className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold transition-all cursor-pointer hidden sm:block ${
              showRulers
                ? 'bg-pink-500 text-white border-pink-400 shadow-[0_0_10px_rgba(255,42,133,0.5)]'
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
