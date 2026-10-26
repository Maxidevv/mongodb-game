Actúa como desarrollador front-end senior. Vamos a construir SOLO EL FRONT de un juego educativo llamado "Escape Room del Backend", donde el jugador aprende MongoDB y Mongoose resolviendo salas por niveles. El backend (Node + Express + MongoDB) lo hace otra parte del equipo, así que el front debe funcionar de forma independiente con una API simulada (mock).

STACK
- HTML, CSS y JavaScript puro con módulos ES (type="module"). Sin frameworks ni bundlers.
- Debe poder abrirse con un servidor estático simple y luego servirse desde /public de Express.
- Responsive (mobile first), accesible (etiquetas, foco visible, contraste) y comentado en español.

ESTRUCTURA DE CARPETAS (respetala exactamente, cada archivo tiene un solo responsable):
public/
index.html
css/
base.css        (variables, tipografía, reset)
layout.css      (grillas, header, contenedores)
components.css  (botones, tarjetas, modales, editor)
rooms/room1.css ... room5.css (un archivo por sala)
js/
main.js         (arranque y router por hash: #/inicio, #/mapa, #/sala/1..5, #/ranking, #/final)
api.js          (todas las llamadas al backend; con modo MOCK activable con una constante)
mock/           (datos simulados por sala)
state.js        (estado global: nickname, sala actual, puntos, salas desbloqueadas, guardado en localStorage)
ui/             (componentes reutilizables: theoryCard.js, hintPanel.js, codeEditor.js, resultPanel.js, errorBox.js, modal.js, toast.js)
views/          (inicio.js, mapa.js, ranking.js, final.js)
rooms/          (room1.js ... room5.js, uno por sala)

CONTRATO DE API (el backend lo va a respetar; usalo en api.js y en los mocks):
- POST /api/players          body {nickname}                       -> {playerId, nickname}
- GET  /api/rooms                                                  -> [{id, titulo, tema, desbloqueada, completada}]
- GET  /api/rooms/:id                                              -> {id, titulo, historia, teoria, consigna, tipo, pistas:[{id,costo}]}
- POST /api/rooms/:id/attempt body {playerId, respuesta}           -> {ok, mensaje, resultado, errorReal, explicacion, puntos}
- POST /api/rooms/:id/hint    body {playerId, pistaId}             -> {texto, puntosRestantes}
- GET  /api/ranking                                                -> [{nickname, puntos, tiempoTotal}]
  Toda respuesta con error devuelve {error: "mensaje"} y un código HTTP correcto. El front NUNCA decide si una respuesta es correcta: lo decide el backend (el mock lo simula).

LAS 5 SALAS (cada una es un tipo de interacción distinta):
1. Consultas con find: editor donde se escribe un filtro JSON; se muestra una tabla con los documentos devueltos.
2. Schemas de Mongoose: el jugador completa campos (tipo, required, enum, min/max, default) y ve en vivo el documento válido o el error de validación.
3. Middlewares y virtuals: ejercicio de completar código (pre('save'), virtual) con huecos editables.
4. Relaciones y populate: vista de dos colecciones y el jugador conecta con ref; se compara el resultado antes y después de populate.
5. Índices y explain(): el jugador crea un índice y ve una comparación visual de tiempos/documentos examinados.

COMPONENTES DE APRENDIZAJE (obligatorios en todas las salas):
- Tarjeta de teoría corta antes de jugar.
- Panel de pistas progresivas que restan puntos al usarse.
- Caja que muestra el error REAL de MongoDB/Mongoose cuando algo falla.
- Panel de explicación al resolver: "esto es lo que hizo tu consulta".
- Puntos, temporizador y barra de progreso por sala.

DISEÑO
- Estética de escape room / laboratorio de datos oscuro, con identidad propia y paleta definida en variables CSS. Nada de plantillas genéricas. Tipografía con personalidad (Google Fonts) y microanimaciones al abrir puertas, resolver y fallar.

ENTREGA
Generá primero SOLO la base: index.html, base.css, layout.css, components.css, main.js, api.js, state.js, los componentes de ui/, las vistas inicio, mapa, ranking y final, y los mocks de las 5 salas. Las salas (js/rooms/roomN.js y css/rooms/roomN.css) dejalas como archivos con la función exportada render(container, data) y un "TODO" claro, porque las desarrolla cada integrante. Terminá con un README_FRONT.md que explique la estructura, el contrato, cómo activar el modo mock y las reglas de trabajo en equipo.