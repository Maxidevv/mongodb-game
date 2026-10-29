import { room4Data } from "../../features/rooms/room4/room4.data.js";

const delay = (duration) =>
  new Promise((resolve) => globalThis.setTimeout(resolve, duration));

const order = room4Data.collections.find((collection) => collection.id === "orders").documents[0];
const client = room4Data.collections.find((collection) => collection.id === "clients").documents[0];

const beforePopulate = { ...order, cliente: order.cliente };
const afterPopulate = { ...order, cliente: { ...client } };

const failure = (mensaje, errorReal) => ({
  ok: false,
  mensaje,
  resultado: null,
  errorReal,
  explicacion: "",
  puntos: 0,
});

export async function simulateRoom4Attempt({ challengeId, respuesta }) {
  await delay(350);
  const answer = typeof respuesta === "string" ? respuesta : "";

  if (challengeId === "terminal-1") {
    const hasObjectId = /(?:mongoose\.)?schema\.types\.objectid/i.test(answer);
    const hasClientRef = /ref\s*:\s*['"`]cliente['"`]/i.test(answer);

    if (!hasObjectId || !hasClientRef) {
      return failure(
        "La referencia todavía no apunta al modelo Cliente.",
        'MissingSchemaError: Schema hasn’t been registered for model "cliente".',
      );
    }

    return {
      ok: true,
      mensaje: "La referencia cliente ya conoce el modelo Cliente.",
      resultado: { antes: beforePopulate, despues: beforePopulate },
      errorReal: "",
      explicacion:
        'El path cliente declara un ObjectId y ref: "Cliente". Mongoose puede usar ese modelo para resolver la referencia.',
      puntos: room4Data.pointReward,
    };
  }

  if (challengeId === "terminal-2") {
    const hasLookup = /orden\.findbyid\s*\(\s*ordenid\s*\)/i.test(answer);
    const hasPopulate = /\.populate\s*\(\s*['"`]cliente['"`]\s*\)/i.test(answer);

    if (!hasLookup || !hasPopulate) {
      return failure(
        "La consulta no pobló el campo cliente.",
        "StrictPopulateError: Cannot populate path `cliente` because it is not in your schema.",
      );
    }

    return {
      ok: true,
      mensaje: "La consulta resolvió el cliente relacionado.",
      resultado: { antes: beforePopulate, despues: afterPopulate },
      errorReal: "",
      explicacion:
        'Antes de populate(), cliente es solo el ObjectId guardado. populate("cliente") consulta el modelo indicado por ref y reemplaza esa referencia por el documento del cliente.',
      puntos: room4Data.pointReward,
    };
  }

  if (challengeId === "terminal-3") {
    const hasPopulate = /\.populate\s*\(\s*['"`]cliente['"`]\s*,\s*['"`][^'"`]*nombre[^'"`]*email[^'"`]*['"`]\s*\)/i.test(answer);

    if (!hasPopulate) {
      return failure(
        "No se seleccionaron nombre y email dentro de populate.",
        "StrictPopulateError: Cannot populate path `cliente` with the requested field selection.",
      );
    }

    return {
      ok: true,
      mensaje: "La consulta pobló el cliente con los campos solicitados.",
      resultado: {
        antes: beforePopulate,
        despues: {
          ...order,
          cliente: { _id: client._id, nombre: client.nombre, email: client.email },
        },
      },
      errorReal: "",
      explicacion:
        'populate("cliente", "nombre email") resuelve la referencia y limita los datos del cliente a nombre y email. MongoDB conserva _id por defecto.',
      puntos: room4Data.pointReward,
    };
  }

  return failure(
    "No se encontró el desafío solicitado.",
    `RoomNotFoundError: terminal "${String(challengeId)}" no existe en la sala 4.`,
  );
}
