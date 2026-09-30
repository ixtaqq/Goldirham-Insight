"use client";

import { useId } from "react";

interface SparklineProps {
  data: number[];
  up?: boolean;
  width?: number;
  height?: number;
  className?: string;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  up = true,
  width = 140,
  height = 44,
  className,
  strokeWidth = 2,
}: SparklineProps) {
  const gid = useId();
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = strokeWidth;
  const innerH = height - pad * 2;

  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => pad + innerH - ((v - min) / range) * innerH;

  const line = data.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ");
  const area = `${line} ${width},${height} 0,${height}`;
  const color = up ? "var(--gain)" : "var(--loss)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      <polyline
        points={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
