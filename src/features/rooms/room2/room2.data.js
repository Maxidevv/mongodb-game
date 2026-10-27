// Desafíos de la sala 2: definición y validación de schemas Mongoose.
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

export const room2Data = {
  id: 2,
  title: 'Schemas y validaciones',
  theme: 'Mongoose · reglas del modelo',
  story: 'El laboratorio acepta documentos inválidos. Configurá el schema para que los datos se validen antes de persistir.',
  theory: 'Un Schema define tipos y reglas de validación. required exige un valor, enum limita opciones, min/max valida rangos y unique crea un índice único (no es un validador de Mongoose).',
  map: {
    terminals: [
      { id: 'terminal-1', label: 'Campos obligatorios', x: 164, y: 170 },
      { id: 'terminal-2', label: 'Enum y rangos', x: 796, y: 170 },
      { id: 'terminal-3', label: 'Defaults e índices', x: 480, y: 410 },
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
      'Campos requeridos',
      'Definí nombre como String obligatorio y email como String obligatorio en un Schema de Mongoose.',
      'const usuarioSchema = new mongoose.Schema({\n  nombre: {},\n  email: {},\n})',
      ['string', 'required', 'true', 'nombre', 'email'],
      ['Cada campo debe declarar su tipo String.', 'Agregá required: true a ambos campos.', 'Recordá que required es una regla del path del Schema.'],
      'ValidationError: Path `email` is required. Path `nombre` is required.',
      'Mongoose valida los paths antes de guardar. required: true genera un error cuando falta alguno de esos valores.',
    ),
    challenge(
      'terminal-2',
      'Enum y límites',
      'Declarà estado como enum ["borrador", "publicado"] y visitas como Number con mínimo 0.',
      'const articuloSchema = new mongoose.Schema({\n  estado: {},\n  visitas: {},\n})',
      ['estado', 'enum', 'borrador', 'publicado', 'visitas', 'number', 'min', '0'],
      ['enum recibe un array de valores permitidos.', 'El tipo de visitas es Number.', 'min: 0 impide un contador negativo.'],
      'ValidationError: `archivado` is not a valid enum value for path `estado`; `visitas` must be at least 0.',
      'El validador enum limita las opciones de estado y min rechaza valores numéricos menores que cero.',
    ),
    challenge(
      'terminal-3',
      'Valor por defecto e índice único',
      'Configurá activo con default true y email con índice único en el schema.',
      'const cuentaSchema = new mongoose.Schema({\n  activo: {},\n  email: {},\n})',
      ['activo', 'default', 'true', 'email', 'unique', 'true'],
      ['default se configura en las opciones del path activo.', 'Declarar unique: true solicita un índice único.', 'El índice único protege la colección; no reemplaza el manejo de errores de duplicados.'],
      'MongoServerError: E11000 duplicate key error collection: cuentas index: email_1 dup key.',
      'default completa el campo si no se proporciona. unique crea una restricción de índice en MongoDB y los duplicados producen E11000.',
    ),
  ],
  pointReward: 100,
  hintCost: 20,
}
