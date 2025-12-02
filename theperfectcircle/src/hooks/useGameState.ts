import { useState, useCallback, useEffect } from 'react';
import { GameState, GamePhase, Point, CircleData } from '@/types';
import { evaluateCircle } from '@/lib/circleEvaluator';

const DRAW_TIMEOUT = 5000; // 5 seconds to draw

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    phase: GamePhase.READY,
    score: 0,
    attempts: 0,
    bestScore: 0,
  });

  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(DRAW_TIMEOUT);

  // Timer for drawing phase
  useEffect(() => {
    if (gameState.phase !== GamePhase.DRAWING) return;

    const startTime = gameState.drawStartTime || Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, DRAW_TIMEOUT - elapsed);

      setTimeRemaining(remaining);

      if (remaining === 0) {
        // Time's up, evaluate what was drawn
        finishDrawing();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [gameState.phase, gameState.drawStartTime]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.DRAWING,
      drawStartTime: Date.now(),
    }));
    setDrawingPoints([]);
    setTimeRemaining(DRAW_TIMEOUT);
  }, []);

  const addPoint = useCallback((point: Point) => {
    setDrawingPoints(prev => [...prev, point]);
  }, []);

  const finishDrawing = useCallback(() => {
    if (drawingPoints.length < 10) {
      // Not enough points, try again
      setGameState(prev => ({
        ...prev,
        phase: GamePhase.READY,
        attempts: prev.attempts + 1,
      }));
      setDrawingPoints([]);
      return;
    }

    // Evaluate the circle
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.EVALUATING,
    }));

    // Add a small delay for effect
    setTimeout(() => {
      const result = evaluateCircle(drawingPoints);

      setGameState(prev => ({
        ...prev,
        phase: GamePhase.RESULT,
        currentCircle: result,
        score: result.score || 0,
        bestScore: Math.max(prev.bestScore, result.score || 0),
        attempts: prev.attempts + 1,
      }));
    }, 500);
  }, [drawingPoints]);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      phase: GamePhase.READY,
      score: 0,
      attempts: 0,
      bestScore: prev.bestScore, // Keep best score
    }));
    setDrawingPoints([]);
    setTimeRemaining(DRAW_TIMEOUT);
  }, []);

  const playAgain = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      phase: GamePhase.READY,
      score: 0,
      currentCircle: undefined,
    }));
    setDrawingPoints([]);
    setTimeRemaining(DRAW_TIMEOUT);
  }, []);

  return {
    gameState,
    drawingPoints,
    timeRemaining,
    maxTime: DRAW_TIMEOUT,
    startGame,
    addPoint,
    finishDrawing,
    resetGame,
    playAgain,
  };
}
