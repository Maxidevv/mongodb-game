import { useEffect, useState } from 'react'
import { room3Data, simulateRoom3Attempt } from '../api/mock/room3.js'
import {
  ErrorBox,
  ExplanationPanel,
  HintPanel,
  HookEditor,
  TheoryCard,
} from './Room3Parts.jsx'
import './Room3.css'

const initialAnswers = {
  virtual: '',
  nombre: '',
  apellido: '',
  middleware: '',
  normalizacion: '',
}

const answerOrder = ['virtual', 'nombre', 'apellido', 'middleware', 'normalizacion']

function Room3({ data = room3Data, onAttempt = simulateRoom3Attempt }) {
  const [answers, setAnswers] = useState(initialAnswers)
  const [revealedHints, setRevealedHints] = useState(0)
  const [hintPenalty, setHintPenalty] = useState(0)
  const [response, setResponse] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const points = Math.max(0, (response?.ok ? response.puntos : 100) - hintPenalty)
  const elapsedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`

  useEffect(() => {
    if (response?.ok) return undefined

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [response?.ok])

  const handleAnswerChange = (id, value) => {
    setAnswers((current) => ({ ...current, [id]: value }))
    setResponse(null)
  }

  const revealHint = (hint) => {
    setRevealedHints((current) => current + 1)
    setHintPenalty((current) => current + hint.costo)
  }

  const handleAttempt = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setResponse(null)

    try {
      const result = await onAttempt(answerOrder.map((id) => answers[id]))
      setResponse(result)
    } catch (error) {
      setResponse({
        ok: false,
        mensaje: 'No se pudo completar el intento. Inténtalo de nuevo.',
        errorReal: error instanceof Error ? error.message : 'Error desconocido al enviar el intento.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="room3" aria-labelledby="r3-title">
      <div className="r3-shell">
        <header className="r3-header">
          <a className="r3-back-link" href="#/mapa">← Volver al mapa</a>
          <div className="r3-brand">
            <span className="r3-room-id">SALA 03 <i aria-hidden="true" /></span>
            <span className="r3-brand-name">LABORATORIO DE DATOS</span>
          </div>
          <div className="r3-header-status">
            <span className="r3-points"><span aria-hidden="true">✦</span> {points} pts</span>
            <span className="r3-time" aria-label={`Tiempo en la sala: ${elapsedTime}`}>{elapsedTime}</span>
          </div>
        </header>

        <section className="r3-hero">
          <div className="r3-hero-copy">
            <span className="r3-kicker">MONGOOSE / MIDDLEWARES Y VIRTUALS</span>
            <h1 id="r3-title">{data.titulo}</h1>
            <p>{data.historia}</p>
          </div>
          <div className="r3-seal" aria-hidden="true">
            <span>CÁMARA</span>
            <strong>03</strong>
            <span>EN ESPERA</span>
          </div>
        </section>

        <div className="r3-progress" aria-label="Progreso de la sala">
          <div className="r3-progress-meta">
            <span>PROGRESO DE LA SALA</span>
            <span>{response?.ok ? 'COMPLETADO' : 'EN CURSO'}</span>
          </div>
          <div
            className="r3-progress-track"
            role="progressbar"
            aria-label="Progreso de la sala"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={response?.ok ? 100 : 0}
          >
            <span className={response?.ok ? 'is-complete' : ''} />
          </div>
        </div>

        <div className="r3-intro-grid">
          <TheoryCard text={data.teoria} />
          <aside className="r3-card r3-mission" aria-labelledby="r3-mission-title">
            <span className="r3-kicker">MISIÓN</span>
            <h2 id="r3-mission-title">Despierta los hooks</h2>
            <p>{data.consigna}</p>
            <span className="r3-mission-tag">5 HUECOS · UNA CÁMARA</span>
          </aside>
        </div>

        <form className="r3-workbench" onSubmit={handleAttempt}>
          <HookEditor data={data} answers={answers} onChange={handleAnswerChange} />
          <div className="r3-submit-column">
            <section className="r3-card r3-submit-card" aria-labelledby="r3-submit-title">
              <span className="r3-kicker">VERIFICACIÓN</span>
              <h2 id="r3-submit-title">¿Están listos los hooks?</h2>
              <p>El mock ejecutará el middleware antes de guardar y calculará el virtual del usuario.</p>
              <button className="r3-submit" type="submit" disabled={isSubmitting || response?.ok}>
                {isSubmitting
                  ? 'EJECUTANDO HOOKS…'
                  : response?.ok
                    ? 'CÁMARA DESBLOQUEADA'
                    : 'EJECUTAR Y GUARDAR'}
                <span aria-hidden="true">↗</span>
              </button>
              {response?.mensaje && !response.ok && (
                <p className="r3-attempt-message" role="status">{response.mensaje}</p>
              )}
            </section>
            <div className="r3-feedback" aria-live="polite">
              <ErrorBox error={response?.errorReal} />
              <ExplanationPanel response={response} />
              {!response && (
                <div className="r3-feedback-empty">
                  <span aria-hidden="true">⌁</span>
                  <p>Los resultados de la cámara aparecerán aquí.</p>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="r3-lower-grid">
          <HintPanel
            hints={data.pistas}
            revealed={revealedHints}
            onReveal={revealHint}
            points={points}
          />
          <aside className="r3-card r3-hook-note" aria-label="Resumen de ejecución">
            <span className="r3-kicker">ORDEN DE EJECUCIÓN</span>
            <p><code>virtual</code> se calcula cuando se lee la propiedad.</p>
            <p><code>pre(&quot;save&quot;)</code> corre antes de persistir el documento.</p>
          </aside>
        </div>
        <footer className="r3-footer">
          <span>ESCAPE ROOM DEL BACKEND</span>
          <span>SECTOR 03 · HOOKS</span>
        </footer>
      </div>
    </main>
  )
}

export default Room3
