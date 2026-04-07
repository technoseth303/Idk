import json
from pathlib import Path

PROJECTS = [
    {
        "title": "Glitch Terminal",
        "description": "A fake terminal that renders animated ASCII storms and random system logs.",
        "tag": "VISUAL",
        "tech": ["HTML", "CSS", "JS"]
    },
    {
        "title": "Chaos Grid",
        "description": "A grid that constantly reorders itself using a seeded RNG.",
        "tag": "EXPERIMENT",
        "tech": ["JS", "Math.random"]
    },
    {
        "title": "Auto-ASCII",
        "description": "Script that converts images into ASCII art for terminal previews.",
        "tag": "UTILITY",
        "tech": ["Python", "Pillow"]
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
