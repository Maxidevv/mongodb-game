import { useCallback, useState } from 'react'
import Room1View from './features/rooms/room1/Room1View.jsx'
import Room2View from './features/rooms/room2/Room2View.jsx'
import Room3View from './features/rooms/room3/Room3View.jsx'
import Room4View from './features/rooms/room4/Room4View.jsx'
import Room5View from './features/rooms/room5/Room5View.jsx'
import './App.css'

const ROOMS = [
  { title: 'Consultas con find()', topic: 'Filtros y proyecciones', icon: '⌕' },
  { title: 'Schemas y validaciones', topic: 'Reglas de Mongoose', icon: '{}' },
  { title: 'Middlewares y virtuals', topic: 'Ciclo de vida del modelo', icon: 'ƒ' },
  { title: 'Relaciones y populate', topic: 'Referencias entre colecciones', icon: '↔' },
  { title: 'Índices y explain()', topic: 'Rendimiento de consultas', icon: '⌁' },
]

const ROOM_VIEWS = [Room1View, Room2View, Room3View, Room4View, Room5View]

function App() {
  const [screen, setScreen] = useState('lobby')
  const [roomIndex, setRoomIndex] = useState(0)
  const [runId, setRunId] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const ActiveRoom = ROOM_VIEWS[roomIndex]

  const startNewGame = () => {
    setRoomIndex(0)
    setRunId((value) => value + 1)
    setHasStarted(true)
    setScreen('playing')
  }

  const handleRoomComplete = useCallback(() => {
    if (roomIndex < ROOM_VIEWS.length - 1) {
      setRoomIndex((value) => value + 1)
    } else {
      setScreen('complete')
    }
  }, [roomIndex])

  return (
    <div className="game-shell">
      {screen === 'lobby' && (
        <main className="lobby">
          <header className="lobby-topbar">
            <a className="brand" href="#inicio" aria-label="Escape Room del Backend, inicio">
              <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
              <span>BACKEND<span className="brand-light">.ESCAPE</span></span>
            </a>
            <span className="version-tag">EXPERIENCIA INTERACTIVA <i /> v1.0</span>
          </header>

          <section className="lobby-hero" aria-labelledby="game-title">
            <div className="hero-copy">
              <p className="section-kicker"><span /> SIMULACIÓN DE INCIDENTE · MONGODB</p>
              <h1 id="game-title">Escape Room<br /><span>del Backend</span></h1>
              <p className="hero-description">
                Cinco salas. Un sistema comprometido. Resolvé desafíos de backend,
                repará los servicios y encontrá la salida.
              </p>
              <div className="lobby-actions">
                {hasStarted ? (
                  <>
                    <button className="button-primary" type="button" onClick={() => setScreen('playing')}>
                      <span>Continuar partida</span><span className="button-arrow" aria-hidden="true">→</span>
                    </button>
                    <button className="button-secondary" type="button" onClick={startNewGame}>Nueva partida</button>
                  </>
                ) : (
                  <button className="button-primary" type="button" onClick={startNewGame}>
                    <span>Jugar</span><span className="button-arrow" aria-hidden="true">→</span>
                  </button>
                )}
                <button className="button-secondary" type="button" onClick={() => setShowInstructions(true)}>
                  Cómo se juega
                </button>
              </div>
              <div className="lobby-note"><span className="signal-dot" /> No necesitás instalar nada más para empezar</div>
            </div>

            <div className="hero-visual" aria-hidden="true">
              <div className="visual-glow" />
              <div className="visual-grid" />
              <div className="scan-line" />
              <div className="terminal-card">
                <div className="terminal-top"><span><i /><i /><i /></span><span>CONEXIÓN SEGURA</span></div>
                <div className="terminal-content">
                  <p className="terminal-muted">&gt; iniciando protocolo de escape...</p>
                  <p><span className="terminal-green">db.status</span>()</p>
                  <div className="terminal-output"><span>status:</span> <b>CRITICAL</b><br /><span>rooms:</span> 05<br /><span>exit:</span> <b className="terminal-red">LOCKED</b></div>
                  <p className="terminal-prompt">&gt; <span className="cursor" /></p>
                </div>
              </div>
              <div className="visual-stamp"><span>5</span><small>SALAS<br />DE DESAFÍO</small></div>
              <span className="visual-label label-top">SYS // 01</span>
              <span className="visual-label label-bottom">LAT 34°36' // DATA LAB</span>
            </div>
          </section>

          <section className="mission-strip" aria-label="Resumen de la misión">
            <div><span className="strip-icon">01</span><p><strong>EXPLORÁ</strong><small>Recorré cada laboratorio</small></p></div>
            <span className="strip-divider" />
            <div><span className="strip-icon">02</span><p><strong>RESOLVÉ</strong><small>Repará terminales backend</small></p></div>
            <span className="strip-divider" />
            <div><span className="strip-icon">03</span><p><strong>ESCAPÁ</strong><small>Desbloqueá la salida final</small></p></div>
          </section>

          <section className="rooms-overview" aria-labelledby="rooms-heading">
            <div className="rooms-heading">
              <div><p className="section-kicker">TU RUTA DE ESCAPE</p><h2 id="rooms-heading">Cinco sistemas. Una salida.</h2></div>
              <span className="rooms-count">05 <i>/</i> NIVELES</span>
            </div>
            <div className="room-cards">
              {ROOMS.map((room, index) => (
                <article className="room-card" key={room.title}>
                  <div className="room-card-head"><span className="room-number">0{index + 1}</span><span className="room-icon" aria-hidden="true">{room.icon}</span></div>
                  <h3>{room.title}</h3>
                  <p>{room.topic}</p>
                  <span className="room-card-status">{index === 0 ? 'PUNTO DE INICIO' : 'DESBLOQUEO SECUENCIAL'}</span>
                </article>
              ))}
            </div>
          </section>

          <footer className="lobby-footer">
            <span>UN JUEGO PARA APRENDER BACKEND HACIENDO</span>
            <span>HECHO PARA CURIOSOS <b>✳</b></span>
          </footer>
        </main>
      )}

      {hasStarted && screen !== 'complete' && (
        <div className="game-screen" hidden={screen !== 'playing'}>
          <nav className="game-nav" aria-label="Navegación de la partida" hidden={screen !== 'playing'}>
            <button type="button" className="back-button" onClick={() => setScreen('lobby')}>
              <span aria-hidden="true">←</span> Lobby
            </button>
            <div className="game-nav-progress" aria-label={`Sala ${roomIndex + 1} de ${ROOMS.length}`}>
              {ROOMS.map((room, index) => (
                <span key={room.title} className={index === roomIndex ? 'progress-step current' : index < roomIndex ? 'progress-step passed' : 'progress-step'} />
              ))}
              <small>SALA {String(roomIndex + 1).padStart(2, '0')} / 05</small>
            </div>
            <span className="nav-brand"><span className="brand-mark" aria-hidden="true">&lt;/&gt;</span> BACKEND.ESCAPE</span>
          </nav>
          <div className="active-room" key={`${roomIndex}-${runId}`} hidden={screen !== 'playing'}>
            <ActiveRoom onRoomComplete={handleRoomComplete} paused={screen !== 'playing'} />
          </div>
        </div>
      )}

      {screen === 'complete' && (
        <main className="completion-screen">
          <div className="completion-card">
            <span className="completion-icon" aria-hidden="true">✓</span>
            <p className="section-kicker">PROTOCOLO COMPLETADO</p>
            <h1>¡Escapaste!</h1>
            <p>Reparaste los cinco sistemas y liberaste el laboratorio. Misión cumplida.</p>
            <div className="completion-stats"><span>05 <small>SALAS</small></span><i /><span>100% <small>COMPLETADO</small></span></div>
            <button className="button-primary" type="button" onClick={startNewGame}><span>Jugar de nuevo</span><span className="button-arrow" aria-hidden="true">↻</span></button>
            <button className="text-button" type="button" onClick={() => setScreen('lobby')}>Volver al lobby</button>
          </div>
        </main>
      )}

      {screen === 'lobby' && showInstructions && (
        <div className="instructions-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowInstructions(false)
        }}>
          <section className="instructions-modal" role="dialog" aria-modal="true" aria-labelledby="instructions-title">
            <button className="instructions-close" type="button" onClick={() => setShowInstructions(false)} aria-label="Cerrar instrucciones">×</button>
            <p className="section-kicker">ANTES DE INGRESAR</p>
            <h2 id="instructions-title">Cómo jugar</h2>
            <ol>
              <li><b>Movete</b> con WASD o las flechas del teclado.</li>
              <li><b>Acercate</b> a cada terminal y presioná E o Espacio.</li>
              <li><b>Resolvé</b> el desafío. Si te trabás, pedí pistas.</li>
              <li><b>Encontrá la salida</b> para avanzar a la siguiente sala.</li>
            </ol>
            <p className="instructions-tip">Los errores son parte del aprendizaje: podés corregir tu respuesta y volver a intentarlo.</p>
            <button className="button-primary" type="button" onClick={() => { setShowInstructions(false); startNewGame() }}>
              <span>Entendido, jugar</span><span className="button-arrow" aria-hidden="true">→</span>
            </button>
          </section>
        </div>
      )}

    </div>
  )
}

export default App
