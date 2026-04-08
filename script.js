async function loadProjects() {
    try {
        const res = await fetch('projects.json');
        const projects = await res.json();
        renderProjects(projects);
    } catch (e) {
        console.error('Failed to load projects.json', e);
    }
}

function renderProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    projects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'project-card';

        const title = document.createElement('h2');
        title.textContent = p.title;

        const desc = document.createElement('p');
        desc.textContent = p.description;

        const meta = document.createElement('p');
        meta.className = 'project-meta';
        meta.textContent = (p.tech || []).join(' • ');

        const btn = document.createElement('button');
        btn.textContent = 'Open';
        btn.onclick = () => handleProjectAction(p.action);

        card.appendChild(title);
        card.appendChild(desc);
        card.appendChild(meta);
        card.appendChild(btn);
        container.appendChild(card);
    });
}

function handleProjectAction(action) {
    switch (action) {
        case 'open_games':
            window.location.href = '/games/index.html';
            break;
        default:
            console.log('No handler for action:', action);
    }
}

function openSection(section) {
    const projects = document.getElementById('projects-section');
    const about = document.getElementById('about-section');

    if (section === 'projects') {
        projects.style.display = 'block';
        about.style.display = 'none';
    } else if (section === 'about') {
        projects.style.display = 'none';
        about.style.display = 'block';
    }
}

document.addEventListener('DOMContentLoaded', loadProjects);
