'use client';

import { AnimatePresence } from 'framer-motion';
import { useGameState } from '@/hooks/useGameState';
import { GamePhase } from '@/types';
import StartScreen from '@/components/StartScreen';
import DrawingCanvas from '@/components/DrawingCanvas';
import GameHUD from '@/components/GameHUD';
import ResultScreen from '@/components/ResultScreen';

export default function Home() {
  const {
    gameState,
    drawingPoints,
    timeRemaining,
    maxTime,
    startGame,
    addPoint,
    finishDrawing,
    playAgain,
  } = useGameState();

  const isNewBest = gameState.score === gameState.bestScore && gameState.score > 0;

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <AnimatePresence>
        {gameState.phase === GamePhase.READY && (
          <StartScreen onStart={startGame} />
        )}
      </AnimatePresence>

      {gameState.phase === GamePhase.DRAWING && (
        <>
          <GameHUD
            timeRemaining={timeRemaining}
            maxTime={maxTime}
            attempts={gameState.attempts}
            bestScore={gameState.bestScore}
          />
          <DrawingCanvas
            onDrawing={addPoint}
            onDrawEnd={finishDrawing}
            drawnPoints={drawingPoints}
            showMinCircle={true}
          />
        </>
      )}

      {gameState.phase === GamePhase.EVALUATING && (
        <>
          <GameHUD
            timeRemaining={0}
            maxTime={maxTime}
            attempts={gameState.attempts}
            bestScore={gameState.bestScore}
          />
          <DrawingCanvas
            disabled={true}
            drawnPoints={drawingPoints}
            showMinCircle={false}
          />
        </>
      )}

      {gameState.phase === GamePhase.RESULT && gameState.currentCircle && (
        <>
          <DrawingCanvas
            disabled={true}
            drawnPoints={drawingPoints}
            showMinCircle={false}
            evaluatedCircle={
              gameState.currentCircle.center && gameState.currentCircle.radius
                ? {
                    center: gameState.currentCircle.center,
                    radius: gameState.currentCircle.radius,
                  }
                : null
            }
          />
          <ResultScreen
            circle={gameState.currentCircle}
            isNewBest={isNewBest}
            onPlayAgain={playAgain}
          />
        </>
      )}
    </div>
  );
}
