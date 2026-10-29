import { roomsMock } from '../features/rooms/roomsMock';

export async function fetchRooms() {
  // Modo mock - solo frontend
  return Promise.resolve(roomsMock.map(r => ({
    id: r.id,
    titulo: r.titulo,
    tema: r.tema,
    desbloqueada: r.id === 1,
    completada: false,
  })));
}

export async function fetchRoomById(id) {
  const room = roomsMock.find(r => r.id === Number(id));
  if (!room) throw new Error('Sala no encontrada');
  return Promise.resolve(room);
}

export async function submitAttempt(roomId, respuesta) {
  const room = roomsMock.find(r => r.id === Number(roomId));
  if (!room) throw new Error('Sala no encontrada');
  
  // Simulación simple - en un caso real lo validaría el backend
  const isCorrect = JSON.stringify(respuesta).toLowerCase().includes('email') && roomId === 5 ||
                    JSON.stringify(respuesta).includes(JSON.stringify(room.solucion).replace(/"/g, '')) ||
                    respuesta === room.solucion.comando ||
                    (roomId === 1 && respuesta.edad && respuesta.edad.$gt === 25);
  
  if (isCorrect || roomId === 5 && (respuesta.includes('createIndex') || respuesta.index)) {
    return Promise.resolve({
      ok: true,
      mensaje: '¡Correcto! Has resuelto la sala.',
      resultado: 'success',
      explicacion: room.teoria,
      puntos: 100,
    });
  }
  
  return Promise.resolve({
    ok: false,
    mensaje: 'Respuesta incorrecta',
    resultado: 'error',
    errorReal: 'MongoServerError: Query failed',
    explicacion: 'Revisa la teoría e intenta nuevamente.',
    puntos: 0,
  });
}

export async function useHint(roomId, pistaId) {
  const room = roomsMock.find(r => r.id === Number(roomId));
  const pista = room?.pistas?.find(p => p.id === Number(pistaId));
  if (!pista) throw new Error('Pista no encontrada');
  return Promise.resolve({
    texto: pista.texto,
    puntosRestantes: 100 - pista.costo,
  });
}
