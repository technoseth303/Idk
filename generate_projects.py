import json
from pathlib import Path

PROJECTS = [
    {
        "title": "Glitch Terminal",
        "description": "A fake terminal that renders animated ASCII storms.",
        "tag": "VISUAL",
        "tech": ["HTML", "CSS", "JS"],
        "action": "open_terminal"
    },
    {
        "title": "Chaos Grid",
        "description": "A grid that constantly reorders itself.",
        "tag": "EXPERIMENT",
        "tech": ["JS"],
        "action": "shuffle_grid"
    },
    {
        "title": "Auto-ASCII",
        "description": "Converts images into ASCII art.",
        "tag": "UTILITY",
        "tech": ["Python"],
        "action": "show_ascii_modal"
    },
    {
        "title": "Python Terminal",
        "description": "Run REAL Python in your browser using Pyodide.",
        "tag": "PYTHON",
        "tech": ["Python", "WebAssembly"],
        "action": "open_python_terminal"
    },
    {
        "title": "Neon Particles",
        "description": "A glowing particle field that reacts to your mouse.",
        "tag": "VISUAL",
        "tech": ["Canvas", "JS"],
        "action": "open_particles"
    },
    {
        "title": "Soundboard",
        "description": "A chaotic soundboard with glitch effects.",
        "tag": "AUDIO",
        "tech": ["JS", "Audio API"],
        "action": "open_soundboard"
    }
]

def main():
    data_dir = Path("data")
    data_dir.mkdir(exist_ok=True)
    out_path = data_dir / "projects.json"
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(PROJECTS, f, indent=2)
    print(f"Wrote {out_path} with {len(PROJECTS)} projects.")

if __name__ == "__main__":
    main()
