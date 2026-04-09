// ---- CONFIG ----
const KIWI_BASE = "http://wessex.hopto.org:8075";
const KIWI_WS   = "ws://wessex.hopto.org:8075/kiwiws";

// ---- DOM ----
const statusEl      = document.getElementById("status");
const freqDisplayEl = document.getElementById("freq-display");
const modeDisplayEl = document.getElementById("mode-display");
const freqInputEl   = document.getElementById("freq-input");
const freqSetBtn    = document.getElementById("freq-set");
const modeButtons   = document.querySelectorAll(".mode-buttons button");
const zoomInBtn     = document.getElementById("zoom-in");
const zoomOutBtn    = document.getElementById("zoom-out");
const audioBtn      = document.getElementById("audio-start");
const audioStatusEl = document.getElementById("audio-status");
const waterfallCanvas = document.getElementById("waterfall");
const wfCtx = waterfallCanvas.getContext("2d");

// ---- STATE ----
let ws = null;
let currentFreqKHz = 7100;
let currentMode = "lsb";
let zoomLevel = 0;

// ---- Helpers ----
function setStatus(text) {
  statusEl.textContent = text;
}

function formatFreqMHz(kHz) {
  const mhz = kHz / 1000;
  return mhz.toFixed(5) + " MHz";
}

function updateFreqDisplay() {
  freqDisplayEl.textContent = formatFreqMHz(currentFreqKHz);
}

function updateModeDisplay() {
  modeDisplayEl.textContent = currentMode.toUpperCase();
}

// ---- Waterfall fake renderer (visual only for now) ----
function resizeWaterfall() {
  const rect = waterfallCanvas.parentElement.getBoundingClientRect();
  waterfallCanvas.width = rect.width;
  waterfallCanvas.height = rect.height;
}
window.addEventListener("resize", resizeWaterfall);
resizeWaterfall();

let wfOffset = 0;
function drawFakeWaterfall() {
  const w = waterfallCanvas.width;
  const h = waterfallCanvas.height;
  if (!w || !h) return;

  const imgData = wfCtx.getImageData(0, 0, w, h);
  wfCtx.putImageData(imgData, 0, 1);

  const y = 0;
  for (let x = 0; x < w; x++) {
    const v = (Math.sin((x + wfOffset) * 0.02) + 1) * 0.5;
    const idx = (y * w + x) * 4;
    imgData.data[idx + 0] = 10 + v * 40;
    imgData.data[idx + 1] = 40 + v * 120;
    imgData.data[idx + 2] = 80 + v * 160;
    imgData.data[idx + 3] = 255;
  }
  wfCtx.putImageData(imgData, 0, 0);
  wfOffset += 2;

  requestAnimationFrame(drawFakeWaterfall);
}
drawFakeWaterfall();

// ---- KiwiSDR WebSocket ----
function connectKiwi() {
  if (ws) {
    ws.close();
    ws = null;
  }

  setStatus("Connecting to KiwiSDR…");
  ws = new WebSocket(KIWI_WS);

  ws.onopen = () => {
    setStatus("Connected to KiwiSDR");

    // Basic auth (empty password)
    ws.send("SET auth t=kiwi p=");

    // Set initial frequency and mode
    sendFreq(currentFreqKHz);
    sendMode(currentMode);

    // Start audio stream (Kiwi will send binary frames)
    ws.send("SET start=1");
  };

  ws.onmessage = (event) => {
    // Kiwi sends text control frames and binary audio/wf frames.
    if (typeof event.data === "string") {
      // Text frame
      console.log("Kiwi text:", event.data);
    } else {
      // Binary frame (audio or waterfall) — not decoded here
      // console.log("Kiwi binary frame", event.data);
    }
  };

  ws.onerror = (err) => {
    console.error("Kiwi error:", err);
    setStatus("Error talking to KiwiSDR");
  };

  ws.onclose = () => {
    setStatus("Disconnected — retrying in 3s…");
    setTimeout(connectKiwi, 3000);
  };
}

function sendFreq(kHz) {
  currentFreqKHz = kHz;
  updateFreqDisplay();
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`SET freq=${kHz}`);
  }
}

function sendMode(mode) {
  currentMode = mode;
  updateModeDisplay();
  if (ws && ws.readyState === WebSocket.OPEN) {
    let low = -3000, high = 3000;
    if (mode === "lsb") { low = -2700; high = -300; }
    if (mode === "usb") { low = 300; high = 2700; }
    if (mode === "cw")  { low = -400; high = 400; }
    ws.send(`SET mod=${mode} low_cut=${low} high_cut=${high}`);
  }
}

// ---- UI wiring ----
freqSetBtn.addEventListener("click", () => {
  const v = parseFloat(freqInputEl.value);
  if (!isNaN(v)) {
    sendFreq(v);
  }
});

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.getAttribute("data-mode");
    sendMode(mode);
  });
});

zoomInBtn.addEventListener("click", () => {
  zoomLevel = Math.min(zoomLevel + 1, 10);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`SET zoom=${zoomLevel}`);
  }
});

zoomOutBtn.addEventListener("click", () => {
  zoomLevel = Math.max(zoomLevel - 1, 0);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`SET zoom=${zoomLevel}`);
  }
});

// Audio button — we’re already asking Kiwi to start audio,
// but proper decoding of its binary audio frames into Web Audio
// needs a custom decoder. For now this just reflects connection state.
audioBtn.addEventListener("click", () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    audioStatusEl.textContent = "Audio requested (binary frames arriving)";
  } else {
    audioStatusEl.textContent = "Not connected";
  }
});

// ---- Init ----
updateFreqDisplay();
updateModeDisplay();
connectKiwi();
