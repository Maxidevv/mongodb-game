export function TheoryCard({ text }) {
  return (
    <section className="r3-card r3-theory" aria-labelledby="r3-theory-title">
      <div className="r3-section-heading">
        <span className="r3-kicker">01 / ARCHIVO DE CAMPO</span>
        <h2 id="r3-theory-title">Antes de entrar</h2>
      </div>
      <p>{text}</p>
      <div className="r3-theory-notes">
        <div><code>virtual</code><span>calcula un dato, no lo persiste</span></div>
        <div><code>pre(&quot;save&quot;)</code><span>se ejecuta antes de guardar</span></div>
      </div>
    </section>
  )
}

const answerOptions = {
  virtual: ['nombreCompleto', 'nombre', 'apellido'],
  nombre: ['nombre', 'apellido', 'email'],
  apellido: ['apellido', 'nombre', 'email'],
  middleware: ['save', 'init', 'validate'],
  normalizacion: ['toLowerCase', 'toUpperCase', 'trim'],
}

export function HookEditor({ data, answers, onChange }) {
  const getSelect = (id, label) => (
    <label className="r3-code-select">
      <span className="r3-sr-only">{label}</span>
      <select
        aria-label={label}
        value={answers[id]}
        onChange={(event) => onChange(id, event.target.value)}
      >
        <option value="">seleccionar…</option>
        {answerOptions[id].map((option) => (
          <option value={option} key={option}>{option}</option>
        ))}
      </select>
    </label>
  )

  return (
    <section className="r3-card r3-editor" aria-labelledby="r3-editor-title">
      <div className="r3-section-heading">
        <span className="r3-kicker">02 / TERMINAL DE HOOKS</span>
        <h2 id="r3-editor-title">Completa el código</h2>
      </div>
      <p className="r3-card-intro">
        Selecciona la opción que completa cada hueco del schema Usuario.
      </p>
      <pre className="r3-code-editor" aria-label="Código de schema Usuario con campos editables">
        <code>
          <span className="r3-code-muted">const usuarioSchema = new mongoose.Schema(&#123;</span>{'\n'}
          {'  '}nombre: String, apellido: String, email: String{'\n'}
          <span className="r3-code-muted">&#125;);</span>{'\n\n'}
          <span className="r3-code-comment">// Virtual: valor calculado, no persistido</span>{'\n'}
          usuarioSchema.virtual(&apos;{getSelect('virtual', 'Nombre del virtual')}&apos;){'\n'}
          {'  '}.get(function () &#123;{'\n'}
          {'    '}return this.{getSelect('nombre', 'Campo nombre')}{' + " " + '}this.{getSelect('apellido', 'Campo apellido')};{'\n'}
          {'  '}&#125;);{'\n\n'}
          <span className="r3-code-comment">// Middleware antes de guardar</span>{'\n'}
          usuarioSchema.pre(&apos;{getSelect('middleware', 'Evento pre middleware')}&apos;, function (next) &#123;{'\n'}
          {'  '}this.email = this.email.{getSelect('normalizacion', 'Método para pasar email a minúsculas')}();{'\n'}
          {'  '}next();{'\n'}
          &#125;);
        </code>
      </pre>
      <div className="r3-code-data">
        <span>DOCUMENTO DE PRUEBA</span>
        <code>
          nombre: &quot;{data.usuario.nombre}&quot; · apellido: &quot;{data.usuario.apellido}&quot;
          <br />
          email: &quot;{data.usuario.email}&quot;
        </code>
      </div>
    </section>
  )
}

export function HintPanel({ hints, revealed, onReveal, points }) {
  return (
    <section className="r3-card r3-hints" aria-labelledby="r3-hints-title">
      <div className="r3-section-heading">
        <span className="r3-kicker">03 / MENSAJES DE LA CÁMARA</span>
        <h2 id="r3-hints-title">Pistas progresivas</h2>
      </div>
      <p className="r3-card-intro">
        Cada pista resta puntos. Saldo actual: <strong>{points}</strong>
      </p>
      <ol className="r3-hint-list">
        {hints.map((hint, index) => (
          <li className="r3-hint-item" key={hint.id}>
            {index < revealed ? (
              <p>{hint.texto}</p>
            ) : (
              <button
                type="button"
                className="r3-hint-button"
                disabled={index !== revealed}
                onClick={() => onReveal(hint)}
              >
                Revelar pista {index + 1}<span>−{hint.costo} pts</span>
              </button>
            )}
          </li>
        ))}
      </ol>
    </section>
  )
}

export function ErrorBox({ error }) {
  if (!error) return null

  return (
    <section className="r3-error-box" role="alert" aria-labelledby="r3-error-title">
      <h2 id="r3-error-title">El hook lanzó un error</h2>
      <p>Respuesta del motor:</p>
      <pre><code>{error}</code></pre>
    </section>
  )
}

export function ExplanationPanel({ response }) {
  if (!response?.ok) return null

  return (
    <section className="r3-explanation" role="status" aria-labelledby="r3-explanation-title">
      <span className="r3-kicker">CÁMARA DESBLOQUEADA</span>
      <h2 id="r3-explanation-title">Esto es lo que hicieron tus hooks</h2>
      <p>{response.explicacion}</p>
      <p className="r3-result-line">
        Resultado: <code>{response.resultado.nombreCompleto}</code>
        {' · Email normalizado: '}
        <code>{response.resultado.emailGuardado}</code>
      </p>
      <p className="r3-success-message">{response.mensaje}</p>
    </section>
  )
}
