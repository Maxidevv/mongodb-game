import { GameProvider } from './features/game/GameProvider'
import Room5 from './features/rooms/Room5'
import { roomsMock } from './features/rooms/roomsMock'
import './styles/rooms/room5.css'
import './styles/App.css'

function App() {
  const room5Data = roomsMock.find(r => r.id === 5)

  return (
    <GameProvider>
      <div className="app">
        <Room5 roomData={room5Data} />
      </div>
    </GameProvider>
  )
}

export default App
