// Fixture consumido por el modo mock del API para GET /api/rooms/4.
// La verificación de la respuesta pertenece al mock del endpoint attempt, no a la sala.
const room4Mock = {
  id: 4,
  titulo: "La conexión perdida",
  tema: "Relaciones y populate",
  historia:
    "Los comentarios llegaron al laboratorio, pero sus autores aparecen como identificadores opacos. Reconstruí la relación para revelar quién escribió cada mensaje.",
  teoria:
    "En Mongoose, un campo con type: Schema.Types.ObjectId y ref: 'Modelo' guarda el identificador de otro documento. Al consultar, populate('campo') sustituye ese ObjectId por el documento relacionado.",
  consigna:
    "Configurá el campo autor de Comentario para que referencie al modelo Usuario. Probá la relación y compará los documentos antes y después de populate().",
  tipo: "relaciones-populate",
  pistas: [
    { id: "room4-hint-1", costo: 5 },
    { id: "room4-hint-2", costo: 10 },
    { id: "room4-hint-3", costo: 15 },
  ],
  codigoInicial: "autor: { type: Schema.Types.ObjectId, ref: '' }",
  colecciones: [
    {
      id: "comentarios",
      nombre: "comentarios",
      modelo: "Comentario",
      descripcion: "Cada comentario almacena el _id de quien lo escribió.",
      documentos: [
        {
          _id: "cmt-101",
          texto: "MongoDB guarda documentos flexibles.",
          autor: "usr-21",
        },
        {
          _id: "cmt-102",
          texto: "populate resuelve referencias.",
          autor: "usr-34",
        },
      ],
    },
    {
      id: "usuarios",
      nombre: "usuarios",
      modelo: "Usuario",
      descripcion: "La colección de personas que participan en el laboratorio.",
      documentos: [
        { _id: "usr-21", nombre: "Ada", rol: "exploradora" },
        { _id: "usr-34", nombre: "Linus", rol: "arquitecto" },
      ],
    },
  ],
  // Valores esperados para que el adaptador MOCK de attempt simule el contrato del backend.
  mockAttempt: {
    respuestaCorrecta: {
      coleccionOrigen: "Comentario",
      campoRef: "autor",
      coleccionDestino: "Usuario",
      codigo: "autor: { type: Schema.Types.ObjectId, ref: 'Usuario' }",
    },
    pistasTexto: {
      "room4-hint-1": "El vínculo se define en el esquema del documento que guarda la referencia.",
      "room4-hint-2": "El tipo del campo es Schema.Types.ObjectId.",
      "room4-hint-3": "El valor de ref debe coincidir con el nombre del modelo, no con el nombre de la colección.",
    },
  },
};

export default room4Mock;
