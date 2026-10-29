import React, { useState } from 'react';
import { useGame } from '../features/game/GameProvider';
import { submitAttempt } from '../utils/api';
import { TheoryCard, HintPanel, ErrorBox, ResultPanel, ProgressBar } from '../../components/UIComponents';

export default function Room5({ roomData }) {
  const { dispatch } = useGame();
  const [indexCommand, setIndexCommand] = useState('');
  const [usedHints, setUsedHints] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await submitAttempt(5, indexCommand);
      setResult(response);
      if (response.ok) {
        dispatch({ type: 'COMPLETE_ROOM', payload: 5, payloadScore: response.puntos });
      }
    } catch (err) {
      setResult({ ok: false, mensaje: 'Error al enviar', errorReal: err.message });
    }
    setLoading(false);
  };

  const handleUseHint = (hintId) => {
    if (!usedHints.includes(hintId)) {
      setUsedHints([...usedHints, hintId]);
    }
  };

  return (
    <div className="room-container room-5">
      <div className="room-header">
        <h1>Sala 5: {roomData.titulo}</h1>
        <ProgressBar current={5} total={5} />
      </div>

      <div className="room-content">
        <div className="room-info">
          <TheoryCard theory={roomData.teoria} />
          <div className="story-card">
            <h3>📖 Historia</h3>
            <p>{roomData.historia}</p>
          </div>
          <HintPanel 
            hints={roomData.pistas || []} 
            onUseHint={handleUseHint}
            usedHints={usedHints}
          />
        </div>

        <div className="room-task">
          <div className="consigna">
            <h3>🎯 Consigna</h3>
            <p>{roomData.consigna}</p>
          </div>

          <div className="explain-section">
            <h3>📊 Comparación: Sin índice vs Con índice</h3>
            <div className="comparison">
              <div className="comparison-col">
                <h4>Sin índice</h4>
                <ul>
                  <li>Documentos examinados: <strong>{roomData.escenario?.sinIndice.docsExamined}</strong></li>
                  <li>Tiempo: <strong>{roomData.escenario?.sinIndice.executionTimeMillis}ms</strong></li>
                  <li>Retornados: <strong>{roomData.escenario?.sinIndice.nReturned}</strong></li>
                </ul>
              </div>
              <div className="comparison-col">
                <h4>Con índice</h4>
                <ul>
                  <li>Documentos examinados: <strong className="good">{roomData.escenario?.conIndice.docsExamined}</strong></li>
                  <li>Tiempo: <strong className="good">{roomData.escenario?.conIndice.executionTimeMillis}ms</strong></li>
                  <li>Retornados: <strong>{roomData.escenario?.conIndice.nReturned}</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="solution-form">
            <label htmlFor="index-cmd">
              <h3>💻 Escribe el comando para crear el índice</h3>
            </label>
            <textarea
              id="index-cmd"
              value={indexCommand}
              onChange={(e) => setIndexCommand(e.target.value)}
              placeholder='Ej: db.usuarios.createIndex({ email: 1 })'
              rows={4}
            />
            <button type="submit" disabled={loading || !indexCommand.trim()}>
              {loading ? 'Verificando...' : 'Enviar solución'}
            </button>
          </form>

          <ErrorBox error={result && !result.ok ? result.errorReal : null} />
          <ResultPanel result={result} explanation={result?.explicacion} />
        </div>
      </div>
    </div>
  );
}
