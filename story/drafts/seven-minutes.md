# Семь минут

**В игре.** Действующая редакция находится в [seven-minutes.js](../../game/seven-minutes.js). [Редакция первой читки](seven-minutes.json) сохранена для сравнения. Основа — комедийное расхождение башенного и кухонного времени из исследования №12. Здесь спор сведён к одному уже съеденному ужину. После выбора появляется тот, на кого пришлась его цена.

**Точка входа для игровой версии.** Рутгер приходит в свободный визит один раз. Гость знает два факта до свайпа: смена уже поела, а казначей признаёт ночной ужин только после звона. Сверхъестественного объяснения у часов нет.

| Выбор у Рутгера | Обещание | Чем отвечает город |
|---|---|---|
| Дом кормит за свой счёт. Деньги уходят из кассы, люди благодарны. | В свободный визит вернётся Агата (`bell-bowls`). | У окна восемь мисок. Можно растянуть суп на всех и докупить хлеб либо накормить дежурных и вернуть их на обход. |
| Караульные платят сами и просят счёт. В кассе прибыло, караул недоволен. | Со счётом придёт Феня (`bell-receipt`). | Казначей просит принести часы. Их можно снять со стены либо оставить на кухне и самому подтвердить время. Денег второй раз хозяин не получает. |

В текущей редакции после обоих ответов Рутгеру сразу приходит очередной гость. Про бесплатный ужин город впервые напоминает мисками у окна. Если отдать Фене часы, Агата при следующем обычном визите с хлебом объяснит, отчего подгорела корка. Пока часы у казначея, эта реплика доступна до конца партии.

## Лист передачи в производство

| ID | Кадр до решения | Разовый звук | Музыка и среда |
|---|---|---|---|
| `late-bell` | Для читки достаточно Рутгера. При отдельной иллюстрации взять лицо из `guard.svg`: на стойке пустая суповая миска, Рутгер придерживает неоплаченный счёт. Важнее увидеть пустую миску, чем разобрать надпись. | Обе стороны используют текущую обратную связь оплаты. Отдельный колокол при входе противоречил бы опозданию. | Общий зал. Сохранить `tavern.ogg` и тихий `fire.ogg`. |
| `bell-bowls` | Новый квадрат по образцу Агаты из `market-hot-oven.webp`. В открытом окне снизу вверх торчат протянутые миски, в руке Агаты один половник. Миску на верёвке сохранить для развязки. Широкий фон можно взять из `bakery-room.webp`. | Короткий одиночный стук пустой миски о дерево на входе (`arrivalSound`). Для пробы записать два лёгких касания с коротким хвостом. Звук сигнала паводка здесь поведёт игрока по ложному следу. | Переиспользовать `bakehouse.ogg` и огонь. На следующем госте вернуть его звуковую сцену. |
| `bell-receipt` | Феня с раскрытой наволочкой смотрит на часы **на стене**. Для лица взять `courier.svg`. Часы должны оставаться на месте до согласия хозяина. | После «Снимай» коротко чиркает крючок. На правом листе отдельного эффекта нет. | Феня пришла на кухню. Сохранить тему пекарни по комнате. Сейчас обычное правило музыки может выбрать тему гостя, поэтому при подключении явно проверить и гостью, и лист. |

**Подключено.** Пустую миску и счёт показывает [Рутгер](../../game/art/late-bell.webp). Для возвращений сделаны отдельные карты [Агаты](../../game/art/bell-bowls.webp) и [Фени](../../game/art/bell-receipt.webp). На входе к Агате звучит [стук миски](../../game/audio/sfx/bowl_tap.ogg), при снятии часов — [скрежет крючка](../../game/audio/sfx/clock_hook.ogg). У Рутгера играет тема зала, в обеих кухонных сценах — тема пекарни с огнём. Со страницы «Семь минут» в книге историй можно начать свежую партию прямо со спора об ужине.

**Проверка читки.** LL и LR ведут к разным исходам у окна кухни. RL и RR оставляют две разные истории про одни часы. На живой читке спросить после первой карты, кто платит за ужин, а после возвращения — почему появилась именно эта гостья. Ответ подскажет, нужно ли ещё править текст перед отрисовкой.

## Иллюстрации выпуска

Три карты сделаны через ImageGen и подготовлены в WebP 768 × 768. Для Рутгера образцом служила карта `quarters-ledger.webp`, для Агаты — `market-hot-oven.webp`. Феня сохраняет лицо, кепку и одежду из `courier.svg`. Серию удобно сравнить [в интерфейсе телефона](../../art/preview-seven-minutes.webp).

### late-bell

> New square edge-to-edge cut-paper woodblock storybook card for the same medieval inn. Reference is Rutger: same older man, silver moustache, conical slate brimmed helmet, olive guard coat and shoulder strap, same simple angular face and muted color blocks. Different composition, waist-up front view across a wooden inn table, a large visibly EMPTY ochre soup bowl tilted toward the innkeeper with a spoon in it in the lower middle. He holds a small folded cream dinner bill against the table with one hand, glances sideways hopefully, faintly sheepish about who pays. Cool blue belltower silhouette glimpsed through the tall window in the back, warm amber sidelight, restrained dark plum shadows and fine paper grain. Empty bowl dominates the gesture, upper fifth unobtrusive. No laundry, soot, coins, lettering, numbers, badges, UI, ornamental frames or borders.

### bell-bowls

> Square single full-bleed storybook game card in tactile angular cut-paper woodblock style, large clean color planes, restrained dusk blue, amber and terracotta and dark plum, subtle paper grain. No text, letters, borders, logos, numbers or UI. Keep upper fifth quiet for swipe label. Agata from reference, angular mature baker in striped cream headscarf, brown apron, teal sleeves. New composition: interior bakery window at blue dusk, Agata on LEFT holding a single large ladle above a soup kettle, looking amused and overwhelmed at many empty mismatched bowls and a few hands extended over the open wooden windowsill on RIGHT. Dry comedy, bowls and face legible at 180 pixels; do not show a rope, payment, pastries or cord.

### bell-receipt

> Square single full-bleed storybook game card in tactile angular cut-paper woodblock style, large clean color planes, restrained dusk blue, amber and terracotta and dark plum, subtle paper grain. No text, letters, borders, logos, numbers or UI. Keep upper fifth quiet for swipe label. First image establishes Fenya ONLY, preserve her young freckled face, dark short hair, blue flat cap, mustard collar and cross-body strap. Second image is style and bakery palette ONLY. Fenya alone at LEFT in three-quarter profile holds a visibly OPEN empty ivory cloth pillowcase in both hands looking expectantly up at an oversized old circular wooden kitchen clock hung firmly on the wall at RIGHT, simple two hands with twelve engraved ticks. Clock and empty bag both visible in middle/lower canvas, wry expression. No baker or envelopes.
