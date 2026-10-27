import { useEffect, useMemo, useState } from 'react'
import { room2Data, simulateRoom2Attempt } from '../api/mock/room2.js'
import {
  ErrorBox,
  ExplanationPanel,
  FieldRow,
  HintPanel,
  SchemaPreview,
  TestBooks,
  TheoryCard,
} from './room2/Room2Parts.jsx'
import './Room2.css'

const fieldDefinitions = [
  { nombre: 'titulo', ayuda: 'Nombre del libro' },
  { nombre: 'autor', ayuda: 'Persona que lo escribió' },
  { nombre: 'paginas', ayuda: 'Cantidad de páginas' },
  { nombre: 'genero', ayuda: 'Categoría literaria' },
  { nombre: 'publicadoEn', ayuda: 'Fecha de publicación' },
]

const initialSchema = {
  titulo: { type: 'String', required: true, min: '', max: '', enumText: '', defaultValue: '' },
  autor: { type: 'String', required: true, min: '', max: '', enumText: '', defaultValue: '' },
  paginas: { type: 'Number', required: false, min: '1', max: '', enumText: '', defaultValue: '' },
  genero: {
    type: 'String',
    required: false,
    min: '',
    max: '',
    enumText: 'novela, ensayo, poesia',
    defaultValue: '',
  },
  publicadoEn: {
    type: 'Date',
    required: false,
    min: '',
    max: '',
    enumText: '',
    defaultValue: 'Date.now',
  },
}

const toSchemaDefinition = (configuration) =>
  Object.fromEntries(
    Object.entries(configuration).map(([name, options]) => {
      const field = { type: options.type }
      if (options.required) field.required = true
      if (options.min !== '') field.min = Number(options.min)
      if (options.max !== '') field.max = Number(options.max)
      if (options.enumText.trim()) {
        field.enum = options.enumText.split(',').map((value) => value.trim()).filter(Boolean)
      }
      if (options.defaultValue.trim()) field.default = options.defaultValue.trim()
      return [name, field]
    }),
  )

const formatSchema = (schema) =>
  `const libroSchema = new mongoose.Schema({\n${Object.entries(schema)
    .map(([name, options]) => {
      const properties = Object.entries(options)
        .map(([key, value]) => {
          const formattedValue =
            key === 'enum'
              ? `[${value.map((entry) => JSON.stringify(entry)).join(', ')}]`
              : key === 'default' && value === 'Date.now'
                ? 'Date.now'
                : JSON.stringify(value)
          return `    ${key}: ${formattedValue}`
        })
        .join(',\n')
      return `  ${name}: {\n${properties}\n  }`
    })
    .join(',\n')}\n});`

function Room2({ data = room2Data, onAttempt = simulateRoom2Attempt }) {
  const [configuration, setConfiguration] = useState(initialSchema)
  const [revealedHints, setRevealedHints] = useState(0)
  const [hintPenalty, setHintPenalty] = useState(0)
  const [response, setResponse] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const schema = useMemo(() => toSchemaDefinition(configuration), [configuration])
  const schemaText = useMemo(() => formatSchema(schema), [schema])
  const points = Math.max(0, (response?.ok ? response.puntos : 100) - hintPenalty)
  const elapsedTime = `${String(Math.floor(elapsedSeconds / 60)).padStart(2, '0')}:${String(elapsedSeconds % 60).padStart(2, '0')}`

  useEffect(() => {
    if (response?.ok) return undefined

    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [response?.ok])

  const handleFieldChange = (name, key, value) => {
    setConfiguration((current) => ({
      ...current,
      [name]: { ...current[name], [key]: value },
    }))
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
      const result = await onAttempt(schema)
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
    <main className="room2" aria-labelledby="r2-title">
      <div className="r2-shell">
        <header className="r2-header">
          <a className="r2-back-link" href="#/mapa">← Volver al mapa</a>
          <div className="r2-brand">
            <span className="r2-room-id">SALA 02 <i aria-hidden="true" /></span>
            <span className="r2-brand-name">LABORATORIO DE DATOS</span>
          </div>
          <div className="r2-header-status">
            <span className="r2-points"><span aria-hidden="true">✦</span> {points} pts</span>
            <span className="r2-time" aria-label={`Tiempo en la sala: ${elapsedTime}`}>{elapsedTime}</span>
          </div>
        </header>

        <section className="r2-hero">
          <div className="r2-hero-copy">
            <span className="r2-kicker">MONGOOSE / VALIDACIÓN DE DOCUMENTOS</span>
            <h1 id="r2-title">{data.titulo}</h1>
            <p>{data.historia}</p>
          </div>
          <div className="r2-seal" aria-hidden="true">
            <span>ARCHIVO</span>
            <strong>02</strong>
            <span>SELLADO</span>
          </div>
        </section>

        <div className="r2-progress" aria-label="Progreso de la sala">
          <div className="r2-progress-meta">
            <span>PROGRESO DE LA SALA</span>
            <span>{response?.ok ? 'COMPLETADO' : 'EN CURSO'}</span>
          </div>
          <div
            className="r2-progress-track"
            role="progressbar"
            aria-label="Progreso de la sala"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={response?.ok ? 100 : 0}
          >
            <span className={response?.ok ? 'is-complete' : ''} />
          </div>
        </div>

        <div className="r2-intro-grid">
          <TheoryCard text={data.teoria} />
          <aside className="r2-card r2-mission" aria-labelledby="r2-mission-title">
            <span className="r2-kicker">MISIÓN</span>
            <h2 id="r2-mission-title">Define el schema de Libro</h2>
            <p>{data.consigna}</p>
            <span className="r2-mission-tag">5 CAMPOS · UNA PUERTA</span>
          </aside>
        </div>

        <form className="r2-workbench" onSubmit={handleAttempt}>
          <section className="r2-card r2-editor" aria-labelledby="r2-editor-title">
            <div className="r2-section-heading">
              <span className="r2-kicker">CONFIGURACIÓN</span>
              <h2 id="r2-editor-title">Completa los campos</h2>
            </div>
            <div className="r2-fields">
              {fieldDefinitions.map((field) => (
                <FieldRow
                  key={field.nombre}
                  field={field}
                  config={configuration[field.nombre]}
                  onChange={handleFieldChange}
                />
              ))}
            </div>
            <button className="r2-submit" type="submit" disabled={isSubmitting || response?.ok}>
              {isSubmitting ? 'VALIDANDO ARCHIVO…' : response?.ok ? 'ARCHIVO DESBLOQUEADO' : 'PROBAR SCHEMA'}
              <span aria-hidden="true">↗</span>
            </button>
            {response?.mensaje && !response.ok && (
              <p className="r2-attempt-message" role="status">{response.mensaje}</p>
            )}
          </section>

          <div className="r2-side-column">
            <SchemaPreview schemaText={schemaText} />
            <TestBooks books={data.libros} schema={schema} />
          </div>
        </form>

        <div className="r2-lower-grid">
          <HintPanel
            hints={data.pistas}
            revealed={revealedHints}
            onReveal={revealHint}
            points={points}
          />
          <div className="r2-feedback" aria-live="polite">
            <ErrorBox error={response?.errorReal} />
            <ExplanationPanel response={response} />
            {!response && (
              <div className="r2-feedback-empty">
                <span aria-hidden="true">⌁</span>
                <p>Los resultados del guardián aparecerán aquí.</p>
              </div>
            )}
          </div>
        </div>
        <footer className="r2-footer">
          <span>ESCAPE ROOM DEL BACKEND</span>
          <span>SECTOR 02 · SCHEMAS</span>
        </footer>
      </div>
    </main>
  )
}

export default Room2
