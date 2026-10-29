import { createContext, useContext, useState } from 'react';

const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [currentRoomData, setCurrentRoomData] = useState(null);
  
  return (
    <RoomContext.Provider value={{ currentRoomData, setCurrentRoomData }}>
      {children}
    </RoomContext.Provider>
  );
}

export function useRoom() {
  const context = useContext(RoomContext);
  if (!context) throw new Error('useRoom must be used within RoomProvider');
  return context;
}
