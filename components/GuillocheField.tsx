"use client";

import { useEffect, useRef } from "react";

/** One woven band: `copies` wavy circles, each shifted by a fraction of a lobe so together they braid. */
type Band = { radius: number; amplitude: number; lobes: number; copies: number };

// Two rosettes with different lobe counts rotate against each other; their interference is the moiré.
const LAYERS: { color: string; bands: Band[] }[] = [
  {
    color: "--guilloche-ink",
    bands: [
      { radius: 0.43, amplitude: 0.034, lobes: 18, copies: 26 },
      { radius: 0.29, amplitude: 0.05, lobes: 13, copies: 20 },
      { radius: 0.13, amplitude: 0.045, lobes: 7, copies: 14 },
    ],
  },
  {
    color: "--guilloche-ink-2",
    bands: [
      { radius: 0.4, amplitude: 0.038, lobes: 19, copies: 22 },
      { radius: 0.21, amplitude: 0.05, lobes: 9, copies: 16 },
    ],
  },
];

function draw(canvas: HTMLCanvasElement, bands: Band[], color: string) {
  const size = canvas.clientWidth;
  const context = canvas.getContext("2d");
  if (!size || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = canvas.height = Math.round(size * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, size, size);
  context.strokeStyle = color;
  context.lineWidth = 0.6;
  const centre = size / 2;
  for (const band of bands) {
    const steps = band.lobes * 24;
    for (let copy = 0; copy < band.copies; copy++) {
      const shift = (copy / band.copies) * ((2 * Math.PI) / band.lobes);
      context.beginPath();
      for (let step = 0; step <= steps; step++) {
        const t = (step / steps) * 2 * Math.PI;
        const r = size * (band.radius + band.amplitude * Math.sin(band.lobes * t));
        const x = centre + r * Math.cos(t + shift);
        const y = centre + r * Math.sin(t + shift);
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
  }
}

/** Ambient security-print rosette behind the hero. Drawn once per size and colour scheme; CSS owns the motion. */
export function GuillocheField() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = root.current;
    if (!field) return;
    const canvases = [...field.querySelectorAll("canvas")];
    let width = 0;
    const paint = () => {
      width = field.clientWidth;
      const styles = getComputedStyle(field);
      canvases.forEach((canvas, index) => draw(canvas, LAYERS[index].bands, styles.getPropertyValue(LAYERS[index].color).trim()));
      field.dataset.ready = "";
    };
    paint();

    let resizeTimer: ReturnType<typeof setTimeout> | undefined;
    const resize = new ResizeObserver(() => {
      if (Math.abs(field.clientWidth - width) < 24) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(paint, 160);
    });
    resize.observe(field);
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", paint);
    // Rotation is a compositor animation; pausing it off screen keeps the GPU idle.
    const visibility = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) delete field.dataset.paused;
      else field.dataset.paused = "";
    });
    visibility.observe(field);

    return () => {
      clearTimeout(resizeTimer);
      resize.disconnect();
      visibility.disconnect();
      scheme.removeEventListener("change", paint);
    };
  }, []);

  return (
    <div ref={root} className="guilloche" aria-hidden="true">
      <canvas />
      <canvas />
    </div>
  );
}
