import { Point, CircleData } from '@/types';

/**
 * Calculate the center point of a set of points
 */
export function calculateCenter(points: Point[]): Point {
  if (points.length === 0) {
    return { x: 0, y: 0 };
  }

  const sum = points.reduce(
    (acc, point) => ({
      x: acc.x + point.x,
      y: acc.y + point.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: sum.x / points.length,
    y: sum.y / points.length,
  };
}

/**
 * Calculate distance between two points
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Calculate average radius from center to all points
 */
export function calculateAverageRadius(
  center: Point,
  points: Point[]
): number {
  if (points.length === 0) return 0;

  const totalDistance = points.reduce((acc, point) => {
    return acc + distance(center, point);
  }, 0);

  return totalDistance / points.length;
}

/**
 * Calculate standard deviation of distances from center
 * This measures how "circular" the drawing is
 */
export function calculateCircularity(
  center: Point,
  points: Point[],
  averageRadius: number
): number {
  if (points.length === 0) return 0;

  const squaredDifferences = points.reduce((acc, point) => {
    const dist = distance(center, point);
    const diff = dist - averageRadius;
    return acc + diff * diff;
  }, 0);

  const variance = squaredDifferences / points.length;
  const standardDeviation = Math.sqrt(variance);

  // Convert to a percentage score (lower deviation = higher score)
  // If std dev is 0 (perfect), score is 100
  // As std dev increases, score decreases
  const circularityRatio = standardDeviation / averageRadius;
  const score = Math.max(0, Math.min(100, 100 * (1 - circularityRatio * 5)));

  return score;
}

/**
 * Check if the circle is closed (start and end points are close)
 */
export function isCircleClosed(points: Point[], threshold = 30): boolean {
  if (points.length < 10) return false;

  const start = points[0];
  const end = points[points.length - 1];

  return distance(start, end) < threshold;
}

/**
 * Evaluate the drawn circle and return a score
 */
export function evaluateCircle(points: Point[]): CircleData {
  if (points.length < 10) {
    return {
      points,
      score: 0,
      accuracy: 0,
    };
  }

  const center = calculateCenter(points);
  const radius = calculateAverageRadius(center, points);
  const circularity = calculateCircularity(center, points, radius);
  const closed = isCircleClosed(points);

  // Bonus points for closing the circle
  const closedBonus = closed ? 10 : 0;

  // Penalty for too few points (jerky drawing)
  const smoothnessScore =
    points.length < 30 ? (points.length / 30) * 20 : 20;

  // Final score (max 100)
  const accuracy = Math.min(100, circularity + closedBonus);
  const score = Math.round(accuracy * 10); // Scale to 1000 points

  return {
    points,
    center,
    radius,
    score,
    accuracy,
  };
}
