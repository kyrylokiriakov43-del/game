"""Inspect shipped story data or rehearse a standalone two-choice draft without media."""
import argparse
import json
from pathlib import Path
import sys

sys.dont_write_bytecode = True
from check_art import read_game_data


def references(card):
    """References from either a card or one of its replies (including flag consumers)."""
    for field in ("requires", "next", "mark", "returnVisit"):
        if card.get(field):
            yield field, card[field]
    for flag in card.get("variants", {}):
        yield "variants", flag
    if alternate := card.get("alternateReturn"):
        yield "alternateReturn.flag", alternate["flag"]
        yield "alternateReturn.id", alternate["id"]
    for side, choice in zip(("L", "R"), card["choices"]):
        for field in ("next", "visitNow", "returnVisit", "flag", "ending"):
            if choice.get(field):
                yield f"{side}.{field}", choice[field]


def inspect(data, key):
    deck = data["deck"]
    if key is None:
        print(f'В игре {len(deck)} встреч')
        for card in deck:
            print(card["id"], card.get("guest") or card["ferry"]["name"])
        return
    card = next((c for c in deck if c["id"] == key), None)
    related = {key}
    if card:
        print(json.dumps(card, ensure_ascii=False, indent=2))
        related.update(value for kind, value in references(card)
                       if kind in ("mark", "requires", "variants") or kind.endswith(".flag"))
    found = False
    for other in deck:
        for field, value in references(other):
            if value in related:
                print(other["id"], field, value)
                found = True
    if not card and not found:
        raise ValueError(f"В колоде нет ID или флага {key}")


def demand(ok, message):
    if not ok:
        raise ValueError(message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def read_draft(path, data):
    draft = json.loads(path.read_text(encoding="utf-8-sig"))
    demand(isinstance(draft, dict) and nonempty(draft.get("title")), "Нужно название title")
    cards = draft.get("cards")
    demand(isinstance(cards, list) and cards, "Нужен непустой массив cards")
    index = {}
    edges = {}
    live_cards = {card["id"]: card for card in data["deck"]}
    for card in cards:
        demand(isinstance(card, dict), "Карточка должна быть объектом")
        key = card.get("id")
        demand(nonempty(key) and key not in index, f"Пустой или повторный ID {key}")
        if key in live_cards:
            story = draft.get("publishedStory")
            demand(nonempty(story) and live_cards[key].get("story") == story, f"{key}: этот ID уже есть в игре")
        demand(isinstance(card.get("guest"), str) and card["guest"] in data["guests"], f"{key}: неизвестный гость")
        demand(nonempty(card.get("line")), f"{key}: нужна реплика")
        demand(set(card) <= {"id", "guest", "line", "choices"}, f"{key}: неизвестное поле карточки")
        choices = card.get("choices")
        demand(isinstance(choices, list) and len(choices) == 2, f"{key}: нужны два ответа")
        index[key] = card
        edges[key] = []
        for choice in choices:
            demand(isinstance(choice, dict) and nonempty(choice.get("text")), f"{key}: нужен текст ответа")
            demand(choice.get("passage") is None or nonempty(choice["passage"]),
                   f"{key}: для пергамента нужен непустой текст")
            demand(set(choice) <= {"text", "effects", "passage", "visitNow", "returnVisit"},
                   f"{key}: неизвестное поле ответа")
            effects = choice.get("effects")
            demand(isinstance(effects, dict) and all(stat in data["stats"] and type(step) is int
                   for stat, step in effects.items()), f"{key}: неверные effects")
            links = [choice[k] for k in ("visitNow", "returnVisit") if k in choice]
            demand(len(links) <= 1 and all(nonempty(link) for link in links), f"{key}: неверный переход")
            edges[key].extend(links)
    visited, visiting = set(), set()

    def visit(key):
        demand(isinstance(key, str) and key in index, f"Неизвестная встреча {key}")
        demand(key not in visiting, f"Цикл внутри короткого черновика у {key}")
        if key in visited:
            return
        visiting.add(key)
        for dest in edges[key]:
            visit(dest)
        visiting.remove(key)
        visited.add(key)

    visit(draft.get("entry"))
    demand(visited == set(index), "Недоступны из входа: " + ", ".join(sorted(index.keys() - visited)))
    return draft, index


def rehearse(draft, index, path, interactive, data):
    key = draft["entry"]
    print(draft["title"])
    while key:
        card = index[key]
        speaker = data["guests"][card["guest"]][0]
        print(f'\n[{key}] {speaker}\n{card["line"]}')
        for side, choice in zip("LR", card["choices"]):
            print(f'  {side}  {choice["text"]}')
        if path:
            side, path = path[0], path[1:]
        elif interactive:
            side = input("L / R (Enter — выход) > ").strip().upper()
            if not side:
                return
        else:
            return
        demand(side in ("L", "R"), "Для чтения пути используй L или R")
        choice = card["choices"]["LR".index(side)]
        if choice.get("passage"):
            print(choice["passage"])
        changes = [f'{data["stats"][stat]["label"]} {step:+} ш.' for stat, step in choice["effects"].items()]
        if changes:
            print("(" + ", ".join(changes) + ")")
        key = choice.get("visitNow") or choice.get("returnVisit")
        if "returnVisit" in choice:
            print("[Между встречами проходит другой визит]")
    demand(not path, "Путь длиннее этой ветки")
    print("[Конец ветки]")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="mode", required=True)
    canon = commands.add_parser("canon", help="Список встреч, одна карточка или связи флага")
    canon.add_argument("key", nargs="?")
    draft = commands.add_parser("draft", help="Проверить черновик и прочесть ветку")
    draft.add_argument("file", type=Path)
    draft.add_argument("--path", default="", help="Например, LR")
    draft.add_argument("--play", action="store_true", help="Выбирать ответы с клавиатуры")
    args = parser.parse_args()
    data = read_game_data()
    if args.mode == "canon":
        inspect(data, args.key)
    else:
        doc, index = read_draft(args.file, data)
        rehearse(doc, index, args.path.upper(), args.play, data)


if __name__ == "__main__":
    if not sys.stdout.isatty():
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        main()
    except (ValueError, OSError, EOFError) as error:
        sys.exit(str(error))
