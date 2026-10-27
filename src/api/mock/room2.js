export const room2Data = {
  id: 2,
  titulo: 'El Archivo Sellado',
  historia:
    'Un guardián protege la biblioteca. Solo abrirá el archivo cuando el schema de Libro impida guardar documentos incompletos o fuera de las reglas.',
  teoria:
    'Un schema de Mongoose define la forma y las reglas de tus documentos. required impide omisiones, enum limita los valores permitidos, min establece el mínimo numérico y default completa un valor cuando falta.',
  consigna:
    'Configura los cinco campos de Libro para que los documentos de prueba respeten sus reglas y la fecha de publicación se complete automáticamente.',
  pistas: [
    { id: 'required', costo: 10, texto: 'titulo y autor deben ser String y no pueden faltar: activa required en ambos.' },
    { id: 'validation', costo: 15, texto: 'paginas es Number con min 1. genero es String y su enum contiene novela, ensayo y poesia.' },
    { id: 'default', costo: 20, texto: 'publicadoEn es Date. Usa Date.now como default para que Mongoose lo evalúe al crear cada documento.' },
  ],
  libros: [
    {
      id: 'libro-valido',
      etiqueta: 'Libro completo',
      descripcion: 'Todos sus valores respetan las reglas.',
      documento: {
        titulo: 'La ciudad y los datos',
        autor: 'Ada Lovelace',
        paginas: 240,
        genero: 'novela',
        publicadoEn: '2024-06-01',
      },
    },
    {
      id: 'libro-sin-titulo',
      etiqueta: 'Sin título',
      descripcion: 'Le falta un campo obligatorio.',
      documento: {
        autor: 'Jorge Luis Borges',
        paginas: 180,
        genero: 'ensayo',
        publicadoEn: '2023-02-14',
      },
    },
    {
      id: 'libro-fuera-de-regla',
      etiqueta: 'Fuera de las reglas',
      descripcion: 'Tiene páginas por debajo del mínimo y un género no permitido.',
      documento: {
        titulo: 'El laboratorio',
        autor: 'Ursula K. Le Guin',
        paginas: 0,
        genero: 'ciencia',
        publicadoEn: '2022-10-10',
      },
    },
  ],
}

const delay = (duration) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, duration)
  })

const isField = (field, type) => field?.type === type

const missingRequiredError = (path) =>
  `Libro validation failed: ${path}: Path \`${path}\` is required.`

export async function simulateRoom2Attempt(schema) {
  await delay(450)

  // El mock valida la consigna del nivel; el componente solo muestra la respuesta recibida.
  if (!isField(schema?.titulo, 'String') || schema.titulo.required !== true) {
    return {
      ok: false,
      mensaje: 'El archivo detectó un libro sin título obligatorio.',
      resultado: null,
      errorReal: missingRequiredError('titulo'),
      explicacion: '',
      puntos: 0,
    }
  }

  if (!isField(schema?.autor, 'String') || schema.autor.required !== true) {
    return {
      ok: false,
      mensaje: 'El archivo detectó un libro sin autor obligatorio.',
      resultado: null,
      errorReal: missingRequiredError('autor'),
      explicacion: '',
      puntos: 0,
    }
  }

  if (!isField(schema?.paginas, 'Number') || schema.paginas.min !== 1) {
    return {
      ok: false,
      mensaje: 'Un libro con cero páginas no fue rechazado correctamente.',
      resultado: null,
      errorReal:
        'Libro validation failed: paginas: Path `paginas` (0) is less than minimum allowed value (1).',
      explicacion: '',
      puntos: 0,
    }
  }

  const expectedGenres = ['novela', 'ensayo', 'poesia']
  const genres = schema?.genero?.enum
  const hasExpectedGenres =
    isField(schema?.genero, 'String') &&
    Array.isArray(genres) &&
    expectedGenres.every((genre) => genres.includes(genre))

  if (!hasExpectedGenres) {
    return {
      ok: false,
      mensaje: 'El género inválido no fue bloqueado por el enum.',
      resultado: null,
      errorReal:
        'Libro validation failed: genero: `ciencia` is not a valid enum value for path `genero`.',
      explicacion: '',
      puntos: 0,
    }
  }

  if (
    !isField(schema?.publicadoEn, 'Date') ||
    schema.publicadoEn.default !== 'Date.now'
  ) {
    return {
      ok: false,
      mensaje: 'La fecha de publicación no se completa automáticamente.',
      resultado: null,
      errorReal:
        'Libro validation failed: publicadoEn: Cast to date failed for value "no-es-una-fecha" (type string) at path "publicadoEn".',
      explicacion: '',
      puntos: 0,
    }
  }

  return {
    ok: true,
    mensaje: '¡El guardián abrió el Archivo Sellado!',
    resultado: {
      camposValidados: ['titulo', 'autor', 'paginas', 'genero', 'publicadoEn'],
    },
    errorReal: '',
    explicacion:
      'required evita que falten titulo y autor. min: 1 rechaza libros sin páginas. enum admite solo novela, ensayo o poesia. default: Date.now asigna la fecha al crear el documento.',
    puntos: 100,
  }
}
