import { useEffect, useRef } from "react";

const COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

interface ConfettiProps {
  duration?: number;
  className?: string;
}

export default function Confetti({ duration, className = "fixed inset-0 pointer-events-none z-40" }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: {
      x: number; y: number; vx: number; vy: number;
      color: string; size: number; angle: number; spin: number;
    }[] = [];

    for (let i = 0; i < 160; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 300,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.2,
      });
    }

    let animId: number;
    let startTime: number | null = null;

    const draw = (ts: number) => {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      if (duration && elapsed > duration) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const fade = duration ? Math.max(0, 1 - (elapsed - duration * 0.7) / (duration * 0.3)) : 1;
      ctx.globalAlpha = fade;
      particles.forEach((p) => {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [duration]);

  return <canvas ref={canvasRef} className={className} />;
}
