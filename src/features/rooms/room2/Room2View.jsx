import { useEffect, useMemo, useRef, useState } from 'react'
import { room2Data } from './room2.data.js'
import { useRoom2Canvas } from './useRoom2Canvas.js'
import styles from './room2.module.css'

const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

export default function Room2View({ onRoomComplete, paused = false }) {
  const [score, setScore] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [drafts, setDrafts] = useState({})
  const [hintsUsed, setHintsUsed] = useState({})
  const [feedback, setFeedback] = useState({})
  const dialogRef = useRef(null)
  const game = useRoom2Canvas({ roomData: room2Data, onRoomComplete, paused })
  const activeChallenge = useMemo(() => room2Data.challenges.find((item) => item.id === game.activeTerminalId), [game.activeTerminalId])
  useEffect(() => { if (paused) return undefined; const timerId = window.setInterval(() => setSeconds((value) => value + 1), 1000); return () => window.clearInterval(timerId) }, [paused])
  useEffect(() => { if (activeChallenge) dialogRef.current?.focus() }, [activeChallenge])

  const submitAnswer = (event) => {
    event.preventDefault()
    if (!activeChallenge || feedback[activeChallenge.id]?.ok) return
    const answer = (drafts[activeChallenge.id] ?? activeChallenge.starter).toLowerCase()
    const isCorrect = activeChallenge.expectedTokens.every((token) => answer.includes(token.toLowerCase()))
    if (isCorrect) {
      setFeedback((previous) => ({ ...previous, [activeChallenge.id]: { ok: true, explanation: activeChallenge.explanation } }))
      setScore((value) => value + room2Data.pointReward)
    } else {
      setFeedback((previous) => ({ ...previous, [activeChallenge.id]: { ok: false, error: activeChallenge.backendError } }))
    }
  }
  const revealHint = () => {
    if (!activeChallenge) return
    const index = hintsUsed[activeChallenge.id] ?? 0
    if (index >= activeChallenge.hints.length) return
    setHintsUsed((previous) => ({ ...previous, [activeChallenge.id]: index + 1 }))
    setScore((value) => Math.max(0, value - room2Data.hintCost))
  }
  const openedHintCount = activeChallenge ? (hintsUsed[activeChallenge.id] ?? 0) : 0
  const activeFeedback = activeChallenge ? feedback[activeChallenge.id] : null
  const nearbyTerminal = room2Data.map.terminals.find((item) => item.id === game.nearbyTerminalId)

  return (
    <main className={styles.room}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>ESCAPE ROOM · NIVEL 02</p><h1>{room2Data.title}</h1><p className={styles.theme}>{room2Data.theme}</p></div>
        <div className={styles.hud} aria-label="Estado de la sala"><div><span>PUNTOS</span><strong>{score}</strong></div><div><span>TIEMPO</span><strong>{formatTime(seconds)}</strong></div><div><span>TERMINALES</span><strong>{game.completedTerminalIds.length}/{room2Data.challenges.length}</strong></div></div>
      </header>
      <section className={styles.theory} aria-labelledby="room2-theory-title"><div className={styles.theoryIcon} aria-hidden="true">02</div><div><p className={styles.eyebrow}>ANTES DE ENTRAR</p><h2 id="room2-theory-title">Briefing de laboratorio</h2><p>{room2Data.theory}</p></div></section>
      <section className={styles.playArea} aria-label="Sala interactiva">
        <div className={styles.gameBar}><span>SECTOR 02 <i aria-hidden="true">/</i> LABORATORIO DE SCHEMAS</span><span className={styles.controls}>WASD / flechas <b>·</b> E o espacio: interactuar</span></div>
        <div className={styles.canvasWrap}>
          <canvas ref={game.canvasRef} className={styles.canvas} width="960" height="600" tabIndex="0" aria-label="Mapa 2D de la sala. Movete con WASD o las flechas y acercate a los terminales." />
          {nearbyTerminal && !activeChallenge && <div className={styles.tooltip} role="status">Presiona E o Espacio para interactuar <span>{nearbyTerminal.label}</span></div>}
          {game.roomMessage && <div className={styles.roomMessage} role="status">{game.roomMessage}</div>}
          <div className={styles.legend}><span><i className={styles.legendActive} /> Terminal disponible</span><span><i className={styles.legendDone} /> Resuelto</span></div>
        </div>
        <footer className={styles.gameFooter}><span>CONTROLES: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> o flechas</span><span>PROGRESO <strong>{Math.round(game.completedTerminalIds.length / room2Data.challenges.length * 100)}%</strong></span></footer>
      </section>
      {activeChallenge && (
        <div className={styles.modalBackdrop}><section ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="room2-challenge-title" tabIndex="-1">
          <header className={styles.modalHeader}><div><p className={styles.eyebrow}>TERMINAL CONECTADO</p><h2 id="room2-challenge-title">{activeChallenge.title}</h2></div><button className={styles.closeButton} type="button" onClick={game.closeTerminal} aria-label="Cerrar desafío">×</button></header>
          <p className={styles.prompt}>{activeChallenge.prompt}</p>
          <form onSubmit={submitAnswer}>
            <label className={styles.editorLabel} htmlFor="room2-answer">Definición del schema</label>
            <textarea id="room2-answer" className={styles.editor} spellCheck="false" value={drafts[activeChallenge.id] ?? activeChallenge.starter} onChange={(event) => setDrafts((previous) => ({ ...previous, [activeChallenge.id]: event.target.value }))} aria-describedby="room2-hint-panel" />
            <div className={styles.hintPanel} id="room2-hint-panel"><div><strong>Pistas progresivas</strong><small>Cada pista resta {room2Data.hintCost} puntos</small></div><button type="button" className={styles.hintButton} onClick={revealHint} disabled={openedHintCount >= activeChallenge.hints.length || activeFeedback?.ok}>Ver pista {openedHintCount < activeChallenge.hints.length ? `${openedHintCount + 1}/${activeChallenge.hints.length}` : '—'}</button>{openedHintCount > 0 && <ol>{activeChallenge.hints.slice(0, openedHintCount).map((hint) => <li key={hint}>{hint}</li>)}</ol>}</div>
            {activeFeedback?.error && <div className={styles.errorBox} role="alert"><strong>Error de Mongoose</strong><code>{activeFeedback.error}</code><p>El schema todavía permite un documento inválido. Revisá las reglas y reintentá; no reiniciás la sala ni perdés la posición.</p></div>}
            {activeFeedback?.ok && <div className={styles.successBox} role="status"><strong>Terminal resuelto · +{room2Data.pointReward} puntos</strong><p>{activeFeedback.explanation}</p></div>}
            <div className={styles.modalActions}><button type="button" className={styles.secondaryButton} onClick={game.closeTerminal}>Volver a la sala</button>{activeFeedback?.ok ? <button type="button" className={styles.primaryButton} onClick={() => game.completeTerminal(activeChallenge.id)}>Continuar</button> : <button type="submit" className={styles.primaryButton}>Probar schema <span aria-hidden="true">↗</span></button>}</div>
          </form>
        </section></div>
      )}
    </main>
  )
}
