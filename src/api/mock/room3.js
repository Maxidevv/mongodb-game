export const room3Data = {
  id: 3,
  titulo: 'La Cámara de los Hooks',
  historia:
    'Una cámara antigua protege el registro de usuarios. Completa sus hooks para formar un nombre visible y normalizar el email antes de guardar.',
  teoria:
    'Un virtual de Mongoose calcula un valor a partir de otros campos del documento, pero no se guarda en MongoDB. Un middleware pre("save") se ejecuta antes de guardar: sirve para preparar datos, como normalizar un email.',
  consigna:
    'Completa el virtual nombreCompleto usando nombre y apellido, y agrega un pre("save") que convierta el email a minúsculas antes de continuar.',
  pistas: [
    {
      id: 'virtual',
      costo: 10,
      texto: 'Declara el virtual con el nombre nombreCompleto y usa this.nombre para leer el nombre del documento.',
    },
    {
      id: 'apellido',
      costo: 15,
      texto: 'Para formar el nombre visible, concatena this.nombre, un espacio y this.apellido.',
    },
    {
      id: 'middleware',
      costo: 20,
      texto: 'Registra el middleware con pre("save"), transforma this.email con toLowerCase() y luego llama a next().',
    },
  ],
  usuario: {
    nombre: 'Ada',
    apellido: 'Lovelace',
    email: 'ADA@EXAMPLE.COM',
  },
  huecos: [
    { id: 'virtual', etiqueta: 'Nombre del virtual' },
    { id: 'nombre', etiqueta: 'Campo del nombre' },
    { id: 'apellido', etiqueta: 'Campo del apellido' },
    { id: 'middleware', etiqueta: 'Evento del middleware' },
    { id: 'normalizacion', etiqueta: 'Método de normalización' },
  ],
}

const delay = (duration) =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, duration)
  })

const expectedAnswers = [
  'nombreCompleto',
  'nombre',
  'apellido',
  'save',
  'toLowerCase',
]

export async function simulateRoom3Attempt(respuestas) {
  await delay(450)

  const answers = Array.isArray(respuestas) ? respuestas : []
  const wrongIndex = expectedAnswers.findIndex((answer, index) => answers[index] !== answer)

  if (wrongIndex === -1 && answers.length === expectedAnswers.length) {
    return {
      ok: true,
      mensaje: '¡Los hooks activaron el mecanismo de la cámara!',
      resultado: {
        nombreCompleto: `${room3Data.usuario.nombre} ${room3Data.usuario.apellido}`,
        emailGuardado: room3Data.usuario.email.toLowerCase(),
      },
      errorReal: '',
      explicacion:
        'El virtual nombreCompleto combina nombre y apellido cuando se consulta el documento; se calcula al vuelo y no se persiste en la base. El middleware pre("save") corre antes de guardar y transforma el email a minúsculas antes de continuar con next().',
      puntos: 100,
    }
  }

  if (wrongIndex === 0) {
    return {
      ok: false,
      mensaje: 'El virtual que espera el lector de la cámara no está definido.',
      resultado: null,
      errorReal: 'ValidatorError: virtual `nombreCompleto` no está definido',
      explicacion: '',
      puntos: 0,
    }
  }

  if (wrongIndex === 1 || wrongIndex === 2) {
    return {
      ok: false,
      mensaje: 'El virtual está leyendo un campo que no corresponde.',
      resultado: null,
      errorReal:
        `TypeError: Cannot read properties of undefined (reading 'trim') while computing virtual \`nombreCompleto\` from \`this.${answers[wrongIndex] ?? 'campo'}\`.`,
      explicacion: '',
      puntos: 0,
    }
  }

  if (wrongIndex === 3) {
    return {
      ok: false,
      mensaje: 'El middleware está conectado al momento equivocado.',
      resultado: null,
      errorReal:
        'MongooseError: middleware must be defined before compiling the model',
      explicacion: '',
      puntos: 0,
    }
  }

  return {
    ok: false,
    mensaje: 'El email no pudo normalizarse antes de guardar.',
    resultado: null,
    errorReal: 'TypeError: this.email.toLowerCase is not a function',
    explicacion: '',
    puntos: 0,
  }
}
