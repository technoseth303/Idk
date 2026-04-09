// ---- CONFIG ----
const OWRX_BASE = "http://rx.linkfanel.net";
const OWRX_WS   = "ws://rx.linkfanel.net/ws"; // OpenWebRX v2 WebSocket endpoint (server side)

// ---- DOM ----
const statusEl      = document.getElementById("status");
const freqMainEl    = document.getElementById("freq-main");
const modeDisplayEl = document.getElementById("mode-display");
const bandDisplayEl = document.getElementById("band-display");
const freqInputEl   = document.getElementById("freq-input");
const freqSetBtn    = document.getElementById("freq-set");
const modeButtons   = document.querySelectorAll(".mode-buttons button");
const stepButtons   = document.querySelectorAll(".step-buttons button");
const zoomInBtn     = document.getElementById("zoom-in");
const zoomOutBtn    = document.getElementById("zoom-out");
const audioToggle   = document.getElementById("audio-toggle");
const audioStatusEl = document.getElementById("audio-status");
const volumeEl      = document.getElementById("volume");
const infoLineEl    = document.getElementById("info-line");

const spectrumCanvas  = document.getElementById("spectrum");
const waterfallCanvas = document.getElementById("waterfall");
const specCtx = spectrumCanvas.getContext("2d");
const wfCtx   = waterfallCanvas.getContext("2d");

// ---- STATE ----
let ws = null;
let connected = false;
let audioEnabled = false;

let currentFreqKHz = 7100;
let currentMode = "usb";
let zoomLevel = 0;
let currentBand = "HF";

// Audio pipeline (PCM placeholder)
let audioContext = null;
let audioGain = null;

// ---- Helpers ----
function setStatus(text) {
  statusEl.textContent = text;
}

function formatFreqMHz(kHz) {
  const mhz = kHz / 1000;
  return mhz.toFixed(5) + " MHz";
}

function updateFreqDisplay() {
  freqMainEl.textContent = formatFreqMHz(currentFreqKHz);
  freqInputEl.value = currentFreqKHz.toFixed(1);
}

function updateModeDisplay() {
  modeDisplayEl.textContent = currentMode.toUpperCase();
}

function updateBandDisplay() {
  const f = currentFreqKHz;
  let band = "HF";
  if (f >= 30000 && f < 300000) band = "VHF";
  if (f >= 300000) band = "UHF";
  currentBand = band;
  bandDisplayEl.textContent = band;
}

function setInfo(text) {
  infoLineEl.textContent = text;
}

// ---- Canvas sizing ----
function resizeCanvases() {
  const sRect = spectrumCanvas.getBoundingClientRect();
  spectrumCanvas.width = sRect.width;
  spectrumCanvas.height = sRect.height;

  const wRect = waterfallCanvas.getBoundingClientRect();
  waterfallCanvas.width = wRect.width;
  waterfallCanvas.height = wRect.height;
}
window.addEventListener("resize", resizeCanvases);
resizeCanvases();

// ---- Fake spectrum + waterfall (visuals while protocol is wired) ----
let wfOffset = 0;

function drawSpectrumPlaceholder() {
  const w = spectrumCanvas.width;
  const h = spectrumCanvas.height;
  if (!w || !h) return;

  specCtx.clearRect(0, 0, w, h);
  const grad = specCtx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "#7fd1ff");
  grad.addColorStop(1, "#05070b");
  specCtx.fillStyle = grad;
  specCtx.fillRect(0, 0, w, h);

  specCtx.strokeStyle = "#0b1018";
  specCtx.lineWidth = 1;
  specCtx.beginPath();
  for (let x = 0; x < w; x++) {
    const v = (Math.sin((x + wfOffset) * 0.02) + 1) * 0.5;
    const y = h - v * (h * 0.8) - h * 0.1;
    if (x === 0) specCtx.moveTo(x, y);
    else specCtx.lineTo(x, y);
  }
  specCtx.stroke();
}

function drawWaterfallPlaceholder() {
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
}

function renderLoop() {
  drawSpectrumPlaceholder();
  drawWaterfallPlaceholder();
  requestAnimationFrame(renderLoop);
}
renderLoop();

// ---- OpenWebRX v2 WebSocket scaffold ----
function connectOWRX() {
  if (ws) {
    ws.close();
    ws = null;
  }

  setStatus("Connecting to OpenWebRX…");
  setInfo("Opening WebSocket to rx.linkfanel.net");

  ws = new WebSocket(OWRX_WS);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    connected = true;
    setStatus("Connected (protocol scaffold)");
    setInfo("Session established · tuning scaffold active");

    // TODO: send proper OpenWebRX v2 session init / capabilities / receiver select frames here.
    // For now we just keep the connection alive and use the UI as a tuning shell.

    // Example placeholder: send a text ping (server will likely ignore)
    try {
      ws.send("HELLO_FROM_CLIENT");
    } catch (e) {
      console.warn("Placeholder send failed:", e);
    }
  };

  ws.onmessage = (event) => {
    // In real v2 client:
    // - parse binary frames
    // - route audio frames to PCM decoder
    // - route waterfall frames to waterfall renderer
    // - route control frames to state updates
    if (typeof event.data === "string") {
      console.log("OWRX text:", event.data);
    } else {
      // Binary frame placeholder
      // console.log("OWRX binary frame", event.data);
    }
  };

  ws.onerror = (err) => {
    console.error("OWRX error:", err);
    setStatus("Error talking to OpenWebRX");
    setInfo("Check connectivity / server status");
  };

  ws.onclose = () => {
    connected = false;
    setStatus("Disconnected — retrying in 5s…");
    setInfo("WebSocket closed · auto-reconnect enabled");
    setTimeout(connectOWRX, 5000);
  };
}

// ---- Tuning + mode (client-side state; protocol TODOs) ----
function sendFreq(kHz) {
  currentFreqKHz = kHz;
  updateFreqDisplay();
  updateBandDisplay();
  setInfo(`Tuned to ${formatFreqMHz(kHz)} · ${currentMode.toUpperCase()}`);

  // TODO: encode and send proper OpenWebRX v2 "set frequency" frame.
  if (ws && ws.readyState === WebSocket.OPEN) {
    // Placeholder: send a simple text message for debugging
    ws.send(`TUNE ${kHz} kHz ${currentMode}`);
  }
}

function sendMode(mode) {
  currentMode = mode;
  updateModeDisplay();
  setInfo(`Mode: ${mode.toUpperCase()} · ${formatFreqMHz(currentFreqKHz)}`);

  // TODO: encode and send proper OpenWebRX v2 "set mode" frame.
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`MODE ${mode}`);
  }
}

function sendZoom(delta) {
  zoomLevel = Math.max(0, Math.min(zoomLevel + delta, 10));
  setInfo(`Zoom: ${zoomLevel}`);

  // TODO: encode and send proper OpenWebRX v2 "set zoom" frame.
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(`ZOOM ${zoomLevel}`);
  }
}

// ---- Audio (PCM pipeline scaffold) ----
function ensureAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioGain = audioContext.createGain();
    audioGain.gain.value = parseFloat(volumeEl.value);
    audioGain.connect(audioContext.destination);
  }
}

function setVolumeFromSlider() {
  if (audioGain) {
    audioGain.gain.value = parseFloat(volumeEl.value);
  }
}

function toggleAudio() {
  audioEnabled = !audioEnabled;
  if (audioEnabled) {
    ensureAudioContext();
    audioStatusEl.textContent = "Audio requested (PCM scaffold)";
    audioToggle.textContent = "Stop audio";

    // TODO: send OpenWebRX v2 "subscribe audio PCM" frame.
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("AUDIO_SUBSCRIBE_PCM");
    }
  } else {
    audioStatusEl.textContent = "Audio stopped";
    audioToggle.textContent = "Start audio";

    // TODO: send OpenWebRX v2 "unsubscribe audio" frame.
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send("AUDIO_UNSUBSCRIBE");
    }
  }
}

// ---- UI wiring ----
freqSetBtn.addEventListener("click", () => {
  const v = parseFloat(freqInputEl.value);
  if (!isNaN(v)) {
    sendFreq(v);
  }
});

stepButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const step = parseFloat(btn.getAttribute("data-step"));
    if (!isNaN(step)) {
      sendFreq(currentFreqKHz + step);
    }
  });
});

modeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const mode = btn.getAttribute("data-mode");
    sendMode(mode);
  });
});

zoomInBtn.addEventListener("click", () => sendZoom(+1));
zoomOutBtn.addEventListener("click", () => sendZoom(-1));

audioToggle.addEventListener("click", toggleAudio);
volumeEl.addEventListener("input", setVolumeFromSlider);

// ---- Init ----
updateFreqDisplay();
updateModeDisplay();
updateBandDisplay();
setInfo("UI ready · waiting for OpenWebRX connection");
connectOWRX();
