# The Inn Between — единый стиль лицевых карточек

Обязательный эталон для фэнтезийной серии. Составлен по четырём предоставленным пользователем снимкам действующих карточек: Рутгер с книгой и канатом, Элиас у мокрого столба, Агата с пирогом, Феня с кружкой. Соответствующие игровые исходники: `game/art/faces/water-ledger.webp`, `water-mark.webp`, `pie.webp`, `cup-relay.webp`. Сравнивать результат с этими изображениями, а не с черновыми SVG фэнтезийной ветки.

## Художественный стандарт

- Квадрат, крупная фигура по пояс или по грудь, голова занимает примерно верхнюю треть. Персонаж и предмет заполняют кадр, плечи и локти могут выходить за нижний край. Лицо и главный предмет не обрезать.
- Стилизованная европейская книжная иллюстрация: крупные цветовые плоскости, угловатые силуэты с умеренно скруглёнными переходами, геометрические тени без контурной обводки. Не пиксель-арт, не 3D, не аниме, не реализм, не детская мультяшность.
- Лица выразительные, анатомически связные: две брови, глаза в одной перспективе, нос начинается между глазами и имеет самостоятельную плоскость, рот ниже носа. Поворот три четверти, живой взгляд, характерное выражение. Руки с ясным хватом, естественная форма и число пальцев.
- Простая композиция: один главный персонаж, один крупный сюжетный предмет, один плоский цвет фона и большая более тёмная арка того же оттенка за фигурой. Никакой подробной комнаты, леса или пейзажа внутри карты.
- Ограниченная палитра, примерно 5–8 главных тонов с родственными оттенками. Приглушённые охра, бордо, тёмный петроль, оливковый, сине-серый, сливово-угольный. Тёплый медовый свет на лице и руках. Матовая лёгкая бумажная фактура, не грубый шум, не глянец, не объёмные градиенты.
- Средневековый костюм с простыми узнаваемыми формами. Магия и чудовища подчиняются тем же правилам: не добавлять декоративные руны, светящиеся частицы, туман, вспышки или чрезмерно сложную броню только ради фэнтези.
- Скриншоты имеют тонкую золотую рамку и угловые орнаменты, наложенные интерфейсом. Для игрового ресурса рисунок должен быть full bleed, без встроенной рамки, текста, заголовков и значков; для демонстрационной карточки можно воспроизвести рамку, но не дублировать её в игре.
- Экспорт отдельного игрового изображения: WebP 512×512. Сохранять неизменными CSS, интерфейс, шрифты, координаты и текущие игровые ресурсы.

## Базовый промпт генерации (EN)

Create ONE square card illustration for The Inn Between, directly matching the four provided approved game card references (Rutger, Elias, Agata, Fenya). Match their existing visual language, not a generic medieval fantasy illustration. Restrained geometric European storybook character art, large sharply separated matte color planes, subtle paper grain, warm ochre skin highlights, deep plum-charcoal shadows, 5–8 dominant muted tones. Waist-up or chest-up figure in a natural three-quarter pose, head in the upper third, one distinct readable story prop held naturally in front of the torso. Anatomically coherent expressive face: aligned eyes, independent nose plane, natural brows and mouth, hands with natural fingers and grip. A single flat muted color background with one larger darker arch behind the character. Full bleed square, no printed frame, no typography, no labels, no decorative effects. Preserve the exact visual proportions, simplicity and scale of the references. Subject: [character, expression, costume, one story prop]. No 3D, no photorealism, no anime, no pixel art, no excessive fantasy ornament, no detailed background, no glossy rendering.

## Проверка

Сравнить рядом с четырьмя эталонами в одинаковом размере; проверить силуэт, анатомию, палитру, крупность, предмет, вид на телефоне. Если новая карта выглядит как иллюстрация другой игры, не подключать её к релизу. Этот стандарт описывает цель, но не гарантирует идентичный результат каждой генерации; требуется визуальная приёмка.
