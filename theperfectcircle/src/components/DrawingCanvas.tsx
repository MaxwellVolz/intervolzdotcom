'use client';

import { useRef, useEffect, useState } from 'react';
import { Point } from '@/types';

interface DrawingCanvasProps {
  onDrawStart?: () => void;
  onDrawing?: (point: Point) => void;
  onDrawEnd?: () => void;
  disabled?: boolean;
  showMinCircle?: boolean;
  drawnPoints?: Point[];
  evaluatedCircle?: {
    center: Point;
    radius: number;
  } | null;
}

const MIN_RADIUS = 60; // Minimum circle radius in pixels

export default function DrawingCanvas({
  onDrawStart,
  onDrawing,
  onDrawEnd,
  disabled = false,
  showMinCircle = true,
  drawnPoints = [],
  evaluatedCircle = null,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Update canvas size on mount and resize
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setCanvasSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Draw on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set canvas style
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw minimum circle guide
    if (showMinCircle) {
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      ctx.beginPath();
      ctx.arc(centerX, centerY, MIN_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw the path
    if (drawnPoints.length > 0) {
      ctx.beginPath();
      ctx.moveTo(drawnPoints[0].x, drawnPoints[0].y);

      for (let i = 1; i < drawnPoints.length; i++) {
        ctx.lineTo(drawnPoints[i].x, drawnPoints[i].y);
      }

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Draw points
      drawnPoints.forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });
    }

    // Draw evaluated circle
    if (evaluatedCircle) {
      ctx.beginPath();
      ctx.arc(
        evaluatedCircle.center.x,
        evaluatedCircle.center.y,
        evaluatedCircle.radius,
        0,
        Math.PI * 2
      );
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;
      ctx.setLineDash([10, 5]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw center point
      ctx.beginPath();
      ctx.arc(
        evaluatedCircle.center.x,
        evaluatedCircle.center.y,
        5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = '#10b981';
      ctx.fill();
    }
  }, [drawnPoints, showMinCircle, evaluatedCircle, canvasSize]);

  const getPoint = (clientX: number, clientY: number): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;

    e.preventDefault();
    setIsDrawing(true);
    onDrawStart?.();

    const point =
      'touches' in e
        ? getPoint(e.touches[0].clientX, e.touches[0].clientY)
        : getPoint(e.clientX, e.clientY);
    onDrawing?.(point);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;

    e.preventDefault();
    const point =
      'touches' in e
        ? getPoint(e.touches[0].clientX, e.touches[0].clientY)
        : getPoint(e.clientX, e.clientY);
    onDrawing?.(point);
  };

  const handleEnd = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;

    e.preventDefault();
    setIsDrawing(false);
    onDrawEnd?.();
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onMouseDown={handleStart}
      onMouseMove={handleMove}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      style={{
        cursor: disabled ? 'default' : 'crosshair',
        touchAction: 'none',
      }}
      className="absolute inset-0"
    />
  );
}
