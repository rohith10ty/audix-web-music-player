"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface ScrollingWaveformProps
  extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
  barWidth?: number;
  barGap?: number;
  speed?: number;
  fadeEdges?: boolean;
  barColor?: string;
  activeColor?: string;
  isPlaying?: boolean;
  progress?: number; // 0 to 100
  interactive?: boolean;
  onSeek?: (percentage: number) => void;
  className?: string;
}

export function ScrollingWaveform({
  height = 48,
  barWidth = 3,
  barGap = 2,
  speed = 30,
  fadeEdges = true,
  barColor = "gray",
  activeColor = "#ef4444",
  isPlaying = true,
  progress,
  interactive = false,
  onSeek,
  className,
  ...props
}: ScrollingWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [hoverPct, setHoverPct] = useState<number>(0);

  isPlayingRef.current = isPlaying;

  // Resolve color string to actual hex/rgba
  const resolveColor = useCallback((color: string, isDefaultInactive = false) => {
    if (color === "gray" || color === "muted") {
      return isDefaultInactive ? "rgba(160, 160, 160, 0.38)" : "rgba(160, 160, 160, 0.7)";
    }
    if (color === "red" || color === "primary") {
      return "#ef4444";
    }
    if (color === "white") {
      return "rgba(255, 255, 255, 0.85)";
    }
    return color;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let width = container.clientWidth || 300;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    const resize = () => {
      if (!container || !canvas) return;
      width = container.clientWidth || 300;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    let lastTime = performance.now();

    // Amplitude noise generator based on coordinate and time
    const getAmplitude = (index: number, time: number, playing: boolean) => {
      if (!playing) {
        // Calm resting wave pattern
        const base = Math.sin(index * 0.18) * 0.22 + 0.32;
        return Math.max(0.12, Math.min(0.6, base));
      }
      // Dynamic dancing waveform harmonics
      const w1 = Math.sin(index * 0.12 + time * 0.0035) * 0.32;
      const w2 = Math.cos(index * 0.28 - time * 0.005) * 0.28;
      const w3 = Math.sin(index * 0.06 + time * 0.002) * 0.24;
      const beat = Math.pow((Math.sin(time * 0.006) + 1) / 2, 3) * 0.18;
      const total = 0.35 + w1 + w2 + w3 + beat;
      return Math.max(0.08, Math.min(0.96, total));
    };

    const draw = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (isPlayingRef.current) {
        offsetRef.current += speed * delta;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const step = barWidth + barGap;
      const totalBars = Math.ceil(width / step) + 4;
      const startOffset = -(offsetRef.current % step);

      const resolvedActive = resolveColor(activeColor);
      const resolvedInactive = resolveColor(barColor, true);

      for (let i = 0; i < totalBars; i++) {
        const x = startOffset + i * step;
        if (x + barWidth < 0 || x > width) continue;

        const globalIndex = Math.floor((offsetRef.current + x) / step);
        const amp = getAmplitude(globalIndex, currentTime, isPlayingRef.current);
        const barH = Math.max(4, amp * (height - 6));
        const y = (height - barH) / 2;

        const barProgressPct = (x / width) * 100;
        const isPlayed = progress !== undefined && barProgressPct <= progress;

        ctx.fillStyle = isPlayed ? resolvedActive : resolvedInactive;

        // Draw pill-shaped rounded bar
        const radius = Math.min(barWidth / 2, 2.5);
        ctx.beginPath();
        if (typeof ctx.roundRect === "function") {
          ctx.roundRect(x, y, barWidth, barH, radius);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      resizeObserver.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [height, barWidth, barGap, speed, barColor, activeColor, progress, resolveColor]);

  const handlePointerAction = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current || !onSeek) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const pct = (clickX / rect.width) * 100;
    onSeek(pct);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    setHoverPct((mouseX / rect.width) * 100);
  };

  return (
    <div
      ref={containerRef}
      onClick={handlePointerAction}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn(
        "relative w-full overflow-hidden select-none",
        interactive && "cursor-pointer group",
        fadeEdges && "[mask-image:linear-gradient(to_right,transparent_0%,black_8%,black_92%,transparent_100%)]",
        className
      )}
      style={{ height: `${height}px` }}
      {...props}
    >
      <canvas ref={canvasRef} className="block w-full h-full pointer-events-none" />

      {/* Interactive hover scrubber line */}
      {interactive && isHovering && (
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-red-400/80 pointer-events-none transition-opacity shadow-[0_0_8px_rgba(239,68,68,0.8)]"
          style={{ left: `${hoverPct}%` }}
        />
      )}
    </div>
  );
}

export function WaveformDemo() {
  return (
    <div className="bg-card w-full rounded-lg border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Waveform</h3>
        <p className="text-muted-foreground text-sm">
          Real-time audio visualization with smooth scrolling animation
        </p>
      </div>
      <ScrollingWaveform
        height={80}
        barWidth={3}
        barGap={2}
        speed={30}
        fadeEdges={true}
        barColor="gray"
      />
    </div>
  );
}

export default ScrollingWaveform;
