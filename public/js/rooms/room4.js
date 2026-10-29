import * as api from "../api.js";
import * as state from "../state.js";
import * as theoryCard from "../ui/theoryCard.js";
import * as hintPanel from "../ui/hintPanel.js";
import * as codeEditor from "../ui/codeEditor.js";
import * as resultPanel from "../ui/resultPanel.js";
import * as errorBox from "../ui/errorBox.js";

const ROOM_ID = 4;

function ensureRoomStylesheet() {
  if (document.querySelector('link[data-room-style="4"]')) return;
  const stylesheet = document.createElement("link");
  stylesheet.rel = "stylesheet";
  stylesheet.href = "/css/rooms/room4.css";
  stylesheet.dataset.roomStyle = "4";
  document.head.append(stylesheet);
}

// Los componentes compartidos se integran mediante su export render(container, data).
function renderShared(component, container, data) {
  const renderComponent = component.render ?? component.default;
  if (typeof renderComponent !== "function") {
    throw new Error("El componente compartido debe exportar render(container, data).");
  }
  renderComponent(container, data);
}

function getPlayerId() {
  const currentState = state.getState?.();
  const playerId = currentState?.playerId ?? currentState?.jugador?.playerId;
  if (!playerId) {
    throw new Error("No se encontró playerId en el estado de la partida.");
  }
  return playerId;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createCollectionTable(collection) {
  const section = element("section", "r4-collection");
  section.setAttribute("aria-label", `Colección ${collection.nombre}`);

  const heading = element("h3", "r4-collection__title", collection.nombre);
  const description = element("p", "r4-collection__description", collection.descripcion);
  const table = element("table", "r4-table");
  const caption = element("caption", "", `Documentos de ${collection.nombre}`);
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  const columns = collection.documentos.length
    ? Object.keys(collection.documentos[0])
    : [];

  for (const column of columns) {
    const heading = element("th", "", column);
    heading.scope = "col";
    headRow.append(heading);
  }
  head.append(headRow);

  const body = document.createElement("tbody");
  for (const documentData of collection.documentos) {
    const row = document.createElement("tr");
    for (const column of columns) {
      const cell = document.createElement("td");
      const value = documentData[column];
      cell.textContent =
        value && typeof value === "object" ? JSON.stringify(value) : String(value ?? "—");
      row.append(cell);
    }
    body.append(row);
  }

  table.append(caption, head, body);
  section.append(heading, description, table);
  return section;
}

function formatResponse(value) {
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
}

function showApiError(mount, message) {
  mount.replaceChildren();
  renderShared(errorBox, mount, { error: message, mensaje: message });
}

export function render(container, data) {
  ensureRoomStylesheet();
  container.replaceChildren();
  container.classList.add("room4");

  const room = data?.room ?? data ?? {};
  const collections = data?.colecciones ?? room.colecciones ?? [];
  const origin = collections.find((collection) => collection.id === "comentarios");
  const target = collections.find((collection) => collection.id === "usuarios");

  const header = element("header", "r4-header");
  header.append(
    element("p", "r4-eyebrow", "SALA 04 · RELACIONES"),
    element("h1", "r4-title", room.titulo ?? "La conexión perdida"),
    element(
      "p",
      "r4-story",
      room.historia ?? "Dos colecciones guardan una relación que todavía no se puede recorrer."
    )
  );
  container.append(header);

  const theoryMount = element("div", "r4-theory");
  container.append(theoryMount);
  renderShared(theoryCard, theoryMount, {
    titulo: "Teoría breve: ref y populate()",
    teoria:
      room.teoria ??
      "Un campo ref almacena el _id de un documento relacionado. populate() reemplaza ese identificador por el documento asociado.",
    contenido: room.teoria,
  });

  const status = element("section", "r4-status");
  status.setAttribute("aria-label", "Progreso de la sala");
  const statusRow = element("div", "r4-status__row");
  const score = element("p", "r4-score", `Puntos: ${data?.puntos ?? 0}`);
  const timer = element("p", "r4-timer", "Tiempo: 00:00");
  timer.setAttribute("aria-live", "off");
  const progress = document.createElement("progress");
  progress.className = "r4-progress";
  progress.max = 100;
  progress.value = 20;
  progress.setAttribute("aria-label", "Progreso de la sala");
  statusRow.append(score, timer);
  status.append(statusRow, progress);
  container.append(status);

  const collectionsSection = element("section", "r4-collections");
  collectionsSection.setAttribute("aria-labelledby", "r4-collections-title");
  const collectionsTitle = element("h2", "r4-section-title", "Explorá las colecciones");
  collectionsTitle.id = "r4-collections-title";
  collectionsSection.append(
    collectionsTitle,
    element(
      "p",
      "r4-section-copy",
      "El campo autor guarda una referencia. Configurá el vínculo para consultar el documento relacionado."
    )
  );
  if (origin) collectionsSection.append(createCollectionTable(origin));
  if (target) collectionsSection.append(createCollectionTable(target));

  const relation = element("div", "r4-relation");
  relation.setAttribute("aria-hidden", "true");
  relation.innerHTML =
    '<span class="r4-relation__node">comentarios.autor</span><span class="r4-relation__line"></span><span class="r4-relation__node">usuarios._id</span>';
  collectionsSection.append(relation);
  container.append(collectionsSection);

  const challenge = element("section", "r4-challenge");
  challenge.setAttribute("aria-labelledby", "r4-challenge-title");
  const challengeTitle = element("h2", "r4-section-title", "Reconectá al autor");
  challengeTitle.id = "r4-challenge-title";
  challenge.append(
    element("p", "r4-eyebrow", "DESAFÍO"),
    challengeTitle,
    element(
      "p",
      "r4-section-copy",
      room.consigna ??
        "Declarale al esquema qué campo guarda la referencia a usuarios y qué modelo debe poblarse."
    )
  );

  const form = element("form", "r4-form");
  const fieldset = document.createElement("fieldset");
  fieldset.className = "r4-form__fieldset";
  const legend = element("legend", "", "Configuración de la relación");
  fieldset.append(legend);

  const refFieldLabel = element("label", "r4-label", "Campo que contiene la referencia");
  refFieldLabel.htmlFor = "r4-ref-field";
  const refField = document.createElement("input");
  refField.id = "r4-ref-field";
  refField.name = "refField";
  refField.required = true;
  refField.autocomplete = "off";
  refField.value = "autor";
  refField.setAttribute("aria-describedby", "r4-ref-help");
  const refHelp = element("span", "r4-help", "Ejemplo: autor");
  refHelp.id = "r4-ref-help";
  refFieldLabel.append(refField, refHelp);

  const modelLabel = element("label", "r4-label", "Colección / modelo referenciado");
  modelLabel.htmlFor = "r4-target-model";
  const modelSelect = document.createElement("select");
  modelSelect.id = "r4-target-model";
  modelSelect.name = "targetModel";
  modelSelect.required = true;
  for (const collection of collections) {
    const option = document.createElement("option");
    option.value = collection.modelo ?? collection.nombre;
    option.textContent = collection.nombre;
    option.selected = collection.id === "usuarios";
    modelSelect.append(option);
  }
  modelLabel.append(modelSelect);
  fieldset.append(refFieldLabel, modelLabel);
  form.append(fieldset);

  const editorMount = element("div", "r4-editor");
  editorMount.id = "r4-code-editor";
  challenge.append(form, editorMount);
  container.append(challenge);

  const submitButton = element("button", "r4-submit", "Probar relación");
  submitButton.type = "submit";
  form.append(submitButton);

  const editorData = {
    titulo: "Vista previa del esquema",
    label: "Definición generada de la referencia",
    language: "javascript",
    value:
      room.codigoInicial ??
      "autor: { type: Schema.Types.ObjectId, ref: '' }",
  };
  renderShared(codeEditor, editorMount, editorData);

  // El editor compartido debe exponer un textarea o un control contenteditable.
  let codeInput = editorMount.querySelector(
    'textarea, [contenteditable="true"], input[type="text"]'
  );
  if (!codeInput) {
    codeInput = document.createElement("textarea");
    codeInput.className = "r4-code-fallback";
    codeInput.setAttribute("aria-label", "Definición de la referencia");
    codeInput.value = editorData.value;
    editorMount.append(codeInput);
  }
  codeInput.setAttribute("aria-label", "Definición de la referencia");
  if ("readOnly" in codeInput) codeInput.readOnly = true;
  if (codeInput.isContentEditable) codeInput.contentEditable = "false";

  function updateCodePreview() {
    const code = `${refField.value.trim()}: { type: Schema.Types.ObjectId, ref: '${modelSelect.value}' }`;
    if ("value" in codeInput) codeInput.value = code;
    else codeInput.textContent = code;
  }
  refField.addEventListener("input", updateCodePreview);
  modelSelect.addEventListener("change", updateCodePreview);
  updateCodePreview();

  const comparison = element("section", "r4-comparison");
  comparison.setAttribute("aria-labelledby", "r4-comparison-title");
  const comparisonTitle = element(
    "h2",
    "r4-section-title",
    "Antes y después de populate()"
  );
  comparisonTitle.id = "r4-comparison-title";
  comparison.append(comparisonTitle);
  const comparisonGrid = element("div", "r4-comparison__grid");
  const before = element("article", "r4-comparison__card");
  before.append(
    element("h3", "", "Sin populate"),
    element("pre", "r4-json", "La consulta mostrará el ObjectId guardado.")
  );
  const after = element("article", "r4-comparison__card");
  after.append(
    element("h3", "", "Con populate"),
    element("pre", "r4-json", "La consulta mostrará el documento relacionado.")
  );
  comparisonGrid.append(before, after);
  comparison.append(comparisonGrid);
  container.append(comparison);

  const hintsMount = element("div", "r4-hints");
  container.append(hintsMount);
  renderShared(hintPanel, hintsMount, {
    pistas: room.pistas ?? [],
    hints: room.pistas ?? [],
    roomId: ROOM_ID,
    onUseHint: requestHint,
  });
  if (!hintsMount.querySelector("[data-hint-id]")) {
    const hintActions = element("div", "r4-hint-actions");
    for (const [index, hint] of (room.pistas ?? []).entries()) {
      const hintButton = element("button", "r4-hint-button", `Usar pista ${index + 1} (-${hint.costo} pts)`);
      hintButton.type = "button";
      hintButton.dataset.hintId = hint.id;
      hintActions.append(hintButton);
    }
    hintsMount.append(hintActions);
  }

  const errorMount = element("div", "r4-error");
  errorMount.setAttribute("aria-live", "assertive");
  container.append(errorMount);

  const resultMount = element("div", "r4-result");
  resultMount.setAttribute("aria-live", "polite");
  container.append(resultMount);

  let hintInFlight = false;
  let elapsedSeconds = 0;
  const timerId = window.setInterval(() => {
    if (!container.isConnected) {
      window.clearInterval(timerId);
      return;
    }
    elapsedSeconds += 1;
    const minutes = String(Math.floor(elapsedSeconds / 60)).padStart(2, "0");
    const seconds = String(elapsedSeconds % 60).padStart(2, "0");
    timer.textContent = `Tiempo: ${minutes}:${seconds}`;
  }, 1000);

  async function requestHint(pistaId) {
    if (hintInFlight) return;
    hintInFlight = true;
    try {
      const response = await api.requestHint(ROOM_ID, {
        playerId: getPlayerId(),
        pistaId,
      });
      if (response?.error) throw new Error(response.error);
      if (typeof hintPanel.update === "function") {
        hintPanel.update(hintsMount, response);
      } else {
        const hintText = element(
          "p",
          "r4-hint-response",
          response.texto ?? "Pista recibida."
        );
        hintsMount.append(hintText);
      }
      score.textContent = `Puntos: ${response.puntosRestantes}`;
    } catch (error) {
      showApiError(errorMount, error.message);
    } finally {
      hintInFlight = false;
    }
  }

  // El panel de pistas compartido identifica sus botones con data-hint-id.
  hintsMount.addEventListener("click", (event) => {
    const button = event.target.closest("[data-hint-id]");
    if (button) requestHint(button.dataset.hintId);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorMount.replaceChildren();
    resultMount.replaceChildren();
    container.classList.remove("is-solved", "has-error");
    submitButton.disabled = true;
    submitButton.textContent = "Verificando relación…";

    const respuesta = {
      coleccionOrigen: origin?.modelo ?? origin?.nombre ?? "Comentario",
      campoRef: refField.value.trim(),
      coleccionDestino: modelSelect.value,
      codigo: "value" in codeInput ? codeInput.value : codeInput.textContent,
    };

    try {
      const response = await api.submitAttempt(ROOM_ID, {
        playerId: getPlayerId(),
        respuesta,
      });
      if (response?.error) throw new Error(response.error);

      if (response.ok) {
        progress.value = 100;
        container.classList.add("is-solved");
      } else {
        progress.value = Math.max(progress.value, 55);
        container.classList.add("has-error");
      }

      score.textContent = `Puntos: ${response.puntos ?? data?.puntos ?? 0}`;
      const resultado = response.resultado ?? {};
      const beforeValue =
        resultado.antes ?? resultado.before ?? resultado.sinPopulate ?? resultado;
      const afterValue =
        resultado.despues ?? resultado.after ?? resultado.conPopulate ?? resultado;
      comparison.querySelectorAll(".r4-json")[0].textContent = formatResponse(beforeValue);
      comparison.querySelectorAll(".r4-json")[1].textContent = formatResponse(afterValue);

      if (response.errorReal) {
        renderShared(errorBox, errorMount, {
          error: response.errorReal,
          mensaje: response.errorReal,
        });
      }
      renderShared(resultPanel, resultMount, {
        ...response,
        explicacion:
          response.explicacion ??
          (response.ok ? "La consulta se ejecutó con la relación configurada." : ""),
      });
    } catch (error) {
      showApiError(errorMount, error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Probar relación";
    }
  });
}
