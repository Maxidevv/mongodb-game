// Desafíos de la sala 1: consultas MongoDB con find().
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

export const room1Data = {
  id: 1,
  title: 'Consultas con find()',
  theme: 'MongoDB · filtros y resultados',
  story: 'El archivo de eventos quedó bloqueado por filtros incompletos. Recuperá los registros sin alterar la colección.',
  theory: 'find(filtro, proyección) devuelve los documentos que coinciden. El filtro limita resultados; la proyección selecciona campos y sort/limit ordenan y acotan la respuesta.',
  map: {
    terminals: [
      { id: 'terminal-1', label: 'Filtro de eventos', x: 164, y: 170 },
      { id: 'terminal-2', label: 'Proyección segura', x: 796, y: 170 },
      { id: 'terminal-3', label: 'Orden y límite', x: 480, y: 410 },
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
      'Filtrar eventos abiertos',
      'Escribí una consulta que encuentre documentos de eventos cuyo campo estado sea "abierto".',
      'db.eventos.find({})',
      ['find', 'estado', 'abierto'],
      ['Usá find() sobre la colección eventos.', 'El filtro es un objeto con el campo estado.', 'El valor buscado es la cadena "abierto".'],
      'MongoServerError: BadValue — el filtro no contiene un predicado utilizable para estado.',
      'find() recibió un objeto filtro y MongoDB comparó el campo estado de cada documento con el valor solicitado.',
    ),
    challenge(
      'terminal-2',
      'Proyección mínima',
      'Buscá usuarios activos y devolvé solamente nombre y email (sin incluir _id).',
      'db.usuarios.find({ activo: true })',
      ['find', 'activo', 'nombre', 'email', '_id', '0'],
      ['El segundo argumento de find() es la proyección.', 'Incluí nombre y email con valor 1.', 'Excluí _id con valor 0.'],
      'MongoServerError: ProjectionError — la proyección solicitada no define los campos de salida esperados.',
      'La proyección reduce los datos transferidos e impide devolver campos que esta pantalla no necesita.',
    ),
    challenge(
      'terminal-3',
      'Últimos registros',
      'Consultá los registros de auditoría más recientes primero y limitá la respuesta a cinco documentos.',
      'db.auditoria.find({})',
      ['find', 'sort', 'fecha', '-1', 'limit', '5'],
      ['Encadená los métodos después de find().', 'Ordená por fecha descendente con -1.', 'Terminá limitando a cinco documentos.'],
      'MongoServerError: SortError — la consulta no aplicó un orden descendente ni el límite solicitado.',
      'sort({ fecha: -1 }) prioriza los más recientes y limit(5) acota el conjunto resultante.',
    ),
  ],
  pointReward: 100,
  hintCost: 20,
}
