# The Perfect Circle

A game where you draw a circle and get scored on how perfect it is!

**Status:** ✅ Complete and Ready to Play

## Game Features

- ✅ **Touch & Mouse Support** - Draw with mouse or touch
- ✅ **5-Second Challenge** - Complete your circle before time runs out
- ✅ **Real-time Feedback** - See your drawing as you go
- ✅ **Smart Evaluation** - Advanced circle analysis algorithm
- ✅ **Score Tracking** - Best score tracking across attempts
- ✅ **Smooth Animations** - Framer Motion powered transitions
- ✅ **Responsive Design** - Works on all screen sizes
- ✅ **Minimum Circle Guide** - Visual guide to help you
- ✅ **No Backend Required** - Pure static export

## How to Play

1. Click "Start Drawing"
2. Draw a circle with your mouse or finger
3. Try to make it as perfect as possible
4. Get scored on accuracy and circularity
5. Try to beat your best score!

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript
- **Animation:** Framer Motion
- **Graphics:** HTML5 Canvas (2D)
- **State Management:** React hooks (useState, useEffect, custom hooks)
- **Styling:** Tailwind CSS v4
- **Build:** Static export (no server required)

## Getting Started

### Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Format code
npm run format

# Check formatting
npm run format:check

# Lint code
npm run lint
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### Production Build & Deployment

```bash
# Build static export for deployment
npm run build

# Output will be in the `out/` folder
# Copy contents to your web server at /theperfectcircle/
```

## Project Structure

```
theperfectcircle/
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   │   ├── DrawingCanvas.tsx    # Canvas for drawing circles
│   │   ├── StartScreen.tsx      # Start screen
│   │   ├── GameHUD.tsx          # Timer and stats display
│   │   └── ResultScreen.tsx     # Score and results
│   ├── hooks/         # Custom React hooks
│   │   └── useGameState.ts      # Game state management
│   ├── lib/           # Utility functions
│   │   └── circleEvaluator.ts   # Circle evaluation algorithm
│   └── types/         # TypeScript type definitions
│       └── game.ts              # Game types
└── public/            # Static assets
```

## How It Works

### Circle Evaluation Algorithm

The game evaluates your circle using several metrics:

1. **Center Calculation** - Finds the average center point of all drawn points
2. **Average Radius** - Calculates the average distance from center to all points
3. **Circularity Score** - Measures how consistent the radius is (lower deviation = higher score)
4. **Closure Bonus** - Extra points if you connect the start and end points
5. **Smoothness** - Rewards smooth drawing with many points

The final score is calculated on a scale of 0-1000 points, with accuracy percentage shown.

## Game States

The game has four main phases:

1. **READY** - Start screen, press "Start Drawing" to begin
2. **DRAWING** - 5 seconds to draw your circle
3. **EVALUATING** - Brief pause while the circle is analyzed
4. **RESULT** - Shows your score, accuracy, and best score

