async function loadSounds() {
    const res = await fetch('sounds.json');
    const files = await res.json();

    const board = document.getElementById('soundboard');
    board.innerHTML = '';

    files.forEach(filename => {
        const btn = document.createElement('button');
        btn.className = 'sound-btn';

        // Display name without extension
        const displayName = filename.replace(/\.[^/.]+$/, "");
        btn.textContent = displayName;

        const audio = new Audio("audio/" + filename);

        btn.addEventListener('click', () => {
            audio.currentTime = 0;
            audio.play();
        });

        board.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', loadSounds);
