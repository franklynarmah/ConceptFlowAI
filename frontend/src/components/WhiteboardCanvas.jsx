import { useRef, useEffect, useCallback } from 'react';
import { renderElement, DRAW_DURATION } from '../utils/canvasDrawings';

const W = 800;
const H = 450;

function getSceneDuration(drawings) {
  if (!drawings?.length) return 3;
  const lastDelay = Math.max(...drawings.map((d) => d.delay || 0));
  return lastDelay + DRAW_DURATION + 1.2; // hold 1.2s after last element finishes
}

export default function WhiteboardCanvas({ scene, isPlaying, onAnimationComplete }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  const doneRef = useRef(false);

  const paint = useCallback((timestamp, drawings, duration) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed = (timestamp - startRef.current) / 1000;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, W, H);

    drawings.forEach((el) => renderElement(ctx, el, elapsed));

    if (elapsed < duration) {
      rafRef.current = requestAnimationFrame((ts) => paint(ts, drawings, duration));
    } else if (!doneRef.current) {
      doneRef.current = true;
      onAnimationComplete?.();
    }
  }, [onAnimationComplete]);

  // Draw a static cleared frame (between scenes)
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#fefefe';
    ctx.fillRect(0, 0, W, H);
  };

  useEffect(() => {
    if (!scene) return;
    const drawings = scene.drawings || [];
    const duration = getSceneDuration(drawings);

    // Reset state on scene change
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;
    doneRef.current = false;
    clearCanvas();

    if (isPlaying) {
      rafRef.current = requestAnimationFrame((ts) => paint(ts, drawings, duration));
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.id, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
}
