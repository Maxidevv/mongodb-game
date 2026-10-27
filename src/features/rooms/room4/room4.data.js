// Desafíos de la sala 4: referencias y populate.
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

export const room4Data = {
  id: 4,
  title: 'Relaciones y populate',
  theme: 'Mongoose · referencias entre colecciones',
  story: 'Las órdenes muestran solo identificadores de clientes. Configurá la referencia y resolvé el documento relacionado.',
  theory: 'Una relación por referencia guarda un ObjectId en un path con ref al modelo relacionado. populate() reemplaza ese identificador por el documento vinculado al consultar.',
  map: {
    terminals: [
      { id: 'terminal-1', label: 'Referencia ObjectId', x: 164, y: 170 },
      { id: 'terminal-2', label: 'Resolver populate()', x: 796, y: 170 },
      { id: 'terminal-3', label: 'Selección de campos', x: 480, y: 410 },
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
      'Declarar la referencia',
      'Definí cliente como ObjectId y vinculalo con el modelo Cliente usando ref.',
      'const ordenSchema = new mongoose.Schema({\n  cliente: {},\n})',
      ['cliente', 'objectid', 'ref', 'cliente'],
      ['El tipo debe ser mongoose.Schema.Types.ObjectId.', 'La opción de referencia se llama ref.', 'El nombre del modelo relacionado es "Cliente".'],
      'CastError: Cast to ObjectId failed for value "undefined" at path "cliente".',
      'Mongoose guarda un ObjectId como referencia y usa ref para saber qué modelo debe consultar cuando se solicita populate().',
    ),
    challenge(
      'terminal-2',
      'Poblar el cliente',
      'Completá la consulta para obtener una orden por id y reemplazar su referencia cliente con el documento relacionado.',
      'Orden.findById(ordenId)',
      ['findbyid', 'populate', 'cliente'],
      ['La consulta parte de findById(ordenId).', 'Encadená populate() a la consulta.', 'El path a poblar es cliente.'],
      "MissingSchemaError: Schema hasn't been registered for model \"cliente\".",
      'populate("cliente") resuelve el ObjectId usando el modelo definido en ref y adjunta el documento relacionado.',
    ),
    challenge(
      'terminal-3',
      'Poblar campos puntuales',
      'Poblá cliente y seleccioná únicamente nombre y email para la respuesta.',
      'Orden.findById(ordenId)',
      ['populate', 'cliente', 'select', 'nombre', 'email'],
      ['El primer argumento de populate es el path cliente.', 'La selección puede expresarse como cadena.', 'Los campos solicitados son nombre y email.'],
      'StrictPopulateError: Cannot populate path `usuario` because it is not in your schema.',
      'Seleccionar campos en populate limita la información del documento relacionado que llega a la respuesta.',
    ),
  ],
  pointReward: 100,
  hintCost: 20,
}
