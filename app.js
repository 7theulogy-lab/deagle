const SHOTS_PER_MAGAZINE = 6;
const EMPTY_CLICKS = 2;
const DEFAULT_TRIGGER_CODES = new Set([
  "Enter", "NumpadEnter", "Space",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "AudioVolumeUp", "AudioVolumeDown", "MediaPlayPause"
]);

const state = {
  phase: "ready",
  shots: 0,
  emptyClicks: 0,
  locked: false,
  learning: false,
  learnedCode: localStorage.getItem("deagle-trigger-code") || ""
};

const ui = {
  card: document.querySelector(".status-card"),
  icon: document.querySelector("#status-icon"),
  label: document.querySelector("#status-label"),
  help: document.querySelector("#status-help"),
  rounds: document.querySelector("#rounds"),
  roundsLeft: document.querySelector("#rounds-left"),
  keyReadout: document.querySelector("#key-readout"),
  settingsButton: document.querySelector("#settings-button"),
  settingsDialog: document.querySelector("#settings-dialog"),
  learnButton: document.querySelector("#learn-button"),
  clearKeyButton: document.querySelector("#clear-key-button"),
  savedKey: document.querySelector("#saved-key")
};

const audioPools = {
  shot: createPool("assets/audio/disparo.wav", SHOTS_PER_MAGAZINE),
  empty: createPool("assets/audio/vacio.wav", EMPTY_CLICKS)
};
const reloadAudio = new Audio("assets/audio/recarga.wav");
reloadAudio.preload = "auto";

let shotPoolIndex = 0;
let emptyPoolIndex = 0;
let lastTriggerAt = 0;

function createPool(src, size) {
  return Array.from({ length: size }, () => {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  });
}

function renderRounds() {
  ui.rounds.replaceChildren();
  const remaining = Math.max(0, SHOTS_PER_MAGAZINE - state.shots);
  ui.roundsLeft.textContent = String(remaining);
  for (let index = 0; index < SHOTS_PER_MAGAZINE; index += 1) {
    const round = document.createElement("span");
    round.className = `round${index < state.shots ? " spent" : ""}`;
    ui.rounds.append(round);
  }
}

function setStatus(phase, label, help, icon) {
  state.phase = phase;
  ui.card.className = `status-card ${phase}`;
  ui.label.textContent = label;
  ui.help.textContent = help;
  ui.icon.textContent = icon;
}

function updateKeyLabels() {
  ui.savedKey.textContent = state.learnedCode || "ninguna";
  ui.keyReadout.textContent = state.learnedCode
    ? `Gatillo configurado: ${state.learnedCode}`
    : "Teclas activas: Enter, F1–F12 y gatillos comunes";
}

async function playFromPool(pool, index) {
  const audio = pool[index % pool.length];
  audio.currentTime = 0;
  await audio.play();
}

async function fireSequence() {
  if (state.locked) return;
  state.locked = true;

  try {
    if (state.shots < SHOTS_PER_MAGAZINE) {
      await playFromPool(audioPools.shot, shotPoolIndex++);
      state.shots += 1;
      setStatus("firing", "DISPARO", `${SHOTS_PER_MAGAZINE - state.shots} tiros restantes`, "✦");
      renderRounds();
      window.setTimeout(() => {
        if (!state.locked && state.shots < SHOTS_PER_MAGAZINE) setStatus("ready", "LISTA", "Aprieta el gatillo físico", "●");
      }, 150);
      return;
    }

    if (state.emptyClicks < EMPTY_CLICKS) {
      await playFromPool(audioPools.empty, emptyPoolIndex++);
      state.emptyClicks += 1;
      setStatus("empty", "VACÍA", state.emptyClicks < EMPTY_CLICKS ? "Aprieta otra vez" : "Próximo gatillo: recarga", "×");
      return;
    }

    setStatus("reloading", "RECARGANDO", "Gatillo bloqueado hasta terminar", "↻");
    reloadAudio.currentTime = 0;
    await reloadAudio.play();
    await new Promise((resolve) => {
      reloadAudio.addEventListener("ended", resolve, { once: true });
      reloadAudio.addEventListener("error", resolve, { once: true });
    });
    state.shots = 0;
    state.emptyClicks = 0;
    renderRounds();
    setStatus("ready", "LISTA", "Cargador completo", "●");
  } catch (error) {
    console.error(error);
    setStatus("empty", "SIN AUDIO", "Revisa los archivos o permisos de sonido", "!");
  } finally {
    state.locked = false;
  }
}

function isTrigger(event) {
  if (state.learnedCode) return event.code === state.learnedCode;
  return DEFAULT_TRIGGER_CODES.has(event.code) || DEFAULT_TRIGGER_CODES.has(event.key);
}

function onKeyDown(event) {
  if (state.learning) {
    event.preventDefault();
    state.learnedCode = event.code || event.key;
    localStorage.setItem("deagle-trigger-code", state.learnedCode);
    state.learning = false;
    ui.learnButton.textContent = "Aprender gatillo";
    updateKeyLabels();
    ui.settingsDialog.close();
    setStatus("ready", "CONFIGURADA", `Gatillo: ${state.learnedCode}`, "✓");
    return;
  }

  if (event.repeat || !isTrigger(event)) return;
  const now = performance.now();
  if (now - lastTriggerAt < 90) return;
  lastTriggerAt = now;
  event.preventDefault();
  void fireSequence();
}

ui.settingsButton.addEventListener("click", () => ui.settingsDialog.showModal());
ui.learnButton.addEventListener("click", () => {
  state.learning = true;
  ui.learnButton.textContent = "Aprieta ahora el gatillo…";
});
ui.clearKeyButton.addEventListener("click", () => {
  state.learnedCode = "";
  state.learning = false;
  localStorage.removeItem("deagle-trigger-code");
  ui.learnButton.textContent = "Aprender gatillo";
  updateKeyLabels();
});
ui.settingsDialog.addEventListener("close", () => {
  state.learning = false;
  ui.learnButton.textContent = "Aprender gatillo";
});
window.addEventListener("keydown", onKeyDown, { capture: true });

renderRounds();
updateKeyLabels();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
