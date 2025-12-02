/**
 * The game phases
 */
export enum GamePhase {
  READY = 'ready',
  DRAWING = 'drawing',
  EVALUATING = 'evaluating',
  RESULT = 'result',
}

/**
 * Represents a point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Circle drawing data
 */
export interface CircleData {
  points: Point[];
  center?: Point;
  radius?: number;
  score?: number;
  accuracy?: number;
}

/**
 * Game state interface
 */
export interface GameState {
  phase: GamePhase;
  score: number;
  attempts: number;
  bestScore: number;
  currentCircle?: CircleData;
  drawStartTime?: number;
}
