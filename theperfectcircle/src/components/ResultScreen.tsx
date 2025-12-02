'use client';

import { motion } from 'framer-motion';
import { CircleData } from '@/types';

interface ResultScreenProps {
  circle: CircleData;
  isNewBest: boolean;
  onPlayAgain: () => void;
}

export default function ResultScreen({
  circle,
  isNewBest,
  onPlayAgain,
}: ResultScreenProps) {
  const getGrade = (accuracy: number = 0): string => {
    if (accuracy >= 95) return 'Perfect!';
    if (accuracy >= 85) return 'Excellent!';
    if (accuracy >= 75) return 'Great!';
    if (accuracy >= 60) return 'Good!';
    if (accuracy >= 40) return 'Not Bad!';
    return 'Keep Trying!';
  };

  const getColor = (accuracy: number = 0): string => {
    if (accuracy >= 85) return 'text-green-400';
    if (accuracy >= 60) return 'text-blue-400';
    if (accuracy >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm"
    >
      <div className="text-center space-y-6 p-8 bg-gray-900 rounded-2xl max-w-md mx-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          <h2
            className={`text-5xl font-bold ${getColor(circle.accuracy || 0)}`}
          >
            {getGrade(circle.accuracy || 0)}
          </h2>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          <div className="text-6xl font-bold text-white">{circle.score}</div>
          <div className="text-sm text-gray-400">points</div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Accuracy:</span>
            <span className="text-white font-semibold">
              {circle.accuracy?.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Radius:</span>
            <span className="text-white font-semibold">
              {circle.radius?.toFixed(0)}px
            </span>
          </div>
        </motion.div>

        {isNewBest && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="py-2 px-4 bg-yellow-600 text-white rounded-full text-sm font-semibold"
          >
            New Best Score!
          </motion.div>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          onClick={onPlayAgain}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Draw Again
        </motion.button>
      </div>
    </motion.div>
  );
}
