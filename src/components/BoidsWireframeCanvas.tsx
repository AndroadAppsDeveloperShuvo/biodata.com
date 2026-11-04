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

    const colors = ['#00f0ff', '#ff003c', '#4338ca', '#fbbf24'];

    class Boid {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;
      angle: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 4 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.atan2(this.vy, this.vx);
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        this.vx += (Math.random() - 0.5) * 0.1;
        this.vy += (Math.random() - 0.5) * 0.1;

        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > 2) {
          this.vx = (this.vx / speed) * 2;
          this.vy = (this.vy / speed) * 2;
        }

        this.angle = Math.atan2(this.vy, this.vx);

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(this.size * 2, 0);
        ctx.lineTo(-this.size, this.size);
        ctx.lineTo(-this.size / 2, 0);
        ctx.lineTo(-this.size, -this.size);
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fill();

        ctx.restore();
      }
    }

    const boids: Boid[] = [];
    const numBoids = Math.min(window.innerWidth / 30, 60);
    for (let i = 0; i < numBoids; i++) {
      boids.push(new Boid());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      boids.forEach((boid) => {
        boid.update();
        boid.draw();
      });

      ctx.lineWidth = 0.5;
      for (let i = 0; i < boids.length; i++) {
        for (let j = i + 1; j < boids.length; j++) {
          const dx = boids[i].x - boids[j].x;
          const dy = boids[i].y - boids[j].y;
          const dist = dx * dx + dy * dy;
          if (dist < 10000) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 - dist / 100000})`;
            ctx.moveTo(boids[i].x, boids[i].y);
            ctx.lineTo(boids[j].x, boids[j].y);
            ctx.stroke();
          }
        }
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
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none opacity-60"
    />
  );
};
