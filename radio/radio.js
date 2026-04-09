const audio = document.getElementById('radioAudio');
const playBtn = document.getElementById('playBtn');
const stopBtn = document.getElementById('stopBtn');
const freqSlider = document.getElementById('freqSlider');
const freqDisplay = document.getElementById('freqDisplay');

// Change this to your audio file or stream
let STREAM_URL = "audio/static1.mp3";

playBtn.addEventListener('click', () => {
  audio.src = STREAM_URL;
  audio.play();
});

stopBtn.addEventListener('click', () => {
  audio.pause();
  audio.currentTime = 0;
});

freqSlider.addEventListener('input', () => {
  const freq = Number(freqSlider.value).toFixed(3);
  freqDisplay.textContent = `${freq} MHz`;
});
