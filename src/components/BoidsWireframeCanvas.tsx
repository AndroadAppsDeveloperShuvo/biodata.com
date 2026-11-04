import React, { useEffect, useRef } from 'react';

export const BoidsWireframeCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    const colors = ['#3b82f6', '#ef4444', '#facc15', '#a855f7', '#2dd4bf'];

    class Boid {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.size = Math.random() * 4 + 4;
      }

      update() {
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.vx += (Math.random() - 0.5) * 0.2;
        this.vy += (Math.random() - 0.5) * 0.2;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 3) {
          this.vx = (this.vx / speed) * 3;
          this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        if (!ctx) return;
        const angle = Math.atan2(this.vy, this.vx);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(this.size, 0); // Tip
        ctx.lineTo(-this.size, this.size / 1.5); // Bottom right
        ctx.lineTo(-this.size / 2, 0); // Inner center
        ctx.lineTo(-this.size, -this.size / 1.5); // Bottom left
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();

        ctx.restore();
      }
    }

    const boids: Boid[] = [];
    const numBoids = 60;
    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < boids.length; i++) {
        for (let j = i + 1; j < boids.length; j++) {
          const dx = boids[i].x - boids[j].x;
          const dy = boids[i].y - boids[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(boids[i].x, boids[i].y);
            ctx.lineTo(boids[j].x, boids[j].y);
            ctx.strokeStyle = `rgba(59, 130, 246, ${1 - dist / 100})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      for (const boid of boids) {
        boid.update();
        boid.draw();
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="boidsCanvas"
      className="fixed inset-0 z-0 pointer-events-none opacity-80"
    />
  );
};

