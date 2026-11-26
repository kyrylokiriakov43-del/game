# Лицевые стороны по образцу Морвен

Рабочий образец — [Морвен с двумя монетами](../../../../game/art/morwen-coins.webp). Во всех 67 встречах одежда и силуэт обозначают героя, а предмет в руках показывает, зачем он пришёл сегодня. Простая арка и два тона фона отделяют лицо от тёмной рамки интерфейса. Подробное окружение занимает отдельный слой за колодой. [Все встречи в порядке игровой колоды](../../../../art/preview-face-edition.webp) · [Три встречи за стойкой](../../../../art/preview-first-loaf.webp)

## Передача в игру

Для нового визита сначала зафиксируй ID, реплику и предмет до выбора. Сверь лицо с европейской книжной графикой первого визита Морвен и с авторским портретом персонажа из `game/art/`. Квадратные исходники персонажей нужны для цвета кожи, возраста, головного убора и рабочей одежды. Для отдельных лиц используется WebP 512 × 512 в `game/art/faces/<id>.webp`, путь и описание находятся в самой встрече. Три утверждённых рисунка первой встречи продолжают использовать свои исходные файлы. Паром и финалы используют ячейки атласов. Осмотри края всех вырезанных ячеек и читаемость нужного предмета внутри рамки на телефоне.

## Рабочие запросы ImageGen

Ниже сохранены общая часть запроса, уточнения о персонажах и шесть действий для каждого листа. Нумерация идёт слева направо, сначала верхний ряд. При изменении одного визита достаточно заново подготовить его квадрат. В качестве первого референса использован исходный рисунок Морвен с монетами. Следующие референсы задавали внешность перечисленных героев.

> Make a production character illustration SPRITE SHEET, landscape 1536x1024, exactly 3 equally wide columns by 2 rows of equal SQUARE edge-to-edge panels. Alignment at exact thirds and halves. Each cell is independent with a complete clearly framed waist-up figure or single object. Four corners extend full bleed to tile boundaries. No frames, no borders, no gutters, no text, no letters, no numbers, no typography, no graphic labels, no collage across cells. Reference 1 is the EXACT approved Morwen art direction from The Inn Between: rigorously simplified sharply cut angular silhouettes, a SINGLE flat colored backdrop with one large DARKER arch/oval of the same hue behind the face, crisp deep plum shadows, two broad planes of warm amber light on faces and hands, restrained matte screenprinted color, sharply graphic eyes, 4–6 broad clearly separated colors. No tavern environment or descriptive scenery except one requested story object per cell. No realistic rendering, no gradients dominating the surface. Head and shoulders and one importantly enlarged, clearly readable narrative prop in front of chest; every head fully inside its tile and faces alternating directions. Muted petrol teal, dusty burgundy, dark sage, muted indigo and ochre backdrops alternate by tile. The extra reference images define identity and dress ONLY; apply the visual style and simple flat background of reference 1 to all tiles. Essential: Respect the requested row-major order:

### payroll — birds

Agata, sturdy middle-aged baker, dark eyebrows, warm rounded angular face, pale kerchief with brick-red stripe knotted behind, dark teal dress, linen apron.

1. `payroll` — holds out soot-smudged payroll sheet with three marks and knows her sister’s hand
2. `hearth-book` — offers a long quill over an open kitchen logbook to a small hand
3. `winter-boots` — proudly shows two new child-sized ochre leather boots dangling by their laces
4. `bread` — breaks a single charred round loaf in half revealing bright good crumb
5. `pie` — raises a wedding tart with two white sugar doves
6. `birds` — two miniature sugar doves balanced on one palm, a single egg in her other hand

### dish — water-stairs

Agata, sturdy middle-aged baker, dark eyebrows, warm rounded angular face, pale kerchief with brick-red stripe knotted behind, dark teal dress, linen apron.

1. `dish` — tilts a large cream glazed serving plate with a conspicuous chipped edge
2. `wax` — holds the metal frame of a broken hand lantern and asks for two short candle stubs
3. `tiny-coat` — delicately holds up a tiny walnut-sized blue wool coat by a thread
4. `mourning-flour` — exhibits a flour sack embroidered with a black funerary wreath, no writing
5. `brass-button` — holds a single copper button engraved with a swallow and her needle
6. `water-stairs` — leans down, dangling child’s dark boots by laces over blue flooded steps

### market-kindling — market-scales

Agata, sturdy middle-aged baker, dark eyebrows, warm rounded angular face, pale kerchief with brick-red stripe knotted behind, dark teal dress, linen apron.

1. `market-kindling` — holds a damp half-split log above a willow market basket
2. `market-hot-oven` — offers tray of small uncooked pies; a rival dark lidded bean pot sits beside it
3. `market-last-embers` — shows a scant handful of wood shavings beside a bowl of risen dough
4. `bell-bowls` — Agata with soup ladle looks at three empty bowls held up at the lower edge
5. `first-loaf` — proudly cradles a single steaming round rye loaf with a cross cut in its crust
6. `market-scales` — ONLY THIS CELL Savva, a lean older male firewood seller, ochre knit cap, russet vest and dark moustache, holds up a small equal-arm balance and a plain cast-iron weight

### haft — moth-curtain

Elias, middle-aged cooper, warm brown skin, short dark curls under floppy burgundy cap, teal shirt, tan leather apron, mustard kerchief.

1. `haft` — presents a wooden coal shovel handle with a distinctive thumb groove
2. `beechwood` — cradles a pale cut piece of seasoned beechwood prominently
3. `hoops` — presses a finger over a thin leak on the curved side of his small barrel
4. `shutter` — holds a loose dark floorboard in one arm and a short hammer in other hand
5. `mirror` — presents small oval mirror still reflecting a candle flame beside an extinguished candle
6. `moth-curtain` — holds up a deep purple cloth with a constellation of tiny moth holes against the light

### mint-brazier — three-knocks

Elias, middle-aged cooper, warm brown skin, short dark curls under floppy burgundy cap, teal shirt, tan leather apron, mustard kerchief.

1. `mint-brazier` — holds a cracked terracotta brazier and an iron repair bracket
2. `thimble` — lifts a short plank with a tiny brass sewing thimble under it
3. `beer-basin` — steadies a shallow basin of amber beer to catch barrel leak
4. `spare-hoop` — holds a single large empty iron barrel hoop vertically
5. `water-mark` — newly carved notch on a wet piling sits above a copper nail, Elias pointing to the notch
6. `three-knocks` — soaked cap, wet shoulders, raises fist for three knocks at an unseen tavern door

### cats-letter — first-passenger

Fenya, young woman post courier, short chestnut hair under a navy peaked cap, ochre neckerchief, navy coat, brown satchel strap.

1. `cats-letter` — presents a cream envelope stamped with a dark pawprint
2. `parcel-for-cat` — opens brown paper parcel showing two little silver fish
3. `fish-bill` — points wryly to a long bill with a little herring pictogram, no lettering
4. `toll-song` — holds a copper toll coin in one hand, taps time on bridge rail with the other, mouth open to sing
5. `sunday-post` — presents sealed letter with a little trail of warm crimson wax
6. `first-passenger` — holds open dry canvas mailbag with clean envelopes, warm ferry lamp glow

### water-notch — warm-window

First 4 tiles Fenya, young woman navy peaked cap, mustard scarf, brown hair and blue coat matching reference 2. Tile 5 Elias matching reference 3. Tile 6 Morwen, match reference 1.

1. `water-notch` — Fenya the courier points with an oar at a copper nail just above high water on a timber post
2. `cup-relay` — Fenya rings a battered tin drinking cup against a railing
3. `bell-receipt` — Fenya with a pillowcase open beneath a small kitchen wall clock
4. `loaf-street` — Fenya kneels with a round golden rye loaf wrapped in striped linen beside a blue door
5. `wash-cart` — Elias the cooper, recognizable burgundy cap, teal shirt and leather apron, grips the handle of a low wooden cart piled with folded pale laundry
6. `warm-window` — Morwen from the style reference, burgundy hood and golden sprig, touches a small square of cold misted window glass with gloved fingertips

### receipt — blind-dice

Rutger, older broad watch sergeant, gray drooping moustache, kind eyes, faceted blue brimmed watch helmet with brass band, dark olive uniform and leather shoulder strap.

1. `receipt` — offers a small tied cloth packet of six silver coins beside a written pay receipt
2. `watch-mark` — civilian coat, bareheaded, places his surrendered bronze watch badge beside a chess pawn
3. `table` — leans on a chair back and gestures politely toward two wooden chess pieces
4. `register` — opens a thick guest register while showing an empty hand where his authorization seal should be
5. `short-shadow` — holds a single supper tally and gestures at two watch helmets on a bench casting only one shadow
6. `blind-dice` — balances two chunky bone dice with deep tactile pips in a palm

### water-ledger — purse

First 3 squares Rutger the older gray mustached sergeant, olive coat and brass band blue helmet, reference 2. Last 3 squares Lida the late stoker, slender young adult, chestnut hair tied low over shoulder, offwhite linen, charcoal apron, russet patched work glove, slightly pale warm skin, human and alert, reference 3.

1. `water-ledger` — Rutger holding a large harbor ledger with a distinct loop of thick blue rope
2. `late-bell` — Rutger presenting an empty wooden soup bowl and a single folded receipt
3. `loaf-hall` — Rutger with a stub of white chalk and a small dark slate beside bread slices
4. `lida` — Lida the stoker holds folded paper around her six small wages-coins and asks about its name
5. `entry` — Lida carefully holds a pen over an open ledger, one soot-smudged work glove removed
6. `purse` — Lida weighs a tied purse in one hand and indicates a child-sized boot with the other

### witness — moth-map

Morwen herself, same face, feather and burgundy hood as reference 1, with correct stance and prominent prop.

1. `witness` — raises a pair of long hearth-dried burgundy gloves as testimony
2. `cup` — holds an opaque pewter tankard near her chest, shielding its contents
3. `supper` — counts visitors with one gloved hand; cropped attentive hound snout below her elbow
4. `sigil` — recoils slightly from a red rowan twig with three clusters of berries
5. `breath` — rests a hand on the curved back of an empty chair, soft light on her thoughtful face
6. `moth-map` — holds a small piece of dark curtain pierced with a constellation of pinholes

### ferry-bell — undertow

This sheet is six supernatural riverside vignettes. Only the figures named in each panel. Preserve a striking immediate visual silhouette, restricted geometric shapes and one flat background just as in ref 1. Agata uses reference 2.

1. `ferry-bell` — a boat prow touches a submerged stone cellar stair, a hanging bronze bell overhead, no person
2. `ferry-oars` — Ustina, a wiry elderly woman with slate headwrap and strong nose, rests brown oar across the boat, two tiny lights behind her
3. `ferry-watch` — Agata the middle-aged baker in cream knotted kerchief and teal dress holds out her open hand for a key beside a golden lamp
4. `ferry-window` — a middle-aged mother in cream blouse and faded plum shawl behind a square pale submerged window, wiping condensation with her sleeve
5. `beacon` — bright ending: a large steady amber beacon burning high above a simple ferry boat at early dawn, no person
6. `undertow` — dark ending: beneath still blue water mother in faded plum shawl hangs a wet dark coat next to hers on two pegs, a boat silhouette overhead

## Атласы финалов и памятных предметов

Квадратные листы 2 × 2 подготовлены по тому же образцу. При экспорте финалы собраны в два ряда по четыре ячейки в порядке полей `panel`. У памятных предметов семь используемых ячеек в один ряд.

> A square 1024 x 1024 game atlas made of FOUR independent full-bleed SQUARE pictures in an exactly aligned 2x2 grid. NO borders, dividers, gutters, frame, lettering or UI. Four narrative still-life woodcuts with clear large silhouettes, flat spot colors, angular cut-paper motifs and one darker flat arch behind the main object in each panel, in the exact graphic style of reference image. Reference defines art direction only; the hooded woman is NOT in these pictures. Limited ochre, warm amber light, deep plum shadows, desaturated verdigris and burgundy. Almost solid backgrounds. Large props in the middle of each cell, generously framed; legible when tiny. Printmaking rather than shading or intricate nature painting.

**endsA**

Evocative poetic yet tasteful end-of-life vignettes, no gore.

1. Cold stove: a tiny unlit match by a cold black cast iron stove; a still sleeve at frame edge
2. Silent neighbor: raised fist with a tin cup tapping a dark wall; opposite a chair turned away
3. Third bolt: a hand holding a big iron key reaches for the third bolt on a door, orange glow beneath
4. Place beyond the threshold: two place settings on opposite sides of a dark doorway, one lit by a cool otherworldly blue flame

**endsB**

Evocative poetic yet tasteful end-of-life vignettes, no gore.

1. Weight of silver: a small bulging chest of coins sinks into a splintered plank, coins fall toward darkness
2. Everyone came: many outstretched friendly hands and hats converging on a single small innkeeper silhouette in a crowd
3. Open kitchen door: an old watchman’s olive cloak tenderly placed over an empty chair beside an ajar back door
4. Last breath: an empty chair near a stove half hidden in soft grey smoke, a single half-burned twig

**tokensA**

Beautiful icons of cherished keepsakes in a medieval inn.

1. A single old golden brass room key on a burgundy ribbon
2. One soot-marked folded wage ledger sheet with three marks, no readable text
3. Exactly six little copper coins loosely in two rows on a folded charcoal cloth
4. A worn bronze town watch badge on an olive wool strap

**tokensB**

Beautiful icons of cherished keepsakes in a medieval inn.

1. An open, flour-dusted kitchen duty book and quill
2. A pair of small sturdy tawny leather lace-up boots
3. One freshly split beechwood log, pale face and dark bark, on a gloved left hand
4. One wooden bread board with a single loaf
