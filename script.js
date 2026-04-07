async function loadProjects() {
    try {
        const res = await fetch('data/projects.json');
        const projects = await res.json();
        const grid = document.getElementById('projectsGrid');
        grid.innerHTML = '';

        projects.forEach(p => {
            const card = document.createElement('article');
            card.className = 'card';
            card.innerHTML = `
                <div class="card-tag">${p.tag || 'EXPERIMENT'}</div>
                <div class="card-title">${p.title}</div>
                <div class="card-desc">${p.description}</div>
                <div class="card-meta">${p.tech.join(' • ')}</div>
            `;
            grid.appendChild(card);
        });
    } catch (e) {
        console.error('Failed to load projects.json', e);
    }
}

function shuffleHighlight() {
    const cards = Array.from(document.querySelectorAll('.card'));
    cards.forEach(c => c.style.outline = 'none');

    if (!cards.length) return;
    const pick = cards[Math.floor(Math.random() * cards.length)];
    pick.style.outline = '1px solid #9fa4ff';
    pick.style.outlineOffset = '3px';
}

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    document.getElementById('shuffleBtn').addEventListener('click', shuffleHighlight);
});
