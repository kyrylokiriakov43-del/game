"""Verify the game's illustration files, card layers and atlas coordinates."""
import json
from pathlib import Path
import re
import subprocess
import sys
import xml.etree.ElementTree as ET


GAME = Path(__file__).resolve().parents[1] / "game"
# Columns, rows and the side of a square cell in SVG coordinates.
ATLASES = {
    "stats.svg": (4, 1, 48),
    "replies.svg": (12, 1, 32),
    "last-night.svg": (4, 2, 320),
    "keepsakes.svg": (7, 1, 160),
    "ferry-cards.svg": (3, 2, 320),
}


def read_game_data():
    # Run the same data scripts in page order, including their card factories.
    # The engine needs the DOM, so only read its literal seal list.
    reader = r"""
const fs = require('node:fs'), vm = require('node:vm');
const read = name => fs.readFileSync(name, 'utf8');
const data = ['config.js','cards.js','ferry.js','high-water.js','chapter.js'].map(read).join('\n');
const match = read('engine.js').match(/\bconst\s+seals\s*=\s*(\[[^\]]*\])/);
if (!match) throw Error('Cannot read seals in engine.js');
const result = vm.runInNewContext(data + '\n;({guests,stats,keepsakes,ferryEndings,deck,seals:' + match[1] + '})');
console.log(JSON.stringify(result));
"""
    try:
        result = subprocess.run(["node", "-e", reader], cwd=GAME, capture_output=True,
                                encoding="utf-8")
    except FileNotFoundError as exc:
        raise ValueError("Install Node.js and put node on PATH to read the game's JS data") from exc
    if result.returncode:
        raise ValueError(result.stderr.strip())
    return json.loads(result.stdout)


def check():
    data = read_game_data()
    css = (GAME / "game.css").read_text(encoding="utf-8")
    html = (GAME / "index.html").read_text(encoding="utf-8")
    art = GAME / "art"
    files = {p.relative_to(art).as_posix() for p in art.rglob("*") if p.is_file()}
    images = set(re.findall(r"""url\(\s*['"]?art/([^'")\s]+)""", css))
    images.update(re.findall(r"""<img\b[^>]*\bsrc=['"]art/([^'"]+)""", html))
    sizes = {}
    errors = []
    for guest, values in data["guests"].items():
        if len(values) < 3:
            errors.append(f"{guest}: missing portrait filename")
            continue
        for name in (values[2], values[3] if len(values) > 3 else "card-scene.svg"):
            if not isinstance(name, str) or not name:
                errors.append(f"{guest}: expected an image filename, got {name!r}")
                continue
            images.add(name)
            if name.lower().endswith(".svg"):
                sizes[name] = (320, 320)

    for card in data["deck"]:
        if name := card.get("illustration"):
            images.add(name)
            sizes[name] = (320, 320)

    for name, (cols, rows, side) in ATLASES.items():
        images.add(name)
        sizes[name] = (cols * side, rows * side)
        pattern = rf"""url\(\s*['"]?art/{re.escape(name)}['"]?\s*\)[^;{{}}]*/\s*{cols*100}%\s+{rows*100}%"""
        if not re.search(pattern, css):
            errors.append(f"{name}: expected {cols * 100}% {rows * 100}% CSS background size")

    for name in sorted(images):
        if name not in files:
            errors.append(f"missing game/art/{name} (case-sensitive)")
            continue
        if name.lower().endswith(".svg"):
            try:
                root = ET.parse(art / name).getroot()
                box = list(map(float, re.split(r"[\s,]+", root.get("viewBox", "").strip())))
                if root.tag != "{http://www.w3.org/2000/svg}svg" or len(box) != 4 or min(box[2:]) <= 0:
                    raise ValueError("invalid SVG or viewBox")
                if name in sizes and tuple(box) != (0, 0, *sizes[name]):
                    raise ValueError(f"expected viewBox 0 0 {sizes[name][0]} {sizes[name][1]}")
            except (ET.ParseError, ValueError) as exc:
                errors.append(f"{name}: {exc}")

    def check_panel(label, item, sheet):
        cols, rows, _ = ATLASES[sheet]
        panel = item.get("panel")
        if type(panel) is not int or not 0 <= panel < rows * cols:
            errors.append(f"{label}: panel {panel!r} outside {sheet}")

    for card in data["deck"]:
        if "ferry" in card:
            check_panel(card["id"], card["ferry"], "ferry-cards.svg")
        elif card.get("guest") not in data["guests"]:
            errors.append(f"{card['id']}: unknown guest {card.get('guest')}")
        for seal in card.get("seals", []):
            if seal not in data["seals"]:
                errors.append(f"{card['id']}: unknown reply seal {seal}")
    for stat, item in data["stats"].items():
        for bound in ("low", "high"):
            check_panel(f"{stat}.{bound}", item[bound], "last-night.svg")
    for key, sheet in (("keepsakes", "keepsakes.svg"), ("ferryEndings", "ferry-cards.svg")):
        for name, item in data[key].items():
            check_panel(name, item, sheet)
    for key, sheet in (("seals", "replies.svg"), ("stats", "stats.svg"), ("keepsakes", "keepsakes.svg")):
        if len(data[key]) != ATLASES[sheet][0]:
            errors.append(f"{key}: item count differs from column count in {sheet}")
    if errors:
        raise ValueError("\n".join(errors))
    print(f"OK: {len(images)} illustrations, {len(ATLASES)} atlases, {len(data['deck'])} cards")


if __name__ == "__main__":
    try:
        check()
    except (OSError, ValueError) as exc:
        sys.exit(str(exc))
