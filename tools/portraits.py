"""Export an approved GIF or nine numbered PNGs as a consistent portrait pack."""
import argparse
from pathlib import Path
from PIL import Image, ImageChops, ImageSequence

SIZE = (411, 402)
COUNT = 9
DELAY = 220


def read_frames(source):
    if source.is_dir():
        expected = [source / f"{i:02}.png" for i in range(COUNT)]
        if sorted(source.glob("*.png")) != expected:
            raise ValueError("Expected exactly 00.png through 08.png")
        frames = []
        for file in expected:
            with Image.open(file) as im:
                frames.append(im.convert("RGBA"))
    else:
        with Image.open(source) as gif:
            frames = []
            for frame in ImageSequence.Iterator(gif):
                if frame.info.get("duration") != DELAY:
                    raise ValueError("Expected 220 ms per frame")
                frames.append(frame.convert("RGBA"))
    if len(frames) != COUNT or any(f.size != SIZE for f in frames):
        raise ValueError("Expected nine 411 x 402 frames")
    if any(f.getextrema()[3] != (255, 255) for f in frames):
        raise ValueError("Composite the portrait onto its background first")
    return [frame.convert("RGB") for frame in frames]


def export(source, output):
    frames = read_frames(source)
    sheet = Image.new("RGB", (SIZE[0] * COUNT, SIZE[1]))
    for i, frame in enumerate(frames):
        sheet.paste(frame, (i * SIZE[0], 0))
    palette = sheet.quantize(colors=256, dither=Image.Dither.NONE)
    indexed = [f.quantize(palette=palette, dither=Image.Dither.NONE) for f in frames]
    if any(ImageChops.difference(a.convert("RGB"), b.convert("RGB")).getbbox() is None
           for a, b in zip(indexed, indexed[1:])):
        raise ValueError("Consecutive duplicate frames after quantization")
    output.mkdir(parents=True, exist_ok=True)
    sheet.save(output / "strip.png")
    indexed[0].save(output / "idle.gif", save_all=True, append_images=indexed[1:],
                    loop=0, duration=DELAY, disposal=1, optimize=False)
    read_frames(output / "idle.gif")
    with Image.open(output / "idle.gif") as result:
        if result.info.get("loop") != 0:
            raise ValueError("Expected infinite loop")
    print(f"{output}: {COUNT} frames, {DELAY} ms each, verified")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    export(args.source, args.output)
