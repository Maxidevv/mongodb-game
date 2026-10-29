// Mock data para las 5 salas
export const roomsMock = [
  {
    id: 1,
    titulo: 'Consultas con find',
    tema: 'Consultas básicas',
    historia: 'Necesitas encontrar documentos en la colección usuarios con un filtro específico.',
    teoria: 'El método find() permite buscar documentos que coincidan con un filtro JSON.',
    consigna: 'Escribe un filtro para encontrar usuarios mayores de 25 años.',
    tipo: 'find',
    pistas: [
      { id: 1, costo: 10, texto: 'Usa operadores como $gt' },
      { id: 2, costo: 20, texto: 'La sintaxis es { edad: { $gt: 25 } }' },
    ],
    solucion: { edad: { $gt: 25 } },
    coleccion: 'usuarios',
    datos: [
      { _id: 1, nombre: 'Ana', edad: 22 },
      { _id: 2, nombre: 'Luis', edad: 30 },
      { _id: 3, nombre: 'María', edad: 28 },
      { _id: 4, nombre: 'Pedro', edad: 19 },
    ],
  },
  {
    id: 2,
    titulo: 'Schemas de Mongoose',
    tema: 'Validación',
    historia: 'Define un esquema Mongoose con validaciones correctas.',
    teoria: 'Los schemas definen la estructura y validaciones de los documentos.',
    consigna: 'Completa el esquema para un campo "email" requerido y único con validación.',
    tipo: 'schema',
    pistas: [
      { id: 1, costo: 10, texto: 'Usa required: true' },
    ],
    solucion: { email: { type: String, required: true, unique: true } },
  },
  {
    id: 3,
    titulo: 'Middlewares y virtuals',
    tema: 'Hooks',
    historia: 'Implementa un middleware pre-save y un virtual.',
    teoria: 'Los middlewares permiten ejecutar lógica antes/después de operaciones.',
    consigna: 'Completa el código para hashear contraseña antes de guardar.',
    tipo: 'middleware',
    pistas: [
      { id: 1, costo: 15, texto: 'Usa schema.pre("save", ...) ' },
    ],
    solucion: `schema.pre('save', function(next) {
  if (!this.isModified('password')) return next();
  this.password = hash(this.password);
  next();
});`,
  },
  {
    id: 4,
    titulo: 'Relaciones y populate',
    tema: 'Referencias',
    historia: 'Relaciona dos colecciones usando ref y populate.',
    teoria: 'Las referencias permiten relacionar documentos entre colecciones.',
    consigna: 'Configura el campo "autor" con ref a "Usuario" para usar populate.',
    tipo: 'populate',
    pistas: [
      { id: 1, costo: 10, texto: 'Usa ref: "Usuario"' },
    ],
    solucion: { autor: { type: Schema.Types.ObjectId, ref: 'Usuario' } },
  },
  {
    id: 5,
    titulo: 'Índices y explain()',
    tema: 'Optimización',
    historia: 'Optimiza una consulta creando un índice y analizando con explain().',
    teoria: 'Los índices mejoran el rendimiento de las consultas. explain() muestra el plan de ejecución.',
    consigna: 'Crea un índice en el campo "email" para optimizar la búsqueda y reduce el número de documentos examinados.',
    tipo: 'index_explain',
    pistas: [
      { id: 1, costo: 10, texto: 'Usa createIndex() o index: true' },
      { id: 2, costo: 20, texto: 'db.usuarios.createIndex({ email: 1 })' },
    ],
    solucion: { index: { email: 1 }, comando: 'db.usuarios.createIndex({ email: 1 })' },
    escenario: {
      sinIndice: { docsExamined: 10000, executionTimeMillis: 150, nReturned: 1 },
      conIndice: { docsExamined: 1, executionTimeMillis: 2, nReturned: 1 },
    },
  },
];
