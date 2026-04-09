async function loadSounds() {
    const res = await fetch('sounds.json');
    const files = await res.json();

    const board = document.getElementById('soundboard');
    board.innerHTML = '';

    files.forEach(path => {
        const btn = document.createElement('button');
        btn.className = 'sound-btn';

        // Extract filename without extension for display
        const name = path.split('/').pop().replace(/\.[^/.]+$/, "");
        btn.textContent = name;

        const audio = new Audio(path);

        btn.addEventListener('click', () => {
            audio.currentTime = 0;
            audio.play();
        });

        board.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', loadSounds);
