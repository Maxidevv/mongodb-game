import React from 'react';

export function TheoryCard({ theory }) {
  return (
    <div className="theory-card">
      <h3>📚 Teoría</h3>
      <p>{theory}</p>
    </div>
  );
}

export function HintPanel({ hints = [], onUseHint, usedHints = [] }) {
  return (
    <div className="hint-panel">
      <h3>💡 Pistas</h3>
      {hints.map(hint => (
        <button
          key={hint.id}
          onClick={() => onUseHint(hint.id)}
          disabled={usedHints.includes(hint.id)}
          className="hint-btn"
        >
          Pista {hint.id} (-{hint.costo} pts)
        </button>
      ))}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="error-box">
      <h4>⚠️ Error MongoDB/Mongoose</h4>
      <code>{error}</code>
    </div>
  );
}

export function ResultPanel({ result, explanation }) {
  if (!result) return null;
  return (
    <div className={`result-panel ${result.resultado}`}>
      <h3>{result.ok ? '✅ ¡Correcto!' : '❌ Incorrecto'}</h3>
      <p>{result.mensaje}</p>
      {explanation && <p><strong>Explicación:</strong> {explanation}</p>}
      {result.puntos > 0 && <p><strong>Puntos:</strong> +{result.puntos}</p>}
    </div>
  );
}

export function ProgressBar({ current, total }) {
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${(current / total) * 100}%` }}
      />
      <span>Sala {current} de {total}</span>
    </div>
  );
}
