let pyodideReady = false;
let pyodide;

async function main() {
    pyodide = await loadPyodide();
    pyodideReady = true;
    write("Python loaded. Type code below.");
}

function write(text) {
    const out = document.getElementById("output");
    out.textContent += text + "\n";
    out.scrollTop = out.scrollHeight;
}

document.getElementById("input").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        const code = e.target.value;
        e.target.value = "";

        write(">>> " + code);

        if (!pyodideReady) {
            write("Python still loading...");
            return;
        }

        try {
            const result = await pyodide.runPythonAsync(code);
            if (result !== undefined) write(result.toString());
        } catch (err) {
            write("Error: " + err);
        }
    }
});

main();
