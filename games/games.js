function openGame(page) {
    const overlay = document.getElementById('static-overlay');
    overlay.style.opacity = 1;

    setTimeout(() => {
        window.location.href = page;
    }, 500);
}
