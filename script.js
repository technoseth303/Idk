/* ============================================================
   LOAD PROJECTS
============================================================ */
async function loadProjects() {
    const res = await fetch('data/projects.json');
    const projects = await res.json();
    const grid = document.getElementById('projectsGrid');
    grid.innerHTML = '';

    projects.forEach(p => {
        const card = document.createElement('article');
        card.className = 'card';
        card.dataset.action = p.action;

        card.innerHTML = `
            <div class="card-tag">${p.tag}</div>
            <div class="card-title">${p.title}</div>
            <div class="card-desc">${p.description}</div>
            <div class="card-meta">${p.tech.join(' • ')}</div>
        `;

        card.addEventListener('click', () => runAction(p.action));
        grid.appendChild(card);
    });
}

/* ============================================================
   ACTION ROUTER
============================================================ */
function runAction(action) {
    switch (action) {

        case "open_terminal":
            openFakeTerminal();
            break;

        case "shuffle_grid":
            shuffleGrid();
            break;

        case "show_ascii_modal":
            showAsciiModal();
            break;

        case "open_python_terminal":
            window.location.href = "python/index.html";
            break;

        case "open_particles":
            openParticles();
            break;

        case "open_soundboard":
            openSoundboard();
            break;

        case "open_matrix":
            openMatrixRain();
            break;

        case "open_clock":
            openClock();
            break;

        default:
            console.log("No action defined:", action);
    }
}

/* ============================================================
   FAKE TERMINAL POPUP
============================================================ */
function openFakeTerminal() {
    const win = document.createElement('div');
    win.className = 'terminal';
    win.innerHTML = `
        <div class="terminal-header">GLITCH TERMINAL</div>
        <pre class="terminal-body"></pre>
    `;
    document.body.appendChild(win);

    const body = win.querySelector('.terminal-body');

    let i = 0;
    const interval = setInterval(() => {
        body.textContent += ">> SYSTEM LOG " + Math.random().toString(36).slice(2) + "\n";
        body.scrollTop = body.scrollHeight;
        i++;
        if (i > 20) clearInterval(interval);
    }, 120);
}

/* ============================================================
   CHAOS GRID SHUFFLE
============================================================ */
function shuffleGrid() {
    const grid = document.getElementById('projectsGrid');
    const cards = Array.from(grid.children);

    cards.sort(() => Math.random() - 0.5);

    grid.innerHTML = "";
    cards.forEach(c => grid.appendChild(c));
}

/* ============================================================
   ASCII MODAL POPUP
============================================================ */
function showAsciiModal() {
    const modal = document.createElement('div');
    modal.className = 'ascii-modal';
    modal.innerHTML = `
        <div class="ascii-box">
            <h3>ASCII Generator</h3>
            <p>This feature is powered by your Python script.</p>
            <pre>
  /\\_/\\
 ( o.o )
  > ^ <
            </pre>
            <button onclick="this.parentElement.parentElement.remove()">Close</button>
        </div>
    `;
    document.body.appendChild(modal);
}

/* ============================================================
   NEW PROJECT PLACEHOLDERS
============================================================ */
function openParticles() {
    alert("Particles page coming soon — glowing neon chaos incoming.");
}

function openSoundboard() {
    alert("Soundboard coming soon — glitch SFX and chaos buttons.");
}

function openMatrixRain() {
    alert("Matrix rain effect coming soon — green code waterfall.");
}

function openClock() {
    alert("Cyber clock coming soon — neon animated time display.");
}

/* ============================================================
   INITIALIZE
============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    document.getElementById('shuffleBtn').addEventListener('click', shuffleGrid);
});
