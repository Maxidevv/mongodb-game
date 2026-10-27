// Desafíos de la sala 5: índices y explain().
const challenge = (id, title, prompt, starter, expectedTokens, hints, backendError, explanation) => ({
  id,
  title,
  prompt,
  starter,
  expectedTokens,
  hints,
  backendError,
  explanation,
})

export const room5Data = {
  id: 5,
  title: 'Índices y explain()',
  theme: 'MongoDB · rendimiento de consultas',
  story: 'La búsqueda de cuentas escanea toda la colección. Medí el plan, agregá el índice correcto y verificá la mejora.',
  theory: 'Un índice evita recorrer documentos irrelevantes para ciertos filtros. explain("executionStats") informa el plan y métricas como totalDocsExamined; los índices aceleran lecturas pero ocupan espacio y encarecen escrituras.',
  map: {
    terminals: [
      { id: 'terminal-1', label: 'Crear índice', x: 164, y: 170 },
      { id: 'terminal-2', label: 'Medir explain()', x: 796, y: 170 },
      { id: 'terminal-3', label: 'Interpretar métricas', x: 480, y: 410 },
    ],
    obstacles: [
      { x: 330, y: 145, width: 120, height: 48 },
      { x: 510, y: 145, width: 120, height: 48 },
      { x: 330, y: 315, width: 120, height: 48 },
      { x: 510, y: 315, width: 120, height: 48 },
    ],
  },
  sprites: {
    up: '/assets/player/up.png',
    down: '/assets/player/down.png',
    left: '/assets/player/left.png',
    right: '/assets/player/right.png',
  },
  challenges: [
    challenge(
      'terminal-1',
      'Indexar email',
      'Creá un índice ascendente sobre email en la colección usuarios.',
      'db.usuarios.createIndex({})',
      ['createindex', 'email', '1'],
      ['Usá createIndex() en la colección usuarios.', 'El campo del índice es email.', 'El valor 1 representa orden ascendente.'],
      'MongoServerError: Index build failed — el patrón de índice no contiene un campo válido.',
      'createIndex({ email: 1 }) crea un índice ascendente que MongoDB puede usar en filtros por email.',
    ),
    challenge(
      'terminal-2',
      'Inspeccionar el plan',
      'Ejecutá la búsqueda por email y pedí a explain las estadísticas de ejecución.',
      'db.usuarios.find({ email: "ana@example.com" })',
      ['find', 'email', 'explain', 'executionstats'],
      ['Mantené el filtro de find por email.', 'Encadená explain() a la consulta.', 'Indicá el modo "executionStats".'],
      'MongoServerError: explain requires a valid verbosity mode; execution metrics are unavailable.',
      'explain("executionStats") ejecuta la consulta y devuelve métricas reales para comparar el plan elegido.',
    ),
    challenge(
      'terminal-3',
      'Comparar documentos examinados',
      'Explicá en el código qué métrica compararías antes y después del índice: documentos examinados.',
      'const stats = resultado.executionStats',
      ['executionstats', 'totaldocsexamined'],
      ['Las estadísticas están bajo executionStats.', 'Buscá la métrica totalDocsExamined.', 'Una búsqueda indexada suele examinar menos documentos que un COLLSCAN.'],
      'QueryPlan: COLLSCAN — la consulta examinó toda la colección antes de encontrar el resultado.',
      'totalDocsExamined permite evaluar el trabajo realizado. Un índice adecuado suele reducir ese valor, aunque conviene medir con datos representativos.',
    ),
  ],
  pointReward: 100,
  hintCost: 20,
}
