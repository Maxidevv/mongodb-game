import { createContext, useContext, useReducer, useEffect } from 'react';
import { gameReducer, initialGameState } from './gameReducer.js';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState, (initial) => {
    try {
      const saved = localStorage.getItem('mongodb-game-state');
      return saved ? JSON.parse(saved) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mongodb-game-state', JSON.stringify(state));
    } catch {}
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}
