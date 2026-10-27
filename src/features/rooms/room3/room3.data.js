// Desafíos de la sala 3: middleware pre-save y virtuals.
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

export const room3Data = {
  id: 3,
  title: 'Middlewares y virtuals',
  theme: 'Mongoose · ciclo de vida del documento',
  story: 'Los datos se guardan sin normalizar y el panel calcula propiedades de forma inconsistente. Repará los hooks del modelo.',
  theory: 'Un middleware pre("save") se ejecuta antes del guardado. Un virtual deriva un valor de otros campos y no se persiste como campo normal; los setters permiten asignar valores a través de él.',
  map: {
    terminals: [
      { id: 'terminal-1', label: 'Hook pre-save', x: 164, y: 170 },
      { id: 'terminal-2', label: 'Virtual de nombre', x: 796, y: 170 },
      { id: 'terminal-3', label: 'Hook async seguro', x: 480, y: 410 },
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
      'Normalizar antes de guardar',
      'Completá un middleware pre("save") que convierta el email del documento a minúsculas antes de continuar.',
      'usuarioSchema.pre("save", function (next) {\n  // normalizar email\n  next()\n})',
      ['pre', 'save', 'email', 'tolowercase', 'next'],
      ['El hook es pre("save").', 'Usá this para acceder al documento actual.', 'Aplicá toLowerCase() sobre this.email antes de next().'],
      'MongooseError: next is not a function — el hook mezcló el estilo callback con una firma incompatible.',
      'El middleware normaliza this.email antes de que Mongoose persista el documento, evitando variantes por mayúsculas.',
    ),
    challenge(
      'terminal-2',
      'Virtual de nombre completo',
      'Creá un virtual nombreCompleto cuyo getter concatene nombre y apellido.',
      'usuarioSchema.virtual("nombreCompleto")\n  .get(function () {\n    return ""\n  })',
      ['virtual', 'nombrecompleto', 'get', 'nombre', 'apellido'],
      ['Declaralo con schema.virtual("nombreCompleto").', 'Agregá un getter con .get(function () {}).', 'Concatená this.nombre y this.apellido.'],
      'TypeError: Cannot read properties of undefined — el getter virtual intentó leer propiedades fuera del documento.',
      'El getter calcula el dato al consultarlo usando this del documento y no crea un campo almacenado adicional.',
    ),
    challenge(
      'terminal-3',
      'Middleware asíncrono',
      'Escribí un pre("save") async que valide la operación sin llamar next() y use this para acceder al documento.',
      'usuarioSchema.pre("save", async function () {\n  // validar antes de guardar\n})',
      ['pre', 'save', 'async', 'function', 'this'],
      ['La función del hook debe ser async.', 'Usá function tradicional para conservar this del documento.', 'No combines el retorno async con next().'],
      'MongooseError: Callback was already called — el middleware mezcló next() con una función async.',
      'Mongoose espera la resolución de la función async. Elegir ese estilo evita llamar next() además de devolver una promesa.',
    ),
  ],
  pointReward: 100,
  hintCost: 20,
}
