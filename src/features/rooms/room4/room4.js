import { room4Data } from "./room4.data.js";
import { simulateRoom4Attempt } from "../../../api/mock/room4.js";

const WORLD = { width: 960, height: 600 };
const DIRECTIONS = new Set([
  "ArrowUp", "KeyW", "ArrowDown", "KeyS", "ArrowLeft", "KeyA", "ArrowRight", "KeyD",
]);
const HINT_COST = room4Data.hintCost;
const isEditable = (target) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function buildCollection(collection) {
  const section = node("section", "r4-collection");
  section.setAttribute("aria-label", `Colección ${collection.name}`);
  section.append(
    node("h3", "r4-collection__title", collection.name),
    node("p", "r4-collection__description", collection.description),
  );
  const wrapper = node("div", "r4-table-scroll");
  const table = node("table", "r4-table");
  table.append(node("caption", "", `Documentos de ${collection.name}`));
  const columns = Object.keys(collection.documents[0] ?? {});
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  for (const column of columns) {
    const th = node("th", "", column);
    th.scope = "col";
    headRow.append(th);
  }
  head.append(headRow);
  const body = document.createElement("tbody");
  for (const documentData of collection.documents) {
    const row = document.createElement("tr");
    for (const column of columns) {
      const value = documentData[column];
      row.append(node("td", "", typeof value === "object" ? JSON.stringify(value) : String(value)));
    }
    body.append(row);
  }
  table.append(head, body);
  wrapper.append(table);
  section.append(wrapper);
  return section;
}

function formatTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

function formatDocument(value) {
  return JSON.stringify(value, null, 2);
}

export function render(container, { onRoomComplete, paused = false } = {}) {
  container.replaceChildren();
  container.classList.add("room4");

  const pageHeader = node("header", "r4-header");
  pageHeader.append(
    node("p", "r4-eyebrow", "ESCAPE ROOM · NIVEL 04"),
    node("h1", "r4-title", room4Data.title),
    node("p", "r4-story", room4Data.story),
  );

  const theory = node("section", "r4-theory");
  theory.setAttribute("aria-labelledby", "r4-theory-title");
  theory.append(
    node("p", "r4-eyebrow", "ANTES DE ENTRAR"),
    node("h2", "r4-section-title", "Briefing de laboratorio"),
    node("p", "r4-section-copy", room4Data.theory),
  );

  const status = node("section", "r4-status");
  status.setAttribute("aria-label", "Progreso de la sala");
  const statusRow = node("div", "r4-status__row");
  const score = node("p", "r4-score", "Puntos: 0");
  const timer = node("p", "r4-timer", "Tiempo: 00:00");
  timer.setAttribute("aria-label", "Tiempo en la sala");
  const progress = document.createElement("progress");
  progress.className = "r4-progress";
  progress.max = room4Data.challenges.length;
  progress.value = 0;
  progress.setAttribute("aria-label", "Terminales completados");
  statusRow.append(score, timer);
  status.append(statusRow, progress);

  const collections = node("section", "r4-collections");
  collections.setAttribute("aria-labelledby", "r4-collections-title");
  const collectionsTitle = node("h2", "r4-section-title", "Las colecciones conectadas");
  collectionsTitle.id = "r4-collections-title";
  collections.append(collectionsTitle);
  for (const collection of room4Data.collections) collections.append(buildCollection(collection));
  const relation = node("div", "r4-relation");
  relation.setAttribute("aria-label", "Ordenes cliente referencia a Clientes por ObjectId");
  relation.append(
    node("span", "r4-relation__node", "Ordenes.cliente"),
    node("span", "r4-relation__line"),
    node("span", "r4-relation__node", "Clientes._id"),
  );
  collections.append(relation);

  const comparison = node("section", "r4-comparison");
  comparison.setAttribute("aria-labelledby", "r4-comparison-title");
  const comparisonTitle = node("h2", "r4-section-title", "Antes y después de populate()");
  comparisonTitle.id = "r4-comparison-title";
  const comparisonGrid = node("div", "r4-comparison__grid");
  const beforeCard = node("article", "r4-comparison__card");
  beforeCard.append(node("h3", "", "Antes · solo ObjectId"));
  const beforeJson = node("pre", "r4-json", "Resolvé el terminal de populate para ver el resultado.");
  beforeCard.append(beforeJson);
  const afterCard = node("article", "r4-comparison__card");
  afterCard.append(node("h3", "", "Después · documento poblado"));
  const afterJson = node("pre", "r4-json", "El cliente aparecerá aquí cuando se resuelva la consulta.");
  afterCard.append(afterJson);
  comparisonGrid.append(beforeCard, afterCard);
  comparison.append(comparisonTitle, comparisonGrid);

  const gameArea = node("section", "r4-game");
  gameArea.setAttribute("aria-label", "Sala interactiva");
  const gameBar = node("div", "r4-game__bar");
  gameBar.append(
    node("span", "", "SECTOR 04 / GRAFO DE DATOS"),
    node("span", "r4-game__controls", "WASD / flechas · E o espacio: interactuar"),
  );
  const canvasWrap = node("div", "r4-game__canvas-wrap");
  const canvas = document.createElement("canvas");
  canvas.className = "r4-game__canvas";
  canvas.width = WORLD.width;
  canvas.height = WORLD.height;
  canvas.tabIndex = 0;
  canvas.setAttribute(
    "aria-label",
    "Mapa 2D de la sala. Movete con WASD o flechas y acercate a los terminales.",
  );
  const tooltip = node("div", "r4-game__tooltip");
  tooltip.setAttribute("role", "status");
  const roomMessage = node("div", "r4-game__message");
  roomMessage.setAttribute("role", "status");
  const legend = node("div", "r4-game__legend");
  legend.innerHTML = "<span><i class=\"is-active\"></i>Terminal disponible</span><span><i class=\"is-done\"></i>Resuelto</span>";
  canvasWrap.append(canvas, tooltip, roomMessage, legend);
  const gameFooter = node("footer", "r4-game__footer");
  gameFooter.append(
    node("span", "", "CONTROLES: W A S D o flechas"),
    node("span", "r4-game__progress", "PROGRESO 0%"),
  );
  gameArea.append(gameBar, canvasWrap, gameFooter);

  const modalHost = node("div", "r4-modal-host");
  const hintPanel = node("section", "r4-hints");
  hintPanel.setAttribute("aria-label", "Pistas progresivas");
  hintPanel.append(node("h2", "r4-section-title", "Pistas progresivas"));

  container.append(pageHeader, theory, status, collections, comparison, gameArea, hintPanel, modalHost);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo iniciar el canvas de la sala 4.");

  const player = { x: 464, y: 500, width: 32, height: 40, direction: "down", speed: 220 };
  const pressedKeys = new Set();
  const completed = new Set();
  const hintsUsed = new Map();
  const images = {};
  const imageElements = [];
  let activeChallenge = null;
  let nearbyTerminal = null;
  let elapsedSeconds = 0;
  let points = 0;
  let frameId = 0;
  let previousTime = 0;
  let destroyed = false;
  let isPaused = paused;
  let completionTriggered = false;
  let roomBlockedMessage = false;
  let modalCleanup = () => {};

  for (const [direction, source] of Object.entries(room4Data.sprites ?? {})) {
    const image = new Image();
    image.onload = () => { images[direction] = image; };
    image.onerror = () => { delete images[direction]; };
    image.src = source;
    imageElements.push(image);
  }

  const resizeCanvas = () => {
    const bounds = canvas.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    ctx.setTransform(canvas.width / WORLD.width, 0, 0, canvas.height / WORLD.height, 0, 0);
  };
  const resizeObserver = new ResizeObserver(resizeCanvas);
  resizeObserver.observe(canvas);
  window.addEventListener("resize", resizeCanvas);
  resizeCanvas();

  function updateScore() {
    score.textContent = `Puntos: ${points}`;
  }

  function updateProgress() {
    progress.value = completed.size;
    gameFooter.querySelector(".r4-game__progress").textContent =
      `PROGRESO ${Math.round((completed.size / room4Data.challenges.length) * 100)}%`;
  }

  function setPaused(nextPaused) {
    isPaused = nextPaused;
    if (isPaused) pressedKeys.clear();
  }

  function closeChallenge() {
    modalCleanup();
    modalCleanup = () => {};
    activeChallenge = null;
    modalHost.replaceChildren();
    pressedKeys.clear();
  }

  function showComparison(result) {
    if (!result) return;
    beforeJson.textContent = formatDocument(result.antes);
    afterJson.textContent = formatDocument(result.despues);
    container.classList.add("is-solved");
  }

  function openChallenge(challengeId) {
    const challenge = room4Data.challenges.find((item) => item.id === challengeId);
    if (!challenge || completed.has(challengeId)) return;
    activeChallenge = challenge;
    pressedKeys.clear();

    const backdrop = node("div", "r4-modal-backdrop");
    const dialog = node("section", "r4-modal");
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", "r4-active-challenge-title");
    dialog.tabIndex = -1;
    const heading = node("header", "r4-modal__header");
    const headingCopy = document.createElement("div");
    headingCopy.append(
      node("p", "r4-eyebrow", "TERMINAL CONECTADO"),
      node("h2", "", challenge.title),
    );
    headingCopy.lastElementChild.id = "r4-active-challenge-title";
    const closeButton = node("button", "r4-modal__close", "×");
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Cerrar desafío");
    heading.append(headingCopy, closeButton);

    const form = node("form", "r4-modal__form");
    form.append(node("p", "r4-section-copy", challenge.prompt));
    const label = node("label", "r4-label", "Código de relación");
    const editor = document.createElement("textarea");
    editor.className = "r4-editor";
    editor.id = "r4-answer";
    editor.spellcheck = false;
    editor.value = challenge.starter;
    label.htmlFor = editor.id;
    label.append(editor);
    form.append(label);

    const hints = node("section", "r4-modal__hints");
    const hintsHeader = node("div", "");
    hintsHeader.append(
      node("strong", "", "Pistas progresivas"),
      node("small", "", `Cada pista resta ${HINT_COST} puntos`),
    );
    const hintButton = node("button", "r4-hint-button");
    hintButton.type = "button";
    const hintList = document.createElement("ol");
    function updateHintPanel() {
      const next = hintsUsed.get(challengeId) ?? 0;
      hintButton.textContent = next < challenge.hints.length
        ? `Ver pista ${next + 1}/${challenge.hints.length}`
        : "No quedan pistas";
      hintButton.disabled = next >= challenge.hints.length;
      hintList.replaceChildren();
      challenge.hints.slice(0, next).forEach((text) => hintList.append(node("li", "", text)));
    }
    hints.append(hintsHeader, hintButton, hintList);
    form.append(hints);

    const feedback = node("div", "r4-modal__feedback");
    feedback.setAttribute("aria-live", "polite");
    const actions = node("div", "r4-modal__actions");
    const backButton = node("button", "r4-secondary-button", "Volver a la sala");
    backButton.type = "button";
    const submitButton = node("button", "r4-submit", "Probar relación ↗");
    submitButton.type = "submit";
    actions.append(backButton, submitButton);
    form.append(feedback, actions);
    dialog.append(heading, form);
    backdrop.append(dialog);
    modalHost.replaceChildren(backdrop);
    updateHintPanel();
    dialog.focus();

    const close = () => closeChallenge();
    const onEscape = (event) => {
      if (event.key === "Escape") close();
    };
    closeButton.addEventListener("click", close);
    backButton.addEventListener("click", close);
    window.addEventListener("keydown", onEscape);
    hintButton.addEventListener("click", () => {
      const index = hintsUsed.get(challengeId) ?? 0;
      if (index >= challenge.hints.length) return;
      hintsUsed.set(challengeId, index + 1);
      points = Math.max(0, points - HINT_COST);
      updateScore();
      updateHintPanel();
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      submitButton.disabled = true;
      submitButton.textContent = "PROBANDO…";
      feedback.replaceChildren();
      try {
        const response = await simulateRoom4Attempt({
          challengeId,
          respuesta: editor.value,
        });
        if (response.ok) {
          const success = node("div", "r4-success", response.mensaje);
          success.append(node("p", "", response.explicacion));
          feedback.append(success);
          points += response.puntos ?? room4Data.pointReward;
          updateScore();
          if (response.resultado?.antes && response.resultado?.despues) {
            showComparison(response.resultado);
          }
          submitButton.hidden = true;
          const continueButton = node("button", "r4-submit", "Continuar ↗");
          continueButton.type = "button";
          actions.append(continueButton);
          continueButton.addEventListener("click", () => {
            completed.add(challengeId);
            updateProgress();
            closeChallenge();
          }, { once: true });
        } else {
          const error = node("div", "r4-error-message");
          error.setAttribute("role", "alert");
          error.append(node("strong", "", "Error de Mongoose"));
          error.append(node("code", "", response.errorReal));
          error.append(node("p", "", response.mensaje));
          feedback.append(error);
          container.classList.remove("is-solved");
          container.classList.add("has-error");
        }
      } catch (error) {
        const message = node("p", "r4-error-message", error instanceof Error ? error.message : "No se pudo ejecutar el mock.");
        message.setAttribute("role", "alert");
        feedback.append(message);
      } finally {
        if (submitButton.isConnected && !submitButton.hidden) {
          submitButton.disabled = false;
          submitButton.textContent = "Probar relación ↗";
        }
      }
    });
    modalCleanup = () => window.removeEventListener("keydown", onEscape);
  }

  function collides(x, y) {
    const playerRight = x + player.width;
    const playerBottom = y + player.height;
    if (x < 20 || playerRight > 940 || playerBottom > 580) return true;
    if (y < 70 && (x + player.width / 2 < 425 || x + player.width / 2 > 535)) return true;
    return room4Data.map.obstacles.some((wall) =>
      x < wall.x + wall.width && playerRight > wall.x &&
      y < wall.y + wall.height && playerBottom > wall.y);
  }

  function draw(time) {
    const delta = Math.min((time - previousTime) / 1000 || 0, 0.04);
    previousTime = time;
    if (!isPaused && !activeChallenge) {
      const dx = Number(pressedKeys.has("ArrowRight") || pressedKeys.has("KeyD")) -
        Number(pressedKeys.has("ArrowLeft") || pressedKeys.has("KeyA"));
      const dy = Number(pressedKeys.has("ArrowDown") || pressedKeys.has("KeyS")) -
        Number(pressedKeys.has("ArrowUp") || pressedKeys.has("KeyW"));
      if (dx || dy) {
        player.direction = Math.abs(dx) > Math.abs(dy)
          ? (dx < 0 ? "left" : "right")
          : (dy < 0 ? "up" : "down");
        const length = Math.hypot(dx, dy);
        const moveX = (dx / length) * player.speed * delta;
        const moveY = (dy / length) * player.speed * delta;
        if (!collides(player.x + moveX, player.y)) player.x += moveX;
        if (!collides(player.x, player.y + moveY)) player.y += moveY;
      }
    }

    nearbyTerminal = room4Data.map.terminals.find((item) =>
      Math.hypot(player.x + player.width / 2 - item.x, player.y + player.height / 2 - item.y) < 78) ?? null;
    tooltip.replaceChildren();
    if (nearbyTerminal && !activeChallenge && !isPaused) {
      tooltip.append(
        document.createTextNode("Presiona E o Espacio para interactuar"),
        node("span", "", nearbyTerminal.label),
      );
    }

    ctx.clearRect(0, 0, WORLD.width, WORLD.height);
    ctx.fillStyle = "#09131a";
    ctx.fillRect(0, 0, WORLD.width, WORLD.height);
    ctx.strokeStyle = "rgba(80, 190, 180, 0.09)";
    ctx.lineWidth = 1;
    for (let x = 30; x < WORLD.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 580); ctx.stroke();
    }
    for (let y = 30; y < WORLD.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(940, y); ctx.stroke();
    }
    ctx.strokeStyle = "#31515a";
    ctx.lineWidth = 3;
    ctx.strokeRect(20, 20, 920, 560);
    ctx.fillStyle = completed.size === room4Data.challenges.length ? "#55f0b5" : "#703f53";
    ctx.fillRect(425, 20, 110, 9);
    ctx.fillStyle = "#b7c9c7";
    ctx.font = "12px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(completed.size === room4Data.challenges.length ? "SALIDA ABIERTA" : "SALIDA BLOQUEADA", 480, 48);
    for (const wall of room4Data.map.obstacles) {
      ctx.fillStyle = "#20333a";
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      ctx.strokeStyle = "#3a6268";
      ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
    for (const terminal of room4Data.map.terminals) {
      const done = completed.has(terminal.id);
      ctx.fillStyle = done ? "#1b705d" : nearbyTerminal?.id === terminal.id ? "#e5a84c" : "#167f83";
      ctx.shadowColor = "#42d6cb";
      ctx.shadowBlur = nearbyTerminal?.id === terminal.id ? 20 : 8;
      ctx.fillRect(terminal.x - 19, terminal.y - 19, 38, 38);
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#9af9ed";
      ctx.strokeRect(terminal.x - 19, terminal.y - 19, 38, 38);
      ctx.fillStyle = "#e2f5ee";
      ctx.font = "11px system-ui";
      ctx.fillText(terminal.label, terminal.x, terminal.y + 34);
      ctx.fillStyle = "#071115";
      ctx.font = "bold 15px system-ui";
      ctx.fillText(done ? "✓" : "⌘", terminal.x, terminal.y + 5);
    }
    const sprite = images[player.direction];
    if (sprite?.complete && sprite.naturalWidth) {
      ctx.drawImage(sprite, player.x, player.y, player.width, player.height);
    } else {
      ctx.fillStyle = "#f2cc75";
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = "#14232a";
      ctx.fillRect(player.x + 5, player.y + 7, 22, 14);
      const eye = { up: [16, 3], down: [16, 37], left: [3, 20], right: [29, 20] }[player.direction];
      ctx.fillStyle = "#5cf0cb";
      ctx.beginPath();
      ctx.arc(player.x + eye[0], player.y + eye[1], 3, 0, Math.PI * 2);
      ctx.fill();
    }

    const atExit = player.y < 55 && player.x + player.width / 2 > 425 && player.x + player.width / 2 < 535;
    if (atExit && completed.size === room4Data.challenges.length && !completionTriggered) {
      completionTriggered = true;
      onRoomComplete?.();
    } else if (atExit && completed.size !== room4Data.challenges.length && !roomBlockedMessage) {
      roomBlockedMessage = true;
      roomMessage.textContent = "Resolvé todos los terminales para abrir la salida.";
    } else if (!atExit && roomBlockedMessage) {
      roomBlockedMessage = false;
      roomMessage.textContent = "";
    }
    if (!destroyed) frameId = requestAnimationFrame(draw);
  }

  function onKeyDown(event) {
    if (DIRECTIONS.has(event.code)) {
      if (!activeChallenge && !isPaused && !isEditable(event.target)) {
        pressedKeys.add(event.code);
        event.preventDefault();
      }
      return;
    }
    if (isEditable(event.target) || isPaused) return;
    if (event.code === "Escape" && activeChallenge) {
      closeChallenge();
    } else if ((event.code === "KeyE" || event.code === "Space") && nearbyTerminal && !activeChallenge) {
      event.preventDefault();
      roomMessage.textContent = "";
      roomBlockedMessage = false;
      openChallenge(nearbyTerminal.id);
    }
  }
  const onKeyUp = (event) => pressedKeys.delete(event.code);
  window.addEventListener("keydown", onKeyDown);
  window.addEventListener("keyup", onKeyUp);

  const timerId = window.setInterval(() => {
    if (isPaused || destroyed) return;
    elapsedSeconds += 1;
    timer.textContent = `Tiempo: ${formatTime(elapsedSeconds)}`;
  }, 1000);
  frameId = requestAnimationFrame(draw);

  return {
    setPaused,
    destroy() {
      destroyed = true;
      window.clearInterval(timerId);
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      modalCleanup();
      imageElements.forEach((image) => {
        image.onload = null;
        image.onerror = null;
        image.src = "";
      });
      container.replaceChildren();
      container.classList.remove("room4", "is-solved", "has-error");
    },
  };
}
