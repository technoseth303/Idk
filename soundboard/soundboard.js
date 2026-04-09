async function loadSounds() {
    const res = await fetch('sounds.json');
    const sounds = await res.json();

    const board = document.getElementById('soundboard');
    board.innerHTML = '';

    sounds.forEach(sound => {
        const btn = document.createElement('button');
        btn.className = 'sound-btn';
        btn.textContent = sound.name;

        const audio = new Audio(sound.file);

        btn.addEventListener('click', () => {
            audio.currentTime = 0;
            audio.play();
        });

        board.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', loadSounds);
