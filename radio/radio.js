let config = null;
let ws = null;
let audioCtx = null;
let audioNode = null;

const statusEl = document.getElementById("status");
const freqDisplay = document.getElementById("freq-display");
const modeDisplay = document.getElementById("mode-display");
const freqInput = document.getElementById("freq-input");
const freqSet = document.getElementById("freq-set");
const modeButtons = document.querySelectorAll(".mode-buttons button");
const audioBtn = document.getElementById("audio-start");
const audioStatus = document.getElementById("audio-status");
const waterfall = document.getElementById("waterfall");
const wfCtx = waterfall.getContext("2d");

let currentFreq = 0;
let currentMode = "usb";
let zoom = 0;

// Load config
fetch("radio-config.json")
  .then(r => r.json())
  .then(c => {
    config = c;
    statusEl.textContent = "Connecting…";
    currentFreq = config.initial_frequency_khz;
    currentMode = config.initial_mode;
    freqInput.value = currentFreq;
    updateDisplays();
    connectKiwi();
  });

// Update UI
function updateDisplays() {
  freqDisplay.textContent = (currentFreq / 1000).toFixed(5) + " MHz";
  modeDisplay.textContent = currentMode.toUpperCase();
}

// Connect to KiwiSDR
function connectKiwi() {
  const wsUrl = config.server.replace("http://", "ws://") + "/kiwiws";
  ws = new WebSocket(wsUrl);
  ws.binaryType = "arraybuffer";

  ws.onopen = () => {
    statusEl.textContent = "Connected";

    ws.send("SET auth t=kiwi p=");
    ws.send("SET mod=" + currentMode);
    ws.send("SET freq=" + currentFreq);
    ws.send("SET zoom=" + zoom);
    ws.send("SET start=1");
  };

  ws.onmessage = (msg) => {
    if (typeof msg.data === "string") {
      console.log("Kiwi text:", msg.data);
      return;
    }

    const data = new DataView(msg.data);
    const type = data.getUint8(0);

    if (type === 1) handleAudio(msg.data);
    if (type === 2) handleWaterfall(msg.data);
  };

  ws.onclose = () => {
    statusEl.textContent = "Disconnected — retrying…";
    setTimeout(connectKiwi, 2000);
  };
}

// Audio (PCM)
function handleAudio(buffer) {
  if (!audioCtx) return;

  const dv = new DataView(buffer, 1);
  const samples = new Float32Array(dv.byteLength / 2);

  for (let i = 0; i < samples.length; i++) {
    samples[i] = dv.getInt16(i * 2, true) / 32768;
  }

  const audioBuf = audioCtx.createBuffer(1, samples.length, 12000);
  audioBuf.copyToChannel(samples, 0);

  const src = audioCtx.createBufferSource();
  src.buffer = audioBuf;
  src.connect(audioNode);
  src.start();
}

// Waterfall
function handleWaterfall(buffer) {
  const dv = new DataView(buffer, 1);
  const width = waterfall.width;
  const height = waterfall.height;

  const img = wfCtx.getImageData(0, 0, width, height);
  wfCtx.putImageData(img, 0, 1);

  for (let x = 0; x < width; x++) {
    const v = dv.getUint8(x % dv.byteLength);
    wfCtx.fillStyle = `rgb(${v}, ${v}, ${255 - v})`;
    wfCtx.fillRect(x, 0, 1, 1);
  }
}

// UI events
freqSet.onclick = () => {
  currentFreq = parseFloat(freqInput.value);
  updateDisplays();
  ws.send("SET freq=" + currentFreq);
};

modeButtons.forEach(btn => {
  btn.onclick = () => {
    modeButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentMode = btn.dataset.mode;
    updateDisplays();
    ws.send("SET mod=" + currentMode);
  };
});

audioBtn.onclick = () => {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    audioNode = audioCtx.createGain();
    audioNode.connect(audioCtx.destination);
    audioStatus.textContent = "Audio ON";
  } else {
    audioCtx.close();
    audioCtx = null;
    audioStatus.textContent = "Audio OFF";
  }
};
