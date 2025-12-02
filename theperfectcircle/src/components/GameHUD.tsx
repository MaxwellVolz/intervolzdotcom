'use client';

import { motion } from 'framer-motion';

interface GameHUDProps {
  timeRemaining: number;
  maxTime: number;
  attempts: number;
  bestScore: number;
}

export default function GameHUD({
  timeRemaining,
  maxTime,
  attempts,
  bestScore,
}: GameHUDProps) {
  const timePercent = (timeRemaining / maxTime) * 100;

  return (
    <div className="fixed top-0 left-0 right-0 z-10 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Timer bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-blue-500"
            initial={{ width: '100%' }}
            animate={{ width: `${timePercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-between text-white">
          <div className="text-sm">
            <span className="text-gray-400">Attempts:</span>{' '}
            <span className="font-semibold">{attempts}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Best:</span>{' '}
            <span className="font-semibold text-green-400">{bestScore}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-400">Time:</span>{' '}
            <span className="font-semibold">
              {(timeRemaining / 1000).toFixed(1)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
