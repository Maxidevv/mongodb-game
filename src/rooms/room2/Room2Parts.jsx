export function TheoryCard({ text }) {
  return (
    <section className="r2-card r2-theory" aria-labelledby="r2-theory-title">
      <div className="r2-section-heading">
        <span className="r2-kicker">01 / ARCHIVO DE CAMPO</span>
        <h2 id="r2-theory-title">Antes de entrar</h2>
      </div>
      <p>{text}</p>
      <ul className="r2-theory-list">
        <li><code>required</code><span>el valor no puede faltar</span></li>
        <li><code>enum</code><span>acepta solo opciones definidas</span></li>
        <li><code>min</code><span>marca el mínimo numérico</span></li>
        <li><code>default</code><span>completa un valor ausente</span></li>
      </ul>
    </section>
  )
}

export function FieldRow({ field, config, onChange }) {
  const isString = config.type === 'String'
  const isNumber = config.type === 'Number'

  const update = (key, value) => onChange(field.nombre, key, value)

  return (
    <fieldset className="r2-field-row">
      <legend className="r2-field-name">
        <span>{field.nombre}</span>
        <small>{field.ayuda}</small>
      </legend>
      <div className="r2-field-controls">
        <label className="r2-control r2-type-control">
          <span>Tipo</span>
          <select
            aria-label={`Tipo de ${field.nombre}`}
            value={config.type}
            onChange={(event) => update('type', event.target.value)}
          >
            {['String', 'Number', 'Date', 'Boolean'].map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <label className="r2-check-control">
          <input
            type="checkbox"
            checked={config.required}
            onChange={(event) => update('required', event.target.checked)}
          />
          <span>required</span>
        </label>

        {isNumber && (
          <>
            <label className="r2-control r2-number-control">
              <span>min</span>
              <input
                type="number"
                aria-label={`Mínimo de ${field.nombre}`}
                value={config.min}
                onChange={(event) => update('min', event.target.value)}
                placeholder="Sin mínimo"
              />
            </label>
            <label className="r2-control r2-number-control">
              <span>max</span>
              <input
                type="number"
                aria-label={`Máximo de ${field.nombre}`}
                value={config.max}
                onChange={(event) => update('max', event.target.value)}
                placeholder="Sin máximo"
              />
            </label>
          </>
        )}

        {isString && (
          <label className="r2-control r2-enum-control">
            <span>enum · separar con comas</span>
            <input
              type="text"
              aria-label={`Valores enum de ${field.nombre}`}
              value={config.enumText}
              onChange={(event) => update('enumText', event.target.value)}
              placeholder="novela, ensayo, poesia"
            />
          </label>
        )}

        <label className="r2-control r2-default-control">
          <span>default</span>
          <input
            type="text"
            aria-label={`Valor por defecto de ${field.nombre}`}
            value={config.defaultValue}
            onChange={(event) => update('defaultValue', event.target.value)}
            placeholder={config.type === 'Date' ? 'Date.now' : 'Sin valor'}
          />
        </label>
      </div>
    </fieldset>
  )
}

export function SchemaPreview({ schemaText }) {
  return (
    <section className="r2-card r2-code-card" aria-labelledby="r2-schema-title">
      <div className="r2-section-heading">
        <span className="r2-kicker">02 / VISTA EN VIVO</span>
        <h2 id="r2-schema-title">Schema de Libro</h2>
      </div>
      <pre className="r2-code-preview"><code>{schemaText}</code></pre>
    </section>
  )
}

export function TestBooks({ books, schema }) {
  // Esta vista previa visualiza las reglas editadas; el resultado del intento lo decide el mock o la API.
  const fieldPasses = (name, value, hasValue) => {
    const rule = schema[name]
    if (!rule) return false
    if (!hasValue) return rule.required !== true || rule.default !== undefined

    if (rule.type === 'String' && typeof value !== 'string') return false
    if (rule.type === 'Number' && typeof value !== 'number') return false
    if (rule.type === 'Boolean' && typeof value !== 'boolean') return false
    if (rule.type === 'Date' && Number.isNaN(Date.parse(value))) return false
    if (rule.min !== undefined && value < rule.min) return false
    if (rule.max !== undefined && value > rule.max) return false
    if (rule.enum && !rule.enum.includes(value)) return false

    return true
  }

  const passesSchema = (document) =>
    Object.entries(schema).every(([name]) =>
      fieldPasses(name, document[name], Object.hasOwn(document, name)),
    )

  return (
    <section className="r2-card r2-tests" aria-labelledby="r2-tests-title">
      <div className="r2-section-heading">
        <span className="r2-kicker">03 / PRUEBA DE INGRESO</span>
        <h2 id="r2-tests-title">Libros de prueba</h2>
      </div>
      <p className="r2-card-intro">Vista previa de validación con las reglas actuales.</p>
      <ul className="r2-book-list">
        {books.map((book) => {
          const passes = passesSchema(book.documento)
          return (
            <li className="r2-book-item" key={book.id}>
              <div>
                <strong>{book.etiqueta}</strong>
                <p>{book.descripcion}</p>
              </div>
              <span className={`r2-status ${passes ? 'is-valid' : 'is-invalid'}`}>
                <span aria-hidden="true">{passes ? '✓' : '×'}</span>
                {passes ? 'Pasaría' : 'Rechazado'}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function HintPanel({ hints, revealed, onReveal, points }) {
  return (
    <section className="r2-card r2-hints" aria-labelledby="r2-hints-title">
      <div className="r2-section-heading">
        <span className="r2-kicker">04 / AYUDA DEL GUARDIÁN</span>
        <h2 id="r2-hints-title">Pistas progresivas</h2>
      </div>
      <p className="r2-card-intro">Cada pista resta puntos. Saldo actual: <strong>{points}</strong></p>
      <ol className="r2-hint-list">
        {hints.map((hint, index) => {
          const isRevealed = index < revealed
          return (
            <li className="r2-hint-item" key={hint.id}>
              {isRevealed ? (
                <p>{hint.texto}</p>
              ) : (
                <button
                  type="button"
                  className="r2-hint-button"
                  disabled={index !== revealed}
                  onClick={() => onReveal(hint)}
                >
                  Revelar pista {index + 1} <span>−{hint.costo} pts</span>
                </button>
              )}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null
  return (
    <section className="r2-error-box" role="alert" aria-labelledby="r2-error-title">
      <h2 id="r2-error-title">El documento no pasó la validación</h2>
      <p>Respuesta de Mongoose:</p>
      <pre><code>{error}</code></pre>
    </section>
  )
}

export function ExplanationPanel({ response }) {
  if (!response?.ok) return null
  return (
    <section className="r2-explanation" role="status" aria-labelledby="r2-explanation-title">
      <span className="r2-kicker">ARCHIVO DESBLOQUEADO</span>
      <h2 id="r2-explanation-title">Esto es lo que hizo tu schema</h2>
      <p>{response.explicacion}</p>
      <p className="r2-success-message">{response.mensaje}</p>
    </section>
  )
}
