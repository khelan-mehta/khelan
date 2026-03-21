import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  dist: number;
  angle: number;
  size: number;
  baseAlpha: number;
  // Drift
  driftX: number;
  driftY: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function WarpTransition({
  active,
  onComplete,
}: {
  active: boolean;
  onComplete: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const activeRef = useRef(false);
  const warpStartRef = useRef(0);
  const completedRef = useRef(false);
  const frameRef = useRef(0);
  const initedRef = useRef(false);

  // Sync active prop into ref and mark warp start
  useEffect(() => {
    if (active && !activeRef.current) {
      activeRef.current = true;
      completedRef.current = false;
      warpStartRef.current = performance.now();
    }
    if (!active) {
      activeRef.current = false;
      completedRef.current = false;
    }
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let disposed = false;
    const ctx = canvas.getContext('2d')!;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio, 2);

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      canvas!.style.width = W + 'px';
      canvas!.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Init stars once — small white dots, matching drei Stars look
    if (!initedRef.current) {
      const stars: Star[] = [];
      const count = 300;
      for (let i = 0; i < count; i++) {
        const x = Math.random() * 2 - 1;
        const y = Math.random() * 2 - 1;
        const dist = Math.hypot(x, y);
        const angle = Math.atan2(y, x);
        stars.push({
          x,
          y,
          dist,
          angle,
          size: 0.2 + Math.random() * 0.5,
          baseAlpha: 0.04 + Math.random() * 0.1,
          driftX: (Math.random() - 0.5) * 0.00008,
          driftY: (Math.random() - 0.5) * 0.00008,
          twinkleSpeed: 0.3 + Math.random() * 1.2,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
      starsRef.current = stars;
      initedRef.current = true;
    }

    function easeInCubic(t: number) {
      return t * t * t;
    }
    function easeOutQuart(t: number) {
      return 1 - Math.pow(1 - t, 4);
    }
    function easeInOutCubic(t: number) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // Warp timeline (ms)
    const T_STRETCH_END = 700;
    const T_FLASH_PEAK = 1000;
    const T_SHRINK_END = 1400;
    const T_END = 1600;

    function animate() {
      if (disposed) return;
      frameRef.current = requestAnimationFrame(animate);

      const now = performance.now();
      const stars = starsRef.current;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.hypot(cx, cy);
      const isWarping = activeRef.current;
      const warpElapsed = isWarping ? now - warpStartRef.current : 0;

      // Warp phase calculations
      let streakFactor = 0;
      let flashAlpha = 0;
      let dotOut = 1;

      if (isWarping) {
        // Streak: 0 → T_STRETCH_END ramps up, holds, then shrinks
        if (warpElapsed <= T_STRETCH_END) {
          streakFactor = easeInCubic(warpElapsed / T_STRETCH_END);
        } else if (warpElapsed <= T_FLASH_PEAK) {
          streakFactor = 1;
        } else if (warpElapsed <= T_SHRINK_END) {
          streakFactor = 1 - easeOutQuart((warpElapsed - T_FLASH_PEAK) / (T_SHRINK_END - T_FLASH_PEAK));
        }

        // Flash
        if (warpElapsed > T_STRETCH_END && warpElapsed <= T_FLASH_PEAK) {
          flashAlpha = easeInOutCubic((warpElapsed - T_STRETCH_END) / (T_FLASH_PEAK - T_STRETCH_END));
        } else if (warpElapsed > T_FLASH_PEAK && warpElapsed <= T_SHRINK_END) {
          flashAlpha = 1 - easeOutQuart((warpElapsed - T_FLASH_PEAK) / (T_SHRINK_END - T_FLASH_PEAK));
        }

        // Fade dots out after shrink
        if (warpElapsed > T_SHRINK_END) {
          dotOut = 1 - Math.min(1, (warpElapsed - T_SHRINK_END) / (T_END - T_SHRINK_END));
        }

        // Signal completion at flash peak
        if (warpElapsed >= T_FLASH_PEAK && !completedRef.current) {
          completedRef.current = true;
          onComplete();
        }
      }

      // Idle time for twinkle
      const idleT = now / 1000;

      // Draw stars
      for (const star of stars) {
        // Drift position slowly
        if (!isWarping) {
          star.x += star.driftX;
          star.y += star.driftY;
          // Wrap around
          if (star.x > 1.1) star.x = -1.1;
          if (star.x < -1.1) star.x = 1.1;
          if (star.y > 1.1) star.y = -1.1;
          if (star.y < -1.1) star.y = 1.1;
          // Update cached values
          star.dist = Math.hypot(star.x, star.y);
          star.angle = Math.atan2(star.y, star.x);
        }

        const sx = cx + star.x * maxR * 0.95;
        const sy = cy + star.y * maxR * 0.95;

        // Twinkle
        const twinkle = 0.6 + 0.4 * Math.sin(idleT * star.twinkleSpeed + star.twinkleOffset);

        // Alpha: in idle mode use base low opacity, during warp brighten significantly
        let alpha: number;
        if (isWarping) {
          const warpBrightness = 0.5 + streakFactor * 0.5;
          alpha = warpBrightness * dotOut;
        } else {
          alpha = star.baseAlpha * twinkle;
        }

        if (alpha <= 0.005) continue;

        if (streakFactor > 0.01) {
          // Line pointing toward center, length proportional to distance
          const streakLen = streakFactor * Math.max(star.dist, 0.08) * maxR * 1.2;
          // Direction: toward center (negative of outward angle)
          const endX = sx - Math.cos(star.angle) * streakLen;
          const endY = sy - Math.sin(star.angle) * streakLen;

          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = '#ffffff';
          ctx.globalAlpha = alpha * 0.4;
          ctx.lineWidth = star.size;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Dot (always drawn, same size whether idle or warping)
        ctx.beginPath();
        ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = alpha;
        ctx.fill();
      }

      ctx.globalAlpha = 1;

      // White flash
      if (flashAlpha > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha * 0.92})`;
        ctx.fillRect(0, 0, W, H);
      }
    }

    animate();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}
