export const initialGameState = {
  currentRoom: null,
  unlockedRooms: [1],
  completedRooms: [],
  score: 0,
  timeElapsed: 0,
  playerName: '',
};

export function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_PLAYER_NAME':
      return { ...state, playerName: action.payload };
    case 'START_ROOM':
      return { ...state, currentRoom: action.payload, timeElapsed: 0 };
    case 'COMPLETE_ROOM':
      return {
        ...state,
        completedRooms: [...new Set([...state.completedRooms, action.payload])],
        unlockedRooms: [...new Set([...state.unlockedRooms, action.payload + 1].filter(r => r <= 5))],
        score: state.score + (action.payloadScore || 100),
      };
    case 'UPDATE_TIME':
      return { ...state, timeElapsed: action.payload };
    case 'RESET_GAME':
      return initialGameState;
    default:
      return state;
  }
}
